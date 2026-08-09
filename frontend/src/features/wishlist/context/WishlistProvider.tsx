import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { WishlistContext } from "./wishlistContext";
import type { WishlistSelection } from "./wishlistContext";
import { WISHLIST_STORAGE_KEY } from "../constants";
import type { WishlistToggleResult } from "../types/wishlist";

/**
 * Reads the saved wishlist.
 *
 * Every access is guarded: `localStorage` throws outright in private-mode
 * Safari and is absent during server rendering, and a wishlist failing to load
 * must never take the page down with it.
 */
function read(): string[] {
    try {
        const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        // De-duplicated on read as well as on write, so a hand-edited or
        // partially-migrated value can never produce two identical cards.
        return [
            ...new Set(
                parsed.filter((value): value is string => typeof value === "string"),
            ),
        ];
    } catch {
        return [];
    }
}

function write(slugs: string[]): void {
    try {
        window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(slugs));
    } catch {
        // Storage full or blocked. The wishlist still works for this session;
        // it just will not survive a reload, which is not worth failing over.
    }
}

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
