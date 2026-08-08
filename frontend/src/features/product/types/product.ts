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
    delivery: string;
    inStock: boolean;
    /** Retailer's own rating out of 5, shown as trust signal. */
    storeRating: number;
}

/** Static AI verdict. Mock content — no model is called in this chapter. */
export interface AiVerdict {
    score: number;
    /** Confidence percentage behind `score`. */
    confidence: number;
    summary: string;
    pros: string[];
    cons: string[];
    /** Short use-case labels, e.g. "Photography", "Travel". */
    bestFor: string[];
    whoShouldBuy: string;
    whoShouldAvoid: string;
}

export interface Review {
    id: string;
    author: string;
    rating: number;
    title: string;
    body: string;
    /** ISO date. Formatted at render time. */
    date: string;
    verified: boolean;
    helpful: number;
}

/** One bar of the rating histogram. */
export interface RatingBucket {
    stars: number;
    count: number;
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

/** Base catalogue record. Everything else is layered on top of this. */
export interface ProductBase {
    slug: string;
    name: string;
    brand: string;
    category: ProductCategory;
    /** One-line positioning statement under the product name. */
    tagline: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    aiScore: number;
    /** Units on hand. 0 means out of stock. */
    stockCount: number;
    /** Short marketing tags, e.g. "Flagship", "5G". */
    tags: string[];
    /** ISO release date. Shown in specs and used for "Newest". */
    releasedAt: string;
    /** Which store currently has the lowest price. */
    lowestAt: string;
}

/** The fully assembled product, as the details page consumes it. */
export interface ProductDetail extends ProductBase {
    inStock: boolean;
    images: GalleryImage[];
    overview: string;
    highlights: string[];
    features: string[];
    boxContents: string[];
    specGroups: SpecGroup[];
    stores: StoreOffer[];
    ai: AiVerdict;
    reviews: Review[];
    ratingBuckets: RatingBucket[];
    /** Cheapest store price. Drives the "lowest price" badge. */
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
