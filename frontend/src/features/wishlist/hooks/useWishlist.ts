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
                 * SELF-HEALING, DISABLED IN CHAPTER 23.5. STILL DISABLED, FOR A DIFFERENT REASON.
                 *
                 * This used to read: `for (const slug of missing) remove(slug)`.
                 * A slug that no longer resolved was dropped from the selection,
                 * so a delisted product could not sit in localStorage forever
                 * inflating the navbar badge. Against localStorage that was free
                 * — the list was the only record, and pruning it cost nothing
                 * that was not already broken.
                 *
                 * Chapter 23.5 disabled it because `missing` meant something
                 * unsafe at the time: this frontend read products from a
                 * hand-written mock array that covered only some of what the
                 * database actually held, so `missing` could mean "not in the
                 * mock file" rather than "genuinely gone" — and `remove` issued
                 * a real DELETE. Pruning on that signal risked erasing a
                 * perfectly real saved product because of a client-side lookup
                 * gap, with nothing on screen to say so.
                 *
                 * THAT mock catalogue is gone — Chapter 26.5 deleted the last of
                 * it, and every product this hook can be asked to load now comes
                 * from the same database the wishlist itself is stored in, so
                 * `missing` is back to meaning what it originally meant: the
                 * server answered 404. Checked while writing this note, not
                 * assumed — `GET /api/products/{slug}` was tried against several
                 * seeded products and resolved all of them.
                 *
                 * Pruning stays disabled anyway. A 404 today almost always means
                 * a product was genuinely delisted, and re-enabling silent
                 * deletion on that signal reintroduces the original risk for a
                 * saving that is now marginal — the badge/grid mismatch below is
                 * a visible inconsistency, which is a cheaper failure mode than
                 * a wishlist row vanishing without the user doing anything. The
                 * real fix remains what it always was: build this hook's cards
                 * from the wishlist response itself, which already embeds every
                 * product in full and would make `missing` unnecessary rather
                 * than merely safer to ignore.
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

    // Chapter 26.5 — see the identical note in useComparison. Async now.
    const [suggestions, setSuggestions] = useState<ProductCardModel[]>([]);

    useEffect(() => {
        let cancelled = false;

        /*
         * Chapter 29 added the `.catch`. It was `void promise.then(...)`, which
         * silences the floating-promise lint without handling anything — a
         * rejection here became an unhandled promise rejection in the console
         * and, in a browser with "pause on unhandled rejections", a stop.
         *
         * It survives today only because `getPopularProducts` happens to catch
         * internally and resolve with `[]`. That is one `try` in another
         * module's implementation away from being a live bug, and this hook
         * should not depend on it. Suggestions are supplementary: an empty list
         * is the correct failure, and WishlistEmpty already renders it.
         */
        void getWishlistSuggestions(slugs)
            .then((next) => {
                if (!cancelled) setSuggestions(next);
            })
            .catch(() => {
                if (!cancelled) setSuggestions([]);
            });

        return () => {
            cancelled = true;
        };
    }, [slugs]);

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
