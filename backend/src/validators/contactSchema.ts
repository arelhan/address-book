import { z } from 'zod';

const phoneSchema = z.object({
    number: z.string().min(7).max(20),
    label: z.string().default('Cep'),
});

export const createContactSchema = z.object({
    type: z.enum(['PERSON', 'COMPANY']),
    name: z.string().min(1).max(200),
    title: z.string().max(100).optional(),
    department: z.string().max(100).optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
    parentId: z.string().cuid().optional().nullable(),
    phones: z.array(phoneSchema).min(0).max(10),
});

export const updateContactSchema = createContactSchema.partial();
