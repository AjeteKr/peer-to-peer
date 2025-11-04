import sql from 'mssql';

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

// SQL Server configuration
const dbConfig: DatabaseConfig = {
  user: process.env.SQL_SERVER_USER || 'sa',
  password: process.env.SQL_SERVER_PASSWORD!,
  database: '.',
  server: process.env.SQL_SERVER_HOST || 'localhost',
  port: parseInt(process.env.SQL_SERVER_PORT || '1433'),
  requestTimeout: 30000,
  connectionTimeout: 30000,
  options: {
    encrypt: process.env.SQL_SERVER_ENCRYPT === 'true' || false,
    trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT === 'true' || true,
    enableArithAbort: true,
    instanceName: process.env.SQL_SERVER_INSTANCE || undefined
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    console.log('🔗 Connecting to SQL Server...');
    
    // Close existing connection if any
    if (pool) {
      await pool.close();
    }

    // Create new connection pool
    pool = new sql.ConnectionPool(dbConfig);
    
    // Handle connection events
    pool.on('connect', () => {
      console.log('✅ Connected to SQL Server database');
    });

    pool.on('error', (err) => {
      console.error('❌ SQL Server connection error:', err);
      pool = null;
    });

    await pool.connect();
    return pool;
    
  } catch (error) {
    console.error('❌ Failed to connect to SQL Server:', error);
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
export async function testConnection(): Promise<boolean> {
  try {
    const result = await executeQuery('SELECT 1 as test');
    return result.length > 0;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
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