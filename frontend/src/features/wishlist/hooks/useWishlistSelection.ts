import { useContext } from "react";

import { WishlistContext } from "../context/wishlistContext";
import type { WishlistSelection } from "../context/wishlistContext";

/**
 * Reads the app-wide wishlist selection.
 *
 * Throws rather than returning a no-op fallback: a missing provider would turn
 * every heart button into a silent dead control, which is far harder to notice
 * than a crash during development.
 */
export function useWishlistSelection(): WishlistSelection {
    const context = useContext(WishlistContext);

    if (!context) {
        throw new Error(
            "useWishlistSelection must be used inside <WishlistProvider>.",
        );
    }

    return context;
}
