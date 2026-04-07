import { useState } from 'react';
import { api } from '../lib/api';
import { Contact, CreateContactInput } from '../types';

export function useContacts() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const data = await api.getContacts();
            setContacts(data.items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const create = async (data: CreateContactInput) => {
        const newContact = await api.createContact(data);
        setContacts(prev => [...prev, newContact]);
        return newContact;
    };

    const remove = async (id: string) => {
        await api.deleteContact(id);
        setContacts(prev => prev.filter(c => c.id !== id));
    };

    return { contacts, loading, fetchContacts, create, remove };
}
