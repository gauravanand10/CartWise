import { useCallback, useEffect, useMemo, useState } from "react";

import { useCompareSelection } from "./useCompareSelection";
import { MIN_COMPARE } from "../constants";
import { getComparisonProducts, getSuggestions } from "../services/compareService";
import { buildSections, buildVerdict } from "../utils/buildComparison";
import type {
    CompareStatus,
    CompareVerdict,
    ResolvedSection,
} from "../types/compare";
import type { ProductCardModel, ProductDetail } from "../../product/types/product";

/** Stable identity for "no products", so downstream memos stay valid. */
const EMPTY: ProductDetail[] = [];

interface UseComparison {
    products: ProductDetail[];
    sections: ResolvedSection[];
    verdict: CompareVerdict | null;
    suggestions: ProductCardModel[];
    status: CompareStatus;
    error: string;
    retry: () => void;
    /** Total rows where the products do not agree. */
    differenceCount: number;
}

/**
 * Loads and resolves the current comparison.
 *
 * Selection lives in context and survives navigation; this hook turns it into
 * products and resolved rows. The heavy work — deriving sections, ranking rows,
 * computing the verdict — is memoised on the loaded products, so toggling
 * "highlight differences" or expanding a section re-renders without
 * recomputing the whole comparison.
 */
export function useComparison(): UseComparison {
    const { slugs, remove } = useCompareSelection();

    const [products, setProducts] = useState<ProductDetail[]>([]);
    const [loading, setLoading] = useState(slugs.length > 0);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);

    // Joined rather than passed as an array: a new array identity on every
    // render would restart the request on each keystroke elsewhere in the app.
    const key = slugs.join(",");

    useEffect(() => {
        // Nothing selected: return without touching state. Clearing `products`
        // here would be a synchronous setState in an effect body — a cascading
        // render for a value that can simply be derived below instead.
        if (!key) return;

        // Guards against a slower earlier request overwriting a newer result
        // when products are added or removed quickly.
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const { products: loaded, missing } =
                    await getComparisonProducts(key.split(","));

                if (cancelled) return;

                setProducts(loaded);

                /*
                 * Pruning removed in Chapter 23.5, for the same reason as the
                 * wishlist's — see the current, corrected note in `useWishlist`
                 * for why `missing` no longer carries the risk that disabled
                 * this: the mock catalogue it once meant "not in" is gone, and
                 * `getComparisonProducts` resolves every seeded product through
                 * `getProductBySlug`, the same real API path the product page
                 * itself uses — checked directly, not assumed.
                 *
                 * Pruning stays off for the same reason it stays off there: a
                 * 404 today is almost always a genuinely delisted product, and
                 * silently deleting a comparison column on that signal is worse
                 * than leaving a visible gap for the user to notice and clear
                 * themselves.
                 */
                void missing;
            } catch {
                if (!cancelled) {
                    setError("We couldn't load this comparison. Please try again.");
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

    // Derived rather than stored, so an emptied selection needs no state update
    // and stale products from a previous selection can never be rendered.
    // `EMPTY` is a module constant, not a fresh `[]`: a new array identity here
    // would invalidate every memo below on each render.
    const activeProducts = key ? products : EMPTY;
    const activeLoading = key ? loading : false;
    const activeError = key ? error : "";

    const sections = useMemo(
        () => buildSections(activeProducts),
        [activeProducts],
    );

    const verdict = useMemo(
        () =>
            activeProducts.length >= MIN_COMPARE
                ? buildVerdict(activeProducts, sections)
                : null,
        [activeProducts, sections],
    );

    /*
     * Chapter 26.5: `getSuggestions` became asynchronous when the local
     * catalogue was retired, so this moved from `useMemo` to state filled by an
     * effect. The starting value is an empty array, which the empty-state
     * component already renders correctly — the picker simply populates a
     * moment after the page, rather than the page waiting on it.
     *
     * `cancelled` guards the usual race: changing the comparison twice quickly
     * would otherwise let a slower earlier response overwrite a newer one.
     */
    const [suggestions, setSuggestions] = useState<ProductCardModel[]>([]);

    useEffect(() => {
        let cancelled = false;

        // Chapter 29 added the `.catch` — see the identical note in
        // useWishlist. An unhandled rejection is not an acceptable failure mode
        // for a supplementary picker list.
        void getSuggestions(activeProducts, slugs)
            .then((next) => {
                if (!cancelled) setSuggestions(next);
            })
            .catch(() => {
                if (!cancelled) setSuggestions([]);
            });

        return () => {
            cancelled = true;
        };
    }, [activeProducts, slugs]);

    const differenceCount = useMemo(
        () =>
            sections.reduce((total, section) => total + section.differenceCount, 0),
        [sections],
    );

    const retry = useCallback(() => setAttempt((value) => value + 1), []);

    const status: CompareStatus = activeLoading
        ? "loading"
        : activeError
            ? "error"
            : activeProducts.length === 0
                ? "empty"
                : "ready";

    return {
        products: activeProducts,
        sections,
        verdict,
        suggestions,
        status,
        error: activeError,
        retry,
        differenceCount,
    };
}
