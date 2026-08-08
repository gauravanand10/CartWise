import { FEATURED_REVIEWS, PRODUCT_LATENCY_MS, RELATED_LIMIT } from "../constants";
import { catalogue, catalogueBySlug } from "../data/catalogue";
import { buildEditorial } from "../data/editorial";
import { buildStoreOffers, lowestOffer } from "../data/offers";
import { buildRatingBuckets, buildReviews } from "../data/reviews";
import { buildSpecGroups } from "../data/specs";
import { buildGallery, cardImage } from "../utils/media";
import type {
    ProductBase,
    ProductCardModel,
    ProductDetail,
    RelatedProducts,
} from "../types/product";

/**
 * The single boundary between the Product Details UI and its data source.
 *
 * Everything above this module is already async and slug-shaped, so replacing
 * the mock catalogue with a real endpoint later is a change to this file alone.
 */

const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

/** Assembles a base record into the full detail model. */
function assemble(base: ProductBase): ProductDetail {
    const editorial = buildEditorial(base);
    const stores = buildStoreOffers(base);

    return {
        ...base,
        inStock: base.stockCount > 0,
        images: buildGallery(base),
        overview: editorial.overview,
        highlights: editorial.highlights,
        features: editorial.features,
        boxContents: editorial.boxContents,
        specGroups: buildSpecGroups(base),
        stores,
        lowestPrice: lowestOffer(stores),
        ai: {
            ...editorial.ai,
            score: base.aiScore,
            // Confidence tracks the size of the review base: a verdict drawn
            // from 20,000 reviews deserves more confidence than one from 2,000.
            confidence: Math.min(
                98,
                80 + Math.round(Math.log10(Math.max(10, base.reviewCount)) * 4),
            ),
        },
        reviews: buildReviews(base, FEATURED_REVIEWS),
        ratingBuckets: buildRatingBuckets(base),
    };
}

/** The card-sized projection of a base record. */
function toCard(base: ProductBase): ProductCardModel {
    return {
        slug: base.slug,
        name: base.name,
        brand: base.brand,
        category: base.category,
        price: base.price,
        originalPrice: base.originalPrice,
        rating: base.rating,
        reviews: base.reviewCount,
        inStock: base.stockCount > 0,
        image: cardImage(base),
        aiScore: base.aiScore,
    };
}

/**
 * Looks a product up by its URL slug.
 *
 * Resolves to `null` rather than throwing when the slug is unknown: an unknown
 * slug is a routing outcome the page renders as "not found", not an error
 * condition that needs a retry button.
 */
export async function getProductBySlug(
    slug: string,
): Promise<ProductDetail | null> {
    await delay(PRODUCT_LATENCY_MS);

    const base = catalogueBySlug.get(slug);

    return base ? assemble(base) : null;
}

/**
 * The three related rails.
 *
 * - Similar: same category, closest in price — the direct alternatives.
 * - Frequently compared: same category, different brand — what a shopper
 *   actually cross-shops.
 * - Recommended: other categories, highest AI score — genuine accessories and
 *   companions rather than more of the same thing.
 */
export async function getRelatedProducts(
    product: ProductDetail,
): Promise<RelatedProducts> {
    await delay(PRODUCT_LATENCY_MS / 2);

    const others = catalogue.filter((item) => item.slug !== product.slug);
    const sameCategory = others.filter(
        (item) => item.category === product.category,
    );

    const similar = [...sameCategory]
        .sort(
            (a, b) =>
                Math.abs(a.price - product.price) -
                Math.abs(b.price - product.price),
        )
        .slice(0, RELATED_LIMIT);

    const compared = sameCategory
        .filter((item) => item.brand !== product.brand)
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, RELATED_LIMIT);

    const recommended = others
        .filter((item) => item.category !== product.category)
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, RELATED_LIMIT);

    return {
        similar: similar.map(toCard),
        compared: compared.map(toCard),
        recommended: recommended.map(toCard),
    };
}

/** Every slug in the catalogue. Used by tests and link checks. */
export function getAllSlugs(): string[] {
    return catalogue.map((product) => product.slug);
}

/**
 * Highest-scoring products, for the not-found recovery screen.
 *
 * Synchronous: the "product not found" page has already finished loading by
 * the time it renders, and a second spinner inside an error state would be
 * worse than showing the list immediately.
 */
export function getPopularProducts(limit = RELATED_LIMIT): ProductCardModel[] {
    return [...catalogue]
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, limit)
        .map(toCard);
}
