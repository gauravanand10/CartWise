import type { SortOption } from "./types/search";
import type { SearchFilter } from "./types/filter";

/** Widest price bracket the catalogue can produce. Derived once at module load. */
export const PRICE_BOUNDS = { min: 0, max: 250_000 } as const;

export const PRODUCTS_PER_PAGE = 9;

/** How long to wait after the last keystroke before searching. */
export const SEARCH_DEBOUNCE_MS = 300;

/** localStorage key for the recent-searches list. */
export const RECENT_SEARCHES_KEY = "cartwise:recent-searches";

export const MAX_RECENT_SEARCHES = 6;

/** Cap on live suggestions so the dropdown never runs past the viewport. */
export const MAX_SUGGESTIONS = 7;

export const SORT_OPTIONS: ReadonlyArray<{
    value: SortOption;
    label: string;
}> = [
    { value: "relevance", label: "Relevance" },
    { value: "price-low-high", label: "Price: Low to High" },
    { value: "price-high-low", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
    { value: "newest", label: "Newest First" },
];

export const RATING_OPTIONS = [4.5, 4, 3.5, 3] as const;

export const DEFAULT_FILTER: SearchFilter = {
    category: "All",
    brands: [],
    price: { min: PRICE_BOUNDS.min, max: PRICE_BOUNDS.max },
    minRating: 0,
    inStockOnly: false,
};
