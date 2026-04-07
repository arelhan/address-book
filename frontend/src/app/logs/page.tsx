'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { AuditLogEntry } from '@/types';

export default function LogsPage() {
    const router = useRouter();
    const { listAuditLogs } = useAuth();
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);

    const loadLogs = async (nextPage = page, nextPageSize = pageSize) => {
        try {
            setLoading(true);
            setError('');
            const result = await listAuditLogs(nextPage, nextPageSize);
            setLogs(result.items);
            setTotal(result.total);
        } catch (err: any) {
            setError(err?.message || 'Loglar yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadLogs(page, pageSize);
    }, [page, pageSize]);

    const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

    return (
        <AuthGuard requireSuperAdmin>
            <main className="min-h-screen px-4 py-8">
                <div className="mx-auto w-full max-w-7xl">
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
                        ) : logs.length === 0 ? (
                            <div className="p-6 text-gray-500 dark:text-gray-400">Log kaydı bulunamadı.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-[#1A1A1F]">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Tarih</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Kullanıcı</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Aksiyon</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Varlık</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">IP</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Cihaz</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log.id} className="border-t border-black/5 dark:border-white/10 align-top">
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('tr-TR')}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{log.user?.fullName || 'Sistem'}<div className="text-xs text-gray-500">{log.user?.username || '-'}</div></td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{log.action}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{log.entityType}{log.entityId ? ` (${log.entityId})` : ''}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{log.ipAddress || '-'}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-200 max-w-[280px] truncate" title={log.userAgent || ''}>{log.userAgent || '-'}</td>
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