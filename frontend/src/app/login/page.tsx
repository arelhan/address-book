'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
    const router = useRouter();
    const { user, login, getSetupStatus } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const run = async () => {
            if (user) {
                router.replace('/');
                return;
            }

            const setupStatus = await getSetupStatus().catch(() => ({ needsSetup: false }));
            if (setupStatus.needsSetup) {
                router.replace('/setup');
            }
        };

        void run();
    }, [getSetupStatus, router, user]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login({ identifier, password });
            router.replace('/');
        } catch (err: any) {
            setError(err?.message || 'Giriş başarısız');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-[linear-gradient(180deg,_#f5f5f7_0%,_#eef3ff_100%)] dark:bg-[linear-gradient(180deg,_#09090b_0%,_#000_100%)]">
            <div className="w-full max-w-md rounded-[32px] border border-black/5 dark:border-white/10 bg-white/90 dark:bg-[#0b0b0f]/92 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.12)] p-8">
                <div className="mb-8">
                    <p className="text-sm font-semibold text-[#007AFF] uppercase tracking-[0.22em]">Login</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Kullanıcı Adı / E-posta</label>
                        <input
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] py-3.5 px-4 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Parola</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] py-3.5 px-4 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white"
                            autoComplete="current-password"
                            required
                        />
                    </div>

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
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-5 text-sm">
                    <button type="button" onClick={() => router.push('/reset-password')} className="font-semibold text-[#007AFF] hover:text-[#005bb5]">
                        Parolamı unuttum
                    </button>
                </div>
            </div>
        </main>
    );
}
