'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CreateUserInput, ManagedUser } from '@/types';

interface Props {
    onSubmit: (data: CreateUserInput) => Promise<void>;
    isLoading?: boolean;
    initialData?: ManagedUser;
    requirePassword?: boolean;
    submitLabel?: string;
}

const inputClasses = 'w-full px-4 py-3 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-2xl shadow-sm focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none transition-all text-[16px] dark:text-white placeholder-gray-400 dark:placeholder-gray-500';
const labelClasses = 'block text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 ml-1';

export function UserForm({ onSubmit, isLoading, initialData, requirePassword = true, submitLabel = 'Kullanıcı Oluştur' }: Props) {
    const [formData, setFormData] = useState<CreateUserInput>({
        fullName: initialData?.fullName || '',
        username: initialData?.username || '',
        email: initialData?.email || '',
        nationalId: initialData?.nationalId || '',
        phone: initialData?.phone || '',
        role: initialData?.role || 'VIEWER',
        password: '',
    });

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        await onSubmit(formData);
        if (!initialData) {
            setFormData({
                fullName: '',
                username: '',
                email: '',
                nationalId: '',
                phone: '',
                role: 'VIEWER',
                password: '',
            });
        } else {
            setFormData(prev => ({ ...prev, password: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClasses}>Ad Soyad *</label>
                <input name="fullName" value={formData.fullName} onChange={handleChange} className={inputClasses} required />
            </div>
            <div>
                <label className={labelClasses}>Kullanıcı Adı *</label>
                <input name="username" value={formData.username} onChange={handleChange} className={inputClasses} required />
            </div>
            <div>
                <label className={labelClasses}>E-posta *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClasses} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>TC Kimlik No *</label>
                    <input name="nationalId" value={formData.nationalId} onChange={handleChange} className={inputClasses} inputMode="numeric" maxLength={11} required />
                </div>
                <div>
                    <label className={labelClasses}>Telefon *</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Yetki *</label>
                    <select name="role" value={formData.role} onChange={handleChange} className={inputClasses}>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="VIEWER">Viewer</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Parola {requirePassword ? '*' : '(opsiyonel)'}</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} className={inputClasses} required={requirePassword} />
                </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#007AFF] hover:bg-[#006ee6] active:bg-[#005bb5] text-white px-6 py-3.5 rounded-[18px] font-semibold text-[17px] transition-colors disabled:opacity-50 shadow-md">
                {isLoading ? 'Kaydediliyor...' : submitLabel}
            </button>
        </form>
    );
}
