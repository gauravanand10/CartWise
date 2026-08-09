import type { WishlistSort } from "./types/wishlist";

/** localStorage key for the saved product slugs. */
export const WISHLIST_STORAGE_KEY = "cartwise:wishlist";

/** Simulated latency so the loading state is exercised in development. */
export const WISHLIST_LATENCY_MS = 300;

/** How many products the empty state offers as a starting point. */
export const WISHLIST_SUGGESTIONS = 4;

/**
 * Sort options.
 *
 * "Recently added" is first and the default because a wishlist is a timeline —
 * the thing you just saved is the thing you are most likely looking for.
 */
export const WISHLIST_SORT_OPTIONS: ReadonlyArray<{
    value: WishlistSort;
    label: string;
}> = [
    { value: "recent", label: "Recently added" },
    { value: "price-low-high", label: "Price: Low to High" },
    { value: "price-high-low", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
];
