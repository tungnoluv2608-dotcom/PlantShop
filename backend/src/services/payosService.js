/**
 * PayOS payment service helpers.
 */

const crypto = require("crypto");

const PAYOS_API_BASE = "https://api-merchant.payos.vn";
const PAYOS_CHECKOUT_BASE = "https://pay.payos.vn/web";
const PAYOS_FETCH_TIMEOUT_MS = 4_000;

function payosFetch(url, options = {}) {
  const signal =
    options.signal ??
    (typeof AbortSignal !== "undefined" && AbortSignal.timeout
      ? AbortSignal.timeout(PAYOS_FETCH_TIMEOUT_MS)
      : undefined);

  return fetch(url, { ...options, signal });
}

function getPayosConfig() {
  const clientId = String(process.env.PAYOS_CLIENT_ID || "").trim();
  const apiKey = String(process.env.PAYOS_API_KEY || "").trim();
  const checksumKey = String(process.env.PAYOS_CHECKSUM_KEY || "").trim();

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error("PayOS credentials not configured");
  }

  return { clientId, apiKey, checksumKey };
}

function sortObjectKeys(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      const value = obj[key];

      if (Array.isArray(value)) {
        acc[key] = value.map((item) => (item && typeof item === "object" ? sortObjectKeys(item) : item));
        return acc;
      }

      if (value && typeof value === "object") {
        acc[key] = sortObjectKeys(value);
        return acc;
      }

      acc[key] = value;
      return acc;
    }, {});
}

function normalizeSignatureValue(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  return String(value);
}

function buildSignaturePayload(data) {
  const sorted = sortObjectKeys(data);
  return Object.keys(sorted)
    .map((key) => `${key}=${normalizeSignatureValue(sorted[key])}`)
    .join("&");
}

function createSignature(data, checksumKey) {
  return crypto.createHmac("sha256", checksumKey).update(buildSignaturePayload(data)).digest("hex");
}

async function readPayosResponse(response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.desc || payload?.message || `PayOS API error: ${response.status}`;
    throw new Error(message);
  }

  if (!payload || payload.code !== "00" || !payload.data) {
    throw new Error(payload?.desc || "PayOS returned an invalid response.");
  }

  return payload.data;
}

async function createPaymentLink({
  orderCode,
  amount,
  description,
  returnUrl,
  cancelUrl,
  buyerName,
  buyerEmail,
  buyerPhone,
  items,
  expiredAt,
}) {
  const { clientId, apiKey, checksumKey } = getPayosConfig();

  const requestBody = {
    orderCode,
    amount: Math.round(amount),
    description: String(description),
    returnUrl: String(returnUrl),
    cancelUrl: String(cancelUrl),
    buyerName: buyerName ? String(buyerName).trim() : undefined,
    buyerEmail: buyerEmail ? String(buyerEmail).trim() : undefined,
    buyerPhone: buyerPhone ? String(buyerPhone).trim() : undefined,
    items: Array.isArray(items) && items.length > 0 ? items : undefined,
    expiredAt: expiredAt || undefined,
  };

  requestBody.signature = createSignature(
    {
      amount: requestBody.amount,
      cancelUrl: requestBody.cancelUrl,
      description: requestBody.description,
      orderCode: requestBody.orderCode,
      returnUrl: requestBody.returnUrl,
    },
    checksumKey
  );

  const response = await payosFetch(`${PAYOS_API_BASE}/v2/payment-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  return readPayosResponse(response);
}

function buildCheckoutUrl(paymentLinkId) {
  const id = String(paymentLinkId || "").trim();
  return id ? `${PAYOS_CHECKOUT_BASE}/${id}` : null;
}

function normalizePaymentLinkResult(data, resumed = false) {
  const paymentLinkId = data.paymentLinkId || data.id;
  return {
    checkoutUrl: data.checkoutUrl || buildCheckoutUrl(paymentLinkId),
    qrCode: data.qrCode,
    paymentLinkId,
    orderCode: data.orderCode,
    status: data.status,
    resumed,
  };
}

function isPayosNotFoundError(err) {
  const msg = String(err?.message || "").toLowerCase();
  return msg.includes("không tồn tại") || msg.includes("not exist") || msg.includes("not found");
}

function isPayosDuplicateOrderError(err) {
  const msg = String(err?.message || "").toLowerCase();
  return msg.includes("đã tồn tại") || msg.includes("already exist");
}

async function getPaymentLinkStatus(paymentLinkIdOrOrderCode) {
  const { clientId, apiKey } = getPayosConfig();
  const response = await payosFetch(
    `${PAYOS_API_BASE}/v2/payment-requests/${encodeURIComponent(String(paymentLinkIdOrOrderCode).trim())}`,
    {
      method: "GET",
      headers: {
        "x-client-id": clientId,
        "x-api-key": apiKey,
      },
    }
  );

  return readPayosResponse(response);
}

async function getPaymentLinkStatusSafe(paymentLinkIdOrOrderCode) {
  try {
    return await getPaymentLinkStatus(paymentLinkIdOrOrderCode);
  } catch (err) {
    if (isPayosNotFoundError(err)) return null;
    throw err;
  }
}

async function cancelPaymentLink(paymentLinkIdOrOrderCode, cancellationReason = "Retry payment") {
  const { clientId, apiKey } = getPayosConfig();
  const response = await payosFetch(
    `${PAYOS_API_BASE}/v2/payment-requests/${encodeURIComponent(String(paymentLinkIdOrOrderCode).trim())}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ cancellationReason: String(cancellationReason) }),
    }
  );

  return readPayosResponse(response);
}

