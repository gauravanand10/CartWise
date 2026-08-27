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
 *
 * ===========================================================================
 * CHAPTER 29 — MEASURED. THIS IS STILL MOCK DATA, AND HERE IS EXACTLY WHAT
 * THAT COSTS.
 *
 * `data/products.ts` holds **20 products**. The database holds **100**. So:
 *
 *     mock slugs not present in the real catalogue :  0
 *     mock entries whose price or rating disagrees :  0
 *     real products INVISIBLE to this page         : 80  (80%)
 *
 * The distinction matters, because this is NOT the Chapter 26.5
 * `catalogue.ts` failure repeating. That one silently DIVERGED — hand-written
 * values drifting from the database, and a lookup miss that deleted real
 * wishlist rows. Every value in this file currently agrees with the database.
 *
 * What is wrong here is COVERAGE, not accuracy. Searching this page for
 * "Garmin Fenix 8", "Acer Swift Go 14", "Apple Watch Ultra 3" or any of 77
 * other real products returns nothing at all — while /browse finds every one
 * of them, because /browse reads the API. Two routes over one catalogue
 * disagree about whether a product exists.
 *
 * WHY IT IS NOT FIXED IN THIS CHAPTER, stated plainly rather than deferred by
 * silence: **the backend has no text-search capability to migrate to.**
 * `GET /api/products` accepts category, brand, minPrice, maxPrice, inStock,
 * sort, page and size — verified against ProductController — and nothing that
 * matches a free-text query against a product name. Pointing this service at
 * the API would mean either fetching all 100 products and filtering them in
 * the browser (the architecture Chapter 20 explicitly rejected for /browse),
 * or adding a query parameter to the API. The second is a new endpoint
 * capability, which this chapter's brief puts out of scope.
 *
 * So it is one item, named in the chapter report, needing a backend change
 * first. What WAS fixed here is the false claim on the page above it: the hero
 * said "Compared across 9 stores" when CartWise compares five, and
 * `SearchStats` labelled the mock subset "Products" as though it were the
 * catalogue.
 * ===========================================================================
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
