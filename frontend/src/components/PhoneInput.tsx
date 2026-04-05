import React from 'react';

import { X, Plus } from 'lucide-react';

interface PhoneField {
    number: string;
    label: string;
}

interface Props {
    phones: PhoneField[];
    onChange: (phones: PhoneField[]) => void;
}

export function PhoneInput({ phones, onChange }: Props) {
    const addPhone = () => {
        onChange([...phones, { number: '', label: 'Cep' }]);
    };

    const removePhone = (index: number) => {
        onChange(phones.filter((_, i) => i !== index));
    };

    const updatePhone = (index: number, field: keyof PhoneField, value: string) => {
        const newPhones = [...phones];
        newPhones[index] = { ...newPhones[index], [field]: value };
        onChange(newPhones);
    };

    const inputClasses = "flex-1 px-4 py-3 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-2xl shadow-sm focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none transition-all text-[16px] dark:text-white placeholder-gray-400 dark:placeholder-gray-500";
    const selectClasses = "px-3 py-3 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-2xl shadow-sm focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none transition-all text-[16px] dark:text-white cursor-pointer";

    return (
        <div className="space-y-3">
            <label className="block text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Telefon Numaraları</label>
                {phones.map((phone, i) => (
                    <div
                        key={i}
                        className="flex items-center space-x-2 transition-all duration-300"
                    >
                        <select
                            value={phone.label}
                            onChange={(e) => updatePhone(i, 'label', e.target.value)}
                            className={selectClasses}
                        >
                            <option value="Cep">Cep</option>
                            <option value="İş">İş</option>
                            <option value="Ev">Ev</option>
                            <option value="Faks">Faks</option>
                        </select>
                        <input
                            type="text"
                            value={phone.number}
                            onChange={(e) => updatePhone(i, 'number', e.target.value)}
                            placeholder="05XX XXX XX XX"
                            className={inputClasses}
                        />
                        <button
                            type="button"
                            onClick={() => removePhone(i)}
                            className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/10 dark:text-[#FF453A] dark:hover:bg-[#FF453A]/20 rounded-full transition-colors flex-shrink-0"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ))}
            <button
                type="button"
                onClick={addPhone}
                className="flex items-center text-[15px] font-medium text-[#007AFF] hover:text-[#005bb5] py-1 transition-colors ml-1"
            >
                <Plus size={18} className="mr-1" /> Yeni Telefon Ekle
            </button>
        </div>
    );
}
