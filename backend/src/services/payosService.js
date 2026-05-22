/**
 * PayOS payment service helpers.
 */

const crypto = require("crypto");

const PAYOS_API_BASE = "https://api-merchant.payos.vn";

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

  const response = await fetch(`${PAYOS_API_BASE}/v2/payment-requests`, {
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

async function getPaymentLinkStatus(paymentLinkIdOrOrderCode) {
  const { clientId, apiKey } = getPayosConfig();
  const response = await fetch(
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

function verifyWebhookSignature(data, signature) {
  const { checksumKey } = getPayosConfig();
  const expectedSignature = createSignature(data, checksumKey);
  return expectedSignature.toLowerCase() === String(signature || "").trim().toLowerCase();
}

module.exports = {
  PAYOS_API_BASE,
  buildSignaturePayload,
  createPaymentLink,
  createSignature,
  getPayosConfig,
  getPaymentLinkStatus,
  verifyWebhookSignature,
};
