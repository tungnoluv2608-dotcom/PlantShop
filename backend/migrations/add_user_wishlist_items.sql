-- Migration: Add UserWishlistItems table for favorites/wishlist

USE PlantShopDB;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.tables
    WHERE name = 'UserWishlistItems'
)
BEGIN
    CREATE TABLE UserWishlistItems (
        id         INT IDENTITY(1,1) PRIMARY KEY,
        user_id    INT NOT NULL REFERENCES Users(id),
        product_id INT NOT NULL REFERENCES Products(id),
        created_at DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE UNIQUE INDEX UX_UserWishlistItems_User_Product
      ON UserWishlistItems(user_id, product_id);

    CREATE INDEX IX_UserWishlistItems_UserId
      ON UserWishlistItems(user_id);

    PRINT 'Created UserWishlistItems table';
END
ELSE
BEGIN
    PRINT 'UserWishlistItems table already exists';
END
GO
