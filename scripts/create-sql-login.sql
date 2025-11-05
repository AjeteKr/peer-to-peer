USE master;
GO

-- Create SQL Server login if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'bookexchange_user')
BEGIN
    CREATE LOGIN bookexchange_user WITH PASSWORD = 'BookExchange123!';
    PRINT 'Login created successfully';
END
ELSE
BEGIN
    PRINT 'Login already exists';
END
GO

-- Grant access to the database
USE [peer-to-peer];
GO

-- Create user in the database
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'bookexchange_user')
BEGIN
    CREATE USER bookexchange_user FOR LOGIN bookexchange_user;
    PRINT 'User created in database';
END
ELSE
BEGIN
    PRINT 'User already exists in database';
END
GO

-- Grant permissions
ALTER ROLE db_owner ADD MEMBER bookexchange_user;
GO

PRINT 'SQL Server login setup completed!';
PRINT 'Username: bookexchange_user';
PRINT 'Password: BookExchange123!';
