import { createContext } from "react";

import type { WishlistToggleResult } from "../types/wishlist";

export interface WishlistSelection {
    /** Saved product slugs, most recently added first. */
    slugs: string[];
    count: number;

    /**
     * Why the last load or write failed, or `""` when nothing has.
     *
     * Chapter 23.5. There was nothing to report while this lived in
     * localStorage — a synchronous write to a key either happened or the whole
     * page was already broken. Against a network there is a third outcome, and
     * this is where it surfaces so `WishlistPage` can render the existing
     * `WishlistError` rather than failing silently.
     */
    error: string;

    /** Re-runs the load after a failure. Wired to `WishlistError`'s "Try again". */
    retry: () => void;

    /*
     * The four mutators return Promises as of Chapter 23.5, and nothing else
     * about them changed — same names, same arguments, same result *values*.
     * `toggle` still answers "added" or "removed"; it just cannot answer until
     * the change has been made.
     *
     * The Promise is the honest part of the contract. These used to be
     * synchronous because a localStorage write is; they are now requests, and a
     * signature that hid that would be lying about when the value is known and
     * would give callers no way to wait for, or notice, a failure.
     *
     * Fire-and-forget remains valid — most call sites are click handlers that
     * ignore the result, and they were left untouched.
     */

    /** Adds a product. A slug already saved is a no-op, never a duplicate. */
    add: (slug: string) => Promise<void>;
    remove: (slug: string) => Promise<void>;
    /** Adds if absent, removes if present. Resolves with what happened. */
    toggle: (slug: string) => Promise<WishlistToggleResult>;
    clear: () => Promise<void>;
    isWishlisted: (slug: string) => boolean;
}

/**
 * Wishlist selection state, shared app-wide.
 *
 * A separate context from Compare on purpose: the two are independent concerns
 * with independent storage, and sharing one store would make "remove from
 * wishlist" capable of disturbing a comparison.
 *
 * `null` default so `useWishlistSelection` fails loudly when the provider is
 * missing, rather than turning every heart button into a silent dead control.
 */
export const WishlistContext = createContext<WishlistSelection | null>(null);
