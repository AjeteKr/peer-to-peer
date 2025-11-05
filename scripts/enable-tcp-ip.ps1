# PowerShell script to enable TCP/IP for SQL Server and create a SQL login

Write-Host "🔧 Enabling TCP/IP for SQL Server..." -ForegroundColor Cyan

# Enable TCP/IP using sqlcmd
Write-Host "`n1️⃣  Creating SQL Server login..." -ForegroundColor Yellow

$createLoginSQL = @'
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
'@

# Save SQL to temp file
$tempSqlFile = "$env:TEMP\setup-sql-login.sql"
$createLoginSQL | Out-File -FilePath $tempSqlFile -Encoding UTF8

# Execute SQL
Write-Host "Executing SQL script..." -ForegroundColor Yellow
sqlcmd -S localhost -E -i $tempSqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SQL login created successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to create SQL login" -ForegroundColor Red
    exit 1
}

# Clean up
Remove-Item $tempSqlFile -ErrorAction SilentlyContinue

Write-Host "`n2️⃣  Now enable TCP/IP in SQL Server Configuration Manager:" -ForegroundColor Yellow
Write-Host "   1. Open 'SQL Server Configuration Manager'" -ForegroundColor White
Write-Host "   2. Go to 'SQL Server Network Configuration' > 'Protocols for MSSQLSERVER'" -ForegroundColor White
Write-Host "   3. Right-click 'TCP/IP' and select 'Enable'" -ForegroundColor White
Write-Host "   4. Set 'TCP Port' to 1433 in IPAll section" -ForegroundColor White
Write-Host "   5. Restart SQL Server service" -ForegroundColor White

Write-Host "`n3️⃣  Or run this command to restart SQL Server after enabling TCP/IP:" -ForegroundColor Yellow
Write-Host "   Restart-Service -Name MSSQLSERVER -Force" -ForegroundColor Cyan

Write-Host "`n📝 SQL Credentials:" -ForegroundColor Green
Write-Host "   Username: bookexchange_user" -ForegroundColor White
Write-Host "   Password: BookExchange123!" -ForegroundColor White
Write-Host "   Database: peer-to-peer" -ForegroundColor White

Write-Host "`n💡 After enabling TCP/IP, update your .env.local file with:" -ForegroundColor Cyan
Write-Host "SQL_SERVER_HOST=localhost" -ForegroundColor White
Write-Host "SQL_SERVER_PORT=1433" -ForegroundColor White
Write-Host "SQL_SERVER_USER=bookexchange_user" -ForegroundColor White
Write-Host "SQL_SERVER_PASSWORD=BookExchange123!" -ForegroundColor White
Write-Host "SQL_SERVER_DATABASE=peer-to-peer" -ForegroundColor White
Write-Host "SQL_SERVER_INTEGRATED_SECURITY=false" -ForegroundColor White
Write-Host "SQL_SERVER_ENCRYPT=false" -ForegroundColor White
Write-Host "SQL_SERVER_TRUST_CERT=true" -ForegroundColor White
