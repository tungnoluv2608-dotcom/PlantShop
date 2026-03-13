-- Migration: Add 'visible' column to Reviews table
-- Run this if the Reviews table was created before this column was added

USE PlantShopDB;
GO

-- Add visible column if it doesn't exist
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('Reviews') AND name = 'visible'
)
BEGIN
    ALTER TABLE Reviews ADD visible BIT NOT NULL DEFAULT 1;
    PRINT 'Added visible column to Reviews table';
END
ELSE
BEGIN
    PRINT 'visible column already exists in Reviews table';
END
GO
