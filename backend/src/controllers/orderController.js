const { getPool, sql } = require("../libs/db");
const crypto = require("crypto");

function buildSortedQuery(obj) {
  return Object.keys(obj)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(String(obj[key] ?? "")).replace(/%20/g, "+")}`)
    .join("&");
}

function getClientIp(req) {
  const raw = (
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "127.0.0.1"
  );

  // VNPay expects IPv4 format; convert local IPv6 forms to IPv4 fallback.
  const ip = String(raw);
  if (ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip;
  return "127.0.0.1";
}

function getDateYmdHis() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function addMinutes(date, minutes) {
  const d = new Date(date.getTime() + minutes * 60000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function toVnpTxnRef(orderId) {
  return String(orderId || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 34);
}

function fromVnpTxnRef(txnRef) {
  const raw = String(txnRef || "").trim();
  const m = raw.match(/^PSTT(\d{4})(\d{5})$/i);
  if (!m) return raw;
  return `PSTT-${m[1]}-${m[2]}`;
}

function normalizeOrderItemProductId(rawId) {
  // Keep numeric product IDs, and also extract numeric part for planter/accessory IDs.
  if (typeof rawId === "number" && Number.isInteger(rawId)) {
    return { productId: rawId, itemType: "product" };
  }

  if (typeof rawId === "string") {
    const trimmed = rawId.trim();
    if (/^\d+$/.test(trimmed)) {
      return { productId: Number(trimmed), itemType: "product" };
    }

    const planterMatch = trimmed.match(/^planter-(\d+)$/i);
    if (planterMatch) {
      return { productId: Number(planterMatch[1]), itemType: "planter" };
    }

    const accessoryMatch = trimmed.match(/^accessory-(\d+)$/i);
    if (accessoryMatch) {
      return { productId: Number(accessoryMatch[1]), itemType: "accessory" };
    }
  }

  return { productId: null, itemType: "unknown" };
}

// GET /api/orders  (my orders)
async function getMyOrders(req, res, next) {
  try {
    const pool = await getPool();
    const ordersResult = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .query(
        `SELECT o.id, CONVERT(varchar, o.created_at, 23) AS date, o.status,
                o.shipping_address AS shippingAddress, o.payment_method AS paymentMethod,
                o.subtotal, o.shipping_fee AS shippingFee, o.total, o.tracking_number AS trackingNumber
         FROM Orders o WHERE o.user_id = @userId ORDER BY o.created_at DESC`
      );

    const orders = await enrichOrders(pool, ordersResult.recordset);
    return res.json(orders);
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id
async function getOrderById(req, res, next) {
  try {
    const pool = await getPool();
    const orderResult = await pool
      .request()
      .input("id", sql.NVarChar, req.params.id)
      .input("userId", sql.Int, req.user.id)
      .query(
        `SELECT o.id, CONVERT(varchar, o.created_at, 23) AS date, o.status,
                o.shipping_address AS shippingAddress, o.payment_method AS paymentMethod,
                o.subtotal, o.shipping_fee AS shippingFee, o.total, o.tracking_number AS trackingNumber
         FROM Orders o WHERE o.id = @id AND o.user_id = @userId`
      );

    if (orderResult.recordset.length === 0)
      return res.status(404).json({ message: "Đơn hàng không tồn tại." });

    const orders = await enrichOrders(pool, orderResult.recordset);
    return res.json(orders[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/orders
async function createOrder(req, res, next) {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      total,
    } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Giỏ hàng trống." });

    const pool = await getPool();

    // Generate order ID like PSTT-2026-XXXXX
    const year = new Date().getFullYear();
    const countResult = await pool.request().query(
      `SELECT COUNT(*) AS cnt FROM Orders WHERE YEAR(created_at) = ${year}`
    );
    const seq = String(countResult.recordset[0].cnt + 1).padStart(5, "0");
    const orderId = `PSTT-${year}-${seq}`;

    await pool
      .request()
      .input("id", sql.NVarChar, orderId)
      .input("userId", sql.Int, req.user.id)
      .input("status", sql.NVarChar, "pending")
      .input("shippingAddress", sql.NVarChar, shippingAddress)
      .input("paymentMethod", sql.NVarChar, paymentMethod)
      .input("subtotal", sql.Decimal(18, 2), subtotal)
      .input("shippingFee", sql.Decimal(18, 2), shippingFee)
      .input("total", sql.Decimal(18, 2), total)
      .query(
        `INSERT INTO Orders (id, user_id, status, shipping_address, payment_method, subtotal, shipping_fee, total)
         VALUES (@id, @userId, @status, @shippingAddress, @paymentMethod, @subtotal, @shippingFee, @total)`
      );

    for (const item of items) {
      const { productId, itemType } = normalizeOrderItemProductId(item.id);
      const isSyntheticItem = itemType === "planter" || itemType === "accessory" || itemType === "unknown";

      await pool
        .request()
        .input("orderId", sql.NVarChar, orderId)
        .input("productId", sql.Int, productId)
        .input("title", sql.NVarChar, item.title)
        .input("price", sql.Decimal(18, 2), item.price)
        .input("quantity", sql.Int, item.quantity)
        .input("imageUrl", sql.NVarChar, item.image)
        .input("planterName", sql.NVarChar, isSyntheticItem ? item.title : (item.planter || ""))
        .query(
          `INSERT INTO OrderItems (order_id, product_id, title, price, quantity, image_url, planter_name)
           VALUES (@orderId, @productId, @title, @price, @quantity, @imageUrl, @planterName)`
        );
    }

    // Initial timeline entry
    await pool
      .request()
      .input("orderId", sql.NVarChar, orderId)
      .input("status", sql.NVarChar, "Đặt hàng thành công")
      .input("done", sql.Bit, true)
      .query(
        `INSERT INTO OrderTimeline (order_id, status, event_date, done)
         VALUES (@orderId, @status, GETDATE(), @done)`
      );

    return res.status(201).json({ orderId, message: "Đặt hàng thành công." });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/orders/:id/cancel
async function cancelOrder(req, res, next) {
  try {
    const pool = await getPool();
    const orderResult = await pool
      .request()
      .input("id", sql.NVarChar, req.params.id)
      .input("userId", sql.Int, req.user.id)
      .query("SELECT status FROM Orders WHERE id = @id AND user_id = @userId");

    if (orderResult.recordset.length === 0)
      return res.status(404).json({ message: "Đơn hàng không tồn tại." });

    const { status } = orderResult.recordset[0];
    if (!["pending", "confirmed"].includes(status))
      return res.status(400).json({ message: "Không thể hủy đơn hàng ở trạng thái này." });

    await pool
      .request()
      .input("id", sql.NVarChar, req.params.id)
      .query("UPDATE Orders SET status = 'cancelled' WHERE id = @id");

    await pool
      .request()
      .input("orderId", sql.NVarChar, req.params.id)
      .query(
        `INSERT INTO OrderTimeline (order_id, status, event_date, done)
         VALUES (@orderId, N'Đã hủy', GETDATE(), 1)`
      );

    return res.json({ message: "Đơn hàng đã được hủy." });
  } catch (err) {
    next(err);
  }
}

// POST /api/orders/:id/vnpay-url
async function createVnpayPaymentUrl(req, res, next) {
  try {
    const tmnCode = String(process.env.VNPAY_TMN_CODE || "").trim();
    const hashSecret = String(process.env.VNPAY_HASH_SECRET || "").trim();
    const returnUrl = String(process.env.VNPAY_RETURN_URL || "").trim();
    const vnpUrlBase = String(process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html").trim();

    if (!tmnCode || !hashSecret || !returnUrl) {
      return res.status(400).json({
        message: "VNPay chưa được cấu hình đầy đủ trên server.",
      });
    }

    try {
      const parsedReturnUrl = new URL(returnUrl);
      if (!/^https?:$/.test(parsedReturnUrl.protocol)) {
        return res.status(400).json({ message: "VNPAY_RETURN_URL phải là URL http/https hợp lệ." });
      }
    } catch {
      return res.status(400).json({ message: "VNPAY_RETURN_URL không hợp lệ." });
    }

    const pool = await getPool();
    const orderResult = await pool
      .request()
      .input("id", sql.NVarChar, req.params.id)
      .input("userId", sql.Int, req.user.id)
      .query("SELECT id, total, status FROM Orders WHERE id = @id AND user_id = @userId");

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại." });
    }

    const order = orderResult.recordset[0];
    const amount = Number(order.total);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Giá trị đơn hàng không hợp lệ." });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Đơn hàng đã hủy, không thể thanh toán VNPay." });
    }

    const createDate = getDateYmdHis();
    const expireDate = addMinutes(new Date(), 15);
    const ipAddr = getClientIp(req);
    const bankCode = String(process.env.VNPAY_BANK_CODE || "").trim().toUpperCase();

    const txnRef = toVnpTxnRef(order.id);
    if (!txnRef) {
      return res.status(400).json({ message: "Mã đơn hàng không hợp lệ cho VNPay." });
    }

    const vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
      vnp_OrderType: "other",
      vnp_Amount: String(Math.round(amount * 100)),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    if (bankCode && /^[A-Z0-9]{2,20}$/.test(bankCode)) {
      vnpParams.vnp_BankCode = bankCode;
    }

    const signData = buildSortedQuery(vnpParams);
    const signed = crypto.createHmac("sha512", hashSecret).update(Buffer.from(signData, "utf-8")).digest("hex");

    const paymentUrl = `${vnpUrlBase}?${signData}&vnp_SecureHash=${signed}`;
    return res.json({ paymentUrl });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/vnpay/verify
async function verifyVnpayReturn(req, res, next) {
  try {
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    if (!hashSecret) {
      return res.status(400).json({ success: false, message: "VNPay chưa được cấu hình trên server." });
    }

    const rawParams = { ...req.query };
    const receivedHash = rawParams.vnp_SecureHash;
    delete rawParams.vnp_SecureHash;
    delete rawParams.vnp_SecureHashType;

    const signData = buildSortedQuery(rawParams);
    const expectedHash = crypto.createHmac("sha512", hashSecret).update(Buffer.from(signData, "utf-8")).digest("hex");

    if (!receivedHash || String(receivedHash).toLowerCase() !== expectedHash.toLowerCase()) {
      return res.status(400).json({ success: false, message: "Sai chữ ký VNPay." });
    }

    const txnRef = String(req.query.vnp_TxnRef || "").trim();
    const candidateOrderId = fromVnpTxnRef(txnRef);
    const rspCode = String(req.query.vnp_ResponseCode || "");
    const txnStatus = String(req.query.vnp_TransactionStatus || "");
    const isSuccess = rspCode === "00" && txnStatus === "00";

    if (!txnRef) {
      return res.status(400).json({ success: false, message: "Không tìm thấy mã đơn hàng VNPay." });
    }

    const pool = await getPool();
    const orderCheck = await pool
      .request()
      .input("id", sql.NVarChar, candidateOrderId)
      .input("txnRef", sql.NVarChar, txnRef)
      .query("SELECT TOP 1 id, status FROM Orders WHERE id = @id OR REPLACE(id, '-', '') = @txnRef");
    if (orderCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại." });
    }

    const orderId = String(orderCheck.recordset[0].id);

    if (isSuccess) {
      await pool.request().input("id", sql.NVarChar, orderId).query("UPDATE Orders SET status = 'confirmed' WHERE id = @id AND status = 'pending'");
      await pool
        .request()
        .input("orderId", sql.NVarChar, orderId)
        .input("status", sql.NVarChar, "Thanh toán VNPay thành công")
        .query("INSERT INTO OrderTimeline (order_id, status, event_date, done) VALUES (@orderId, @status, GETDATE(), 1)");
      return res.json({ success: true, orderId, message: "Thanh toán VNPay thành công." });
    }

    await pool
      .request()
      .input("orderId", sql.NVarChar, orderId)
      .input("status", sql.NVarChar, `Thanh toán VNPay thất bại (${rspCode || "N/A"})`)
      .query("INSERT INTO OrderTimeline (order_id, status, event_date, done) VALUES (@orderId, @status, GETDATE(), 1)");

    return res.json({ success: false, orderId, message: "Thanh toán VNPay thất bại." });
  } catch (err) {
    next(err);
  }
}

async function enrichOrders(pool, orders) {
  if (orders.length === 0) return orders;
  const ids = orders.map((o) => `'${o.id}'`).join(",");

  const itemsResult = await pool
    .request()
    .query(
      `SELECT order_id, product_id AS id, title, price, quantity, image_url AS image, planter_name AS planter
       FROM OrderItems WHERE order_id IN (${ids})`
    );

  const planterCandidates = Array.from(
    new Set(
      itemsResult.recordset
        .filter((item) => item.id !== null && item.id !== undefined && item.planter === item.title)
        .map((item) => Number(item.id))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  );

  const planterTypeMap = {};
  if (planterCandidates.length > 0) {
    const typeRows = await pool
      .request()
      .query(`SELECT id, type FROM Planters WHERE id IN (${planterCandidates.join(",")})`);

    for (const row of typeRows.recordset) {
      planterTypeMap[row.id] = row.type === "accessory" ? "accessory" : "planter";
    }
  }

  const timelineResult = await pool
    .request()
    .query(
      `SELECT order_id, status, CONVERT(varchar, event_date, 120) AS date, done
       FROM OrderTimeline WHERE order_id IN (${ids}) ORDER BY event_date ASC`
    );

  const itemsMap = {};
  for (const item of itemsResult.recordset) {
    if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];

    let normalizedId = item.id === null || item.id === undefined ? "" : String(item.id);
    if (item.id !== null && item.id !== undefined && item.planter === item.title && planterTypeMap[item.id]) {
      normalizedId = `${planterTypeMap[item.id]}-${item.id}`;
    }

    itemsMap[item.order_id].push({
      id: normalizedId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      planter: item.planter,
    });
  }

  const timelineMap = {};
  for (const t of timelineResult.recordset) {
    if (!timelineMap[t.order_id]) timelineMap[t.order_id] = [];
    timelineMap[t.order_id].push({ status: t.status, date: t.date, done: !!t.done });
  }

  return orders.map((o) => ({
    ...o,
    items: itemsMap[o.id] || [],
    timeline: timelineMap[o.id] || [],
  }));
}

module.exports = {
  getMyOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  createVnpayPaymentUrl,
  verifyVnpayReturn,
};
