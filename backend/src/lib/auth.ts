import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';

export interface AuthenticatedUser {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: UserRole;
}

const AUTH_SECRET = process.env.AUTH_SECRET || 'address-book-change-this-secret';
const TOKEN_TTL_MS = Number(process.env.AUTH_TOKEN_TTL_MS || 1000 * 60 * 60 * 24);

function toBase64Url(value: string | Buffer) {
    return Buffer.from(value).toString('base64url');
}

function fromBase64Url(value: string) {
    return Buffer.from(value, 'base64url').toString('utf8');
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string) {
    const actualHash = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHash, 'hex');
    return expected.length === actualHash.length && crypto.timingSafeEqual(expected, actualHash);
}

export function createAuthToken(user: AuthenticatedUser) {
    const payload = {
        sub: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        exp: Date.now() + TOKEN_TTL_MS,
    };

    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const signature = crypto.createHmac('sha256', AUTH_SECRET).update(encodedPayload).digest('base64url');
    return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string): AuthenticatedUser | null {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(encodedPayload).digest('base64url');
    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(signature);
    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
        return null;
    }

    try {
        const payload = JSON.parse(fromBase64Url(encodedPayload)) as {
            sub: string;
            fullName: string;
            username: string;
            email: string;
            role: UserRole;
            exp: number;
        };

        if (!payload.sub || !payload.exp || Date.now() > payload.exp) return null;

        return {
            id: payload.sub,
            fullName: payload.fullName,
            username: payload.username,
            email: payload.email,
            role: payload.role,
        };
    } catch {
        return null;
    }
}

export function hashResetToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

function extractBearerToken(req: Request) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    return header.slice(7).trim();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = extractBearerToken(req);
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const user = verifyAuthToken(token);
    if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    req.user = user;
    next();
}

export function requireRole(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        next();
    };
}
