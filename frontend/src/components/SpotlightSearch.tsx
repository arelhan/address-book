import React, { useRef, useEffect } from 'react';

import { Search, List, X } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { ContactCard } from './ContactCard';
import { Contact } from '../types';

interface Props {
    onContactClick: (c: Contact) => void;
    registerRefreshCount?: (fn: () => void) => void;
}

export function SpotlightSearch({ onContactClick, registerRefreshCount }: Props) {
    const { query, setQuery, results, isLoading, count, showingAll, loadAll, clearAll, refreshCount } = useSearch();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Üst bileşenin refreshCount'ı tetikleyebilmesi için fn'i dışarı aç
    useEffect(() => {
        if (registerRefreshCount) registerRefreshCount(refreshCount);
    }, [registerRefreshCount, refreshCount]);

    const hasResults = query.trim().length > 0 || showingAll;

    return (
        <div
            className={`w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out ${hasResults ? 'mt-8' : 'mt-[30vh]'}`}
        >
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400 dark:text-gray-500 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Kişi veya firma ara..."
                    className="block w-full pl-14 pr-40 py-4 text-xl bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-2 border-transparent focus:border-[#007AFF] rounded-3xl shadow-xl hover:shadow-2xl focus:shadow-2xl focus:ring-4 focus:ring-[#007AFF]/10 placeholder-gray-400 dark:placeholder-gray-500 transition-all text-gray-900 dark:text-white outline-none focus:outline-none"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                    {showingAll ? (
                        <button
                            onClick={clearAll}
                            className="flex items-center px-4 py-2 bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 rounded-full hover:bg-gray-50 dark:hover:bg-[#3A3A3C] font-semibold transition-colors shadow-sm"
                        >
                            <X size={18} className="mr-1" /> Kapat
                        </button>
                    ) : (
                        <button
                            onClick={loadAll}
                            disabled={count === 0}
                            className="flex items-center px-4 py-2 bg-white dark:bg-[#2C2C2E] text-[#007AFF] border border-gray-200 dark:border-zinc-700 rounded-full hover:bg-gray-50 dark:hover:bg-[#3A3A3C] font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <List size={18} className="mr-1" /> {count} Kayıt
                        </button>
                    )}
                </div>
            </div>

            {hasResults && (
                <div className="mt-6">
                    {isLoading ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            {showingAll ? 'Kayıtlar yükleniyor...' : 'Aranıyor...'}
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            {showingAll && (
                                <div className="mb-3 text-[13px] font-medium text-gray-500 dark:text-gray-400 ml-1">
                                    Tüm kayıtlar ({results.length})
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.map((contact, i) => (
                                    <ContactCard
                                        key={contact.id}
                                        contact={contact}
                                        index={i}
                                        onClick={onContactClick}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-transparent dark:border-zinc-800">
                            Kayıt bulunamadı.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
