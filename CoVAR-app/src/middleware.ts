import { NextResponse, NextRequest } from 'next/server';
import { useAuth } from '@/functions/authContext';
import {checkToken} from '@/functions/requests';
export function middleware(req: NextRequest) {
  // Check if the request is for a non-protected route
  const nonProtectedRoutes = ['/login', '/signup'];
  const path = req.nextUrl.pathname;

  if (nonProtectedRoutes.includes(path)) {
    console.log('Path is non-protected, proceeding...');
    return NextResponse.next();
  }

  // Get token from cookies
  const tokenCookie = req.cookies.get('accessToken');
  const token = tokenCookie?.value;
  console.log('Token:', token);

  // If the user is not logged in, redirect to the login page
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    console.log('No token found, redirecting to login...');
    return NextResponse.redirect(url);
  }
  const validityOfToken=checkToken(token);
  if(!validityOfToken){
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    console.log('Token is invalid, redirecting to login...');
    return NextResponse.redirect(url);
  }
  console.log('Token found and valid, proceeding to requested path...');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|_next|api|favicon.ico|robots.txt|sitemap.xml).*)'],
};
