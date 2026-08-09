import { COMPARE_LATENCY_MS } from "../constants";
import {
    getPopularProducts,
    getProductBySlug,
} from "../../product/services/productService";
import type { ProductCardModel, ProductDetail } from "../../product/types/product";

/**
 * The single boundary between the Compare UI and its data source.
 *
 * Reads through the Product Details service rather than owning a second
 * catalogue: a comparison has to show the same prices and specifications the
 * product page shows, and two catalogues would eventually disagree. When a real
 * API arrives, this becomes one batch request and nothing above it changes.
 */

/**
 * Loads every selected product, in selection order.
 *
 * Slugs that no longer resolve are dropped rather than failing the whole
 * comparison — a stale slug in localStorage (a delisted product, an old shared
 * link) should not leave the user with an error page they cannot clear.
 */
export async function getComparisonProducts(
    slugs: string[],
): Promise<{ products: ProductDetail[]; missing: string[] }> {
    if (slugs.length === 0) return { products: [], missing: [] };

    await new Promise((resolve) => setTimeout(resolve, COMPARE_LATENCY_MS));

    const loaded = await Promise.all(
        slugs.map(async (slug) => ({
            slug,
            product: await getProductBySlug(slug),
        })),
    );

    return {
        products: loaded
            .map((entry) => entry.product)
            .filter((product): product is ProductDetail => product !== null),
        missing: loaded
            .filter((entry) => entry.product === null)
            .map((entry) => entry.slug),
    };
}

/**
 * Products the user could add next.
 *
 * Same-category candidates first — comparing a television against a mouse is
 * technically possible but never what someone wants — then popular products to
 * fill the list out.
 */
export function getSuggestions(
    selected: ProductDetail[],
    excludeSlugs: string[],
    limit = 8,
): ProductCardModel[] {
    const exclude = new Set(excludeSlugs);
    const categories = new Set(selected.map((product) => product.category));

    const pool = getPopularProducts(100).filter(
        (candidate) => !exclude.has(candidate.slug),
    );

    if (categories.size === 0) return pool.slice(0, limit);

    const sameCategory = pool.filter((candidate) =>
        categories.has(candidate.category as ProductDetail["category"]),
    );
    const rest = pool.filter(
        (candidate) =>
            !categories.has(candidate.category as ProductDetail["category"]),
    );

    return [...sameCategory, ...rest].slice(0, limit);
}