/**
 * Resume an open PayOS checkout when possible; otherwise cancel stale links and create a new one.
 * PayOS rejects duplicate orderCode — retry must reuse PENDING links or cancel before recreate.
 */
async function createOrResumePaymentLink(options) {
  const orderCode = options.orderCode;
  const existing = await getPaymentLinkStatusSafe(orderCode);

  if (existing) {
    const status = String(existing.status || "").trim().toUpperCase();

    if (status === "PAID") {
      throw new Error("Đơn hàng đã được thanh toán qua PayOS.");
    }

    if (status === "PENDING") {
      const resumed = normalizePaymentLinkResult(existing, true);
      if (resumed.checkoutUrl) return resumed;
    }

    if (["PENDING", "PROCESSING"].includes(status)) {
      try {
        await cancelPaymentLink(orderCode, "User retry payment");
      } catch {
        const retryExisting = await getPaymentLinkStatusSafe(orderCode);
        if (retryExisting) {
          const resumed = normalizePaymentLinkResult(retryExisting, true);
          if (resumed.checkoutUrl) return resumed;
        }
      }
    }
  }

  try {
    const created = await createPaymentLink(options);
    return normalizePaymentLinkResult(created, false);
  } catch (err) {
    if (!isPayosDuplicateOrderError(err)) throw err;

    const fallback = await getPaymentLinkStatusSafe(orderCode);
    if (!fallback) throw err;

    const status = String(fallback.status || "").trim().toUpperCase();
    if (status === "PAID") {
      throw new Error("Đơn hàng đã được thanh toán qua PayOS.");
    }

    const resumed = normalizePaymentLinkResult(fallback, true);
    if (resumed.checkoutUrl) return resumed;

    try {
      await cancelPaymentLink(orderCode, "Recreate payment link");
    } catch {
      // PayOS may already be cancelled/expired — attempt create anyway.
    }

    const recreated = await createPaymentLink(options);
    return normalizePaymentLinkResult(recreated, false);
  }
}

function verifyWebhookSignature(data, signature) {
  const { checksumKey } = getPayosConfig();
  const expectedSignature = createSignature(data, checksumKey);
  return expectedSignature.toLowerCase() === String(signature || "").trim().toLowerCase();
}

module.exports = {
  PAYOS_API_BASE,
  buildCheckoutUrl,
  buildSignaturePayload,
  cancelPaymentLink,
  createOrResumePaymentLink,
  createPaymentLink,
  createSignature,
  getPayosConfig,
  getPaymentLinkStatus,
  getPaymentLinkStatusSafe,
  verifyWebhookSignature,
};
