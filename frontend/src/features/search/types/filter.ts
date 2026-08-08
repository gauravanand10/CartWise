export interface PriceRange {
    min: number;
    max: number;
}

export interface SearchFilter {
    /** "All" means unfiltered. */
    category: string;
    /** Empty array means all brands. Multi-select. */
    brands: string[];
    /** Inclusive bounds, in rupees. */
    price: PriceRange;
    /** Minimum star rating; 0 means unfiltered. */
    minRating: number;
    /** Hide out-of-stock results. */
    inStockOnly: boolean;
}
