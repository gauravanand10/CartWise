import { useCallback, useState } from "react";

import { MAX_RECENT_SEARCHES, RECENT_SEARCHES_KEY } from "../constants";

function read(): string[] {
    // Guarded: localStorage throws in private-mode Safari and is absent during SSR.
    try {
        const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter((v): v is string => typeof v === "string")
            : [];
    } catch {
        return [];
    }
}

function write(values: string[]): void {
    try {
        window.localStorage.setItem(
            RECENT_SEARCHES_KEY,
            JSON.stringify(values),
        );
    } catch {
        // Storage full or blocked — recent searches are a convenience, not
        // something worth failing the search over.
    }
}

interface RecentSearches {
    recent: string[];
    add: (term: string) => void;
    remove: (term: string) => void;
    clear: () => void;
}

/**
 * Most-recent-first list of submitted queries, persisted to localStorage.
 *
 * Initialised lazily from storage so the first render already has the list,
 * avoiding a flash of an empty dropdown.
 */
export function useRecentSearches(): RecentSearches {
    const [recent, setRecent] = useState<string[]>(read);

    const add = useCallback((term: string) => {
        const value = term.trim();
        if (!value) return;

        setRecent((current) => {
            // Case-insensitive de-dupe, then move to the front.
            const withoutDupe = current.filter(
                (item) => item.toLowerCase() !== value.toLowerCase(),
            );
            const next = [value, ...withoutDupe].slice(0, MAX_RECENT_SEARCHES);
            write(next);
            return next;
        });
    }, []);

    const remove = useCallback((term: string) => {
        setRecent((current) => {
            const next = current.filter((item) => item !== term);
            write(next);
            return next;
        });
    }, []);

    const clear = useCallback(() => {
        setRecent([]);
        write([]);
    }, []);

    return { recent, add, remove, clear };
}
