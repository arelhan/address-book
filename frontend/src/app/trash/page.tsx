'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { Contact, PaginatedContactsResponse } from '@/types';

function formatDeletedAt(value?: string | null) {
    if (!value) return '-';
    return new Date(value).toLocaleString('tr-TR');
}

export default function TrashPage() {
    const router = useRouter();
    const { getDeletedContacts, restoreContact } = useAuth();
    const [items, setItems] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);

    const loadTrash = async (nextPage = page, nextPageSize = pageSize) => {
        try {
            setLoading(true);
            setError('');
            const result: PaginatedContactsResponse = await getDeletedContacts(nextPage, nextPageSize);
            setItems(result.items);
            setTotal(result.total);
        } catch (err: any) {
            setError(err?.message || 'Pasif kayıtlar yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadTrash(page, pageSize);
    }, [page, pageSize]);

    const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

    const handleRestore = async (contact: Contact) => {
        if (!confirm(`${contact.name} kaydını tekrar aktif etmek istiyor musunuz?`)) return;

        try {
            await restoreContact(contact.id);
            await loadTrash(page, pageSize);
        } catch (err: any) {
            alert(err?.message || 'Kayıt geri alınamadı.');
        }
    };

    return (
        <AuthGuard requireSuperAdmin>
            <main className="min-h-screen px-4 py-8">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1f1f24] px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200"
                        >
                            <ArrowLeft size={16} className="mr-1" /> Geri
                        </button>
                        <select
                            value={pageSize}
                            onChange={(event) => {
                                setPageSize(Number(event.target.value));
                                setPage(1);
                            }}
                            className="rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1f1f24] px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200"
                        >
                            {[20, 50, 100].map(size => (
                                <option key={size} value={size}>{size} / sayfa</option>
                            ))}
                        </select>
                    </div>

                    <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-white dark:bg-[#101014] overflow-hidden">
                        {loading ? (
                            <div className="p-6 text-gray-500 dark:text-gray-400">Yükleniyor...</div>
                        ) : error ? (
                            <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
                        ) : items.length === 0 ? (
                            <div className="p-6 text-gray-500 dark:text-gray-400">Pasif kayıt bulunamadı.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-[#1A1A1F]">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Ad</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Tip</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Telefon</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Silinme Tarihi</th>
                                            <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((contact) => (
                                            <tr key={contact.id} className="border-t border-black/5 dark:border-white/10">
                                                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                                                    {contact.name}
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{contact.email || '-'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{contact.type}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{contact.phones?.[0]?.number || '-'}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDeletedAt(contact.deletedAt)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleRestore(contact)}
                                                        className="inline-flex items-center rounded-full bg-[#007AFF] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#006ee6]"
                                                    >
                                                        <RotateCcw size={14} className="mr-1" /> Aktif Et
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Sayfa {page} / {totalPages}</div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page <= 1}
                                className="rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1f1f24] px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 disabled:opacity-40"
                            >
                                Önceki
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page >= totalPages}
                                className="rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1f1f24] px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 disabled:opacity-40"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </AuthGuard>
    );
}