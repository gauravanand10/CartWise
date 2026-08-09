import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { CompareContext } from "./compareContext";
import type { CompareSelection } from "./compareContext";
import { COMPARE_STORAGE_KEY, MAX_COMPARE } from "../constants";
import type { AddResult } from "../types/compare";

/** Reads the saved selection. Guarded — localStorage throws in private mode. */
function read(): string[] {
    try {
        const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((value): value is string => typeof value === "string")
            .slice(0, MAX_COMPARE);
    } catch {
        return [];
    }
}

function write(slugs: string[]): void {
    try {
        window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(slugs));
    } catch {
        // Storage full or blocked. The comparison still works for this session;
        // it just will not survive a reload, which is not worth failing over.
    }
}

/**
 * Provides the comparison selection to the whole app.
 *
 * Persisted to localStorage on every change so a refresh — or arriving at
 * /compare directly from a shared link — restores what the user had picked.
 * Reading it lazily in `useState` means the first render already has the real
 * list, so the navbar badge never flashes a zero.
 */
export default function CompareProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [slugs, setSlugs] = useState<string[]>(read);

    const add = useCallback((slug: string): AddResult => {
        let result: AddResult = "added";

        setSlugs((current) => {
            if (current.includes(slug)) {
                result = "duplicate";
                return current;
            }

            if (current.length >= MAX_COMPARE) {
                result = "full";
                return current;
            }

            const next = [...current, slug];
            write(next);
            return next;
        });

        return result;
    }, []);

    const remove = useCallback((slug: string) => {
        setSlugs((current) => {
            const next = current.filter((item) => item !== slug);
            write(next);
            return next;
        });
    }, []);

    const toggle = useCallback(
        (slug: string): AddResult | "removed" => {
            // Reads through the setter rather than closing over `slugs`, so the
            // callback stays stable and every consumer of this context does not
            // re-render on each selection change.
            let result: AddResult | "removed" = "added";

            setSlugs((current) => {
                if (current.includes(slug)) {
                    result = "removed";
                    const next = current.filter((item) => item !== slug);
                    write(next);
                    return next;
                }

                if (current.length >= MAX_COMPARE) {
                    result = "full";
                    return current;
                }

                const next = [...current, slug];
                write(next);
                return next;
            });

            return result;
        },
        [],
    );

    const clear = useCallback(() => {
        setSlugs([]);
        write([]);
    }, []);

    const value = useMemo<CompareSelection>(
        () => ({
            slugs,
            count: slugs.length,
            isFull: slugs.length >= MAX_COMPARE,
            add,
            remove,
            toggle,
            clear,
            isComparing: (slug: string) => slugs.includes(slug),
        }),
        [slugs, add, remove, toggle, clear],
    );

    return (
        <CompareContext.Provider value={value}>
            {children}
        </CompareContext.Provider>
    );
}
