import { products } from "../data/products";
import type { SearchProduct, SortOption } from "../types/search";
import type { SearchFilter } from "../types/filter";
import { applyFilters, matchesQuery, sortProducts } from "../utils/searchUtils";

/** Simulated network latency so the loading skeleton is exercised in dev. */
const MOCK_LATENCY_MS = 350;

/**
 * The single boundary between the search UI and its data source.
 *
 * Everything above this function is already async and filter-shaped, so
 * swapping the mock array for a real endpoint later is a change to this file
 * alone.
 */
export async function searchProducts(
    query: string,
    sort: SortOption,
    filter: SearchFilter,
): Promise<SearchProduct[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

    const matched = products.filter((product) => matchesQuery(product, query));

    return sortProducts(applyFilters(matched, filter), sort, query);
}

/** The unfiltered catalogue — used to build facet lists and price bounds. */
export function getCatalogue(): SearchProduct[] {
    return products;
}
