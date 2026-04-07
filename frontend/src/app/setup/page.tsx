'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SetupPage() {
    const router = useRouter();
    const { user, setupInitialSuperAdmin, getSetupStatus } = useAuth();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const run = async () => {
            if (user) {
                router.replace('/');
                return;
            }

            const setupStatus = await getSetupStatus().catch(() => ({ needsSetup: false }));
            if (!setupStatus.needsSetup) {
                router.replace('/login');
            }
        };

        void run();
    }, [getSetupStatus, router, user]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Parolalar uyuşmuyor');
            return;
        }

        setLoading(true);
        try {
            await setupInitialSuperAdmin({
                fullName,
                username,
                email,
                nationalId,
                phone,
                password,
            });
            router.replace('/');
        } catch (err: any) {
            setError(err?.message || 'Kurulum tamamlanamadı');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(circle_at_top,_rgba(0,122,255,0.18),_transparent_35%),linear-gradient(180deg,_#f5f5f7_0%,_#eef3ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(0,122,255,0.18),_transparent_35%),linear-gradient(180deg,_#09090b_0%,_#000_100%)]">
            <div className="w-full max-w-2xl rounded-[32px] border border-black/5 dark:border-white/10 bg-white/90 dark:bg-[#0b0b0f]/92 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.12)] p-8 md:p-10">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#007AFF]/10 px-3 py-1 text-sm font-semibold text-[#007AFF]">
                        <ShieldCheck size={16} /> İlk Kurulum
                    </div>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Super Admin oluşturun</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Uygulama ilk kez çalışırken bu hesabı oluşturun. Kurulum tamamlanınca doğrudan giriş yapılır.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="Ad Soyad" required />
                        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="Kullanıcı adı" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="E-posta" required />
                        <input value={nationalId} onChange={(e) => setNationalId(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="TC kimlik numarası" inputMode="numeric" maxLength={11} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="Telefon numarası" required />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="Parola" required />
                    </div>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="Parola tekrar" required />

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#007AFF] px-4 py-3.5 font-semibold text-white transition-colors hover:bg-[#006ee6] disabled:opacity-60"
                    >
                        {loading ? 'Kuruluyor...' : 'Kurulumu Tamamla'}
                        <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </main>
    );
}