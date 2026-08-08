import type { LucideIcon } from "lucide-react";

/**
 * A Tailwind gradient stop pair, e.g. "from-blue-500 to-indigo-600".
 * Kept as a plain string so it composes with `bg-gradient-to-*` at the call site.
 */
export type Gradient = string;

export interface HomeProduct {
    id: string;
    /** URL identity, matching the Product Details catalogue. Drives `/product/:slug`. */
    slug: string;
    name: string;
    /** Absolute path under /assets. May 404 until the API supplies real images — always render via <ProductImage>. */
    image: string;
    /** Category, used to pick a sensible fallback glyph when `image` is unavailable. */
    category: ProductCategory;
    price: string;
    originalPrice?: string;
    discount?: string;
    rating: number;
    reviews: string;
    aiScore?: number;
    badge?: string;
    store?: string;
}

export type ProductCategory =
    | "phones"
    | "laptops"
    | "audio"
    | "wearables"
    | "tvs"
    | "monitors"
    | "gaming"
    | "cameras"
    | "appliances";

export interface Category {
    id: string;
    title: string;
    /** Short line under the title, e.g. "1,240+ items". */
    caption: string;
    icon: LucideIcon;
    gradient: Gradient;
    /** Soft tint used for the card body behind the icon. */
    tint: string;
}

export interface Banner {
    id: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    gradient: Gradient;
    icon: LucideIcon;
}

export interface Brand {
    id: string;
    name: string;
    logo: string;
    /** Rendered when `logo` is unavailable — keeps the grid looking deliberate rather than broken. */
    monogram: string;
    products: string;
    gradient: Gradient;
}

export interface FlashDeal {
    id: string;
    /** URL identity of the product on offer. */
    slug: string;
    name: string;
    image: string;
    category: ProductCategory;
    price: string;
    originalPrice: string;
    discountPercent: number;
    store: string;
    /** Seconds remaining when the page loads; the countdown ticks down from here. */
    endsInSeconds: number;
    claimedPercent: number;
}

export interface AIPick {
    id: string;
    /** URL identity of the recommended product. */
    slug: string;
    name: string;
    image: string;
    category: ProductCategory;
    price: string;
    score: number;
    confidence: number;
    verdict: string;
    reasons: string[];
    gradient: Gradient;
}
