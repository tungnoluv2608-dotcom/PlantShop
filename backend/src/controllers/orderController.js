const { getPool, sql } = require("../libs/db");
const crypto = require("crypto");
const { buildTrackingUrl, normalizeTrackingProvider } = require("../services/trackingService");

const VALID_PAYMENT_METHODS = new Set(["cod", "payos", "vnpay"]);
const VALID_SHIPPING_METHODS = new Set(["standard", "express", "sameday"]);
const SHIPPING_STANDARD_FEE = Number(process.env.SHIPPING_STANDARD_FEE || 0);
const SHIPPING_STANDARD_FREE_THRESHOLD = Number(process.env.SHIPPING_STANDARD_FREE_THRESHOLD || 500000);
const SHIPPING_EXPRESS_FEE = Number(process.env.SHIPPING_EXPRESS_FEE || 30000);
const SHIPPING_SAMEDAY_FEE = Number(process.env.SHIPPING_SAMEDAY_FEE || 60000);

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
  if (typeof rawId === "number" && Number.isInteger(rawId)) {
    return { productId: rawId, itemType: "product", planterId: null };
  }

  if (typeof rawId === "string") {
    const trimmed = rawId.trim();
    if (/^\d+$/.test(trimmed)) {
      return { productId: Number(trimmed), itemType: "product", planterId: null };
    }

    const productMatch = trimmed.match(/^product-(\d+)(?:-planter-(\d+)|-none)?(?:-.+)?$/i);
    if (productMatch) {
      return {
        productId: Number(productMatch[1]),
        itemType: "product",
        planterId: productMatch[2] ? Number(productMatch[2]) : null,
      };
    }

    const planterMatch = trimmed.match(/^planter-(\d+)$/i);
    if (planterMatch) {
      return { productId: Number(planterMatch[1]), itemType: "planter", planterId: null };
    }

    const accessoryMatch = trimmed.match(/^accessory-(\d+)$/i);
    if (accessoryMatch) {
      return { productId: Number(accessoryMatch[1]), itemType: "accessory", planterId: null };
    }
  }

  return { productId: null, itemType: "unknown", planterId: null };
}

function normalizePaymentMethod(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return VALID_PAYMENT_METHODS.has(normalized) ? normalized : "";
}

function normalizeShippingMethod(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return VALID_SHIPPING_METHODS.has(normalized) ? normalized : "";
}

function computeShippingFee(subtotal, shippingMethod) {
  if (shippingMethod === "express") {
    return Math.max(0, SHIPPING_EXPRESS_FEE);
  }

  if (shippingMethod === "sameday") {
    return Math.max(0, SHIPPING_SAMEDAY_FEE);
  }

  if (shippingMethod === "standard") {
    return subtotal >= SHIPPING_STANDARD_FREE_THRESHOLD ? 0 : Math.max(0, SHIPPING_STANDARD_FEE);
  }

  throw new Error("Unsupported shipping method");
}

