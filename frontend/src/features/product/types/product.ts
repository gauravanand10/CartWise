import type { LucideIcon } from "lucide-react";

import type { ProductCardModel } from "../../../types/product";

/**
 * Product Details domain model.
 *
 * `slug` is the identity used in the URL (`/product/:slug`) and in every
 * cross-link, so nothing downstream has to know about numeric ids.
 */

/** Catalogue categories. Drives spec templates and fallback glyphs. */
export type ProductCategory =
    | "Smartphone"
    | "Laptop"
    | "Headphones"
    | "Earbuds"
    | "Smartwatch"
    | "Television"
    | "Accessories";

export interface SpecItem {
    label: string;
    value: string;
}

/** One collapsible block in the specification section. */
export interface SpecGroup {
    id: string;
    title: string;
    icon: LucideIcon;
    items: SpecItem[];
}

/** A retailer's offer for this product. */
export interface StoreOffer {
    id: string;
    name: string;
    /** Logo path. Expected to 404 until real assets land — always via SafeImage. */
    logo: string;
    /** Two-letter fallback drawn when `logo` is unavailable. */
    monogram: string;
    /** Tailwind gradient stops for the monogram tile, e.g. "from-blue-500 to-indigo-600". */
    gradient: string;
    price: number;
    /*
     * Chapter 26.5 removed `delivery: string` from here. It carried "Tomorrow",
     * "2 days" or "3 days" per retailer, rendered beside a truck glyph on every
     * offer row — a delivery promise made on a retailer's behalf, with no feed
     * from that retailer and no idea where the shopper is. Delivery is the
     * retailer's term to state, on the retailer's own page, after the "Visit
     * store" link.
     */
    inStock: boolean;
    /*
     * Chapter 28 removed `storeRating: number` from here, for the same reason
     * and by the same rule as `delivery` above.
     *
     * It held 4.5 for Amazon, 4.3 for Flipkart, 4.2 for Croma, 4.1 for Reliance
     * Digital and 4.0 for Vijay Sales — five literals typed into constants.ts,
     * rendered beside a filled star on every offer row, and described in this
     * file as a "trust signal". CartWise surveys nobody, collects no retailer
     * feedback and reads no third-party retailer-rating feed. The numbers were
     * chosen to look plausible and to rank the stores in an order somebody
     * assumed; nothing measured any of them.
     *
     * A star rating is a stronger claim than most of what this project has
     * already deleted, because the glyph itself asserts provenance: a filled
     * star means "this was rated", and no rating took place.
     *
     * NOT REPLACED. There is no honest number for that slot — not a default,
     * not an average, not the product's own rating borrowed across. The row now
     * shows the retailer's name, its price and whether the product is in stock,
     * all three of which CartWise can substantiate.
     */
}

export interface GalleryImage {
    id: string;
    src: string;
    alt: string;
    /** Which view this is, e.g. "Front". Announced with the image. */
    caption: string;
}

/**
 * Re-exported so this feature has a single type entry point, but *defined* in
 * `src/types` — the shared card in `components/ui/ProductCard` renders both
 * search results and related products, and a shared component must not depend
 * on a feature.
 */
export type { ProductCardModel };

/**
 * The product's photograph and the licence terms that travel with it.
 *
 * Chapter 26.5. Carried on the base record because the detail page now reads
 * `GET /api/products/:slug`, and every one of these fields is on that response —
 * the Chapter 24 rule that `imageUrl` may not be rendered without
 * `imageAttribution` is only enforceable if they arrive together.
 *
 * <p>Retired from this file in Chapter 26.5: `AiVerdict`, `Review` and
 * `RatingBucket`. Nothing generates their values honestly — see the note on
 * {@link ProductBase} — so the types went with the data.
 */
export interface ProductImage {
    url: string | null;
    attribution: string | null;
    license: string | null;
    licenseUrl: string | null;
    sourceUrl: string | null;
    /** True when `url` is the seeded placehold.co stand-in, not a photograph. */
    placeholder: boolean;
}

/**
 * One product, as the API actually knows it.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 26.5 — WHAT LEFT THIS INTERFACE, AND WHY
 *
 * Until this chapter the detail page was served from a 23-record local file
 * (`data/catalogue.ts`), and this interface described that file. Five of its
 * fields existed only because a local file can hold anything:
 *
 *   aiScore     REMOVED. A 0–100 "CartWise AI score" with no model behind it.
 *               It was a number invented per product and then rendered with a
 *               sparkles icon as though it were a measurement.
 *
 *   stockCount  REMOVED. CartWise holds no inventory and has no feed from any
 *               retailer that does. "In stock (18 units)" is not a soft claim
 *               or a placeholder — it is a specific false statement about
 *               someone else's warehouse. `inStock` survives because the API
 *               genuinely carries it.
 *
 *   releasedAt  REMOVED. Never researched, and a release date is checkable —
 *               which is exactly why inventing one is worse than omitting it.
 *
 *   lowestAt    REMOVED. Named the retailer with the best price, in an app
 *               whose store prices are illustrative offsets rather than quotes.
 *
 *   reviews /   REMOVED (from ProductDetail below). Fabricated customer
 *   ratingBuckets  reviews with names, dates and "verified purchase" badges.
 *               This is the same regulatory regime as Chapter 26's affiliate
 *               disclosure — the FTC's Endorsement Guides treat a fake
 *               consumer review as a deceptive endorsement — so it is a legal
 *               exposure rather than a matter of taste. Nothing replaces it
 *               that is presented as anyone's opinion but CartWise's own.
 *
 * `tagline` and `tags` survive but are no longer authored: they are DERIVED
 * from brand, category and the real price/stock facts. See `deriveTagline`
 * and `deriveTags` in services/productService.ts. A derived line can be dull;
 * it cannot be a claim nobody checked.
 * ---------------------------------------------------------------------------
 */
export interface ProductBase {
    slug: string;
    name: string;
    brand: string;
    category: ProductCategory;
    /** Derived positioning line. Never authored per product. */
    tagline: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    /** From the API. Replaces the old invented `stockCount`. */
    inStock: boolean;
    /** Derived from category, brand and real price facts. */
    tags: string[];
    image: ProductImage;
}

/** The fully assembled product, as the details page consumes it. */
export interface ProductDetail extends ProductBase {
    images: GalleryImage[];
    /** Derived from real fields. See `deriveOverview`. */
    overview: string;
    /**
     * Derived from real fields — rating, discount, availability, category.
     * Every entry is a restatement of something on this page, never a claim.
     */
    highlights: string[];
    /**
     * CartWise's own note about the product, and labelled as such wherever it
     * renders. Chapter 26.5 removed the fabricated customer reviews; this is
     * the honest thing that may occupy that space — the site speaking as
     * itself, never a quote attributed to a person who does not exist.
     */
    note: string;
    specGroups: SpecGroup[];
    stores: StoreOffer[];
    /** Cheapest in-stock store price. Drives the "lowest price" badge. */
    lowestPrice: number;
}

/** The three related-product rails, as slug lists. */
export interface RelatedProducts {
    similar: ProductCardModel[];
    compared: ProductCardModel[];
    recommended: ProductCardModel[];
}

/** What the page should render right now. */
export type ProductStatus = "loading" | "error" | "not-found" | "ready";
