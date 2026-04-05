export type ContactType = 'PERSON' | 'COMPANY';

export interface Phone {
    id: string;
    number: string;
    label: string;
}

export interface Contact {
    id: string;
    type: ContactType;
    name: string;
    title?: string | null;
    department?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
    avatarUrl?: string | null;
    phones: Phone[];
    parentId?: string | null;
    parent?: { id: string; name: string; type: ContactType } | null;
    children?: Contact[];
    _count?: { children: number };
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactInput {
    type: ContactType;
    name: string;
    title?: string;
    department?: string;
    email?: string;
    address?: string;
    notes?: string;
    parentId?: string | null;
    phones: { number: string; label: string }[];
}

export interface BulkImportResult {
    summary: {
        total: number;
        success: number;
        failed: number;
    };
    errors: Array<{
        row: number;
        errors: Record<string, string[]>;
    }>;
}
