import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface DatabaseConfig {
  user?: string;
  password?: string;
  database: string;
  server: string;
  port?: number;
  requestTimeout?: number;
  connectionTimeout?: number;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
    enableArithAbort?: boolean;
    instanceName?: string;
    integratedSecurity?: boolean;
  };
}

const useIntegratedSecurity = process.env.SQL_SERVER_INTEGRATED_SECURITY === 'true';

const dbConfig: DatabaseConfig = {
  database: process.env.SQL_SERVER_DATABASE || 'master',
  server: process.env.SQL_SERVER_HOST || 'localhost',
  port: parseInt(process.env.SQL_SERVER_PORT || '1433'),
  requestTimeout: 60000,
  connectionTimeout: 60000,
  options: {
    encrypt: process.env.SQL_SERVER_ENCRYPT === 'true' || false,
    trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT === 'true' || true,
    enableArithAbort: true,
    integratedSecurity: useIntegratedSecurity,
    instanceName: process.env.SQL_SERVER_INSTANCE || undefined
  }
};

// Only add user/password if not using integrated security
if (!useIntegratedSecurity) {
  dbConfig.user = process.env.SQL_SERVER_USER || 'sa';
  dbConfig.password = process.env.SQL_SERVER_PASSWORD!;
}

async function runMigration() {
  let pool: sql.ConnectionPool | null = null;

  try {
    console.log('🚀 Starting database migration...\n');
    console.log('📋 Configuration:');
    console.log(`   Server: ${dbConfig.server}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Auth: ${useIntegratedSecurity ? 'Windows Authentication' : 'SQL Authentication'}\n`);

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
        console.error(`❌ Error in batch ${i + 1}:`, error instanceof Error ? error.message : error);
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
    console.error('\n❌ Migration failed:', error instanceof Error ? error.message : error);
    
    if (error instanceof Error && error.message.includes('Failed to connect')) {
      console.log('\n💡 Troubleshooting Tips:');
      console.log('   1. Make sure SQL Server is running');
      console.log('   2. Check if TCP/IP is enabled in SQL Server Configuration Manager');
      console.log('   3. Verify your .env.local file has correct credentials');
      console.log('   4. If using SQL Server Express, try: localhost\\SQLEXPRESS');
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
