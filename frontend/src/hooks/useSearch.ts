import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Contact } from '../types';

export function useSearch(delay = 300) {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [showingAll, setShowingAll] = useState(false);

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
