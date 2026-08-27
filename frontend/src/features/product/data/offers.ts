import { STORES } from "../constants";
import type { AffiliateRetailer } from "../../../services/api";
import type { ProductBase, StoreOffer } from "../types/product";

/**
 * The store comparison table.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 26.5 — THE RETAILERS ARE REAL NOW. THE PRICES STILL ARE NOT.
 *
 * That sentence is the whole design of this file, and both halves matter.
 *
 * WHAT CHANGED. The store list was `STORES`, a hard-coded array in
 * `constants.ts`. It is now driven by `GET /api/affiliate/retailers` — the same
 * endpoint the disclosure page reads and the same ids `POST /api/affiliate/
 * clicks` accepts. That closes a real gap rather than tidying one: the two
 * lists could disagree, and if they had, this table would have rendered a
 * "Visit store" button for a retailer the click endpoint answers 404 for. The
 * displayed retailers and the linkable retailers are now one list by
 * construction.
 *
 * WHAT DID NOT CHANGE, AND WILL NOT UNTIL SOMEONE PAYS FOR A PRICING FEED. The
 * per-store PRICES are still this product's catalogue price nudged by a fixed
 * per-store offset. No free live pricing API exists that CartWise could call —
 * researched in Chapter 24, re-confirmed in Chapter 26, re-confirmed again
 * here. The offsets are deterministic so that the cheapest row, the "Best
 * price" badge and the headline figure agree with each other on every render;
 * they are not observations of anything.
 *
 * Everything that renders these says so. `StoreComparison`'s description reads
 * "Reference prices for N retailers — illustrative, not live quotes", and
 * `PricingCard` says "Lowest reference price of N stores". Chapter 26.5 fixed
 * that copy where it used to claim prices were "updated daily".
 *
 * WHAT WAS DELETED. `lowestAt` — an authored field naming the retailer with the
 * best price — used to be honoured here by swapping two rows so the named store
 * came out cheapest. It was a fabricated fact bending fabricated prices, so it
 * went with the rest of the invented catalogue fields. The cheapest row is now
 * simply whichever offset is smallest, which is at least internally true.
 *
 * `stockCount` went the same way. Per-store availability was
 * `base.stockCount > 0 && store.id !== "vijay-sales"` — a hard-coded pretence
 * that one named retailer was out of stock of everything. Availability now
 * mirrors the product's real `inStock` flag for every store, because that is
 * the only availability fact CartWise actually has.
 * ---------------------------------------------------------------------------
 */

/**
 * Presentation defaults for a retailer the constants file has no entry for.
 *
 * Chapter 28 removed `storeRating: 4` from here along with the field itself.
 * This one was the clearest illustration of the problem: it was the rating an
 * *unknown* retailer got — a store CartWise had never heard of before the API
 * named it, handed a 4.0 out of 5 on arrival.
 */
const FALLBACK_PRESENTATION = {
    monogram: "??",
    gradient: "",
    priceOffset: 1.03,
};

/**
 * Two-letter monogram for a retailer with no configured one.
 *
 * "Reliance Digital" -> "RD", "Croma" -> "CR". Initials when there are two
 * words, first two letters when there is one.
 */
function monogramFor(name: string): string {
    const words = name.trim().split(/\s+/);

    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
}

/**
 * Builds one offer row per retailer the API reports.
 *
 * Presentation details — the monogram, and the price offset — still come
 * from `STORES` where the id matches, because the API deliberately carries none
 * of them: `AffiliateRetailer` is `{ id, name, status }` and nothing more, which
 * is what keeps the affiliate credential out of the browser. A retailer the API
 * knows and `constants.ts` does not still renders, with a derived monogram
 * rather than being silently dropped from the comparison.
 */
export function buildStoreOffers(
    base: ProductBase,
    retailers: AffiliateRetailer[],
): StoreOffer[] {
    return retailers.map<StoreOffer>((retailer) => {
        const known = STORES.find((store) => store.id === retailer.id);

        const presentation = known ?? {
            ...FALLBACK_PRESENTATION,
            monogram: monogramFor(retailer.name),
        };

        return {
            id: retailer.id,
            name: retailer.name,
            logo: `/assets/stores/${retailer.id}.svg`,
            monogram: presentation.monogram,
            gradient: presentation.gradient,
            price:
                presentation.priceOffset === 1
                    ? base.price
                    : Math.round((base.price * presentation.priceOffset) / 10) * 10,
            // The product's own availability, for every store. See the header:
            // CartWise has no per-retailer stock feed and will not pretend to.
            inStock: base.inStock,
        };
    });
}

/** The cheapest in-stock price, falling back to the outright cheapest. */
export function lowestOffer(offers: StoreOffer[]): number {
    if (offers.length === 0) return 0;

    const available = offers.filter((offer) => offer.inStock);
    const pool = available.length > 0 ? available : offers;

    return Math.min(...pool.map((offer) => offer.price));
}
