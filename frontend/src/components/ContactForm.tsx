import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { CreateContactInput } from '../types';
import { PhoneInput } from './PhoneInput';
import { ContactTypeSelector } from './ContactTypeSelector';

interface Props {
    initialData?: Partial<CreateContactInput>;
    onSubmit: (data: CreateContactInput) => Promise<void>;
    isLoading?: boolean;
}

export function ContactForm({ initialData, onSubmit, isLoading }: Props) {
    const [formData, setFormData] = useState<CreateContactInput>({
        type: initialData?.type || 'PERSON',
        name: initialData?.name || '',
        title: initialData?.title || '',
        department: initialData?.department || '',
        email: initialData?.email || '',
        address: initialData?.address || '',
        notes: initialData?.notes || '',
        phones: initialData?.phones && initialData.phones.length > 0
            ? initialData.phones
            : [{ number: '', label: 'Cep' }],
        parentId: initialData?.parentId || null
    });

    const [showEmail, setShowEmail] = useState(!!initialData?.email);
    const [showAddress, setShowAddress] = useState(!!initialData?.address);
    const [showNotes, setShowNotes] = useState(!!initialData?.notes);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Boş telefon satırlarını temizle
        const cleanedPhones = formData.phones.filter(p => p.number.trim().length > 0);
        await onSubmit({ ...formData, phones: cleanedPhones });
    };

    const inputClasses = "w-full px-4 py-3 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-2xl shadow-sm focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none transition-all text-[16px] dark:text-white placeholder-gray-400 dark:placeholder-gray-500";
    const labelClasses = "block text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 ml-1";
    const addBtnClasses = "flex items-center text-[15px] font-medium text-[#007AFF] hover:text-[#005bb5] py-1 transition-colors ml-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <ContactTypeSelector
                value={formData.type}
                onChange={(type) => setFormData(prev => ({
                    ...prev,
                    type,
                    title: type !== 'PERSON' ? '' : prev.title,
                    department: type !== 'PERSON' ? '' : prev.department,
                }))}
            />

            <div>
                <label className={labelClasses}>
                    {formData.type === 'PERSON' ? 'Ad Soyad' : 'Firma Ünvanı'} *
                </label>
                <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder={formData.type === 'PERSON' ? 'Örn: Ahmet Yılmaz' : 'Örn: ABC Teknoloji Ltd.'}
                />
            </div>

            <div className="pt-1">
                <PhoneInput
                    phones={formData.phones}
                    onChange={(phones) => setFormData(prev => ({ ...prev, phones }))}
                />
            </div>

            {formData.type === 'PERSON' && (
                <>
                    <div>
                        <label className={labelClasses}>Ünvan</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title || ''}
                            onChange={handleChange}
                            placeholder="Örn: Müdür"
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Birim</label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department || ''}
                            onChange={handleChange}
                            placeholder="Örn: İnsan Kaynakları"
                            className={inputClasses}
                        />
                    </div>
                </>
            )}

            {showEmail ? (
                <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                        <label className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">E-posta</label>
                        <button
                            type="button"
                            onClick={() => { setShowEmail(false); setFormData(prev => ({ ...prev, email: '' })); }}
                            className="text-[#FF3B30] hover:bg-[#FF3B30]/10 dark:text-[#FF453A] dark:hover:bg-[#FF453A]/20 rounded-full p-1 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="ornek@firma.com"
                    />
                </div>
            ) : (
                <button type="button" onClick={() => setShowEmail(true)} className={addBtnClasses}>
                    <Plus size={18} className="mr-1" /> E-posta Ekle
                </button>
            )}

            {showAddress ? (
                <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                        <label className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Adres</label>
                        <button
                            type="button"
                            onClick={() => { setShowAddress(false); setFormData(prev => ({ ...prev, address: '' })); }}
                            className="text-[#FF3B30] hover:bg-[#FF3B30]/10 dark:text-[#FF453A] dark:hover:bg-[#FF453A]/20 rounded-full p-1 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <textarea
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        rows={2}
                        className={`${inputClasses} resize-none`}
                        placeholder="Açık adres..."
                    />
                </div>
            ) : (
                <button type="button" onClick={() => setShowAddress(true)} className={addBtnClasses}>
                    <Plus size={18} className="mr-1" /> Adres Ekle
                </button>
            )}

            {showNotes ? (
                <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                        <label className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Notlar</label>
                        <button
                            type="button"
                            onClick={() => { setShowNotes(false); setFormData(prev => ({ ...prev, notes: '' })); }}
                            className="text-[#FF3B30] hover:bg-[#FF3B30]/10 dark:text-[#FF453A] dark:hover:bg-[#FF453A]/20 rounded-full p-1 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        rows={3}
                        className={`${inputClasses} resize-none`}
                        placeholder="Eklemek istediğiniz notlar..."
                    />
                </div>
            ) : (
                <button type="button" onClick={() => setShowNotes(true)} className={addBtnClasses}>
                    <Plus size={18} className="mr-1" /> Not Ekle
                </button>
            )}

            <div className="pt-6 pb-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#007AFF] hover:bg-[#006ee6] active:bg-[#005bb5] text-white px-6 py-3.5 rounded-[18px] font-semibold text-[17px] transition-colors disabled:opacity-50 shadow-md"
                >
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </form>
    );
}
