import { Store } from "lucide-react";

import ProductSection from "./ProductSection";
import StoreOfferCard from "./StoreOfferCard";
import AffiliateNotice from "../../../components/common/AffiliateNotice";
import { formatPrice } from "../../../lib/currency";
import type { StoreOffer } from "../types/product";

interface StoreComparisonProps {
    stores: StoreOffer[];
    productName: string;
    /** The product's URL identity, passed down so each offer can build its click URL. */
    productSlug: string;
}

/**
 * Reference prices across every retailer CartWise lists.
 *
 * NOT live prices, and the wording here is load-bearing rather than cautious.
 * Every figure in this section is derived from the catalogue's stored reference
 * price by a fixed per-store offset (see data/offers.ts) because no free live
 * pricing API exists for CartWise to call — established in Chapter 24,
 * re-confirmed in Chapter 26, and unchanged in 26.5. This component used to say
 * "updated daily", which was a claim about freshness that nothing in the system
 * could keep. It now says what is true.
 *
 * Sorted cheapest first: comparison is the product's whole reason to exist, and
 * making the reader scan an arbitrary order for the best number would waste it.
 * Out-of-stock offers sink to the bottom regardless of price, because an
 * unbuyable price is not the best price.
 *
 * Chapter 26 made the offers below monetised, and that ordering rule is now
 * load-bearing in a second way: it is what makes the disclosure's claim that
 * commission does not affect ranking true rather than merely asserted. Nothing
 * here reads a commission rate, and nothing may — sorting paid offers upward
 * would be the exact conflict of interest the disclosure exists to surface.
 */
export default function StoreComparison({
    stores,
    productName,
    productSlug,
}: StoreComparisonProps) {
    const ordered = [...stores].sort((a, b) => {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        return a.price - b.price;
    });

    const best = ordered.find((offer) => offer.inStock);
    const spread =
        Math.max(...stores.map((s) => s.price)) -
        Math.min(...stores.map((s) => s.price));

    return (
        <ProductSection
            id="stores"
            title="Compare across stores"
            icon={Store}
            description={`Reference prices for ${stores.length} retailers — illustrative, not live quotes.`}
            action={
                /*
                    Chapter 26.5 reworded this badge. It read "Save up to ₹X"
                    in savings-green — a saving the shopper was invited to act
                    on, computed from reference prices that are illustrative
                    offsets rather than observations. The figure itself is
                    honest arithmetic on the rows below it, so it stays; what
                    changed is that it now names itself as a spread across the
                    reference prices instead of promising money back, and it is
                    neutral rather than green.
                */
                spread > 0 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {formatPrice(spread)} reference spread
                    </span>
                )
            }
        >
            {/* Above the list, deliberately. See AffiliateNotice — a disclosure
                the reader only meets after the link does not meet the standard
                it exists to satisfy. */}
            <AffiliateNotice />

            <ul className="space-y-3">
                {ordered.map((offer) => (
                    <StoreOfferCard
                        key={offer.id}
                        offer={offer}
                        best={offer.id === best?.id}
                        productName={productName}
                        productSlug={productSlug}
                    />
                ))}
            </ul>
        </ProductSection>
    );
}
