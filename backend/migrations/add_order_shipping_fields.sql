ALTER TABLE Orders
ADD shipping_method NVARCHAR(50) NULL,
    recipient_name NVARCHAR(255) NULL,
    recipient_phone NVARCHAR(50) NULL,
    province NVARCHAR(255) NULL,
    district NVARCHAR(255) NULL,
    ward NVARCHAR(255) NULL,
    address_line NVARCHAR(500) NULL,
    internal_note NVARCHAR(1000) NULL,
    weight_grams INT NULL;
GO