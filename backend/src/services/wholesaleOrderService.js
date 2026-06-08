const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sql } = require("../libs/db");
const { calculateOrderTotalsWithVoucher } = require("./voucherService");
const {
  mapStockRow,
  validateOrderItemStock,
  deductStockForOrderItems,
} = require("./stockService");

function parseJsonArray(rawValue) {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseQuantityNumber(rawValue) {
  const match = String(rawValue || "").match(/\d+/);
  if (!match) return 1;
  const value = Number.parseInt(match[0], 10);
  return Number.isInteger(value) && value > 0 ? value : 1;
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
      SELECT 1 FROM sys.tables WHERE name = 'OrderNumberSequences'
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
    .input("yearPrefix", sql.NVarChar, `${yearPrefix}%`)
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
      UPDATE SET last_value = target.last_value + 1, updated_at = GETDATE()
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

async function findOrCreateCustomer(pool, { name, email }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const existing = await pool
    .request()
    .input("email", sql.NVarChar, normalizedEmail)
    .query("SELECT id, name, email FROM Users WHERE email = @email");

  if (existing.recordset.length > 0) {
    return existing.recordset[0];
  }

  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
  const result = await pool
    .request()
    .input("name", sql.NVarChar, String(name || "Khách B2B").trim())
    .input("email", sql.NVarChar, normalizedEmail)
    .input("passwordHash", sql.NVarChar, passwordHash)
    .query(
      `INSERT INTO Users (name, email, password_hash, role)
       OUTPUT INSERTED.id, INSERTED.name, INSERTED.email
       VALUES (@name, @email, @passwordHash, 'customer')`
    );

  return result.recordset[0];
}

function normalizeWholesaleOrderItems(rawItems, fallbackQuantity) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    const error = new Error("Không có sản phẩm để tạo đơn hàng.");
    error.status = 400;
    throw error;
  }

  return rawItems.map((item, index) => {
    const productId = Number(item?.productId ?? item?.id);
    const quantity = Number.parseInt(item?.quantity, 10);
    const resolvedQuantity =
      Number.isInteger(quantity) && quantity > 0 ? quantity : fallbackQuantity;

    if (!Number.isInteger(productId) || productId <= 0) {
      const error = new Error(`Mã sản phẩm ở vị trí ${index + 1} không hợp lệ.`);
      error.status = 400;
      throw error;
    }

    if (!Number.isInteger(resolvedQuantity) || resolvedQuantity <= 0) {
      const error = new Error(`Số lượng ở vị trí ${index + 1} không hợp lệ.`);
      error.status = 400;
      throw error;
    }

    return {
      cartId: `product-${productId}`,
      itemType: "product",
      productId,
      planterId: null,
      quantity: resolvedQuantity,
    };
  });
}

async function loadProductMap(pool, productIds) {
  const productMap = new Map();
  if (productIds.length === 0) return productMap;

  const result = await pool.request().query(`
    SELECT id, title, price, image_url AS imageUrl, in_stock AS inStock,
           stock_quantity AS stockQuantity, category_id AS categoryId
    FROM Products
    WHERE id IN (${productIds.join(",")})
  `);

  for (const row of result.recordset) {
    productMap.set(Number(row.id), mapStockRow(row));
  }

  return productMap;
}

function buildCanonicalItems(normalizedItems, productMap) {
  return normalizedItems.map((item, index) => {
    const product = productMap.get(Number(item.productId));
    if (!product || !product.inStock) {
      const error = new Error(`Sản phẩm ở vị trí ${index + 1} không tồn tại hoặc đã hết hàng.`);
      error.status = 400;
      throw error;
    }

    return {
      itemType: "product",
      productId: Number(product.id),
      planterId: null,
      categoryId: product.categoryId != null ? Number(product.categoryId) : null,
      quantity: item.quantity,
      title: String(product.title || "").trim(),
      imageUrl: String(product.imageUrl || "").trim(),
      price: Number(product.price || 0),
      planterName: "",
    };
  });
}

function buildDefaultItemsFromInquiry(inquiry) {
  const products = Array.isArray(inquiry.interestedProducts) ? inquiry.interestedProducts : [];
  const fallbackQuantity = parseQuantityNumber(inquiry.quantity);
  return products.map((item) => ({
    productId: Number(item?.id),
    quantity: fallbackQuantity,
  }));
}

