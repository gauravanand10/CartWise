export interface SearchProduct {
    id: number;
    title: string;
    brand: string;
    category: string;
    price: number;
    rating: number;
    image: string;
}

export type SortOption =
    | "relevance"
    | "price-low-high"
    | "price-high-low"
    | "rating"
    | "name";
