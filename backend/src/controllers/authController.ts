import { Request, Response } from 'express';
import prisma from '../prisma/client';
import {
    createAuthToken,
    generateResetToken,
    hashPassword,
    hashResetToken,
    verifyPassword,
} from '../lib/auth';
import {
    createUserSchema,
    initialSetupSchema,
    loginSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    updateUserSchema,
} from '../validators/authSchema';
import type { UserRole } from '../lib/auth';
import { getValidationErrorMessage, writeAuditLog } from '../lib/audit';

function toPublicUser(user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: string;
}) {
    return {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role as UserRole,
    };
}

function toManagedUser(user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    nationalId: string;
    phone: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}) {
    return {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        nationalId: user.nationalId,
        phone: user.phone,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export const login = async (req: Request, res: Response) => {
    try {
        const { identifier, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ username: identifier }, { email: identifier }],
            },
        });

        if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
            res.status(401).json({ error: 'Geçersiz kullanıcı bilgileri' });
            return;
        }

        const publicUser = toPublicUser(user);
        const token = createAuthToken(publicUser);
        await writeAuditLog(req, {
            action: 'AUTH_LOGIN',
            entityType: 'AUTH',
            userId: user.id,
            details: { username: user.username, role: user.role },
        });
        res.json({ token, user: publicUser });
    } catch (error: any) {
        res.status(400).json({ error: getValidationErrorMessage(error) });
    }
};

export const setupStatus = async (_req: Request, res: Response) => {
    try {
        const userCount = await prisma.user.count();
        res.json({ needsSetup: userCount === 0 });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const setupInitialSuperAdmin = async (req: Request, res: Response) => {
    try {
        const userCount = await prisma.user.count();
        if (userCount > 0) {
            res.status(409).json({ error: 'Setup already completed' });
            return;
        }

        const input = initialSetupSchema.parse(req.body);
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: input.username },
                    { email: input.email },
                    { nationalId: input.nationalId },
                ],
            },
        });

        if (existing) {
            res.status(409).json({ error: 'Kullanıcı zaten kayıtlı' });
            return;
        }

        const { salt, hash } = hashPassword(input.password);
        const user = await prisma.user.create({
            data: {
                fullName: input.fullName,
                username: input.username,
                email: input.email,
                nationalId: input.nationalId,
                phone: input.phone,
                role: 'SUPER_ADMIN',
                passwordSalt: salt,
                passwordHash: hash,
            },
        });

        const publicUser = toPublicUser(user);
        const token = createAuthToken(publicUser);

        await writeAuditLog(req, {
            action: 'SETUP_INITIAL_SUPER_ADMIN_CREATE',
            entityType: 'AUTH',
            entityId: user.id,
            details: { username: user.username, role: user.role },
        });

        res.status(201).json({ token, user: publicUser });
    } catch (error: any) {
        res.status(400).json({ error: getValidationErrorMessage(error) });
    }
};

export const logout = async (req: Request, res: Response) => {
    await writeAuditLog(req, {
        action: 'AUTH_LOGOUT',
        entityType: 'AUTH',
        details: { username: req.user?.username },
    });
    res.json({ message: 'Çıkış yapıldı' });
};

export const me = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    res.json({ user: req.user });
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const input = createUserSchema.parse(req.body);
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: input.username },
                    { email: input.email },
                    { nationalId: input.nationalId },
                ],
            },
        });

        if (existing) {
            res.status(409).json({ error: 'Kullanıcı zaten kayıtlı' });
            return;
        }

        const { salt, hash } = hashPassword(input.password);
        const user = await prisma.user.create({
            data: {
                fullName: input.fullName,
                username: input.username,
                email: input.email,
                nationalId: input.nationalId,
                phone: input.phone,
                role: input.role,
                passwordSalt: salt,
                passwordHash: hash,
            },
        });

        await writeAuditLog(req, {
            action: 'USER_CREATE',
            entityType: 'USER',
            entityId: user.id,
            details: { username: user.username, role: user.role },
        });

        res.status(201).json({ user: toPublicUser(user) });
    } catch (error: any) {
        res.status(400).json({ error: getValidationErrorMessage(error) });
    }
};

export const listUsers = async (_req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.json({ users: users.map(toManagedUser) });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const input = updateUserSchema.parse(req.body);
        const userId = req.params.id as string;

        const existing = await prisma.user.findFirst({
            where: {
                id: { not: userId },
                OR: [
                    { username: input.username },
                    { email: input.email },
                    { nationalId: input.nationalId },
                ],
            },
        });

        if (existing) {
            res.status(409).json({ error: 'Kullanıcı bilgileri başka bir kullanıcıda mevcut' });
            return;
        }

        const updateData: any = {
            fullName: input.fullName,
            username: input.username,
            email: input.email,
            nationalId: input.nationalId,
            phone: input.phone,
            role: input.role,
        };

        if (input.password) {
            const { salt, hash } = hashPassword(input.password);
            updateData.passwordSalt = salt;
            updateData.passwordHash = hash;
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        await writeAuditLog(req, {
            action: 'USER_UPDATE',
            entityType: 'USER',
            entityId: updated.id,
            details: {
                username: updated.username,
                role: updated.role,
                passwordChanged: Boolean(input.password),
            },
        });

        res.json({ user: toManagedUser(updated) });
    } catch (error: any) {
        res.status(400).json({ error: getValidationErrorMessage(error) });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id as string;

        if (req.user?.id === userId) {
            res.status(400).json({ error: 'Kendi hesabınızı silemezsiniz' });
            return;
        }

        const deleted = await prisma.user.delete({ where: { id: userId } });
        await writeAuditLog(req, {
            action: 'USER_DELETE',
            entityType: 'USER',
            entityId: deleted.id,
            details: { username: deleted.username, role: deleted.role },
        });
        res.json({ message: 'Kullanıcı silindi' });
    } catch {
        res.status(400).json({ error: 'Invalid data' });
    }
};

export const listAuditLogs = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, Number(req.query.page || 1));
        const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize || 20)));
        const skip = (page - 1) * pageSize;

        const [items, total] = await prisma.$transaction([
            prisma.auditLog.findMany({
                include: {
                    user: {
                        select: { id: true, fullName: true, username: true, role: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.auditLog.count(),
        ]);

        res.json({ items, total, page, pageSize });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const input = requestPasswordResetSchema.parse(req.body);
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ username: input.username }, { email: input.username }],
                nationalId: input.nationalId,
                phone: input.phone,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'Kullanıcı bulunamadı' });
            return;
        }

        const token = generateResetToken();
        const resetTokenHash = hashResetToken(token);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetTokenHash,
                resetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
            },
        });

        res.json({ token });
    } catch (error: any) {
        res.status(400).json({ error: getValidationErrorMessage(error) });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = resetPasswordSchema.parse(req.body);
        const resetTokenHash = hashResetToken(token);

        const user = await prisma.user.findFirst({
            where: {
                resetTokenHash,
                resetTokenExpiresAt: { gt: new Date() },
            },
        });

        if (!user) {
            res.status(400).json({ error: 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı' });
            return;
        }

        const { salt, hash } = hashPassword(password);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordSalt: salt,
                passwordHash: hash,
                resetTokenHash: null,
                resetTokenExpiresAt: null,
            },
        });

        await writeAuditLog(req, {
            action: 'AUTH_PASSWORD_RESET',
            entityType: 'AUTH',
            userId: user.id,
            details: { username: user.username },
        });

        res.json({ message: 'Parola güncellendi' });
    } catch (error: any) {
        res.status(400).json({ error: getValidationErrorMessage(error) });
    }
};
