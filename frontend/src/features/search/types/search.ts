export interface SearchProduct {
    id: number;
    /**
     * URL identity, matching the Product Details catalogue.
     *
     * Stored rather than derived from `title` so renaming a result can never
     * silently break the link to its details page — TypeScript forces the slug
     * to be stated, and it is the same string the route resolves.
     */
    slug: string;
    title: string;
    brand: string;
    category: string;
    /** Current selling price in rupees (integer, no decimals). */
    price: number;
    /** Pre-discount price, when the product is discounted. */
    originalPrice?: number;
    rating: number;
    /** Number of ratings behind `rating` — needed to show credible social proof. */
    reviews: number;
    /** ISO date the product was listed. Drives the "Newest" sort. */
    addedAt: string;
    inStock: boolean;
    image: string;
}

export type SortOption =
    | "relevance"
    | "price-low-high"
    | "price-high-low"
    | "rating"
    | "newest";

/** What the results panel should render right now. */
export type SearchStatus =
    | "idle"
    | "loading"
    | "error"
    | "empty"
    | "results";
