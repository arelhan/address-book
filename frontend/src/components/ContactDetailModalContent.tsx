'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Contact, CreateContactInput } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Phone, Trash2, Copy, Mail, MapPin, FileText, Users, Pencil } from 'lucide-react';
import { HierarchyTree } from '@/components/HierarchyTree';
import { Modal } from '@/components/ui/Modal';
import { ContactForm } from '@/components/ContactForm';

interface Props {
    contactId: string;
    onClose: () => void;
    onDeleted?: () => void;
    onNavigate?: (id: string) => void;
}

export function ContactDetailModalContent({ contactId, onClose, onDeleted, onNavigate }: Props) {
    const [contact, setContact] = useState<Contact | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!contactId) return;
        api.getContact(contactId).then(setContact).catch(console.error);
    }, [contactId]);

    const handleDelete = async () => {
        if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

        try {
            await api.deleteContact(contactId);
            onDeleted?.();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Silme sırasında hata oluştu.');
        }
    };

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(key);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const toInitialData = (c: Contact): Partial<CreateContactInput> => ({
        type: c.type,
        name: c.name,
        title: c.title || '',
        department: c.department || '',
        email: c.email || '',
        address: c.address || '',
        notes: c.notes || '',
        parentId: c.parentId || null,
        phones: c.phones.map(p => ({ number: p.number, label: p.label })),
    });

    const handleUpdate = async (data: CreateContactInput) => {
        try {
            setIsUpdating(true);
            await api.updateContact(contactId, data);
            const fresh = await api.getContact(contactId);
            setContact(fresh);
            setIsEditOpen(false);
        } catch (err) {
            console.error(err);
            alert('Güncelleme sırasında hata oluştu.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!contact) {
        return (
            <div className="py-10 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>
        );
    }

    const subtitle = [contact.title, contact.department].filter(Boolean).join(' · ');

    return (
        <>
            <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <Badge variant={contact.type === 'PERSON' ? 'person' : 'company'} className="mb-3">
                            {contact.type === 'PERSON' ? 'Kişi' : 'Firma'}
                        </Badge>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {contact.name}
                        </h1>
                        {subtitle && (
                            <p className="mt-1 text-[15px] text-gray-500 dark:text-gray-400">{subtitle}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditOpen(true)}
                            className="flex items-center px-3 py-2 bg-white dark:bg-[#1C1C1E] text-[#007AFF] border border-black/5 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-[#2C2C2E] font-medium transition-colors shadow-sm"
                        >
                            <Pencil size={16} className="mr-1" /> Düzenle
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="p-2.5 bg-white dark:bg-[#1C1C1E] text-[#FF3B30] dark:text-[#FF453A] border border-black/5 dark:border-white/10 hover:bg-[#FF3B30]/10 dark:hover:bg-[#FF453A]/20 rounded-full transition-colors shadow-sm"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {contact.phones && contact.phones.length > 0 && (
                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            Telefon Numaraları
                        </h3>
                        <div className="space-y-2">
                            {contact.phones.map(p => (
                                <div key={p.id} className="flex items-center p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl">
                                    <Phone size={18} className="text-[#007AFF] mr-3 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {p.label}
                                        </div>
                                        <div className="text-[16px] font-medium text-gray-900 dark:text-white truncate">
                                            {p.number}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(p.number, p.id)}
                                        className="ml-2 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] text-[#007AFF] text-[13px] font-medium rounded-full border border-black/5 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition-colors"
                                    >
                                        <Copy size={14} className="inline mr-1" />
                                        {copiedId === p.id ? 'Kopyalandı' : 'Kopyala'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {contact.email && (
                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            E-posta
                        </h3>
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl">
                            <Mail size={18} className="text-[#007AFF] mr-3 flex-shrink-0" />
                            <a href={`mailto:${contact.email}`} className="flex-1 text-[16px] text-gray-900 dark:text-white hover:text-[#007AFF] truncate transition-colors">
                                {contact.email}
                            </a>
                            <button
                                type="button"
                                onClick={() => handleCopy(contact.email!, 'email')}
                                className="ml-2 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] text-[#007AFF] text-[13px] font-medium rounded-full border border-black/5 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition-colors"
                            >
                                <Copy size={14} className="inline mr-1" />
                                {copiedId === 'email' ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                        </div>
                    </div>
                )}

                {contact.address && (
                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            Adres
                        </h3>
                        <div className="flex items-start p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl">
                            <MapPin size={18} className="text-[#007AFF] mr-3 flex-shrink-0 mt-0.5" />
                            <div className="text-[16px] text-gray-900 dark:text-white whitespace-pre-wrap">
                                {contact.address}
                            </div>
                        </div>
                    </div>
                )}

                {contact.notes && (
                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            Notlar
                        </h3>
                        <div className="flex items-start p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl">
                            <FileText size={18} className="text-[#007AFF] mr-3 flex-shrink-0 mt-0.5" />
                            <div className="text-[16px] text-gray-900 dark:text-white whitespace-pre-wrap">
                                {contact.notes}
                            </div>
                        </div>
                    </div>
                )}

                {contact.children && contact.children.length > 0 && (
                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center">
                            <Users size={14} className="mr-1.5" />
                            Bağlı Kişiler ({contact.children.length})
                        </h3>
                        <HierarchyTree nodes={contact.children} onSelect={(c) => onNavigate?.(c.id)} />
                    </div>
                )}
            </div>

            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Bilgiyi Güncelle">
                <ContactForm
                    initialData={toInitialData(contact)}
                    onSubmit={handleUpdate}
                    isLoading={isUpdating}
                ></ContactForm>
            </Modal>
        </>
    );
}
