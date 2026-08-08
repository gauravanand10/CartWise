import { STORES } from "../constants";
import type { ProductBase, StoreOffer } from "../types/product";

/**
 * Store offers for one product.
 *
 * Prices are derived from the catalogue price via each store's fixed offset,
 * then rotated so the product's own `lowestAt` retailer really is the cheapest.
 * Deterministic on purpose: the "lowest price" badge, the store list and the
 * pricing card all read the same numbers, so they cannot disagree, and the page
 * shows the same spread on every render.
 *
 * Hand-writing 5 × 23 offer rows would be the same information with 115 chances
 * to typo a price that contradicts the badge above it.
 */
export function buildStoreOffers(base: ProductBase): StoreOffer[] {
    const offers = STORES.map<StoreOffer>((store) => ({
        id: store.id,
        name: store.name,
        // Expected to 404 until real brand assets land — always via SafeImage,
        // which falls back to the monogram tile.
        logo: `/assets/stores/${store.id}.svg`,
        monogram: store.monogram,
        gradient: store.gradient,
        // Offset stores round to the nearest ₹10 so their prices read like real
        // listings. The 1.0-offset store keeps the catalogue price *exactly*:
        // rounding it produced a "lowest price" that was ₹1 above the headline
        // price the badge sat next to.
        price:
            store.priceOffset === 1
                ? base.price
                : Math.round((base.price * store.priceOffset) / 10) * 10,
        delivery: store.delivery,
        // A product that is out of stock overall is out of stock everywhere;
        // otherwise the slowest-delivering store is the one short on units.
        inStock: base.stockCount > 0 && store.id !== "vijay-sales",
        storeRating: store.storeRating,
    }));

    const cheapest = offers.find((offer) => offer.name === base.lowestAt);
    if (!cheapest) return offers;

    // Swap the base price onto the store the catalogue names as cheapest, and
    // give the displaced store the offset that store would have had.
    const baseOffer = offers[0];
    const swapped = cheapest.price;

    cheapest.price = baseOffer.price;
    baseOffer.price = swapped;

    return offers;
}

/** The cheapest in-stock price, falling back to the outright cheapest. */
export function lowestOffer(offers: StoreOffer[]): number {
    const available = offers.filter((offer) => offer.inStock);
    const pool = available.length > 0 ? available : offers;

    return Math.min(...pool.map((offer) => offer.price));
}
