import { z } from 'zod';

const strongPasswordSchema = z
    .string()
    .min(8, 'Parola en az 8 karakter olmalıdır')
    .max(200)
    .regex(/[a-z]/, 'Parola en az bir küçük harf içermelidir')
    .regex(/[A-Z]/, 'Parola en az bir büyük harf içermelidir')
    .regex(/\d/, 'Parola en az bir rakam içermelidir')
    .regex(/[^A-Za-z0-9]/, 'Parola en az bir özel karakter içermelidir');

export const loginSchema = z.object({
    identifier: z.string().trim().min(1).max(120),
    password: z.string().min(1).max(200),
});

export const createUserSchema = z.object({
    fullName: z.string().trim().min(3).max(200),
    username: z.string().trim().min(3).max(120),
    email: z.string().trim().email(),
    nationalId: z.string().trim().regex(/^\d{11}$/, 'TC kimlik numarası 11 haneli olmalıdır'),
    phone: z.string().trim().min(1).max(30),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'VIEWER']).default('VIEWER'),
    password: strongPasswordSchema,
});

export const initialSetupSchema = z.object({
    fullName: z.string().trim().min(3).max(200),
    username: z.string().trim().min(3).max(120),
    email: z.string().trim().email(),
    nationalId: z.string().trim().regex(/^\d{11}$/, 'TC kimlik numarası 11 haneli olmalıdır'),
    phone: z.string().trim().min(1).max(30),
    password: strongPasswordSchema,
});

const optionalStrongPasswordSchema = z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return value;
}, strongPasswordSchema.optional());

export const updateUserSchema = z.object({
    fullName: z.string().trim().min(3).max(200),
    username: z.string().trim().min(3).max(120),
    email: z.string().trim().email(),
    nationalId: z.string().trim().regex(/^\d{11}$/, 'TC kimlik numarası 11 haneli olmalıdır'),
    phone: z.string().trim().min(1).max(30),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'VIEWER']),
    password: optionalStrongPasswordSchema,
});

export const requestPasswordResetSchema = z.object({
    username: z.string().trim().min(1).max(120),
    nationalId: z.string().trim().regex(/^\d{11}$/, 'TC kimlik numarası 11 haneli olmalıdır'),
    phone: z.string().trim().min(1).max(30),
});

export const resetPasswordSchema = z.object({
    token: z.string().trim().min(1),
    password: strongPasswordSchema,
});
