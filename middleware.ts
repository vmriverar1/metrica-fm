import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle Service Worker requests for Firebase App Hosting
  if (pathname === '/sw.js') {
    return NextResponse.rewrite(new URL('/api/sw', request.url));
  }

  // Handle Workbox files (pattern: /workbox-<hash>.js)
  const workboxMatch = pathname.match(/^\/workbox-[a-f0-9]+\.js$/);
  if (workboxMatch) {
    const filename = pathname.substring(1); // Remove leading slash
    return NextResponse.rewrite(new URL(`/api/workbox/${filename}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sw.js',
    '/workbox-:hash.js',
  ],
};