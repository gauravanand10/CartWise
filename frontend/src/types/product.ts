/**
 * Cross-feature product contract.
 *
 * Lives outside `features/` because Search results and Product Details related
 * rails both render through the same `components/ui/ProductCard`. Putting the
 * shape inside either feature would make the shared component depend on a
 * feature, which is the wrong direction.
 */
export interface ProductCardModel {
    /** URL identity. Every card links to `/product/${slug}`. */
    slug: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    originalPrice?: number;
    rating: number;
    /** Number of ratings behind `rating`. */
    reviews: number;
    inStock: boolean;
    image: string;
    /** CartWise score out of 100, when one has been computed. */
    aiScore?: number;
}
