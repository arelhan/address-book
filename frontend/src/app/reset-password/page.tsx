'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'verify' | 'reset'>('verify');
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const existingToken = searchParams.get('token');
        if (existingToken) {
            setToken(existingToken);
            setStep('reset');
        }
    }, []);

    const handleVerify = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.requestPasswordReset({ username, nationalId, phone });
            setToken(response.token);
            setStep('reset');
            router.replace(`/reset-password?token=${response.token}`);
        } catch (err: any) {
            setError(err?.message || 'Kullanıcı doğrulanamadı');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (event: FormEvent) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setError('Parolalar uyuşmuyor');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.resetPassword({ token, password });
            router.replace('/login');
        } catch (err: any) {
            setError(err?.message || 'Parola sıfırlanamadı');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(circle_at_top,_rgba(0,122,255,0.14),_transparent_35%),linear-gradient(180deg,_#f5f5f7_0%,_#eef3ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(0,122,255,0.18),_transparent_35%),linear-gradient(180deg,_#09090b_0%,_#000_100%)]">
            <div className="w-full max-w-lg rounded-[32px] border border-black/5 dark:border-white/10 bg-white/85 dark:bg-[#0b0b0f]/88 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.12)] p-8">
                <div className="mb-7">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#007AFF]/10 px-3 py-1 text-sm font-semibold text-[#007AFF]">
                        <ShieldCheck size={16} /> Parola Sıfırlama
                    </div>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {step === 'verify' ? 'Kimliği doğrulayın' : 'Yeni parolanızı belirleyin'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {step === 'verify'
                            ? 'Kullanıcı adı, TC ve telefon bilgileri eşleşirse sıfırlama ekranı açılır.'
                            : 'Sistemle eşleşen kullanıcı için yeni parolayı tanımlayın.'}
                    </p>
                </div>

                {step === 'verify' ? (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="Kullanıcı adı veya e-posta" required />
                        <input value={nationalId} onChange={(e) => setNationalId(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="TC kimlik numarası" inputMode="numeric" maxLength={11} required />
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="Telefon numarası" required />

                        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

                        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[#007AFF] px-4 py-3.5 font-semibold text-white transition-colors hover:bg-[#006ee6] disabled:opacity-60">
                            {loading ? 'Doğrulanıyor...' : 'Sıfırlama Ekranını Aç'}
                        </button>
                        <button type="button" onClick={() => router.push('/login')} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 font-semibold text-gray-700 dark:text-gray-200">
                            Geri dön
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="Yeni parola" required />
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#131316] px-4 py-3.5 outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] text-gray-900 dark:text-white" placeholder="Yeni parola tekrar" required />

                        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

                        <button type="submit" disabled={loading || !token} className="w-full rounded-2xl bg-[#007AFF] px-4 py-3.5 font-semibold text-white transition-colors hover:bg-[#006ee6] disabled:opacity-60">
                            {loading ? 'Güncelleniyor...' : 'Parolayı Güncelle'}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
