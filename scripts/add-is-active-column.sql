-- Add is_active column to users table for account management
USE [peer-to-peer];
GO

-- Check if column already exists
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active'
)
BEGIN
    -- Add is_active column (default TRUE for all existing users)
    ALTER TABLE users
    ADD is_active BIT NOT NULL DEFAULT 1;
    
    PRINT 'is_active column added successfully';
END
ELSE
BEGIN
    PRINT 'is_active column already exists';
END
GO

-- Verify the column was added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active';
GO

PRINT 'Account status management enabled - admins can now ban/activate users';
GO