function parseJsonArray(rawValue) {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildProductPlanterLabel(planter) {
  if (!planter) {
    return "Không (Chỉ cây và chậu nhựa ươm)";
  }

  const price = Number(planter.price || 0);
  return `Có (Kèm ${planter.name}${price > 0 ? ` +${price.toLocaleString("vi-VN")}đ` : ""})`;
}

function formatOrderSequenceValue(value) {
  return String(value).padStart(5, "0");
}

function buildOrderId(year, sequenceValue) {
  return `PSTT-${year}-${formatOrderSequenceValue(sequenceValue)}`;
}

async function ensureOrderSequenceTable(transaction) {
  await transaction.request().query(`
    IF NOT EXISTS (
      SELECT 1
      FROM sys.tables
      WHERE name = 'OrderNumberSequences'
    )
    BEGIN
      CREATE TABLE OrderNumberSequences (
        sequence_year INT NOT NULL PRIMARY KEY,
        last_value    INT NOT NULL DEFAULT 0,
        updated_at    DATETIME NOT NULL DEFAULT GETDATE()
      );
    END
  `);
}

async function getNextOrderSequenceValue(transaction, year) {
  await ensureOrderSequenceTable(transaction);

  const yearPrefix = `PSTT-${year}-`;
  const maxResult = await transaction
    .request()
    .input("yearPrefix", sql.NVarChar, yearPrefix + "%")
    .input("prefixLen", sql.Int, yearPrefix.length)
    .query(`
      SELECT ISNULL(MAX(TRY_CAST(SUBSTRING(id, @prefixLen + 1, LEN(id) - @prefixLen) AS INT)), 0)
        AS maxExisting
      FROM Orders WITH (HOLDLOCK)
      WHERE id LIKE @yearPrefix
    `);

  const maxExisting = Number(maxResult.recordset[0]?.maxExisting || 0);

  const result = await transaction.request().input("sequenceYear", sql.Int, year).query(`
    MERGE OrderNumberSequences WITH (HOLDLOCK) AS target
    USING (SELECT @sequenceYear AS sequence_year) AS source
    ON target.sequence_year = source.sequence_year
    WHEN MATCHED THEN
      UPDATE SET
        last_value = target.last_value + 1,
        updated_at = GETDATE()
    WHEN NOT MATCHED THEN
      INSERT (sequence_year, last_value, updated_at)
      VALUES (source.sequence_year, 1, GETDATE())
    OUTPUT inserted.last_value AS nextValue;
  `);

  const sequenceValue = Number(result.recordset[0]?.nextValue || 0);

  if (sequenceValue <= maxExisting) {
    const correctedValue = maxExisting + 1;
    await transaction
      .request()
      .input("sequenceYear", sql.Int, year)
      .input("correctedValue", sql.Int, correctedValue)
      .query(`
        UPDATE OrderNumberSequences
        SET last_value = @correctedValue, updated_at = GETDATE()
        WHERE sequence_year = @sequenceYear
      `);
    return correctedValue;
  }

  return sequenceValue;
}

async function loadCatalogMaps(pool, normalizedItems) {
  const productIds = Array.from(
    new Set(
      normalizedItems
        .filter((item) => item.itemType === "product" && Number.isInteger(item.productId))
        .map((item) => Number(item.productId))
    )
  );
  const planterIds = Array.from(
    new Set(
      normalizedItems
        .flatMap((item) => {
          const ids = [];
          if ((item.itemType === "planter" || item.itemType === "accessory") && Number.isInteger(item.productId)) {
            ids.push(Number(item.productId));
          }
          if (item.itemType === "product" && Number.isInteger(item.planterId)) {
            ids.push(Number(item.planterId));
          }
          return ids;
        })
    )
  );

  const productMap = new Map();
  const planterMap = new Map();

  if (productIds.length > 0) {
    const productResult = await pool.request().query(`
      SELECT id, title, price, image_url AS imageUrl, in_stock AS inStock, planter_options AS planterOptions
      FROM Products
      WHERE id IN (${productIds.join(",")})
    `);

    for (const row of productResult.recordset) {
      productMap.set(Number(row.id), row);
    }
  }

  if (planterIds.length > 0) {
    const planterResult = await pool.request().query(`
      SELECT id, name, price, image_url AS imageUrl, in_stock AS inStock, type
      FROM Planters
      WHERE id IN (${planterIds.join(",")})
    `);

    for (const row of planterResult.recordset) {
      planterMap.set(Number(row.id), row);
    }
  }

  return { productMap, planterMap };
}

function normalizeIncomingItems(items) {
  return items.map((item, index) => {
    const parsed = normalizeOrderItemProductId(item?.id);
    const quantity = Number.parseInt(item?.quantity, 10);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      const error = new Error(`Số lượng sản phẩm ở vị trí ${index + 1} không hợp lệ.`);
      error.status = 400;
      throw error;
    }

    if (!Number.isInteger(parsed.productId) || parsed.productId <= 0) {
      const error = new Error(`Mã sản phẩm ở vị trí ${index + 1} không hợp lệ.`);
      error.status = 400;
      throw error;
    }

    if (parsed.itemType === "unknown") {
      const error = new Error(`Không nhận diện được sản phẩm ở vị trí ${index + 1}.`);
      error.status = 400;
      throw error;
    }

    return {
      cartId: String(item?.id || "").trim(),
      itemType: parsed.itemType,
      productId: parsed.productId,
      planterId: Number.isInteger(parsed.planterId) && parsed.planterId > 0 ? parsed.planterId : null,
      quantity,
    };
  });
}

