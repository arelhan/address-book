import { Contact, CreateContactInput, BulkImportResult } from '../types';

const API_URL = '/api';

export const api = {
    async getContacts(): Promise<Contact[]> {
        const res = await fetch(`${API_URL}/contacts`);
        if (!res.ok) throw new Error('API Error');
        return res.json();
    },

    async getContactsCount(): Promise<number> {
        const res = await fetch(`${API_URL}/contacts/count`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        return data.count;
    },

    async searchContacts(query: string): Promise<Contact[]> {
        const res = await fetch(`${API_URL}/contacts/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('API Error');
        return res.json();
    },

    async getContact(id: string): Promise<Contact> {
        const res = await fetch(`${API_URL}/contacts/${id}`);
        if (!res.ok) throw new Error('API Error');
        return res.json();
    },

    async getContactChildren(id: string): Promise<Contact[]> {
        const res = await fetch(`${API_URL}/contacts/${id}/children`);
        if (!res.ok) throw new Error('API Error');
        return res.json();
    },

    async createContact(data: CreateContactInput): Promise<Contact> {
        const res = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('API Error');
        return res.json();
    },

    async updateContact(id: string, data: Partial<CreateContactInput>): Promise<Contact> {
        const res = await fetch(`${API_URL}/contacts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('API Error');
        return res.json();
    },

    async deleteContact(id: string): Promise<void> {
        const res = await fetch(`${API_URL}/contacts/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('API Error');
    },

    async bulkCreateContacts(contacts: CreateContactInput[]): Promise<BulkImportResult> {
        const res = await fetch(`${API_URL}/contacts/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contacts }),
        });
        if (!res.ok) throw new Error('API Error');
        return res.json();
    },
};
