import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Check if the request is for a non-protected route
  const nonProtectedRoutes = ['/login', '/signup'];
  const path = req.nextUrl.pathname;
  if (nonProtectedRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Get token from cookies
  const tokenCookie = req.cookies.get('accessToken');
  const token = tokenCookie?.value;

  // If the user is not logged in, redirect to the login page
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|_next|api|favicon.ico|robots.txt|sitemap.xml).*)'],
};
