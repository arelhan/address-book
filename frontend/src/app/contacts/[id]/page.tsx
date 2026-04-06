'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Contact, CreateContactInput } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Phone, ArrowLeft, Trash2, Copy, Mail, MapPin, FileText, Users, Pencil } from 'lucide-react';
import { HierarchyTree } from '@/components/HierarchyTree';
import { Modal } from '@/components/ui/Modal';
import { ContactForm } from '@/components/ContactForm';

export default function ContactDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [contact, setContact] = useState<Contact | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (id) api.getContact(id).then(setContact).catch(console.error);
    }, [id]);

    const handleDelete = async () => {
        if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
            await api.deleteContact(id);
            router.push('/');
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
            await api.updateContact(id, data);
            const fresh = await api.getContact(id);
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
            <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
                Yükleniyor...
            </div>
        );
    }

    const subtitle = [contact.title, contact.department].filter(Boolean).join(' · ');

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="max-w-3xl mx-auto">
                {/* Üst bar */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center px-4 py-2 bg-white dark:bg-[#1C1C1E] text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-[#2C2C2E] font-medium transition-colors shadow-sm"
                    >
                        <ArrowLeft size={18} className="mr-1" /> Geri
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="flex items-center px-3 py-2 bg-white dark:bg-[#1C1C1E] text-[#007AFF] border border-black/5 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-[#2C2C2E] font-medium transition-colors shadow-sm"
                        >
                            <Pencil size={16} className="mr-1" /> Düzenle
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2.5 bg-white dark:bg-[#1C1C1E] text-[#FF3B30] dark:text-[#FF453A] border border-black/5 dark:border-white/10 hover:bg-[#FF3B30]/10 dark:hover:bg-[#FF453A]/20 rounded-full transition-colors shadow-sm"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Kart */}
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[30px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
                    {/* Başlık bölümü */}
                    <div className="p-7 border-b border-black/[0.04] dark:border-white/[0.08]">
                        <Badge variant={contact.type.toLowerCase() as 'person' | 'company'} className="mb-4">
                            {contact.type === 'PERSON' ? 'Kişi' : 'Firma'}
                        </Badge>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {contact.name}
                        </h1>
                        {subtitle && (
                            <p className="mt-2 text-[17px] text-gray-500 dark:text-gray-400">{subtitle}</p>
                        )}
                        {contact.parent && (
                            <button
                                onClick={() => router.push(`/contacts/${contact.parent!.id}`)}
                                className="mt-3 inline-flex items-center text-[13px] font-medium text-[#007AFF] hover:text-[#005bb5] transition-colors"
                            >
                                ↑ {contact.parent.name}
                            </button>
                        )}
                    </div>

                    {/* Telefon */}
                    {contact.phones && contact.phones.length > 0 && (
                        <div className="p-7 border-b border-black/[0.04] dark:border-white/[0.08]">
                            <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                Telefon Numaraları
                            </h3>
                            <div className="space-y-2">
                                {contact.phones.map(p => (
                                    <div
                                        key={p.id}
                                        className="flex items-center p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl"
                                    >
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
                                            onClick={() => handleCopy(p.number, p.id)}
                                            className="ml-2 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] text-[#007AFF] text-[13px] font-medium rounded-full border border-black/5 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition-colors flex items-center flex-shrink-0"
                                        >
                                            <Copy size={14} className="mr-1" />
                                            {copiedId === p.id ? 'Kopyalandı' : 'Kopyala'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* E-posta */}
                    {contact.email && (
                        <div className="p-7 border-b border-black/[0.04] dark:border-white/[0.08]">
                            <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                E-posta
                            </h3>
                            <div className="flex items-center p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl">
                                <Mail size={18} className="text-[#007AFF] mr-3 flex-shrink-0" />
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="flex-1 text-[16px] text-gray-900 dark:text-white hover:text-[#007AFF] truncate transition-colors"
                                >
                                    {contact.email}
                                </a>
                                <button
                                    onClick={() => handleCopy(contact.email!, 'email')}
                                    className="ml-2 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] text-[#007AFF] text-[13px] font-medium rounded-full border border-black/5 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition-colors flex items-center flex-shrink-0"
                                >
                                    <Copy size={14} className="mr-1" />
                                    {copiedId === 'email' ? 'Kopyalandı' : 'Kopyala'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Adres */}
                    {contact.address && (
                        <div className="p-7 border-b border-black/[0.04] dark:border-white/[0.08]">
                            <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
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

                    {/* Notlar */}
                    {contact.notes && (
                        <div className="p-7 border-b border-black/[0.04] dark:border-white/[0.08]">
                            <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
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

                    {/* Alt Birimler / Bağlı Kişiler */}
                    {contact.children && contact.children.length > 0 && (
                        <div className="p-7">
                            <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center">
                                <Users size={14} className="mr-1.5" />
                                Bağlı Kişiler ({contact.children.length})
                            </h3>
                            <HierarchyTree
                                nodes={contact.children}
                                onSelect={(c) => router.push(`/contacts/${c.id}`)}
                            />
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
            </div>
        </div>
    );
}
