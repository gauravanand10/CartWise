import { useCallback, useEffect, useMemo, useState } from "react";

import { useWishlistSelection } from "./useWishlistSelection";
import {
    getWishlistProducts,
    getWishlistSuggestions,
} from "../services/wishlistService";
import { sortWishlist } from "../utils/sortWishlist";
import type { WishlistSort, WishlistStatus } from "../types/wishlist";
import type { ProductCardModel } from "../../product/types/product";

/** Stable identity for "nothing saved", so downstream memos stay valid. */
const EMPTY: ProductCardModel[] = [];

interface UseWishlist {
    products: ProductCardModel[];
    suggestions: ProductCardModel[];
    status: WishlistStatus;
    error: string;
    retry: () => void;
    sort: WishlistSort;
    setSort: (value: WishlistSort) => void;
}

/**
 * Loads and orders the saved products.
 *
 * Selection lives in context and survives navigation; this hook turns it into
 * renderable products. Sorting is memoised on the loaded list, so changing the
 * order re-sorts without re-fetching anything.
 */
export function useWishlist(): UseWishlist {
    const { slugs, remove } = useWishlistSelection();

    const [products, setProducts] = useState<ProductCardModel[]>([]);
    const [loading, setLoading] = useState(slugs.length > 0);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const [sort, setSort] = useState<WishlistSort>("recent");

    // Joined rather than passed as an array: a new array identity on every
    // render would restart the request continuously.
    const key = slugs.join(",");

    useEffect(() => {
        // Nothing saved: return without touching state. Clearing `products`
        // here would be a synchronous setState in an effect body — a cascading
        // render for a value that is simply derived below instead.
        if (!key) return;

        // Guards against a slower earlier request overwriting a newer result
        // when products are removed in quick succession.
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const { products: loaded, missing } =
                    await getWishlistProducts(key.split(","));

                if (cancelled) return;

                setProducts(loaded);

                // Drop slugs that no longer resolve, so a delisted product
                // cannot sit in storage forever inflating the navbar badge.
                for (const slug of missing) remove(slug);
            } catch {
                if (!cancelled) {
                    setError("We couldn't load your wishlist. Please try again.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [key, attempt, remove]);

    const activeProducts = key ? products : EMPTY;
    const activeLoading = key ? loading : false;
    const activeError = key ? error : "";

    const sorted = useMemo(
        () => sortWishlist(activeProducts, sort),
        [activeProducts, sort],
    );

    const suggestions = useMemo(
        () => getWishlistSuggestions(slugs),
        [slugs],
    );

    const retry = useCallback(() => setAttempt((value) => value + 1), []);

    const status: WishlistStatus = activeLoading
        ? "loading"
        : activeError
            ? "error"
            : sorted.length === 0
                ? "empty"
                : "ready";

    return {
        products: sorted,
        suggestions,
        status,
        error: activeError,
        retry,
        sort,
        setSort,
    };
}
