import { NextRequest } from 'next/server';

// Helper function for API route authentication
export async function authenticateRequest(request: NextRequest) {
  try {
    // Import auth functions dynamically to avoid edge runtime issues
    const { verifyToken, getUserById } = await import('./auth');
    
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return { user: null, error: 'No authentication token provided' };
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return { user: null, error: 'Invalid or expired token' };
    }

    // Get user details
    const user = await getUserById(decoded.userId);
    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { user, error: null };

  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

// Middleware helper for client IP and user agent
export function getRequestMetadata(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ipAddress = forwardedFor?.split(',')[0] || realIP || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ipAddress, userAgent };
}