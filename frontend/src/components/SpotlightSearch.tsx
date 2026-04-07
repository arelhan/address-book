import React, { useRef, useEffect, useMemo, useState } from 'react';

import { Search, List, X, Trash2, CheckSquare } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { ContactCard } from './ContactCard';
import { Contact } from '../types';
import { api } from '../lib/api';

interface Props {
    onContactClick: (c: Contact) => void;
    registerRefreshCount?: (fn: () => void) => void;
    canManage?: boolean;
}

export function SpotlightSearch({ onContactClick, registerRefreshCount, canManage = false }: Props) {
    const {
        query,
        setQuery,
        results,
        isLoading,
        count,
        showingAll,
        page,
        setPage,
        pageSize,
        setPageSize,
        total,
        totalPages,
        loadAll,
        clearAll,
        refreshCount,
    } = useSearch();
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Üst bileşenin refreshCount'ı tetikleyebilmesi için fn'i dışarı aç
    useEffect(() => {
        if (registerRefreshCount) registerRefreshCount(refreshCount);
    }, [registerRefreshCount, refreshCount]);

    const hasResults = query.trim().length > 0 || showingAll;
    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
    const showPagination = total > pageSize;

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const selectAll = () => {
        setSelectedIds(results.map(c => c.id));
    };

    const clearSelection = () => {
        setSelectedIds([]);
    };

    const closeSelectionMode = () => {
        setSelectionMode(false);
        setSelectedIds([]);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`${selectedIds.length} kaydı pasif yapmak istediğinize emin misiniz?`)) return;

        try {
            setIsBulkDeleting(true);
            await api.bulkDeleteContacts(selectedIds);
            setSelectedIds([]);
            await refreshCount();

            if (showingAll) {
                await loadAll();
            }
        } catch (err) {
            console.error(err);
            alert('Toplu pasifleştirme sırasında hata oluştu.');
        } finally {
            setIsBulkDeleting(false);
            setSelectionMode(false);
        }
    };

    return (
        <div
            className={`w-full max-w-5xl mx-auto transition-all duration-500 ease-in-out ${hasResults ? 'mt-8' : 'mt-[30vh]'}`}
        >
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400 dark:text-gray-500 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(1);
                    }}
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
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 ml-1">
                                <div className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                                    {showingAll ? `Tüm kayıtlar (${total})` : `Arama sonuçları (${total})`}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <label className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
                                        Sayfa boyutu
                                    </label>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-full text-sm font-semibold transition-colors"
                                    >
                                        {[20, 50, 100].map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                {showingAll && canManage && !selectionMode ? (
                                    <button
                                        type="button"
                                        onClick={() => setSelectionMode(true)}
                                        className="flex items-center px-3 py-1.5 bg-white dark:bg-[#2C2C2E] text-[#007AFF] border border-gray-200 dark:border-zinc-700 rounded-full hover:bg-gray-50 dark:hover:bg-[#3A3A3C] text-sm font-semibold transition-colors"
                                    >
                                        <CheckSquare size={16} className="mr-1" /> Seçim Modu
                                    </button>
                                ) : null}
                            </div>

                            {showingAll && canManage && selectionMode && (
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 ml-1">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={selectAll}
                                            className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-full hover:bg-gray-50 dark:hover:bg-[#3A3A3C] text-sm font-semibold transition-colors"
                                        >
                                            Tümünü Seç
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearSelection}
                                            className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-full hover:bg-gray-50 dark:hover:bg-[#3A3A3C] text-sm font-semibold transition-colors"
                                        >
                                            Temizle
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleBulkDelete}
                                            disabled={selectedIds.length === 0 || isBulkDeleting}
                                            className="flex items-center px-3 py-1.5 bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20 rounded-full hover:bg-[#FF3B30]/20 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={16} className="mr-1" />
                                            {isBulkDeleting ? 'Pasifleştiriliyor...' : `Seçilenleri Pasifleştir (${selectedIds.length})`}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeSelectionMode}
                                            className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-full hover:bg-gray-50 dark:hover:bg-[#3A3A3C] text-sm font-semibold transition-colors"
                                        >
                                            Çık
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.map((contact) => (
                                    <ContactCard
                                        key={contact.id}
                                        contact={contact}
                                        onClick={onContactClick}
                                        selectable={selectionMode && canManage}
                                        selected={selectedSet.has(contact.id)}
                                        onToggleSelect={toggleSelect}
                                        searchQuery={query}
                                    />
                                ))}
                            </div>

                            {showPagination && (
                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Sayfa {page} / {totalPages}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page <= 1}
                                            className="rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#2C2C2E] px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 disabled:opacity-40"
                                        >
                                            Önceki
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                                            disabled={page >= totalPages}
                                            className="rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#2C2C2E] px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 disabled:opacity-40"
                                        >
                                            Sonraki
                                        </button>
                                    </div>
                                </div>
                            )}
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
