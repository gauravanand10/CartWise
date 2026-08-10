import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { CompareContext } from "./compareContext";
import type { CompareSelection } from "./compareContext";
import { COMPARE_STORAGE_KEY, MAX_COMPARE } from "../constants";
import type { AddResult } from "../types/compare";
import { createPersistedList, isSameList } from "../../../lib/persistedList";

/**
 * Guarded, de-duplicated, versioned persistence. The store owns the mechanics;
 * the cap below is Compare's own rule and stays here.
 */
const store = createPersistedList(COMPARE_STORAGE_KEY);

const { write } = store;

/**
 * The stored list, held to the comparison's own limit.
 *
 * The cap is applied on the way in rather than inside the shared store: a
 * hand-edited value or one written by an older build with a different limit
 * must not be able to render a fifth column.
 */
function read(): string[] {
    return store.read().slice(0, MAX_COMPARE);
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

    // Cross-tab sync — same contract as the wishlist: read-only in response to
    // another tab's write, so the two tabs converge instead of ping-ponging.
    // The incoming value goes through `read`, so the cap applies to it too.
    useEffect(
        () =>
            store.subscribe(() => {
                const incoming = read();
                setSlugs((current) =>
                    isSameList(current, incoming) ? current : incoming,
                );
            }),
        [],
    );

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
