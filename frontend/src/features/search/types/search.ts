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
    /*
     * Chapter 30 removed `addedAt`. The database records no creation date
     * for a product; the mock file's values were invented, and the
     * "Newest First" sort that read them went with it. Chapter 26.5
     * removed "New arrivals" from the footer for exactly this reason.
     */
    inStock: boolean;
    image: string;
}

export type SortOption =
    | "relevance"
    | "price-low-high"
    | "price-high-low"
    | "rating";

/** What the results panel should render right now. */
export type SearchStatus =
    | "idle"
    | "loading"
    | "error"
    | "empty"
    | "results";
