import React from 'react';

import { ContactType } from '../types';

interface Props {
    value: ContactType;
    onChange: (type: ContactType) => void;
}

export function ContactTypeSelector({ value, onChange }: Props) {
    const types: { id: ContactType; label: string }[] = [
        { id: 'PERSON', label: 'Kişi' },
        { id: 'COMPANY', label: 'Firma' }
    ];

    return (
        <div className="flex p-0.5 bg-gray-200/80 dark:bg-[#1C1C1E] rounded-[9px] relative items-center h-[32px]">
            {types.map((type) => (
                <button
                    key={type.id}
                    type="button"
                    onClick={() => onChange(type.id)}
                    className={`flex-1 text-[13px] font-medium z-10 transition-colors ${value === type.id ? 'text-gray-900 dark:text-white cursor-default' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    {type.label}
                </button>
            ))}
            <div
                className="absolute top-[2px] bottom-[2px] w-[calc(50%-2px)] bg-white dark:bg-[#2C2C2E] rounded-[7px] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-300"
                style={{
                    left: `calc(${types.findIndex(t => t.id === value) * 50}% + 2px)`
                }}
            />
        </div>
    );
}
