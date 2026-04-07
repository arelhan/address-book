import { Request, Response } from 'express';
import * as contactService from '../services/contactService';
import { createContactSchema, updateContactSchema } from '../validators/contactSchema';
import { z } from 'zod';
import { getValidationErrorMessage, writeAuditLog } from '../lib/audit';

export const getContacts = async (req: Request, res: Response) => {
    try {
        const querySchema = z.object({
            page: z.coerce.number().int().min(1).default(1),
            pageSize: z.coerce.number().int().min(1).max(100).default(20),
        });
        const { page, pageSize } = querySchema.parse(req.query);
        const result = await contactService.getContacts({ page, pageSize });
        res.json({ ...result, page, pageSize });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getContactsCount = async (req: Request, res: Response) => {
    try {
        const count = await contactService.getContactsCount();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getDeletedContactsCount = async (_req: Request, res: Response) => {
    try {
        const count = await contactService.getDeletedContactsCount();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const searchContacts = async (req: Request, res: Response) => {
    try {
        const querySchema = z.object({
            q: z.string().trim().min(1),
            page: z.coerce.number().int().min(1).default(1),
            pageSize: z.coerce.number().int().min(1).max(100).default(20),
        });
        const { q, page, pageSize } = querySchema.parse(req.query);
        const results = await contactService.searchContacts(q, { page, pageSize });
        res.json({ ...results, page, pageSize });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getContactById = async (req: Request, res: Response) => {
    try {
        const contact = await contactService.getContactById(req.params.id as string);
        if (!contact) {
            res.status(404).json({ error: 'Contact not found' });
            return;
        }
        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createContact = async (req: Request, res: Response) => {
    try {
        const validatedData = createContactSchema.parse(req.body);
        const newContact = await contactService.createContact(validatedData);
        await writeAuditLog(req, {
            action: 'CONTACT_CREATE',
            entityType: 'CONTACT',
            entityId: newContact.id,
            details: { name: newContact.name, type: newContact.type },
        });
        res.status(201).json(newContact);
    } catch (error: any) {
        res.status(400).json({ error: getValidationErrorMessage(error) });
    }
};

export const updateContact = async (req: Request, res: Response) => {
    try {
        const validatedData = updateContactSchema.parse(req.body);
        const updatedContact = await contactService.updateContact(req.params.id as string, validatedData);
        await writeAuditLog(req, {
            action: 'CONTACT_UPDATE',
            entityType: 'CONTACT',
            entityId: updatedContact.id,
            details: { name: updatedContact.name, type: updatedContact.type },
        });
        res.json(updatedContact);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ error: getValidationErrorMessage(error) });
    }
};

export const deleteContact = async (req: Request, res: Response) => {
    try {
        const deleted = await contactService.deleteContact(req.params.id as string);
        await writeAuditLog(req, {
            action: 'CONTACT_DEACTIVATE',
            entityType: 'CONTACT',
            entityId: deleted.id,
            details: { name: deleted.name, type: deleted.type },
        });
        res.json({ message: 'Contact deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const restoreContact = async (req: Request, res: Response) => {
    try {
        const restored = await contactService.restoreContact(req.params.id as string);
        await writeAuditLog(req, {
            action: 'CONTACT_RESTORE',
            entityType: 'CONTACT',
            entityId: restored.id,
            details: { name: restored.name, type: restored.type },
        });
        res.json({ message: 'Contact restored' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const bulkDeleteContacts = async (req: Request, res: Response) => {
    try {
        const maxBulkDeleteSize = Number(process.env.BULK_DELETE_MAX || 5000);
        const schema = z.object({
            ids: z.array(z.string().cuid()).min(1).max(maxBulkDeleteSize),
        });

        const { ids } = schema.parse(req.body);
        const result = await contactService.bulkDeleteContacts(ids);
        await writeAuditLog(req, {
            action: 'CONTACT_BULK_DEACTIVATE',
            entityType: 'CONTACT',
            details: { requested: ids.length, deletedCount: result.count },
        });
        res.json({ deletedCount: result.count });
    } catch (error: any) {
        res.status(400).json({ error: getValidationErrorMessage(error) });
    }
};

export const bulkCreateContacts = async (req: Request, res: Response) => {
    try {
        const { contacts, rowOffset = 0 } = req.body;
        const maxBulkSize = Number(process.env.BULK_IMPORT_MAX || 500);
        const safeOffset = Number.isFinite(Number(rowOffset)) ? Math.max(0, Number(rowOffset)) : 0;

        if (!Array.isArray(contacts) || contacts.length === 0) {
            res.status(400).json({ error: 'contacts array is required' });
            return;
        }

        if (contacts.length > maxBulkSize) {
            res.status(400).json({ error: `Maximum ${maxBulkSize} contacts per request` });
            return;
        }

        const validContacts: any[] = [];
        const errors: Array<{ row: number; errors: any }> = [];

        contacts.forEach((contact: any, index: number) => {
            const result = createContactSchema.safeParse(contact);
            if (result.success) {
                validContacts.push(result.data);
            } else {
                errors.push({ row: safeOffset + index + 1, errors: result.error.flatten().fieldErrors });
            }
        });

        let created: any[] = [];
        if (validContacts.length > 0) {
            created = await contactService.bulkCreateContacts(validContacts);
        }

        res.status(201).json({
            summary: {
                total: contacts.length,
                success: created.length,
                failed: errors.length,
            },
            errors,
        });

        await writeAuditLog(req, {
            action: 'CONTACT_BULK_CREATE',
            entityType: 'CONTACT',
            details: {
                total: contacts.length,
                success: created.length,
                failed: errors.length,
            },
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Bulk import failed' });
    }
};

export const getContactChildren = async (req: Request, res: Response) => {
    try {
        const children = await contactService.getContactChildren(req.params.id as string);
        res.json(children);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getDeletedContacts = async (req: Request, res: Response) => {
    try {
        const querySchema = z.object({
            page: z.coerce.number().int().min(1).default(1),
            pageSize: z.coerce.number().int().min(1).max(100).default(20),
        });
        const { page, pageSize } = querySchema.parse(req.query);
        const result = await contactService.getDeletedContacts({ page, pageSize });
        res.json({ ...result, page, pageSize });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
