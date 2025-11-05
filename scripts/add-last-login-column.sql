-- Add last_login_at column to users table for security tracking
USE [peer-to-peer];
GO

-- Check if column already exists
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login_at'
)
BEGIN
    -- Add last_login_at column (nullable, no default - will be set on first login)
    ALTER TABLE users
    ADD last_login_at DATETIME2 NULL;
    
    PRINT 'last_login_at column added successfully';
END
ELSE
BEGIN
    PRINT 'last_login_at column already exists';
END
GO

-- Verify the column was added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login_at';
GO

PRINT 'Last login tracking enabled - useful for security and user analytics';
GO