function buildCanonicalOrderItems(normalizedItems, productMap, planterMap) {
  return normalizedItems.map((item, index) => {
    if (item.itemType === "product") {
      const product = productMap.get(Number(item.productId));
      if (!product || !product.inStock) {
        const error = new Error(`Sản phẩm ở vị trí ${index + 1} không tồn tại hoặc đã hết hàng.`);
        error.status = 400;
        throw error;
      }

      let selectedPlanter = null;
      if (item.planterId) {
        selectedPlanter = planterMap.get(Number(item.planterId));
        const allowedPlanterIds = parseJsonArray(product.planterOptions).map((value) => String(value));

        if (
          !selectedPlanter ||
          !selectedPlanter.inStock ||
          !allowedPlanterIds.includes(String(item.planterId))
        ) {
          const error = new Error(`Chậu đi kèm ở vị trí ${index + 1} không hợp lệ hoặc không còn hàng.`);
          error.status = 400;
          throw error;
        }
      }

      const unitPrice = Number(product.price || 0) + Number(selectedPlanter?.price || 0);
      return {
        itemType: "product",
        productId: Number(product.id),
        quantity: item.quantity,
        title: String(product.title || "").trim(),
        imageUrl: String(product.imageUrl || "").trim(),
        price: unitPrice,
        planterName: buildProductPlanterLabel(selectedPlanter),
      };
    }

    const planter = planterMap.get(Number(item.productId));
    if (!planter || !planter.inStock) {
      const error = new Error(`Mặt hàng ở vị trí ${index + 1} không tồn tại hoặc đã hết hàng.`);
      error.status = 400;
      throw error;
    }

    if (item.itemType === "accessory" && String(planter.type || "").trim().toLowerCase() !== "accessory") {
      const error = new Error(`Phụ kiện ở vị trí ${index + 1} không hợp lệ.`);
      error.status = 400;
      throw error;
    }

    if (item.itemType === "planter" && String(planter.type || "").trim().toLowerCase() === "accessory") {
      const error = new Error(`Chậu cây ở vị trí ${index + 1} không hợp lệ.`);
      error.status = 400;
      throw error;
    }

    return {
      itemType: item.itemType,
      productId: Number(planter.id),
      quantity: item.quantity,
      title: String(planter.name || "").trim(),
      imageUrl: String(planter.imageUrl || "").trim(),
      price: Number(planter.price || 0),
      planterName: String(planter.name || "").trim(),
    };
  });
}

