-- Migration: Add UserAddresses table for server-side shipping address book

USE PlantShopDB;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.tables
    WHERE name = 'UserAddresses'
)
BEGIN
    CREATE TABLE UserAddresses (
        id           INT IDENTITY(1,1) PRIMARY KEY,
        user_id      INT            NOT NULL REFERENCES Users(id),
        label        NVARCHAR(100)  NOT NULL,
        full_name    NVARCHAR(255)  NOT NULL,
        phone        NVARCHAR(50)   NOT NULL,
        province     NVARCHAR(255)  NOT NULL,
        district     NVARCHAR(255)  NOT NULL,
        ward         NVARCHAR(255),
        address_line NVARCHAR(MAX)  NOT NULL,
        is_default   BIT            NOT NULL DEFAULT 0,
        created_at   DATETIME       NOT NULL DEFAULT GETDATE(),
        updated_at   DATETIME       NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_UserAddresses_UserId ON UserAddresses(user_id);
    PRINT 'Created UserAddresses table';
END
ELSE
BEGIN
    PRINT 'UserAddresses table already exists';
END
GO
