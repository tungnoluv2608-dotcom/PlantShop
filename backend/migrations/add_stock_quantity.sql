-- Stock quantity for Products and Planters
IF COL_LENGTH('Products', 'stock_quantity') IS NULL
BEGIN
  ALTER TABLE Products
  ADD stock_quantity INT NOT NULL
    CONSTRAINT DF_Products_stock_quantity DEFAULT 0
    WITH VALUES;
END
GO

IF COL_LENGTH('Planters', 'stock_quantity') IS NULL
BEGIN
  ALTER TABLE Planters
  ADD stock_quantity INT NOT NULL
    CONSTRAINT DF_Planters_stock_quantity DEFAULT 0
    WITH VALUES;
END
GO

-- Backfill from legacy in_stock flag
UPDATE Products
SET stock_quantity = CASE WHEN in_stock = 1 THEN 50 ELSE 0 END
WHERE stock_quantity = 0;
GO

UPDATE Planters
SET stock_quantity = CASE WHEN in_stock = 1 THEN 50 ELSE 0 END
WHERE stock_quantity = 0;
GO

-- Order item metadata for stock restore on cancel
IF COL_LENGTH('OrderItems', 'item_type') IS NULL
BEGIN
  ALTER TABLE OrderItems
  ADD item_type NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('OrderItems', 'planter_id') IS NULL
BEGIN
  ALTER TABLE OrderItems
  ADD planter_id INT NULL;
END
GO

IF COL_LENGTH('Orders', 'stock_reserved') IS NULL
BEGIN
  ALTER TABLE Orders
  ADD stock_reserved BIT NOT NULL
    CONSTRAINT DF_Orders_stock_reserved DEFAULT 0
    WITH VALUES;
END
GO