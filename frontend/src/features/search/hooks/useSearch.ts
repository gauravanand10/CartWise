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

export function useSearch(initial: SearchInitialState = {}): UseSearch {
    // Facets come from the whole catalogue, not the current results: deriving
    // them from filtered data makes every other option vanish the moment one
    // is picked, leaving no way back without clearing the filter first.
    const catalogue = useMemo(() => getCatalogue(), []);
    const priceBounds = useMemo(() => priceBoundsOf(catalogue), [catalogue]);

    const [query, setQuery] = useState(initial.query ?? "");
    const [sort, setSort] = useState<SortOption>("relevance");

    // Seeded from the real catalogue bounds so the price slider and the
    // "is this filter active?" check agree from the very first render.
    const [filter, setFilterState] = useState<SearchFilter>(() => ({
        ...DEFAULT_FILTER,
        // An unknown category is left at "All" rather than applied blindly:
        // filtering on a value no product carries would render an empty page
        // with no way to tell a bad link from a genuinely empty result.
        category: initial.category ?? DEFAULT_FILTER.category,
        price: priceBounds,
    }));

    const [results, setResults] = useState<SearchProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
