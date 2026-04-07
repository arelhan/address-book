import { Request } from 'express';
import prisma from '../prisma/client';

interface AuditPayload {
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, unknown>;
    userId?: string;
}

export async function writeAuditLog(req: Request, payload: AuditPayload) {
    try {
        await prisma.auditLog.create({
            data: {
                action: payload.action,
                entityType: payload.entityType,
                entityId: payload.entityId,
                details: payload.details ? JSON.stringify(payload.details) : null,
                ipAddress: getClientIp(req),
                userAgent: req.headers['user-agent'] || null,
                userId: payload.userId || req.user?.id,
            },
        });
    } catch (error) {
        console.error('Audit log write failed:', error);
    }
}

export function getValidationErrorMessage(error: any, fallback = 'Invalid data') {
    const issueMessage = error?.issues?.[0]?.message;
    if (issueMessage) return issueMessage;
    if (typeof error?.error === 'string') return error.error;
    if (typeof error?.message === 'string') return error.message;
    return fallback;
}

function getClientIp(req: Request) {
    const headerKeys = ['x-forwarded-for', 'x-real-ip', 'x-client-ip', 'cf-connecting-ip'] as const;

    for (const key of headerKeys) {
        const forwarded = req.headers[key];

        if (typeof forwarded === 'string' && forwarded.trim()) {
            return forwarded.split(',')[0].trim();
        }

        if (Array.isArray(forwarded) && forwarded.length > 0 && forwarded[0]) {
            return forwarded[0].split(',')[0].trim();
        }
    }

    return req.ip || req.socket.remoteAddress || null;
}
