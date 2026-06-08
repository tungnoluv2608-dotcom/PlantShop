const { sql } = require("../libs/db");

function parseStockQuantity(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

function resolveStockFields({ stockQuantity, inStock, previousStockQuantity = 0 }) {
  const parsed = parseStockQuantity(stockQuantity);
  let quantity;

  if (parsed !== null) {
    quantity = parsed;
  } else if (inStock === false) {
    quantity = 0;
  } else if (inStock === true) {
    quantity = previousStockQuantity > 0 ? previousStockQuantity : 1;
  } else {
    quantity = Math.max(0, Number(previousStockQuantity) || 0);
  }

  return {
    stockQuantity: quantity,
    inStock: quantity > 0,
  };
}

function mapStockRow(row) {
  const stockQuantity = Math.max(0, Number(row.stockQuantity ?? row.stock_quantity ?? 0));
  return {
    ...row,
    stockQuantity,
    inStock: stockQuantity > 0,
  };
}

function buildInsufficientStockError(label, available, index) {
  const error = new Error(
    available > 0
      ? `${label} ở vị trí ${index + 1} chỉ còn ${available} sản phẩm trong kho.`
      : `${label} ở vị trí ${index + 1} đã hết hàng.`
  );
  error.status = 400;
  return error;
}

function assertStockAvailable(entity, quantity, label, index) {
  const stockQuantity = Math.max(0, Number(entity?.stockQuantity ?? 0));
  if (stockQuantity < quantity) {
    throw buildInsufficientStockError(label, stockQuantity, index);
  }
}

function validateOrderItemStock(canonicalItems, productMap, planterMap) {
  for (let index = 0; index < canonicalItems.length; index += 1) {
    const item = canonicalItems[index];
    if (item.itemType === "product") {
      const product = productMap.get(Number(item.productId));
      assertStockAvailable(product, item.quantity, "Sản phẩm", index);

      if (item.planterId) {
        const selectedPlanter = planterMap.get(Number(item.planterId));
        assertStockAvailable(selectedPlanter, item.quantity, "Chậu đi kèm", index);
      }
      continue;
    }

    const planter = planterMap.get(Number(item.productId));
    assertStockAvailable(planter, item.quantity, "Mặt hàng", index);
  }
}

async function deductProductStock(transaction, productId, quantity) {
  const result = await transaction
    .request()
    .input("id", sql.Int, productId)
    .input("qty", sql.Int, quantity)
    .query(
      `UPDATE Products
       SET stock_quantity = stock_quantity - @qty,
           in_stock = CASE WHEN stock_quantity - @qty > 0 THEN 1 ELSE 0 END
       WHERE id = @id AND stock_quantity >= @qty`
    );

  if (result.rowsAffected[0] === 0) {
    const error = new Error("Không đủ số lượng tồn kho cho sản phẩm.");
    error.status = 400;
    throw error;
  }
}

async function deductPlanterStock(transaction, planterId, quantity) {
  const result = await transaction
    .request()
    .input("id", sql.Int, planterId)
    .input("qty", sql.Int, quantity)
    .query(
      `UPDATE Planters
       SET stock_quantity = stock_quantity - @qty,
           in_stock = CASE WHEN stock_quantity - @qty > 0 THEN 1 ELSE 0 END
       WHERE id = @id AND stock_quantity >= @qty`
    );

  if (result.rowsAffected[0] === 0) {
    const error = new Error("Không đủ số lượng tồn kho cho chậu/phụ kiện.");
    error.status = 400;
    throw error;
  }
}

async function restoreProductStock(transaction, productId, quantity) {
  await transaction
    .request()
    .input("id", sql.Int, productId)
    .input("qty", sql.Int, quantity)
    .query(
      `UPDATE Products
       SET stock_quantity = stock_quantity + @qty,
           in_stock = CASE WHEN stock_quantity + @qty > 0 THEN 1 ELSE 0 END
       WHERE id = @id`
    );
}

async function restorePlanterStock(transaction, planterId, quantity) {
  await transaction
    .request()
    .input("id", sql.Int, planterId)
    .input("qty", sql.Int, quantity)
    .query(
      `UPDATE Planters
       SET stock_quantity = stock_quantity + @qty,
           in_stock = CASE WHEN stock_quantity + @qty > 0 THEN 1 ELSE 0 END
       WHERE id = @id`
    );
}

async function deductStockForOrderItems(transaction, items) {
  for (const item of items) {
    if (item.itemType === "product") {
      await deductProductStock(transaction, item.productId, item.quantity);
      if (item.planterId) {
        await deductPlanterStock(transaction, item.planterId, item.quantity);
      }
      continue;
    }

    await deductPlanterStock(transaction, item.productId, item.quantity);
  }
}

async function restoreStockForOrderItems(transaction, items) {
  for (const item of items) {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    if (quantity <= 0) continue;

    const itemType = String(item.itemType || "").trim().toLowerCase();
    if (itemType === "product") {
      await restoreProductStock(transaction, item.productId, quantity);
      if (item.planterId) {
        await restorePlanterStock(transaction, item.planterId, quantity);
      }
      continue;
    }

    if (itemType === "planter" || itemType === "accessory") {
      await restorePlanterStock(transaction, item.productId, quantity);
    }
  }
}

async function loadOrderItemsForStockRestore(poolOrTransaction, orderId) {
  const request = poolOrTransaction.request();
  const result = await request.input("orderId", sql.NVarChar, orderId).query(
    `SELECT product_id AS productId, quantity, item_type AS itemType, planter_id AS planterId
     FROM OrderItems
     WHERE order_id = @orderId`
  );
  return result.recordset;
}

async function restoreOrderStock(pool, orderId) {
  const orderResult = await pool
    .request()
    .input("orderId", sql.NVarChar, orderId)
    .query("SELECT stock_reserved AS stockReserved FROM Orders WHERE id = @orderId");

  if (orderResult.recordset.length === 0) return false;
  if (!orderResult.recordset[0].stockReserved) return false;

  const items = await loadOrderItemsForStockRestore(pool, orderId);
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    await restoreStockForOrderItems(transaction, items);
    await transaction
      .request()
      .input("orderId", sql.NVarChar, orderId)
      .query("UPDATE Orders SET stock_reserved = 0 WHERE id = @orderId");
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  parseStockQuantity,
  resolveStockFields,
  mapStockRow,
  validateOrderItemStock,
  deductStockForOrderItems,
  restoreStockForOrderItems,
  loadOrderItemsForStockRestore,
  restoreOrderStock,
};