async function createOrderFromWholesaleInquiry(pool, inquiry, options = {}) {
  if (inquiry.orderId) {
    const error = new Error("Yêu cầu này đã được liên kết với một đơn hàng.");
    error.status = 409;
    throw error;
  }

  const fallbackQuantity = parseQuantityNumber(inquiry.quantity);
  const rawItems = Array.isArray(options.items) && options.items.length > 0
    ? options.items
    : buildDefaultItemsFromInquiry(inquiry);

  const normalizedItems = normalizeWholesaleOrderItems(rawItems, fallbackQuantity);
  const productIds = Array.from(new Set(normalizedItems.map((item) => item.productId)));
  const productMap = await loadProductMap(pool, productIds);
  const planterMap = new Map();
  const canonicalItems = buildCanonicalItems(normalizedItems, productMap);
  validateOrderItemStock(canonicalItems, productMap, planterMap);

  const customer = await findOrCreateCustomer(pool, {
    name: inquiry.contact || inquiry.company,
    email: inquiry.email,
  });

  const shippingAddress = String(inquiry.location || inquiry.company || "Chưa cập nhật").trim();
  const totals = await calculateOrderTotalsWithVoucher(
    pool,
    canonicalItems,
    options.shippingMethod || "standard",
    null,
    { province: null, district: null, ward: null }
  );

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const year = new Date().getFullYear();
    const nextSequenceValue = await getNextOrderSequenceValue(transaction, year);
    const orderId = buildOrderId(year, nextSequenceValue);
    const internalNote = `Tạo từ yêu cầu B2B #${inquiry.id}`;

    await transaction
      .request()
      .input("id", sql.NVarChar, orderId)
      .input("userId", sql.Int, customer.id)
      .input("status", sql.NVarChar, "pending")
      .input("shippingAddress", sql.NVarChar, shippingAddress)
      .input("paymentMethod", sql.NVarChar, options.paymentMethod || "cod")
      .input("subtotal", sql.Decimal(18, 2), totals.subtotal)
      .input("shippingFee", sql.Decimal(18, 2), totals.shippingFee)
      .input("discountAmount", sql.Decimal(18, 2), totals.discountAmount)
      .input("voucherId", sql.Int, null)
      .input("voucherCode", sql.NVarChar, null)
      .input("total", sql.Decimal(18, 2), totals.total)
      .input("shippingMethod", sql.NVarChar, options.shippingMethod || "standard")
      .input("recipientName", sql.NVarChar, inquiry.contact || customer.name)
      .input("recipientPhone", sql.NVarChar, inquiry.phone || null)
      .input("province", sql.NVarChar, null)
      .input("district", sql.NVarChar, null)
      .input("ward", sql.NVarChar, null)
      .input("addressLine", sql.NVarChar, shippingAddress)
      .input("internalNote", sql.NVarChar, internalNote)
      .query(
        `INSERT INTO Orders (
           id, user_id, status, shipping_address, payment_method,
           subtotal, shipping_fee, discount_amount, voucher_id, voucher_code, total,
           shipping_method, recipient_name, recipient_phone, province, district, ward, address_line,
           internal_note
         )
         VALUES (
           @id, @userId, @status, @shippingAddress, @paymentMethod,
           @subtotal, @shippingFee, @discountAmount, @voucherId, @voucherCode, @total,
           @shippingMethod, @recipientName, @recipientPhone, @province, @district, @ward, @addressLine,
           @internalNote
         )`
      );

    await deductStockForOrderItems(transaction, canonicalItems);

    for (const item of canonicalItems) {
      await transaction
        .request()
        .input("orderId", sql.NVarChar, orderId)
        .input("productId", sql.Int, item.productId)
        .input("title", sql.NVarChar, item.title)
        .input("price", sql.Decimal(18, 2), item.price)
        .input("quantity", sql.Int, item.quantity)
        .input("imageUrl", sql.NVarChar, item.imageUrl || null)
        .input("planterName", sql.NVarChar, "")
        .input("itemType", sql.NVarChar, item.itemType)
        .input("planterId", sql.Int, null)
        .query(
          `INSERT INTO OrderItems (
             order_id, product_id, title, price, quantity, image_url, planter_name, item_type, planter_id
           )
           VALUES (
             @orderId, @productId, @title, @price, @quantity, @imageUrl, @planterName, @itemType, @planterId
           )`
        );
    }

    await transaction
      .request()
      .input("orderId", sql.NVarChar, orderId)
      .query("UPDATE Orders SET stock_reserved = 1 WHERE id = @orderId");

    await transaction
      .request()
      .input("orderId", sql.NVarChar, orderId)
      .input("status", sql.NVarChar, "Đặt hàng thành công")
      .input("done", sql.Bit, true)
      .query(
        `INSERT INTO OrderTimeline (order_id, status, event_date, done)
         VALUES (@orderId, @status, GETDATE(), @done)`
      );

    await transaction
      .request()
      .input("inquiryId", sql.Int, Number(inquiry.id))
      .input("orderId", sql.NVarChar, orderId)
      .query(
        `UPDATE WholesaleInquiries
         SET order_id = @orderId, updated_at = GETDATE()
         WHERE id = @inquiryId`
      );

    await transaction.commit();

    return {
      orderId,
      total: totals.total,
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      customerId: String(customer.id),
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

module.exports = {
  parseJsonArray,
  parseQuantityNumber,
  buildDefaultItemsFromInquiry,
  createOrderFromWholesaleInquiry,
};