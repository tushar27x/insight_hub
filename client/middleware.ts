import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;

  // Protect the dashboard route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const hasTokenInUrl = request.nextUrl.searchParams.has('token');
    
    if (!sessionToken && !hasTokenInUrl) {
      // Redirect to landing page if no session token AND no token in URL
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect to dashboard if already logged in and trying to access landing page
  if (request.nextUrl.pathname === '/') {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
