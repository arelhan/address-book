import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Contact } from '../types';

const SEARCH_STATE_KEY = 'address-book-search-state';

function readStoredSearchState() {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.sessionStorage.getItem(SEARCH_STATE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as {
            query?: string;
            results?: Contact[];
            showingAll?: boolean;
            page?: number;
            pageSize?: number;
        };
    } catch {
        return null;
    }
}

export function useSearch(delay = 300) {
    const stored = readStoredSearchState();
    const [query, setQuery] = useState(stored?.query || '');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<Contact[]>(stored?.results || []);
    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [showingAll, setShowingAll] = useState(stored?.showingAll || false);
    const [page, setPage] = useState(stored?.page || 1);
    const [pageSize, setPageSize] = useState(stored?.pageSize || 20);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            window.sessionStorage.setItem(
                SEARCH_STATE_KEY,
                JSON.stringify({ query, results, showingAll, page, pageSize })
            );
        } catch {
            // Ignore persistence failures.
        }
    }, [query, results, showingAll, page, pageSize]);

    const refreshCount = useCallback(async () => {
        try {
            const c = await api.getContactsCount();
            setCount(c);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        void refreshCount();
    }, [refreshCount]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), delay);
        return () => clearTimeout(timer);
    }, [query, delay]);

    useEffect(() => {
        let isMounted = true;

        const run = async () => {
            if (debouncedQuery.trim()) {
                setShowingAll(false);
                setIsLoading(true);

                try {
                    const data = await api.searchContacts(debouncedQuery, page, pageSize);
                    if (isMounted) {
                        setResults(data.items);
                        setTotal(data.total);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    if (isMounted) setIsLoading(false);
                }
                return;
            }

            if (showingAll) {
                setIsLoading(true);

                try {
                    const data = await api.getContacts(page, pageSize);
                    if (isMounted) {
                        setResults(data.items);
                        setTotal(data.total);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    if (isMounted) setIsLoading(false);
                }
                return;
            }

            setResults([]);
            setTotal(0);
        };

        void run();

        return () => {
            isMounted = false;
        };
    }, [debouncedQuery, showingAll, page, pageSize]);

    const loadAll = useCallback(() => {
        setPage(1);
        setQuery('');
        setDebouncedQuery('');
        setShowingAll(true);
    }, []);

    const clearAll = useCallback(() => {
        setPage(1);
        setQuery('');
        setDebouncedQuery('');
        setShowingAll(false);
        setResults([]);
        setTotal(0);
    }, []);

    const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

    return {
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
    };
}
