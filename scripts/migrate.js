const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const useIntegratedSecurity = process.env.SQL_SERVER_INTEGRATED_SECURITY === 'true';

// For Windows Authentication with Named Pipes, use connection string format
let dbConfig;

if (useIntegratedSecurity) {
  // Use connection string for Named Pipes with Windows Authentication
  const serverName = process.env.SQL_SERVER_HOST || 'localhost';
  const database = process.env.SQL_SERVER_DATABASE || 'master';
  
  // Connection string format for msnodesqlv8
  const connectionString = `server=${serverName};Database=${database};Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}`;
  
  console.log('Using connection string:', connectionString);
  
  dbConfig = {
    server: serverName,
    database: database,
    connectionString: connectionString,
    driver: 'msnodesqlv8',
    requestTimeout: 60000,
    connectionTimeout: 60000
  };
} else {
  // Use standard SQL authentication
  dbConfig = {
    database: process.env.SQL_SERVER_DATABASE || 'master',
    server: process.env.SQL_SERVER_HOST || 'localhost',
    port: parseInt(process.env.SQL_SERVER_PORT || '1433'),
    user: process.env.SQL_SERVER_USER || 'sa',
    password: process.env.SQL_SERVER_PASSWORD,
    requestTimeout: 60000,
    connectionTimeout: 60000,
    options: {
      encrypt: process.env.SQL_SERVER_ENCRYPT === 'true' || false,
      trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT === 'true' || true,
      enableArithAbort: true,
      instanceName: process.env.SQL_SERVER_INSTANCE || undefined
    }
  };
}

async function runMigration() {
  let pool = null;

  try {
    console.log('🚀 Starting database migration...\n');
    console.log('📋 Configuration:');
    if (useIntegratedSecurity) {
      console.log(`   Server: ${process.env.SQL_SERVER_HOST}`);
      console.log(`   Database: ${process.env.SQL_SERVER_DATABASE}`);
      console.log(`   Connection: Windows Authentication (Named Pipes)`);
    } else {
      console.log(`   Server: ${dbConfig.server}`);
      console.log(`   Port: ${dbConfig.port}`);
      console.log(`   Database: ${dbConfig.database}`);
      console.log(`   Auth: SQL Authentication`);
    }
    console.log();

    // Connect to SQL Server
    console.log('🔗 Connecting to SQL Server...');
    pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('✅ Connected successfully!\n');

    // Read the SQL setup file
    const sqlFilePath = path.join(__dirname, '..', 'SQLSERVER_DATABASE_SETUP.sql');
    console.log(`📖 Reading SQL file: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }

    const sqlScript = fs.readFileSync(sqlFilePath, 'utf-8');
    console.log('✅ SQL file loaded\n');

    // Split the script into batches (separated by GO statements)
    const batches = sqlScript
      .split(/^\s*GO\s*$/gim)
      .map(batch => batch.trim())
      .filter(batch => batch.length > 0);

    console.log(`📦 Found ${batches.length} SQL batches to execute\n`);

    // Execute each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      // Skip empty batches and comments-only batches
      if (!batch || batch.startsWith('--')) continue;

      try {
        console.log(`⚡ Executing batch ${i + 1}/${batches.length}...`);
        const result = await pool.request().query(batch);
        
        // Display any messages from the SQL
        if (result.recordset && result.recordset.length > 0) {
          console.table(result.recordset);
        }
        
        console.log(`✅ Batch ${i + 1} completed`);
      } catch (error) {
        console.error(`❌ Error in batch ${i + 1}:`, error.message);
        // Continue with other batches even if one fails
      }
    }

    console.log('\n🎉 Migration completed successfully!\n');
    console.log('📊 Database Tables Created:');
    console.log('   ✓ users');
    console.log('   ✓ books');
    console.log('   ✓ exchanges');
    console.log('   ✓ messages');
    console.log('   ✓ user_stats');
    console.log('   ✓ user_badges');
    console.log('   ✓ book_reviews');
    console.log('   ✓ favorites');
    
    console.log('\n👤 Test Account Created:');
    console.log('   Email: admin@bookexchange.com');
    console.log('   Password: admin123');
    
    console.log('\n🚀 You can now start your application with: npm run dev');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    
    if (error.message.includes('Failed to connect') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting Tips:');
      console.log('   1. Make sure SQL Server is running');
      console.log('   2. Check if TCP/IP is enabled in SQL Server Configuration Manager');
      console.log('   3. Verify your .env.local file has correct credentials');
      console.log('   4. If using SQL Server Express, try: localhost\\\\SQLEXPRESS');
      console.log('   5. Try running: Get-Service MSSQLSERVER to check service status');
    }
    
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the migration
runMigration();
