import type { WishlistSort } from "../types/wishlist";
import type { ProductCardModel } from "../../product/types/product";

/**
 * Orders saved products.
 *
 * "Recently added" is the identity sort — the provider already stores newest
 * first, so recency needs no timestamps and no work here.
 *
 * Always copies before sorting: `Array.prototype.sort` mutates, and the input
 * is the memoised array held by the loader hook.
 */
export function sortWishlist(
    products: ProductCardModel[],
    sort: WishlistSort,
): ProductCardModel[] {
    if (sort === "recent") return products;

    const sorted = [...products];

    switch (sort) {
        case "price-low-high":
            return sorted.sort((a, b) => a.price - b.price);
        case "price-high-low":
            return sorted.sort((a, b) => b.price - a.price);
        case "rating":
            return sorted.sort(
                (a, b) => b.rating - a.rating || b.reviews - a.reviews,
            );
        default:
            return sorted;
    }
}
