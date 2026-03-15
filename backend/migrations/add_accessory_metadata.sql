IF COL_LENGTH('Planters', 'accessory_brand') IS NULL
BEGIN
  ALTER TABLE Planters
  ADD accessory_brand NVARCHAR(255) NULL;
END
GO

IF COL_LENGTH('Planters', 'accessory_uses') IS NULL
BEGIN
  ALTER TABLE Planters
  ADD accessory_uses NVARCHAR(MAX) NULL;
END
GO
