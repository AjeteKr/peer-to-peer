import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the authentication token from cookie
  const token = request.cookies.get('auth-token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isHomePage = request.nextUrl.pathname === '/';
  const isStaticFile = request.nextUrl.pathname.startsWith('/_next') || 
                       request.nextUrl.pathname.startsWith('/favicon') ||
                       request.nextUrl.pathname.includes('.');

  // Skip middleware for static files and API routes
  if (isStaticFile || isApiRoute) {
    return NextResponse.next();
  }

  // If no token and trying to access protected routes, redirect to login
  if (!token && !isAuthPage && !isHomePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // If token exists and trying to access auth pages, redirect to dashboard
  if (token && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: []  // Temporarily disable middleware to avoid edge runtime issues
}
