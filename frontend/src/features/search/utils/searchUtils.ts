import type { SearchProduct, SortOption } from "../types/search";
import type { SearchFilter } from "../types/filter";
import { MAX_SUGGESTIONS } from "../constants";

/**
 * Re-exported from the shared formatter rather than owning a second
 * `Intl.NumberFormat`: Search, Product Details and Compare all print the same
 * prices, and every call site here already imports it from this module.
 */
export { formatPrice } from "../../../lib/currency";

export function normalise(value: string): string {
    return value.trim().toLowerCase();
}

/**
 * Free-text match across the fields a shopper would actually type.
 *
 * Every whitespace-separated term must appear somewhere in the product, so
 * "sony head" narrows to the Sony headphones rather than returning everything
 * matching either word.
 */
export function matchesQuery(
    product: SearchProduct,
    query: string,
): boolean {
    const terms = normalise(query).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;

    const haystack = normalise(
        `${product.title} ${product.brand} ${product.category}`,
    );

    return terms.every((term) => haystack.includes(term));
}

/**
 * Relevance score, highest wins.
 *
 * Ranks an exact title prefix above a title hit, above a brand/category hit,
 * so typing "sony" surfaces Sony products before a product merely mentioning it.
 * Rating is a tie-breaker only.
 */
function relevanceScore(product: SearchProduct, query: string): number {
    const q = normalise(query);
    if (!q) return product.rating;

    const title = normalise(product.title);
    const brand = normalise(product.brand);

    let score = 0;
    if (title === q) score += 100;
    else if (title.startsWith(q)) score += 60;
    else if (title.includes(q)) score += 40;

    if (brand === q) score += 30;
    else if (brand.includes(q)) score += 15;

    if (normalise(product.category).includes(q)) score += 10;

    return score + product.rating;
}

export function applyFilters(
    items: SearchProduct[],
    filter: SearchFilter,
): SearchProduct[] {
    return items.filter((product) => {
        if (filter.category !== "All" && product.category !== filter.category) {
            return false;
        }
        if (filter.brands.length > 0 && !filter.brands.includes(product.brand)) {
            return false;
        }
        if (product.price < filter.price.min || product.price > filter.price.max) {
            return false;
        }
        if (filter.minRating > 0 && product.rating < filter.minRating) {
            return false;
        }
        if (filter.inStockOnly && !product.inStock) {
            return false;
        }
        return true;
    });
}

export function sortProducts(
    items: SearchProduct[],
    sort: SortOption,
    query: string,
): SearchProduct[] {
    // Copy first: Array.prototype.sort mutates, and `items` may be the
    // caller's memoised array.
    const sorted = [...items];

    switch (sort) {
        case "price-low-high":
            return sorted.sort((a, b) => a.price - b.price);
        case "price-high-low":
            return sorted.sort((a, b) => b.price - a.price);
        case "rating":
            return sorted.sort(
                (a, b) => b.rating - a.rating || b.reviews - a.reviews,
            );
        case "newest":
            return sorted.sort(
                (a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt),
            );
        case "relevance":
        default:
            return sorted.sort(
                (a, b) => relevanceScore(b, query) - relevanceScore(a, query),
            );
    }
}

export interface Suggestion {
    /** The text inserted into the input when chosen. */
    value: string;
    kind: "product" | "brand" | "category";
}

/**
 * Live suggestions for the dropdown.
 *
 * Product titles first (most specific), then brands and categories, so the
 * list reads from precise to broad. De-duplicated and capped.
 */
export function buildSuggestions(
    items: SearchProduct[],
    query: string,
): Suggestion[] {
    const q = normalise(query);
    if (!q) return [];

    const seen = new Set<string>();
    const out: Suggestion[] = [];

    const push = (value: string, kind: Suggestion["kind"]) => {
        const key = normalise(value);
        if (seen.has(key) || out.length >= MAX_SUGGESTIONS) return;
        seen.add(key);
        out.push({ value, kind });
    };

    for (const p of items) {
        if (normalise(p.title).includes(q)) push(p.title, "product");
    }
    for (const p of items) {
        if (normalise(p.brand).includes(q)) push(p.brand, "brand");
    }
    for (const p of items) {
        if (normalise(p.category).includes(q)) push(p.category, "category");
    }

    return out;
}

/**
 * Cheapest and dearest price in a set, rounded outwards to clean 1,000 steps
 * so the slider lands on tidy numbers.
 */
export function priceBoundsOf(items: SearchProduct[]): {
    min: number;
    max: number;
} {
    if (items.length === 0) return { min: 0, max: 0 };

    const prices = items.map((p) => p.price);

    return {
        min: Math.floor(Math.min(...prices) / 1000) * 1000,
        max: Math.ceil(Math.max(...prices) / 1000) * 1000,
    };
}

/** Distinct values for a facet, sorted, with a result count for each. */
export function facetCounts(
    items: SearchProduct[],
    key: "category" | "brand",
): Array<{ value: string; count: number }> {
    const counts = new Map<string, number>();

    for (const product of items) {
        counts.set(product[key], (counts.get(product[key]) ?? 0) + 1);
    }

    return [...counts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => a.value.localeCompare(b.value));
}

/** How many filter groups are currently narrowing the results. */
export function countActiveFilters(
    filter: SearchFilter,
    bounds: { min: number; max: number },
): number {
    let n = 0;
    if (filter.category !== "All") n += 1;
    if (filter.brands.length > 0) n += 1;
    if (filter.price.min > bounds.min || filter.price.max < bounds.max) n += 1;
    if (filter.minRating > 0) n += 1;
    if (filter.inStockOnly) n += 1;
    return n;
}
