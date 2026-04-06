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

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            window.sessionStorage.setItem(
                SEARCH_STATE_KEY,
                JSON.stringify({ query, results, showingAll })
            );
        } catch {
            // Ignore persistence failures.
        }
    }, [query, results, showingAll]);

    // Başlangıçta toplam sayıyı çek
    const refreshCount = useCallback(async () => {
        try {
            const c = await api.getContactsCount();
            setCount(c);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        refreshCount();
    }, [refreshCount]);

    // Query değişince debounce
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), delay);
        return () => clearTimeout(timer);
    }, [query, delay]);

    // Query girilince arama yap (ve showAll modunu kapat)
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            if (!showingAll) setResults([]);
            return;
        }

        setShowingAll(false);
        let isMounted = true;
        setIsLoading(true);

        api.searchContacts(debouncedQuery)
            .then(data => {
                if (isMounted) setResults(data);
            })
            .catch(console.error)
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => { isMounted = false; };
    }, [debouncedQuery, showingAll]);

    const loadAll = useCallback(async () => {
        setIsLoading(true);
        setQuery('');
        try {
            const all = await api.getContacts();
            setResults(all);
            setShowingAll(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearAll = useCallback(() => {
        setShowingAll(false);
        setResults([]);
    }, []);

    return {
        query,
        setQuery,
        results,
        isLoading,
        count,
        showingAll,
        loadAll,
        clearAll,
        refreshCount,
    };
}
