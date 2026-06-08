-- Voucher system: codes, scopes, redemptions, order linkage

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Vouchers')
BEGIN
  CREATE TABLE Vouchers (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    code            NVARCHAR(50)  NOT NULL,
    name            NVARCHAR(255) NOT NULL,
    description     NVARCHAR(500) NULL,
    discount_type   NVARCHAR(20)  NOT NULL,
    discount_value  DECIMAL(18,2) NOT NULL,
    max_discount    DECIMAL(18,2) NULL,
    min_order_value DECIMAL(18,2) NOT NULL DEFAULT 0,
    usage_limit     INT NULL,
    usage_per_user  INT NOT NULL DEFAULT 1,
    starts_at       DATETIME      NOT NULL,
    expires_at      DATETIME      NOT NULL,
    is_active       BIT           NOT NULL DEFAULT 1,
    applies_to      NVARCHAR(20)  NOT NULL DEFAULT 'all',
    created_at      DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Vouchers_Code UNIQUE (code),
    CONSTRAINT CK_Vouchers_DiscountType CHECK (discount_type IN ('percent', 'fixed', 'freeship')),
    CONSTRAINT CK_Vouchers_AppliesTo CHECK (applies_to IN ('all', 'category', 'product'))
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'VoucherScopes')
BEGIN
  CREATE TABLE VoucherScopes (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    voucher_id  INT NOT NULL REFERENCES Vouchers(id) ON DELETE CASCADE,
    scope_type  NVARCHAR(20) NOT NULL,
    scope_id    INT NOT NULL,
    CONSTRAINT CK_VoucherScopes_Type CHECK (scope_type IN ('category', 'product'))
  );
  CREATE INDEX IX_VoucherScopes_VoucherId ON VoucherScopes(voucher_id);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'VoucherRedemptions')
BEGIN
  CREATE TABLE VoucherRedemptions (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    voucher_id      INT NOT NULL REFERENCES Vouchers(id),
    user_id         INT NOT NULL REFERENCES Users(id),
    order_id        NVARCHAR(50) NULL REFERENCES Orders(id),
    discount_amount DECIMAL(18,2) NOT NULL,
    redeemed_at     DATETIME NOT NULL DEFAULT GETDATE()
  );
  CREATE INDEX IX_VoucherRedemptions_VoucherId ON VoucherRedemptions(voucher_id);
  CREATE INDEX IX_VoucherRedemptions_UserId ON VoucherRedemptions(user_id);
  CREATE INDEX IX_VoucherRedemptions_OrderId ON VoucherRedemptions(order_id);
END
GO

IF COL_LENGTH('Orders', 'voucher_id') IS NULL
BEGIN
  ALTER TABLE Orders ADD
    voucher_id      INT NULL,
    voucher_code    NVARCHAR(50) NULL,
    discount_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Orders_DiscountAmount DEFAULT 0;
END
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Orders_VoucherId'
)
BEGIN
  ALTER TABLE Orders
    ADD CONSTRAINT FK_Orders_VoucherId FOREIGN KEY (voucher_id) REFERENCES Vouchers(id);
END
GO