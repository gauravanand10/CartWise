import { useCallback, useEffect, useMemo, useState } from "react";

import useDebounce from "./useDebounce";
import { getCatalogue, searchProducts } from "../services/searchService";
import { DEFAULT_FILTER, SEARCH_DEBOUNCE_MS } from "../constants";
import type { SearchProduct, SearchStatus, SortOption } from "../types/search";
import type { SearchFilter } from "../types/filter";
import {
    countActiveFilters,
    facetCounts,
    priceBoundsOf,
} from "../utils/searchUtils";

interface UseSearch {
    query: string;
    setQuery: (value: string) => void;
    /** The query actually driving `results` — lags `query` by the debounce. */
    activeQuery: string;

    sort: SortOption;
    setSort: (value: SortOption) => void;

    filter: SearchFilter;
    setFilter: (patch: Partial<SearchFilter>) => void;
    resetFilters: () => void;
    activeFilterCount: number;

    resetSearch: () => void;

    results: SearchProduct[];
    status: SearchStatus;
    error: string;

    categories: Array<{ value: string; count: number }>;
    brands: Array<{ value: string; count: number }>;
    priceBounds: { min: number; max: number };
}

/**
 * Optional starting state, read from the URL by the page.
 *
 * Chapter 24: the header and hero search fields navigate to `/search?q=…`, and
 * a breadcrumb can arrive with `?category=…`. Without seeding, both landed on
 * an unfiltered page that silently ignored what the user had asked for.
 */
export interface SearchInitialState {
    query?: string;
    /** Display form, e.g. `"Smartphone"` — the facet values this hook exposes. */
    category?: string;
}

/** Stable identity for "catalogue not loaded yet", so memos below stay valid. */
const EMPTY_CATALOGUE: SearchProduct[] = [];

export function useSearch(initial: SearchInitialState = {}): UseSearch {
    /*
     * Facets come from the whole catalogue, not the current results: deriving
     * them from filtered data makes every other option vanish the moment one
     * is picked, leaving no way back without clearing the filter first.
     *
     * CHAPTER 30 — this is a request now rather than a module-level array, so
     * it is state filled by an effect instead of a useMemo. The starting value
     * is `EMPTY_CATALOGUE`, a module constant rather than a fresh `[]`: a new
     * array identity on every render would invalidate every memo below it.
     *
     * An empty catalogue renders correctly everywhere it is used — the facet
     * lists are simply empty for the moment before it lands.
     */
    const [catalogue, setCatalogue] = useState<SearchProduct[]>(EMPTY_CATALOGUE);

    const priceBounds = useMemo(() => priceBoundsOf(catalogue), [catalogue]);

    const [query, setQuery] = useState(initial.query ?? "");
    const [sort, setSort] = useState<SortOption>("relevance");

    /*
     * CHAPTER 30 — seeded from DEFAULT_FILTER, not from `priceBounds`.
     *
     * This used to read `price: priceBounds`, which was correct while the
     * catalogue was a module-level array available on the first render. Now it
     * is a request, so on the first render the catalogue is empty and
     * `priceBoundsOf([])` returns `{ min: 0, max: 0 }` — which is not a
     * placeholder, it is a price filter that excludes every product.
     *
     * Measured, not theorised: /search?q=garmin rendered "No products found …
     * ₹0 – ₹0" against a backend that returned two Garmins for the same query.
     * The widening below could not rescue it either, because its guard compares
     * against `DEFAULT_FILTER.price` and the seed was `{0,0}`, so the two never
     * matched and the range stayed collapsed forever.
     *
     * DEFAULT_FILTER's static bounds are a real, wide range, so the first
     * request is unfiltered on price and the effect below narrows it to the
     * catalogue's true range the moment that is known.
     */
    const [filter, setFilterState] = useState<SearchFilter>(() => ({
        ...DEFAULT_FILTER,
        // An unknown category is left at "All" rather than applied blindly:
        // filtering on a value no product carries would render an empty page
        // with no way to tell a bad link from a genuinely empty result.
        category: initial.category ?? DEFAULT_FILTER.category,
    }));

    const [results, setResults] = useState<SearchProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * Loads the facet catalogue. Declared here, below the state it writes to,
     * rather than beside `setCatalogue` above — `setFilterState` is used in the
     * callback and reading it earlier is a temporal dead zone that
     * `react-hooks` correctly rejects.
     */
    useEffect(() => {
        let cancelled = false;

        void getCatalogue()
            .then((items) => {
                if (cancelled) return;

                setCatalogue(items);

                /*
                 * The price filter is seeded from the catalogue's bounds, which
                 * are not known until this resolves. Widening it happens HERE,
                 * in the promise callback, rather than in a second effect
                 * watching `priceBounds`: a synchronous setState in an effect
                 * body is a cascading render, and `react-hooks/set-state-in-effect`
                 * rejects it. This is the shape that rule asks for — an external
                 * system answering, and state updated in its callback.
                 *
                 * Guarded on the untouched default so it can only ever widen a
                 * range the user has not adjusted. Once they move the slider the
                 * guard stops matching and this never fires again.
                 */
                const bounds = priceBoundsOf(items);
                setFilterState((current) =>
                    current.price.min === DEFAULT_FILTER.price.min
                        && current.price.max === DEFAULT_FILTER.price.max
                        ? { ...current, price: bounds }
                        : current,
                );
            })
            .catch(() => {
                // `getCatalogue` already resolves to [] on failure. This is the
                // same belt-and-braces Chapter 29 added everywhere else, so a
                // rejection can never surface as an unhandled promise.
                if (!cancelled) setCatalogue(EMPTY_CATALOGUE);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

    useEffect(() => {
        // Guards against an earlier, slower request overwriting a newer result.
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await searchProducts(debouncedQuery, sort, filter);
                if (!cancelled) setResults(data);
            } catch {
                if (!cancelled) setError("Something went wrong while searching.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [debouncedQuery, sort, filter]);

    const categories = useMemo(
        () => facetCounts(catalogue, "category"),
        [catalogue],
    );

    const brands = useMemo(() => facetCounts(catalogue, "brand"), [catalogue]);

    const setFilter = useCallback((patch: Partial<SearchFilter>) => {
        setFilterState((current) => ({ ...current, ...patch }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilterState({
            ...DEFAULT_FILTER,
            price: { min: priceBounds.min, max: priceBounds.max },
        });
    }, [priceBounds.min, priceBounds.max]);

    const resetSearch = useCallback(() => {
        setQuery("");
        setSort("relevance");
        resetFilters();
    }, [resetFilters]);

    const activeFilterCount = countActiveFilters(filter, priceBounds);

    const status: SearchStatus = loading
        ? "loading"
        : error
            ? "error"
            : results.length > 0
                ? "results"
                : debouncedQuery.trim() || activeFilterCount > 0
                    ? "empty"
                    : "idle";

    return {
        query,
        setQuery,
        activeQuery: debouncedQuery,
        sort,
        setSort,
        filter,
        setFilter,
        resetFilters,
        activeFilterCount,
        resetSearch,
        results,
        status,
        error,
        categories,
        brands,
        priceBounds,
    };
}
