IF NOT EXISTS (
  SELECT 1
  FROM sys.tables
  WHERE name = 'WholesaleInquiries'
)
BEGIN
  CREATE TABLE WholesaleInquiries (
    id                 INT IDENTITY(1,1) PRIMARY KEY,
    company_name       NVARCHAR(255)  NOT NULL,
    contact_name       NVARCHAR(255)  NOT NULL,
    phone              NVARCHAR(50)   NOT NULL,
    email              NVARCHAR(255)  NOT NULL,
    estimated_quantity NVARCHAR(100),
    space_type         NVARCHAR(255),
    project_location   NVARCHAR(255),
    budget_range       NVARCHAR(255),
    timeline           NVARCHAR(255),
    note               NVARCHAR(MAX),
    status             NVARCHAR(50)   NOT NULL DEFAULT 'new',
    source             NVARCHAR(100)  NOT NULL DEFAULT 'website_wholesale',
    assigned_to        NVARCHAR(255),
    admin_note         NVARCHAR(MAX),
    created_at         DATETIME       NOT NULL DEFAULT GETDATE(),
    updated_at         DATETIME       NOT NULL DEFAULT GETDATE(),
    contacted_at       DATETIME       NULL,
    closed_at          DATETIME       NULL
  );

  CREATE INDEX IX_WholesaleInquiries_Status
    ON WholesaleInquiries(status);

  CREATE INDEX IX_WholesaleInquiries_CreatedAt
    ON WholesaleInquiries(created_at DESC);
END

IF COL_LENGTH('WholesaleInquiries', 'project_location') IS NULL
BEGIN
  ALTER TABLE WholesaleInquiries ADD project_location NVARCHAR(255);
END

IF COL_LENGTH('WholesaleInquiries', 'budget_range') IS NULL
BEGIN
  ALTER TABLE WholesaleInquiries ADD budget_range NVARCHAR(255);
END

IF COL_LENGTH('WholesaleInquiries', 'timeline') IS NULL
BEGIN
  ALTER TABLE WholesaleInquiries ADD timeline NVARCHAR(255);
END
