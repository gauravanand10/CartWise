export interface ProductSpecification {
    title: string;
    value: string;
}

export interface ProductReview {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Product {

    id: number;

    name: string;

    brand: string;

    category: string;

    price: number;

    originalPrice?: number;

    rating: number;

    reviewCount: number;

    stock: number;

    sku: string;

    description: string;

    images: string[];

    specifications: ProductSpecification[];

    features: string[];

    reviews: ProductReview[];

    relatedProducts: number[];

}
