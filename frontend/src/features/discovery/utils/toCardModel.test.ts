import { describe, expect, it } from "vitest";

import { toCardModel } from "./toCardModel";
import type { ApiProduct } from "../../../services/api";

/**
 * The adapter between the API's product shape and the card model.
 *
 * Small, and worth its own file because it is the one place three deliberate naming and nullability
 * mismatches are reconciled. Each of the three has a visible failure mode if it drifts, and each is
 * asserted below rather than assumed.
 */

const apiProduct: ApiProduct = {
    id: 7,
    slug: "sony-wh-1000xm6",
    name: "Sony WH-1000XM6",
    brand: "Sony",
    category: "Headphones",
    price: 29990,
    originalPrice: 34990,
    rating: 4.8,
    reviewCount: 1234,
    inStock: true,
    imageUrl: "https://example.test/sony.png",
};

describe("toCardModel", () => {

    it("carries every field the card renders", () => {
        expect(toCardModel(apiProduct)).toEqual({
            slug: "sony-wh-1000xm6",
            name: "Sony WH-1000XM6",
            brand: "Sony",
            category: "Headphones",
            price: 29990,
            originalPrice: 34990,
            rating: 4.8,
            reviews: 1234,
            inStock: true,
            image: "https://example.test/sony.png",
        });
    });

    it("renames reviewCount to reviews", () => {
        expect(toCardModel(apiProduct).reviews).toBe(1234);
    });

    it("renames imageUrl to image", () => {
        expect(toCardModel(apiProduct).image).toBe("https://example.test/sony.png");
    });

    /**
     * The card model marks `originalPrice` optional rather than nullable. Passing `null` through
     * would render a struck-through "₹null" wherever the card tests truthiness loosely — which it
     * does, with `{product.originalPrice && ...}`.
     */
    it("turns a null original price into undefined, not null", () => {
        const result = toCardModel({ ...apiProduct, originalPrice: null });

        expect(result.originalPrice).toBeUndefined();
        expect(result.originalPrice).not.toBeNull();
    });

    /**
     * `image` is a required string on the card model and `SafeImage` already draws a placeholder for
     * anything it cannot load, so the empty string is the honest value for "no image": it fails the
     * load and gets the fallback. `null` would be passed to `<img src>` as the literal text "null".
     */
    it("turns a null image URL into an empty string", () => {
        expect(toCardModel({ ...apiProduct, imageUrl: null }).image).toBe("");
    });

    /**
     * `aiScore` has no column behind it. The card hides its badge when the field is undefined, so
     * inventing a number here would put a fabricated score on every product on the browse page.
     */
    it("never invents an AI score", () => {
        expect(toCardModel(apiProduct)).not.toHaveProperty("aiScore");
    });

    /** The API's numeric `id` is a database fact the card has no use for and must not leak into it. */
    it("drops the database id", () => {
        expect(toCardModel(apiProduct)).not.toHaveProperty("id");
    });

    it("preserves an out-of-stock flag rather than defaulting it", () => {
        expect(toCardModel({ ...apiProduct, inStock: false }).inStock).toBe(false);
    });

    it("preserves a zero price rather than treating it as absent", () => {
        expect(toCardModel({ ...apiProduct, price: 0 }).price).toBe(0);
    });
});
