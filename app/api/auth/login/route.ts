import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/sqlserver/auth';
import { getRequestMetadata } from '@/lib/sqlserver/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get request metadata for security logging
    const { ipAddress, userAgent } = getRequestMetadata(request);

    // Login user
    const result = await loginUser(email, password, ipAddress, userAgent);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Return success with token
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: result.user,
        token: result.token
      },
      { status: 200 }
    );

    // Set HTTP-only cookie for token
    response.cookies.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error('❌ Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}