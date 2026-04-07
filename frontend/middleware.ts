import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const headers = new Headers(request.headers);
    const requestWithIp = request as NextRequest & { ip?: string };
    const forwardedFor =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        request.headers.get('x-client-ip') ||
        request.headers.get('cf-connecting-ip') ||
        requestWithIp.ip;

    if (forwardedFor) {
        headers.set('x-forwarded-for', forwardedFor);
        headers.set('x-real-ip', forwardedFor);
        headers.set('x-client-ip', forwardedFor);
    }

    return NextResponse.next({
        request: {
            headers,
        },
    });
}

export const config = {
    matcher: ['/api/:path*'],
};