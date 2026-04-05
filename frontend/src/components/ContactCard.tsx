import React from 'react';

import { Contact } from '../types';
import { Badge } from './ui/Badge';
import { Phone, Building2, User } from 'lucide-react';

interface Props {
    contact: Contact;
    index: number;
    onClick: (contact: Contact) => void;
}

export function ContactCard({ contact, index, onClick }: Props) {
    const getIcon = () => {
        if (contact.type === 'PERSON') return <User size={16} className="mr-1" />;
        return <Building2 size={16} className="mr-1" />;
    };

    const getTypeStr = () => {
        if (contact.type === 'PERSON') return 'Kişi';
        return 'Firma';
    };

    const getVariant = () => {
        return contact.type.toLowerCase() as any;
    };

    return (
        <div
            onClick={() => onClick(contact)}
            className="cursor-pointer rounded-[24px] bg-white dark:bg-[#1C1C1E] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.04] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:bg-[#2C2C2E] hover:scale-[1.015] active:scale-[0.98] transition-all duration-300 flex flex-col relative group"
        >
            <div className="flex justify-between items-start mb-3">
                <Badge variant={getVariant()}>
                    {getIcon()}
                    {getTypeStr()}
                </Badge>
                {contact.parent && (
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                        {contact.parent.name}
                    </span>
                )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate w-full tracking-tight" title={contact.name}>
                {contact.name}
            </h3>
            {(contact.title || contact.department) && (
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 truncate">
                    {[contact.title, contact.department].filter(Boolean).join(' · ')}
                </p>
            )}

            <div className="mt-auto pt-4 border-t border-black/[0.04] dark:border-white/[0.04] text-sm">
                {contact.phones && contact.phones.length > 0 ? (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Phone size={14} className="mr-2 opacity-60" />
                        <span className="font-medium tracking-wide">{contact.phones[0].number}</span>
                        {contact.phones.length > 1 && (
                            <span className="ml-2 text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                                +{contact.phones.length - 1}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Telefon yok</span>
                )}
            </div>

            {contact._count?.children !== undefined && contact._count.children > 0 && (
                <div className="absolute top-5 right-5 text-[11px] font-bold bg-[#007AFF]/10 text-[#007AFF] px-2 py-0.5 rounded-full">
                    {contact._count.children} alt
                </div>
            )}
        </div>
    );
}
