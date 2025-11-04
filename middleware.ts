import { NextResponse, type NextRequest } from "next/server"
import { verifyToken } from "@/lib/sqlserver/auth"

export async function middleware(request: NextRequest) {
  // Get the authentication token from cookie or Authorization header
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
  const isHomePage = request.nextUrl.pathname === '/';

  // If no token and trying to access protected routes, redirect to login
  if (!token && !isAuthPage && !isApiAuthRoute && !isHomePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // If token exists, verify it
  if (token) {
    const decoded = verifyToken(token);
    
    // If token is invalid and trying to access protected routes, redirect to login
    if (!decoded && !isAuthPage && !isApiAuthRoute && !isHomePage) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      
      // Clear invalid token
      const response = NextResponse.redirect(url);
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0
      });
      
      return response;
    }

    // If valid token and trying to access auth pages, redirect to dashboard
    if (decoded && isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
