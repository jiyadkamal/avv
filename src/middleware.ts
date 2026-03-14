import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('firebase_token')?.value;
    const { pathname } = request.nextUrl;

    // Public routes
    const publicPaths = ['/login', '/register', '/forgot-password', '/api/auth'];
    if (publicPaths.some(p => pathname.startsWith(p)) || pathname === '/') {
        return NextResponse.next();
    }

    // Protect dashboard routes
    if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/user') || pathname.startsWith('/settings'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api/(?!auth)).*)'],
};
