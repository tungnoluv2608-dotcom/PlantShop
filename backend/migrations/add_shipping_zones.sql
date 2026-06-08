-- Zone-based shipping: configurable fees by province/district

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ShippingZones')
BEGIN
  CREATE TABLE ShippingZones (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    name                    NVARCHAR(255)  NOT NULL,
    province                NVARCHAR(255)  NULL,
    district                NVARCHAR(255)  NULL,
    standard_fee            DECIMAL(18, 2) NOT NULL DEFAULT 0,
    express_fee             DECIMAL(18, 2) NOT NULL DEFAULT 30000,
    sameday_fee             DECIMAL(18, 2) NOT NULL DEFAULT 60000,
    allows_sameday          BIT            NOT NULL DEFAULT 0,
    free_shipping_threshold DECIMAL(18, 2) NULL,
    priority                INT            NOT NULL DEFAULT 0,
    is_active               BIT            NOT NULL DEFAULT 1,
    created_at              DATETIME       NOT NULL DEFAULT GETDATE(),
    updated_at              DATETIME       NOT NULL DEFAULT GETDATE()
  );

  CREATE INDEX IX_ShippingZones_Lookup
    ON ShippingZones (is_active, priority DESC);
END
GO

IF NOT EXISTS (SELECT 1 FROM ShippingZones)
BEGIN
  INSERT INTO ShippingZones (
    name, province, district,
    standard_fee, express_fee, sameday_fee,
    allows_sameday, free_shipping_threshold, priority, is_active
  )
  VALUES
    (N'Mặc định toàn quốc', NULL, NULL, 35000, 45000, 60000, 0, 500000, 0, 1),
    (N'TP. Hồ Chí Minh', N'TP. Hồ Chí Minh', NULL, 20000, 30000, 50000, 1, 500000, 50, 1),
    (N'Hà Nội', N'Hà Nội', NULL, 20000, 30000, 50000, 1, 500000, 50, 1),
    (N'Đà Nẵng', N'Đà Nẵng', NULL, 25000, 35000, 0, 0, 500000, 50, 1);
END
GO