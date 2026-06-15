const { getPool, sql } = require("../libs/db");
const {
  createOrResumePaymentLink,
  getPaymentLinkStatus,
  getPayosConfig,
  verifyWebhookSignature,
} = require("../services/payosService");

const BASE_URL = String(process.env.BASE_URL || "http://localhost:5173").replace(/\/$/, "");

function toPayosOrderCode(orderId) {
  const digits = String(orderId || "").replace(/\D/g, "");
  const orderCode = Number.parseInt(digits, 10);
  return Number.isSafeInteger(orderCode) ? orderCode : null;
}

function buildPayosDescription(orderId) {
  return String(toPayosOrderCode(orderId) || "").slice(0, 25);
}

function buildPayosItems(items) {
  if (!Array.isArray(items) || items.length === 0) return undefined;

  return items.slice(0, 20).map((item) => ({
    name: String(item.title || item.name || "San pham").slice(0, 80),
    quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
    price: Math.max(0, Math.round(Number(item.price) || 0)),
  }));
}

async function findOrderByPayosOrderCode(pool, payosOrderCode) {
  return pool
    .request()
    .input("payosOrderCode", sql.NVarChar, String(payosOrderCode || "").trim())
    .query(
      `SELECT TOP 1 id, status
       FROM Orders
       WHERE REPLACE(REPLACE(id, 'PSTT-', ''), '-', '') = @payosOrderCode`
    );
}

async function markOrderPaid(pool, orderId, timelineStatus) {
  const updateResult = await pool
    .request()
    .input("id", sql.NVarChar, orderId)
    .query("UPDATE Orders SET status = 'confirmed' WHERE id = @id AND status = 'pending'");

  if ((updateResult.rowsAffected?.[0] || 0) === 0) {
    return false;
  }

  await pool
    .request()
    .input("orderId", sql.NVarChar, orderId)
    .input("status", sql.NVarChar, timelineStatus)
    .query(
      "INSERT INTO OrderTimeline (order_id, status, event_date, done) VALUES (@orderId, @status, GETDATE(), 1)"
    );

  return true;
}

async function resolveVerifiedOrder(pool, payosLookupId, expectedOrderCode) {
  const paymentInfo = await getPaymentLinkStatus(payosLookupId);
  const actualOrderCode = String(paymentInfo.orderCode || "").trim();

  if (!actualOrderCode) {
    throw new Error("PayOS did not return a valid order code.");
  }

  if (expectedOrderCode && actualOrderCode !== String(expectedOrderCode).trim()) {
    throw new Error("PayOS order code does not match the return URL.");
  }

  const orderResult = await findOrderByPayosOrderCode(pool, actualOrderCode);
  if (orderResult.recordset.length === 0) {
    throw new Error("Đơn hàng PayOS không tồn tại trong hệ thống.");
  }

  return {
    orderId: String(orderResult.recordset[0].id),
    orderStatus: String(orderResult.recordset[0].status || ""),
    payosStatus: String(paymentInfo.status || "").trim().toUpperCase(),
  };
}

