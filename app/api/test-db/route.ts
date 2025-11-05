import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/sqlserver/connection';

export async function GET(request: NextRequest) {
  try {
    const result = await testConnection();
    
    if (result.success) {
      return NextResponse.json({
        status: 'success',
        message: '✅ SQL Server connection successful!',
        timestamp: new Date().toISOString(),
        database: result.database,
        serverVersion: result.serverVersion
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: '❌ SQL Server connection failed',
        error: result.error,
        timestamp: new Date().toISOString(),
        suggestion: 'Check your environment variables and ensure SQL Server is running'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Database test error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: '❌ Database connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Verify SQL Server is installed and running',
        'Check environment variables in .env.local',
        'Ensure TCP/IP is enabled in SQL Server Configuration Manager',
        'Verify firewall settings allow port 1433'
      ]
    }, { status: 500 });
  }
}