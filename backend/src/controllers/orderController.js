const { getPool, sql } = require("../libs/db");

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

module.exports = { getMyOrders, getOrderById, createOrder, cancelOrder };
