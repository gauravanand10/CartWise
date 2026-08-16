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

                /*
                 * SELF-HEALING, ADAPTED IN CHAPTER 23.5 — AND NARROWED.
                 *
                 * This used to read: `for (const slug of missing) remove(slug)`.
                 * A slug that no longer resolved was dropped from the selection,
                 * so a delisted product could not sit in localStorage forever
                 * inflating the navbar badge. Against localStorage that was free
                 * — the list was the only record, and pruning it cost nothing
                 * that was not already broken.
                 *
                 * Against the API it is destructive, and quietly so. `remove`
                 * now issues a DELETE against the user's real wishlist, and
                 * `missing` does not mean "the server forgot this product" — it
                 * means "this frontend's mock catalogue could not resolve it".
                 * Those came apart the moment the database became the source of
                 * truth: V3 seeded 50 products, of which 27 exist only in
                 * PostgreSQL and have no entry in the mock catalogue the product
                 * service reads. Saving any of those and opening this page would
                 * have deleted the row — a real saved product, erased by a
                 * client-side lookup miss, with nothing on screen to say so.
                 *
                 * So the pruning is gone and the products that did resolve are
                 * rendered. The server is authoritative about what is saved; a
                 * slug it returned is saved, whether or not this build can draw
                 * a card for it.
                 *
                 * The cost is the problem the original code solved: the badge
                 * counts what the server holds while the grid shows only what
                 * resolved, so the two can disagree by exactly the number of
                 * database-only products saved. That is a visible inconsistency
                 * and it is the lesser one — the alternative is silent data
                 * loss. The real repair is for this hook to build its cards from
                 * the wishlist response, which already embeds every product in
                 * full; that is a larger change than unblocking the wiring and
                 * is recorded rather than smuggled in here.
                 */
                void missing;
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
