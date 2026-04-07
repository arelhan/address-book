const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const hopByHopHeaders = new Set([
    'connection',
    'content-length',
    'host',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
]);

async function proxyRequest(request: Request, context: { params: Promise<{ path?: string[] }> | { path?: string[] } }) {
    const params = await context.params;
    const path = params?.path?.join('/') || '';
    const sourceUrl = new URL(request.url);
    const targetUrl = new URL(`${BACKEND_URL}/api/${path}`);
    targetUrl.search = sourceUrl.search;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (!hopByHopHeaders.has(key.toLowerCase())) {
            headers.set(key, value);
        }
    });

    const originalForwardedFor = request.headers.get('x-forwarded-for');
    const requestIp = (request as Request & { ip?: string }).ip || request.headers.get('x-real-ip');
    const proxyIp = requestIp || request.headers.get('x-client-ip') || request.headers.get('cf-connecting-ip');

    if (proxyIp) {
        const forwardedFor = originalForwardedFor
            ? `${originalForwardedFor}, ${proxyIp}`
            : proxyIp;

        headers.set('x-forwarded-for', forwardedFor);
        headers.set('x-real-ip', proxyIp);
        headers.set('x-client-ip', proxyIp);
    }

    const init: RequestInit = {
        method: request.method,
        headers,
        redirect: 'manual',
    };

    if (!['GET', 'HEAD'].includes(request.method)) {
        init.body = await request.arrayBuffer();
    }

    const backendResponse = await fetch(targetUrl, init);
    const responseHeaders = new Headers();

    backendResponse.headers.forEach((value, key) => {
        if (!hopByHopHeaders.has(key.toLowerCase())) {
            responseHeaders.set(key, value);
        }
    });

    return new Response(backendResponse.body, {
        status: backendResponse.status,
        headers: responseHeaders,
    });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
export const HEAD = proxyRequest;