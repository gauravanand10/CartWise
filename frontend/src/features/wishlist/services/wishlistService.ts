import { WISHLIST_LATENCY_MS, WISHLIST_SUGGESTIONS } from "../constants";
import {
    getPopularProducts,
    getProductBySlug,
} from "../../product/services/productService";
import type { ProductCardModel } from "../../product/types/product";

/**
 * The single boundary between the Wishlist UI and its data source.
 *
 * Reads through the Product Details service rather than owning a catalogue of
 * its own, so a saved product shows the same price and rating its product page
 * shows. When the backend arrives this becomes
 * `GET /wishlist` + `POST/DELETE /wishlist/:slug`, and nothing above this file
 * changes — the UI already talks in slugs and awaits a promise.
 */

/**
 * Resolves saved slugs into card models, preserving wishlist order.
 *
 * Slugs that no longer resolve are reported rather than thrown: a delisted
 * product left in localStorage should not turn the whole page into an error the
 * user has no way to clear.
 */
export async function getWishlistProducts(
    slugs: string[],
): Promise<{ products: ProductCardModel[]; missing: string[] }> {
    if (slugs.length === 0) return { products: [], missing: [] };

    await new Promise((resolve) => setTimeout(resolve, WISHLIST_LATENCY_MS));

    const loaded = await Promise.all(
        slugs.map(async (slug) => ({
            slug,
            product: await getProductBySlug(slug),
        })),
    );

    const products: ProductCardModel[] = [];
    const missing: string[] = [];

    for (const { slug, product } of loaded) {
        if (!product) {
            missing.push(slug);
            continue;
        }

        // Projected down to the card model here rather than passing the full
        // detail object around: the grid only needs what a card renders.
        products.push({
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            category: product.category,
            price: product.price,
            originalPrice: product.originalPrice,
            rating: product.rating,
            reviews: product.reviewCount,
            inStock: product.inStock,
            image: product.images[0]?.src ?? "",
        });
    }

    return { products, missing };
}

/** Products to offer when the wishlist is empty. */
export async function getWishlistSuggestions(
    excludeSlugs: string[] = [],
    limit = WISHLIST_SUGGESTIONS,
): Promise<ProductCardModel[]> {
    const exclude = new Set(excludeSlugs);

    // Async as of Chapter 26.5 — see the note in compareService.getSuggestions.
    return (await getPopularProducts(100))
        .filter((product) => !exclude.has(product.slug))
        .slice(0, limit);
}
