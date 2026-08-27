import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PricingCard from "./PricingCard";
import type { ProductDetail, StoreOffer } from "../types/product";

/**
 * The pricing card, and the crash it used to contain.
 *
 * ===========================================================================
 * WHY THE EMPTY-STORES TEST IS THE IMPORTANT ONE
 *
 * Until Chapter 29 this component opened with:
 *
 *     product.stores.reduce((best, s) => (s.price < best.price ? s : best))
 *
 * — a `reduce` with no seed, which throws on an empty array. `product.stores`
 * comes from `buildStoreOffers`, which maps whatever `GET /api/affiliate/
 * retailers` returns, and that endpoint returns `[]` for any deployment that
 * has not configured `cartwise.affiliate.retailers`. So a perfectly ordinary
 * environment produced a product page that threw during render — and with no
 * error boundary anywhere in the app, that unmounted the whole tree and left a
 * blank white page.
 *
 * The first test below fails against the old code with "Reduce of empty array
 * with no initial value".
 * ===========================================================================
 */

function offer(overrides: Partial<StoreOffer> = {}): StoreOffer {
    return {
        id: "amazon",
        name: "Amazon",
        logo: "",
        monogram: "AZ",
        gradient: "",
        price: 10000,
        inStock: true,
        ...overrides,
    };
}

function product(overrides: Partial<ProductDetail> = {}): ProductDetail {
    return {
        slug: "test",
        name: "Test",
        price: 10000,
        originalPrice: 12000,
        lowestPrice: 10000,
        stores: [offer()],
        ...overrides,
    } as unknown as ProductDetail;
}

describe("PricingCard", () => {

    it("renders without throwing when the product has no store offers", () => {
        expect(() =>
            render(<PricingCard product={product({ stores: [], lowestPrice: 0 })} />),
        ).not.toThrow();

        // The price is still the point of the card, and it still shows.
        expect(screen.getByText("₹10,000")).toBeInTheDocument();
    });

    /**
     * The badge names a retailer. With no offers there is no retailer to name,
     * and inventing one is exactly what this project spent four chapters
     * removing — so the badge is absent rather than filled with a placeholder.
     */
    it("omits the lowest-price badge entirely when there are no offers", () => {
        render(<PricingCard product={product({ stores: [], lowestPrice: 0 })} />);

        expect(screen.queryByText(/Lowest reference price/)).not.toBeInTheDocument();
    });

    it("names the cheapest retailer when offers exist", () => {
        render(
            <PricingCard
                product={product({
                    price: 10000,
                    lowestPrice: 10000,
                    stores: [
                        offer({ id: "croma", name: "Croma", price: 11000 }),
                        offer({ id: "amazon", name: "Amazon", price: 10000 }),
                    ],
                })}
            />,
        );

        expect(screen.getByText(/Lowest reference price of 2 stores/)).toBeInTheDocument();
        expect(screen.getByText(/Amazon/)).toBeInTheDocument();
    });

    it("shows both prices and no discount chip", () => {
        render(<PricingCard product={product()} />);

        expect(screen.getByText("₹10,000")).toBeInTheDocument();
        expect(screen.getByText("₹12,000")).toBeInTheDocument();
        // Chapter 28 removed the "N% off" pill; this is the standing guard.
        expect(screen.queryByText(/% off/i)).not.toBeInTheDocument();
    });

    it("keeps the retailer-terms line Chapter 26.5 put here", () => {
        render(<PricingCard product={product()} />);

        expect(
            screen.getByText(/Delivery, payment and financing terms are set by the retailer/),
        ).toBeInTheDocument();
    });
});
