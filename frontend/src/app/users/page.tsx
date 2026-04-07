'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, UserPlus } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { Modal } from '@/components/ui/Modal';
import { UserForm } from '@/components/UserForm';
import { useAuth } from '@/hooks/useAuth';
import { CreateUserInput, ManagedUser } from '@/types';

export default function UsersPage() {
    const router = useRouter();
    const { listUsers, createUser, updateUser, deleteUser } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await listUsers();
            setUsers(result.users);
        } catch (err: any) {
            setError(err?.message || 'Kullanıcılar yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadUsers();
    }, []);

    const handleCreate = async (data: CreateUserInput) => {
        try {
            setModalError('');
            await createUser(data);
            setIsCreateOpen(false);
            await loadUsers();
        } catch (err: any) {
            setModalError(err?.message || 'Kullanıcı oluşturulamadı.');
        }
    };

    const handleUpdate = async (data: CreateUserInput) => {
        if (!editingUser) return;
        try {
            setModalError('');
            await updateUser(editingUser.id, {
                fullName: data.fullName,
                username: data.username,
                email: data.email,
                nationalId: data.nationalId,
                phone: data.phone,
                role: data.role,
                ...(data.password ? { password: data.password } : {}),
            });
            setEditingUser(null);
            await loadUsers();
        } catch (err: any) {
            setModalError(err?.message || 'Kullanıcı güncellenemedi.');
        }
    };

    const handleDelete = async (user: ManagedUser) => {
        if (!confirm(`${user.fullName} kullanıcısını silmek istediğinize emin misiniz?`)) return;
        try {
            setModalError('');
            await deleteUser(user.id);
            await loadUsers();
        } catch (err: any) {
            setModalError(err?.message || 'Kullanıcı silinemedi.');
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
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center rounded-full bg-[#007AFF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#006ee6]"
                        >
                            <UserPlus size={16} className="mr-1" /> Yeni Kullanıcı
                        </button>
                    </div>

                    <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-white dark:bg-[#101014] overflow-hidden">
                        {loading ? (
                            <div className="p-6 text-gray-500 dark:text-gray-400">Yükleniyor...</div>
                        ) : error ? (
                            <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
                        ) : users.length === 0 ? (
                            <div className="p-6 text-gray-500 dark:text-gray-400">Kullanıcı bulunamadı.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-[#1A1A1F]">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Ad Soyad</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Kullanıcı Adı</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">E-posta</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">TC</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Telefon</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Rol</th>
                                            <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-t border-black/5 dark:border-white/10">
                                                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{user.fullName}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.username}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.nationalId}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.phone}</td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-[#007AFF]/10 px-3 py-1 text-xs font-semibold text-[#007AFF]">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1f1f24] px-3 py-1.5 text-gray-700 dark:text-gray-200"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="rounded-full border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-red-600 dark:text-red-300"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Kullanıcı Oluştur" maxWidth="max-w-2xl">
                    {modalError && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{modalError}</div>}
                    <UserForm onSubmit={handleCreate} />
                </Modal>

                <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Kullanıcı Güncelle" maxWidth="max-w-2xl">
                    {editingUser && (
                        <>
                            {modalError && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{modalError}</div>}
                            <UserForm
                                initialData={editingUser}
                                onSubmit={handleUpdate}
                                requirePassword={false}
                                submitLabel="Kullanıcıyı Güncelle"
                            />
                        </>
                    )}
                </Modal>
            </main>
        </AuthGuard>
    );
}