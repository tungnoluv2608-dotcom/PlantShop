ALTER TABLE Orders
ADD tracking_provider NVARCHAR(50) NULL,
    tracking_url NVARCHAR(1000) NULL;
GO
