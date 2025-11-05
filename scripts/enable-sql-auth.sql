-- Enable SQL Server Authentication (Mixed Mode)
USE master;
GO

-- Enable mixed mode authentication
EXEC xp_instance_regwrite 
    N'HKEY_LOCAL_MACHINE', 
    N'Software\Microsoft\MSSQLServer\MSSQLServer',
    N'LoginMode', 
    REG_DWORD, 
    2;
GO

-- Verify the login exists
IF EXISTS (SELECT * FROM sys.server_principals WHERE name = 'bookexchange_user')
BEGIN
    PRINT 'Login bookexchange_user exists';
    
    -- Make sure it's enabled
    ALTER LOGIN bookexchange_user ENABLE;
    PRINT 'Login enabled';
END
ELSE
BEGIN
    PRINT 'Login does not exist - creating it now';
    CREATE LOGIN bookexchange_user WITH PASSWORD = 'BookExchange123!';
    PRINT 'Login created';
END
GO

-- Grant access to peer-to-peer database
USE [peer-to-peer];
GO

-- Create user if not exists
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'bookexchange_user')
BEGIN
    CREATE USER bookexchange_user FOR LOGIN bookexchange_user;
    PRINT 'User created in peer-to-peer database';
END
GO

-- Grant full permissions
ALTER ROLE db_owner ADD MEMBER bookexchange_user;
GO

PRINT 'Setup completed! Please restart SQL Server for authentication mode changes to take effect.';
PRINT 'Username: bookexchange_user';
PRINT 'Password: BookExchange123!';
