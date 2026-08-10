import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { WishlistContext } from "./wishlistContext";
import type { WishlistSelection } from "./wishlistContext";
import { WISHLIST_STORAGE_KEY } from "../constants";
import type { WishlistToggleResult } from "../types/wishlist";
import { createPersistedList, isSameList } from "../../../lib/persistedList";

/**
 * Guarded, de-duplicated, versioned persistence. The store owns the mechanics;
 * this provider owns what the wishlist means — ordering, toggling, and the
 * public contract in `wishlistContext`.
 */
const store = createPersistedList(WISHLIST_STORAGE_KEY);

const { read, write } = store;

/**
 * Provides the wishlist selection to the whole app.
 *
 * Newly saved products are prepended, so array order *is* recency — that gives
 * the "Recently added" sort for free without storing a timestamp per entry, and
 * keeps the persisted value a plain list of identifiers.
 *
 * Read lazily in `useState` so the first render already has the real list and
 * the navbar badge never flashes a zero.
 */
export default function WishlistProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [slugs, setSlugs] = useState<string[]>(read);

    // Cross-tab sync. Saving a product in one tab used to leave every other
    // open tab showing a stale badge until it was reloaded.
    //
    // This path only ever *reads*, which is what keeps it loop-free: the
    // browser does not deliver `storage` to the tab that performed the write,
    // so a tab reacting by reading cannot bounce the event back. Bailing out
    // when the value is unchanged also keeps the context value referentially
    // stable, so an unrelated key changing costs no re-render.
    useEffect(
        () =>
            store.subscribe((incoming) => {
                setSlugs((current) =>
                    isSameList(current, incoming) ? current : incoming,
                );
            }),
        [],
    );

    const add = useCallback((slug: string) => {
        setSlugs((current) => {
            if (current.includes(slug)) return current;

            const next = [slug, ...current];
            write(next);
            return next;
        });
    }, []);

    const remove = useCallback((slug: string) => {
        setSlugs((current) => {
            if (!current.includes(slug)) return current;

            const next = current.filter((item) => item !== slug);
            write(next);
            return next;
        });
    }, []);

    const toggle = useCallback((slug: string): WishlistToggleResult => {
        // Decided inside the setter rather than by closing over `slugs`, so the
        // callback identity stays stable and consumers of this context do not
        // all re-render whenever the selection changes.
        let result: WishlistToggleResult = "added";

        setSlugs((current) => {
            if (current.includes(slug)) {
                result = "removed";
                const next = current.filter((item) => item !== slug);
                write(next);
                return next;
            }

            const next = [slug, ...current];
            write(next);
            return next;
        });

        return result;
    }, []);

    const clear = useCallback(() => {
        setSlugs([]);
        write([]);
    }, []);

    const value = useMemo<WishlistSelection>(
        () => ({
            slugs,
            count: slugs.length,
            add,
            remove,
            toggle,
            clear,
            isWishlisted: (slug: string) => slugs.includes(slug),
        }),
        [slugs, add, remove, toggle, clear],
    );

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}
