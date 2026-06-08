-- Wholesale B2B enhancements: catalog interest, order link, admin assignment, activity log

IF COL_LENGTH('WholesaleInquiries', 'interested_categories') IS NULL
BEGIN
  ALTER TABLE WholesaleInquiries ADD interested_categories NVARCHAR(MAX);
END

IF COL_LENGTH('WholesaleInquiries', 'interested_products') IS NULL
BEGIN
  ALTER TABLE WholesaleInquiries ADD interested_products NVARCHAR(MAX);
END

IF COL_LENGTH('WholesaleInquiries', 'order_id') IS NULL
BEGIN
  ALTER TABLE WholesaleInquiries ADD order_id NVARCHAR(50) NULL;
END

IF COL_LENGTH('WholesaleInquiries', 'assigned_admin_id') IS NULL
BEGIN
  ALTER TABLE WholesaleInquiries ADD assigned_admin_id INT NULL;
END

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = 'FK_WholesaleInquiries_AssignedAdmin'
)
BEGIN
  ALTER TABLE WholesaleInquiries
    ADD CONSTRAINT FK_WholesaleInquiries_AssignedAdmin
    FOREIGN KEY (assigned_admin_id) REFERENCES Users(id);
END

IF NOT EXISTS (
  SELECT 1
  FROM sys.tables
  WHERE name = 'WholesaleInquiryActivities'
)
BEGIN
  CREATE TABLE WholesaleInquiryActivities (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    inquiry_id  INT            NOT NULL REFERENCES WholesaleInquiries(id) ON DELETE CASCADE,
    actor_id    INT            NULL REFERENCES Users(id),
    actor_name  NVARCHAR(255)  NOT NULL,
    action      NVARCHAR(100)  NOT NULL,
    details     NVARCHAR(MAX),
    created_at  DATETIME       NOT NULL DEFAULT GETDATE()
  );

  CREATE INDEX IX_WholesaleInquiryActivities_InquiryId
    ON WholesaleInquiryActivities(inquiry_id, created_at DESC);
END