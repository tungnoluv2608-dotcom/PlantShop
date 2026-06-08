IF NOT EXISTS (
  SELECT 1 FROM sys.tables WHERE name = 'ShopPrintSettings'
)
BEGIN
  CREATE TABLE ShopPrintSettings (
    id           INT            NOT NULL PRIMARY KEY DEFAULT 1,
    shop_name    NVARCHAR(255)  NOT NULL,
    shop_phone   NVARCHAR(50)   NOT NULL,
    shop_address NVARCHAR(500)  NOT NULL,
    default_note NVARCHAR(500)  NULL,
    logo_url     NVARCHAR(1000) NULL,
    updated_at   DATETIME       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CK_ShopPrintSettings_singleton CHECK (id = 1)
  );
END
GO