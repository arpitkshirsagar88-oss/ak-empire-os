import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Current logic: Allow all requests through.
  // Supabase auth is handled client-side as per your setup.
  return NextResponse.next();
}

// Optimized matcher to avoid unnecessary middleware execution
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
