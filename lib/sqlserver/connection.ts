import sql from 'mssql';

interface DatabaseConfig {
  user?: string;
  password?: string;
  database: string;
  server: string;
  port?: number;
  driver?: string;
  connectionString?: string;
  requestTimeout?: number;
  connectionTimeout?: number;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
    enableArithAbort?: boolean;
    instanceName?: string;
    integratedSecurity?: boolean;
    trustedConnection?: boolean;
  };
}

// Function to get database configuration dynamically
function getDatabaseConfig(): DatabaseConfig {
  const useIntegratedSecurity = process.env.SQL_SERVER_INTEGRATED_SECURITY === 'true';
  
  console.log('🔧 Environment check:');
  console.log('   SQL_SERVER_INTEGRATED_SECURITY:', process.env.SQL_SERVER_INTEGRATED_SECURITY);
  console.log('   SQL_SERVER_HOST:', process.env.SQL_SERVER_HOST);
  console.log('   SQL_SERVER_DATABASE:', process.env.SQL_SERVER_DATABASE);
  console.log('   Using integrated security:', useIntegratedSecurity);
  
  if (useIntegratedSecurity) {
    throw new Error('Windows Authentication is not supported. Please use SQL Server Authentication.');
  }
  
  // Always use standard tedious driver for SQL Authentication
  return {
    database: process.env.SQL_SERVER_DATABASE || 'master',
    server: process.env.SQL_SERVER_HOST || 'localhost',
    port: parseInt(process.env.SQL_SERVER_PORT || '1433'),
    user: process.env.SQL_SERVER_USER || 'sa',
    password: process.env.SQL_SERVER_PASSWORD!,
    requestTimeout: 30000,
    connectionTimeout: 30000,
    options: {
      encrypt: process.env.SQL_SERVER_ENCRYPT === 'true' || false,
      trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT === 'true' || true,
      enableArithAbort: true,
      instanceName: process.env.SQL_SERVER_INSTANCE || undefined
    }
  };
}

let pool: sql.ConnectionPool | null = null;
let useWindowsAuth = false;
let currentConfig: string | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    // Get configuration dynamically
    const dbConfig = getDatabaseConfig();
    const configHash = JSON.stringify(dbConfig);
    
    // If configuration changed, close old pool
    if (currentConfig && currentConfig !== configHash && pool) {
      console.log('🔄 Configuration changed, closing old connection...');
      await pool.close();
      pool = null;
    }
    
    currentConfig = configHash;
    
    if (pool && pool.connected) {
      return pool;
    }

    console.log('🔗 Connecting to SQL Server...');
    
    // Close existing connection if any
    if (pool) {
      await pool.close();
    }

    useWindowsAuth = dbConfig.driver === 'msnodesqlv8';
    
    console.log(`📋 Using ${useWindowsAuth ? 'Windows Authentication (Named Pipes)' : 'SQL Authentication'}`);
    console.log(`📍 Server: ${dbConfig.server}, Database: ${dbConfig.database}`);
    
    // Always use default tedious driver for SQL Authentication
    console.log('✅ Creating connection with tedious driver (SQL Auth)');
    pool = new sql.ConnectionPool(dbConfig);
    
    // Handle connection events
    pool.on('connect', () => {
      console.log('✅ Connected to SQL Server database');
    });

    pool.on('error', (err) => {
      console.error('❌ SQL Server connection error:', err);
      pool = null;
    });

    console.log('🔌 Initiating connection...');
    await pool.connect();
    console.log('✅ Connection established successfully!');
    return pool;
    
  } catch (error) {
    console.error('❌ Failed to connect to SQL Server:', error);
    
    // Log the full error object for msnodesqlv8 errors
    if (error && typeof error === 'object') {
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Try to access nested error properties
      const anyError = error as any;
      if (anyError.originalError) {
        console.error('Original error:', anyError.originalError);
      }
      if (anyError.code) {
        console.error('Error code:', anyError.code);
      }
    }
    
    pool = null;
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeQuery<T = any>(
  query: string, 
  params?: Record<string, any>
): Promise<T[]> {
  let connection: sql.ConnectionPool | null = null;
  
  try {
    connection = await getConnection();
    const request = connection.request();
    
    // Add parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Determine SQL type based on JavaScript type
        if (typeof value === 'string') {
          request.input(key, sql.NVarChar, value);
        } else if (typeof value === 'number') {
          if (Number.isInteger(value)) {
            request.input(key, sql.Int, value);
          } else {
            request.input(key, sql.Decimal(10, 2), value);
          }
        } else if (typeof value === 'boolean') {
          request.input(key, sql.Bit, value);
        } else if (value instanceof Date) {
          request.input(key, sql.DateTime2, value);
        } else if (value === null || value === undefined) {
          request.input(key, sql.NVarChar, null);
        } else {
          // Default to string for complex types
          request.input(key, sql.NVarChar, JSON.stringify(value));
        }
      });
    }
    
    const result = await request.query(query);
    return result.recordset || [];
    
  } catch (error) {
    console.error('❌ SQL Query Error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeTransaction<T = any>(
  queries: Array<{ query: string; params?: Record<string, any> }>
): Promise<T[][]> {
  let connection: sql.ConnectionPool | null = null;
  let transaction: sql.Transaction | null = null;
  
  try {
    connection = await getConnection();
    transaction = new sql.Transaction(connection);
    await transaction.begin();
    
    const results: T[][] = [];
    
    for (const { query, params } of queries) {
      const request = new sql.Request(transaction);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (typeof value === 'string') {
            request.input(key, sql.NVarChar, value);
          } else if (typeof value === 'number') {
            if (Number.isInteger(value)) {
              request.input(key, sql.Int, value);
            } else {
              request.input(key, sql.Decimal(10, 2), value);
            }
          } else if (typeof value === 'boolean') {
            request.input(key, sql.Bit, value);
          } else if (value instanceof Date) {
            request.input(key, sql.DateTime2, value);
          } else {
            request.input(key, sql.NVarChar, value);
          }
        });
      }
      
      const result = await request.query(query);
      results.push(result.recordset || []);
    }
    
    await transaction.commit();
    return results;
    
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('❌ Transaction Error:', error);
    throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to test connection  
export async function testConnection(): Promise<{ success: boolean; serverVersion?: string; database?: string; error?: string }> {
  try {
    console.log('🧪 Running connection test...');
    // Simple connection test
    const connection = await getConnection();
    console.log('📡 Connection obtained, connection type:', connection.constructor.name);
    
    // Try using request method properly
    const request = connection.request();
    console.log('📋 Request created');
    console.log('📋 All request properties:', Object.keys(request));
    console.log('📋 typeof request.query:', typeof (request as any).query);
    
    // Try calling query
    const result = await (request as any).query('SELECT @@VERSION as version, DB_NAME() as database_name');
    console.log('✅ Test query executed successfully');
    
    if (result.recordset && result.recordset.length > 0) {
      return {
        success: true,
        serverVersion: result.recordset[0].version,
        database: result.recordset[0].database_name
      };
    }
    return { success: false, error: 'No version information returned' };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.error('❌ Error stack:', (error as any)?.stack);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Cleanup function
export async function closeConnection(): Promise<void> {
  if (pool && pool.connected) {
    await pool.close();
    pool = null;
    console.log('🔌 SQL Server connection closed');
  }
}

export { sql };