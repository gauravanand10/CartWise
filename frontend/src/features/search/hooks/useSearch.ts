import { useEffect, useMemo, useState } from "react";

import useDebounce from "./useDebounce";
import { searchProducts } from "../services/searchService";
import { products } from "../data/products";

import type {
    SearchProduct,
    SortOption,
} from "../types/search";

import {
    DEFAULT_FILTER,
    type SearchFilter,
} from "../types/filter";

export function useSearch() {
    const [query, setQuery] = useState("");

    const debouncedQuery = useDebounce(query, 500);

    const [sort, setSort] =
        useState<SortOption>("relevance");

    const [filter, setFilter] =
        useState<SearchFilter>(DEFAULT_FILTER);

    const [results, setResults] =
        useState<SearchProduct[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                setError("");

                const data = await searchProducts(
                    debouncedQuery,
                    sort,
                    filter
                );

                setResults(data);
            } catch {
                setError(
                    "Unable to load products."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [
        debouncedQuery,
        sort,
        filter,
    ]);

    // Derived from the full catalogue, not from `results`. Deriving it from the
    // filtered results made every other category disappear as soon as one was
    // selected, leaving no way to switch categories without clearing the filter
    // first. The list of available categories is a property of the catalogue,
    // not of the current result set.
    const categories = useMemo(() => {
        const unique = new Set<string>();

        products.forEach((product) => {
            unique.add(product.category);
        });

        return [
            "All",
            ...Array.from(unique).sort(),
        ];
    }, []);

    return {
        query,
        setQuery,

        sort,
        setSort,

        filter,
        setFilter,

        results,

        categories,

        loading,

        error,
    };
}
