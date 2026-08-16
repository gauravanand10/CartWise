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

    /**
     * Credit line for `image`, when the image is a real licensed photograph.
     *
     * Chapter 24. Product photographs now come from Openverse, which indexes
     * Creative Commons works — and the CC licences behind almost all of them
     * grant use *on condition* of attribution. This field travels on the same
     * model as the URL it belongs to, deliberately: any surface that can render
     * `image` can reach `imageAttribution`, so there is no place in the app
     * where showing the picture without the credit is the path of least
     * resistance.
     *
     * Undefined when `image` is the seeded placeholder rather than a
     * photograph — nothing to credit, because nobody's work is being used.
     */
    imageAttribution?: string;
    /** Licence deed URL the attribution links to. */
    imageLicenseUrl?: string;
    /** The provider's page for the original work — not the image bytes. */
    imageSourceUrl?: string;
}
