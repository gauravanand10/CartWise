export interface Specification {
    label: string;
    left: string;
    right: string;
    winner: "left" | "right" | "draw";
}

export interface ProductScore {
    performance: number;
    camera: number;
    battery: number;
    display: number;
    value: number;
    overall: number;
}

export interface StorePrice {
    store: string;
    logo: string;
    price: number;
    delivery: string;
    availability: string;
}

export interface CompareProduct {
    id: string;

    brand: string;

    name: string;

    image: string;

    rating: number;

    reviews: number;

    price: number;

    originalPrice: number;

    score: ProductScore;

    specifications: Specification[];

    pros: string[];

    cons: string[];

    stores: StorePrice[];
}

export interface CompareResult {
    leftProduct: CompareProduct;

    rightProduct: CompareProduct;

    winner: "left" | "right" | "draw";

    confidence: number;

    summary: string;
}
