import React from 'react';

import { Contact } from '../types';
import { Badge } from './ui/Badge';
import { Phone, Building2, User } from 'lucide-react';

interface Props {
    contact: Contact;
    onClick: (contact: Contact) => void;
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: (id: string) => void;
    searchQuery?: string;
}

function normalizeSearchText(value: string) {
    return value
        .replaceAll('Ç', 'c')
        .replaceAll('ç', 'c')
        .replaceAll('Ğ', 'g')
        .replaceAll('ğ', 'g')
        .replaceAll('İ', 'i')
        .replaceAll('I', 'i')
        .replaceAll('ı', 'i')
        .replaceAll('Ö', 'o')
        .replaceAll('ö', 'o')
        .replaceAll('Ş', 's')
        .replaceAll('ş', 's')
        .replaceAll('Ü', 'u')
        .replaceAll('ü', 'u')
        .toLowerCase();
}

function getHighlightRanges(text: string, query: string) {
    const normalizedText = normalizeSearchText(text);
    const tokens = normalizeSearchText(query)
        .split(/\s+/)
        .map(token => token.trim())
        .filter(Boolean);

    if (tokens.length === 0) return [] as Array<{ start: number; end: number }>;

    const ranges: Array<{ start: number; end: number }> = [];

    for (const token of tokens) {
        let startIndex = 0;

        while (startIndex <= normalizedText.length) {
            const foundIndex = normalizedText.indexOf(token, startIndex);
            if (foundIndex === -1) break;

            ranges.push({ start: foundIndex, end: foundIndex + token.length });
            startIndex = foundIndex + token.length;
        }
    }

    ranges.sort((left, right) => left.start - right.start || left.end - right.end);

    const mergedRanges: Array<{ start: number; end: number }> = [];

    for (const range of ranges) {
        const lastRange = mergedRanges[mergedRanges.length - 1];
        if (lastRange && range.start <= lastRange.end) {
            lastRange.end = Math.max(lastRange.end, range.end);
            continue;
        }

        mergedRanges.push({ ...range });
    }

    return mergedRanges;
}

function renderHighlightedText(text: string, query?: string) {
    const trimmedQuery = query?.trim() || '';
    if (!trimmedQuery) return text;

    const ranges = getHighlightRanges(text, trimmedQuery);
    if (ranges.length === 0) return text;

    const parts: React.ReactNode[] = [];
    let cursor = 0;

    ranges.forEach((range, index) => {
        if (range.start > cursor) {
            parts.push(text.slice(cursor, range.start));
        }

        parts.push(
            <span
                key={`${range.start}-${range.end}-${index}`}
                className="rounded bg-[#007AFF]/12 px-0.5 text-[#007AFF] dark:bg-[#007AFF]/20 dark:text-[#8AB4FF]"
            >
                {text.slice(range.start, range.end)}
            </span>
        );

        cursor = range.end;
    });

    if (cursor < text.length) {
        parts.push(text.slice(cursor));
    }

    return parts;
}

export function ContactCard({ contact, onClick, selectable = false, selected = false, onToggleSelect, searchQuery }: Props) {
    const getIcon = () => {
        if (contact.type === 'PERSON') return <User size={16} className="mr-1" />;
        return <Building2 size={16} className="mr-1" />;
    };

    const getTypeStr = () => {
        if (contact.type === 'PERSON') return 'Kişi';
        return 'Firma';
    };

    const getVariant = () => {
        return contact.type === 'PERSON' ? 'person' : 'company';
    };

    return (
        <div
            onClick={() => {
                if (selectable && onToggleSelect) {
                    onToggleSelect(contact.id);
                    return;
                }
                onClick(contact);
            }}
            className="cursor-pointer rounded-[24px] bg-white dark:bg-[#1C1C1E] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none border border-black/[0.04] dark:border-white/[0.04] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:bg-[#2C2C2E] hover:scale-[1.015] active:scale-[0.98] transition-all duration-300 flex flex-col relative group"
        >
            {selectable && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect?.(contact.id);
                    }}
                    aria-label={selected ? 'Seçimi kaldır' : 'Seç'}
                    className={`absolute left-4 top-4 h-6 w-6 rounded-md border flex items-center justify-center transition-colors ${selected
                        ? 'bg-[#007AFF] border-[#007AFF] text-white'
                        : 'bg-white dark:bg-[#1C1C1E] border-gray-300 dark:border-zinc-600 text-transparent'
                        }`}
                >
                    ✓
                </button>
            )}

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
                {renderHighlightedText(contact.name, searchQuery)}
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
