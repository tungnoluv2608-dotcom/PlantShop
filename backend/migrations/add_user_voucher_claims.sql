IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'UserVoucherClaims')
BEGIN
  CREATE TABLE UserVoucherClaims (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    voucher_id INT NOT NULL REFERENCES Vouchers(id) ON DELETE CASCADE,
    claimed_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_UserVoucherClaims_User_Voucher UNIQUE (user_id, voucher_id)
  );
  CREATE INDEX IX_UserVoucherClaims_UserId ON UserVoucherClaims(user_id);
  CREATE INDEX IX_UserVoucherClaims_VoucherId ON UserVoucherClaims(voucher_id);
END
GO