// POST /api/orders/:id/payos-url
async function createPayosPaymentUrl(req, res, next) {
  try {
    getPayosConfig();

    const pool = await getPool();
    const orderResult = await pool
      .request()
      .input("id", sql.NVarChar, req.params.id)
      .input("userId", sql.Int, req.user.id)
      .query(
        `SELECT o.id, o.total, o.status, o.payment_method AS paymentMethod,
                o.recipient_phone AS recipientPhone,
                u.name AS buyerName, u.email AS buyerEmail
         FROM Orders o
         JOIN Users u ON u.id = o.user_id
         WHERE o.id = @id AND o.user_id = @userId`
      );

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại." });
    }

    const order = orderResult.recordset[0];
    const amount = Number(order.total);
    const orderCode = toPayosOrderCode(order.id);

    if (!orderCode) {
      return res.status(400).json({ message: "Mã đơn hàng không hợp lệ cho PayOS." });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Giá trị đơn hàng không hợp lệ." });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Đơn hàng đã hủy, không thể thanh toán PayOS." });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Đơn hàng đã được thanh toán hoặc không còn chờ thanh toán." });
    }

    if (String(order.paymentMethod || "").toLowerCase() !== "payos") {
      return res.status(400).json({ message: "Đơn hàng này không dùng phương thức PayOS." });
    }

    const itemsResult = await pool
      .request()
      .input("orderId", sql.NVarChar, order.id)
      .query(
        `SELECT title, quantity, price
         FROM OrderItems
         WHERE order_id = @orderId`
      );

    const result = await createOrResumePaymentLink({
      orderCode,
      amount,
      description: buildPayosDescription(order.id),
      returnUrl: `${BASE_URL}/payment/payos-return`,
      cancelUrl: `${BASE_URL}/payment/payos-cancel?orderId=${encodeURIComponent(order.id)}`,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      buyerPhone: req.body?.buyerPhone || order.recipientPhone,
      items: buildPayosItems(itemsResult.recordset),
    });

    return res.json({
      checkoutUrl: result.checkoutUrl,
      qrCode: result.qrCode,
      paymentLinkId: result.paymentLinkId,
      orderCode: result.orderCode,
    });
  } catch (err) {
    if (err.message === "PayOS credentials not configured") {
      return res.status(400).json({
        message: "PayOS chưa được cấu hình đầy đủ trên server.",
      });
    }

    next(err);
  }
}

// GET /api/orders/payos/verify
async function verifyPayosReturn(req, res, next) {
  try {
    const paymentLinkId = String(req.query.id || "").trim();
    const expectedOrderCode = String(req.query.orderCode || "").trim();

    if (!paymentLinkId && !expectedOrderCode) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin xác minh PayOS." });
    }

    const pool = await getPool();
    const verified = await resolveVerifiedOrder(pool, paymentLinkId || expectedOrderCode, expectedOrderCode);

    if (verified.payosStatus === "PAID") {
      await markOrderPaid(pool, verified.orderId, "Thanh toán PayOS thành công");
      return res.json({ success: true, orderId: verified.orderId, status: verified.payosStatus });
    }

    return res.json({
      success: false,
      orderId: verified.orderId,
      status: verified.payosStatus,
      message: "Thanh toán PayOS chưa hoàn tất.",
    });
  } catch (err) {
    if (err.message === "PayOS credentials not configured") {
      return res.status(400).json({ success: false, message: "PayOS chưa được cấu hình đầy đủ trên server." });
    }

    next(err);
  }
}

// POST /api/webhooks/payos-webhook
async function handlePayosWebhook(req, res, next) {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body || {});
    const payload = typeof req.body === "object" && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(rawBody || "{}");
    const webhookData = payload?.data;
    const signature = payload?.signature;

    if (!webhookData || !signature || !verifyWebhookSignature(webhookData, signature)) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const status = String(webhookData.status || "").trim().toUpperCase();
    const resultCode = String(webhookData.code || payload.code || "").trim().toUpperCase();
    const payosOrderCode = String(webhookData.orderCode || "").trim();

    if ((status === "PAID" || resultCode === "00") && payosOrderCode) {
      const pool = await getPool();
      const orderResult = await findOrderByPayosOrderCode(pool, payosOrderCode);

      if (orderResult.recordset.length > 0) {
        const orderId = String(orderResult.recordset[0].id);
        await markOrderPaid(pool, orderId, "Thanh toán PayOS thành công qua webhook");
      }
    }

    return res.json({ received: true });
  } catch (err) {
    if (err.message === "PayOS credentials not configured") {
      return res.status(400).json({ message: "PayOS chưa được cấu hình đầy đủ trên server." });
    }

    next(err);
  }
}

module.exports = {
  createPayosPaymentUrl,
  handlePayosWebhook,
  verifyPayosReturn,
};
