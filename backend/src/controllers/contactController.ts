import { Request, Response } from 'express';
import * as contactService from '../services/contactService';
import { createContactSchema, updateContactSchema } from '../validators/contactSchema';
import { z } from 'zod';

export const getContacts = async (req: Request, res: Response) => {
    try {
        const contacts = await contactService.getContacts();
        res.json(contacts);
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

export const searchContacts = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            res.json([]);
            return;
        }
        const results = await contactService.searchContacts(query);
        res.json(results);
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
        res.status(201).json(newContact);
    } catch (error: any) {
        res.status(400).json({ error: error.errors || 'Invalid data' });
    }
};

export const updateContact = async (req: Request, res: Response) => {
    try {
        const validatedData = updateContactSchema.parse(req.body);
        const updatedContact = await contactService.updateContact(req.params.id as string, validatedData);
        res.json(updatedContact);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ error: error.errors || 'Invalid data' });
    }
};

export const deleteContact = async (req: Request, res: Response) => {
    try {
        await contactService.deleteContact(req.params.id as string);
        res.json({ message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const bulkDeleteContacts = async (req: Request, res: Response) => {
    try {
        const schema = z.object({
            ids: z.array(z.string().cuid()).min(1).max(500),
        });

        const { ids } = schema.parse(req.body);
        const result = await contactService.bulkDeleteContacts(ids);
        res.json({ deletedCount: result.count });
    } catch (error: any) {
        res.status(400).json({ error: error.errors || 'Invalid data' });
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
