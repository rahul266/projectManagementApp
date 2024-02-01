import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function authenticationMiddleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    if (path === '/') {
        return NextResponse.next();
    }
    const session = request.cookies.get("next-auth.session-token")

    const isProtected = path.includes('/projects') || path.includes('/teams') || path.includes('/ticket')
        || path.includes('/project');

    if (!session && isProtected) {
        return NextResponse.redirect(new URL('/', request.url));
    } else if (session && (path === '/restore' || path === '/register')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
}






