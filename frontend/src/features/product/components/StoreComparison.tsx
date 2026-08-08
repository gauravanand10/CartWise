import { Store } from "lucide-react";

import ProductSection from "./ProductSection";
import StoreOfferCard from "./StoreOfferCard";
import { formatPrice } from "../../../lib/currency";
import type { StoreOffer } from "../types/product";

interface StoreComparisonProps {
    stores: StoreOffer[];
    productName: string;
}

/**
 * Live prices across every retailer CartWise tracks.
 *
 * Sorted cheapest first: comparison is the product's whole reason to exist, and
 * making the reader scan an arbitrary order for the best number would waste it.
 * Out-of-stock offers sink to the bottom regardless of price, because an
 * unbuyable price is not the best price.
 */
export default function StoreComparison({
    stores,
    productName,
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
            description={`Prices from ${stores.length} retailers, updated daily.`}
            action={
                spread > 0 && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Save up to {formatPrice(spread)}
                    </span>
                )
            }
        >
            <ul className="space-y-3">
                {ordered.map((offer) => (
                    <StoreOfferCard
                        key={offer.id}
                        offer={offer}
                        best={offer.id === best?.id}
                        productName={productName}
                    />
                ))}
            </ul>
        </ProductSection>
    );
}
