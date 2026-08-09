import { createContext } from "react";

import type { WishlistToggleResult } from "../types/wishlist";

export interface WishlistSelection {
    /** Saved product slugs, most recently added first. */
    slugs: string[];
    count: number;
    /** Adds a product. A slug already saved is a no-op, never a duplicate. */
    add: (slug: string) => void;
    remove: (slug: string) => void;
    /** Adds if absent, removes if present. Returns what happened. */
    toggle: (slug: string) => WishlistToggleResult;
    clear: () => void;
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
