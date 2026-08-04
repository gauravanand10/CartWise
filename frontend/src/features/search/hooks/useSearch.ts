import { useEffect, useMemo, useState } from "react";

import useDebounce from "./useDebounce";
import { searchProducts } from "../services/searchService";

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

    const categories = useMemo(() => {
        const unique = new Set<string>();

        results.forEach((product) => {
            unique.add(product.category);
        });

        return [
            "All",
            ...Array.from(unique).sort(),
        ];
    }, [results]);

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