function calculateOrderTotals(canonicalItems, shippingMethod) {
  const subtotal = canonicalItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
  const shippingFee = computeShippingFee(subtotal, shippingMethod);
  return {
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
  };
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
                o.subtotal, o.shipping_fee AS shippingFee, o.total, o.tracking_number AS trackingNumber,
                o.tracking_provider AS trackingProvider, o.tracking_url AS trackingUrl
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
                o.subtotal, o.shipping_fee AS shippingFee, o.total, o.tracking_number AS trackingNumber,
                o.tracking_provider AS trackingProvider, o.tracking_url AS trackingUrl
         FROM Orders o WHERE o.id = @id AND o.user_id = @userId`
      );

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại." });
    }

    const orders = await enrichOrders(pool, orderResult.recordset);
    return res.json(orders[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/orders
async function createOrder(req, res, next) {
  let transaction;
  let rolledBack = false;

  try {
    const { items, shippingAddress, paymentMethod, shippingMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống." });
    }

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    if (!normalizedPaymentMethod) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ." });
    }

    const normalizedShippingMethod = normalizeShippingMethod(shippingMethod);
    if (!normalizedShippingMethod) {
      return res.status(400).json({ message: "Phương thức vận chuyển không hợp lệ." });
    }

    const normalizedShippingAddress = String(shippingAddress || "").trim();
    if (!normalizedShippingAddress) {
      return res.status(400).json({ message: "Địa chỉ giao hàng không được để trống." });
    }

    const normalizedItems = normalizeIncomingItems(items);
    const pool = await getPool();
    const { productMap, planterMap } = await loadCatalogMaps(pool, normalizedItems);
    const canonicalItems = buildCanonicalOrderItems(normalizedItems, productMap, planterMap);
    const totals = calculateOrderTotals(canonicalItems, normalizedShippingMethod);

    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const year = new Date().getFullYear();
    const nextSequenceValue = await getNextOrderSequenceValue(transaction, year);
    if (!Number.isInteger(nextSequenceValue) || nextSequenceValue <= 0) {
      throw new Error("Không thể tạo mã đơn hàng mới.");
    }

    const orderId = buildOrderId(year, nextSequenceValue);

    await transaction
      .request()
      .input("id", sql.NVarChar, orderId)
      .input("userId", sql.Int, req.user.id)
      .input("status", sql.NVarChar, "pending")
      .input("shippingAddress", sql.NVarChar, normalizedShippingAddress)
      .input("paymentMethod", sql.NVarChar, normalizedPaymentMethod)
      .input("subtotal", sql.Decimal(18, 2), totals.subtotal)
      .input("shippingFee", sql.Decimal(18, 2), totals.shippingFee)
      .input("total", sql.Decimal(18, 2), totals.total)
      .query(
        `INSERT INTO Orders (id, user_id, status, shipping_address, payment_method, subtotal, shipping_fee, total)
         VALUES (@id, @userId, @status, @shippingAddress, @paymentMethod, @subtotal, @shippingFee, @total)`
      );

    for (const item of canonicalItems) {
      await transaction
        .request()
        .input("orderId", sql.NVarChar, orderId)
        .input("productId", sql.Int, item.productId)
        .input("title", sql.NVarChar, item.title)
        .input("price", sql.Decimal(18, 2), item.price)
        .input("quantity", sql.Int, item.quantity)
        .input("imageUrl", sql.NVarChar, item.imageUrl || null)
        .input("planterName", sql.NVarChar, item.planterName || "")
        .query(
          `INSERT INTO OrderItems (order_id, product_id, title, price, quantity, image_url, planter_name)
           VALUES (@orderId, @productId, @title, @price, @quantity, @imageUrl, @planterName)`
        );
    }

    await transaction
      .request()
      .input("orderId", sql.NVarChar, orderId)
      .input("status", sql.NVarChar, "Đặt hàng thành công")
      .input("done", sql.Bit, true)
      .query(
        `INSERT INTO OrderTimeline (order_id, status, event_date, done)
         VALUES (@orderId, @status, GETDATE(), @done)`
      );

    await transaction.commit();
    return res.status(201).json({
      orderId,
      message: "Đặt hàng thành công.",
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      total: totals.total,
    });
  } catch (err) {
    if (transaction && !rolledBack) {
      try {
        await transaction.rollback();
        rolledBack = true;
      } catch (rollbackError) {
        console.error("Rollback order transaction failed:", rollbackError.message || rollbackError);
      }
    }
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

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại." });
    }

    const { status } = orderResult.recordset[0];
    if (!["pending", "confirmed"].includes(status)) {
      return res.status(400).json({ message: "Không thể hủy đơn hàng ở trạng thái này." });
    }

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
    trackingProvider: normalizeTrackingProvider(o.trackingProvider),
    trackingUrl: buildTrackingUrl(o.trackingProvider, o.trackingNumber, o.trackingUrl),
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
