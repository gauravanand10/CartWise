import {
    Battery,
    Camera,
    Cpu,
    Headphones,
    Laptop,
    MemoryStick,
    Monitor,
    Package,
    Ruler,
    Smartphone,
    Tv,
    Watch,
    Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ProductCategory } from "./types/product";

/*
 * ===========================================================================
 * CHAPTER 26.5 — CONSTANTS RETIRED FROM THIS FILE
 *
 * Dead code left by the fabricated-content removals:
 *
 *   PRODUCT_LATENCY_MS  an artificial `await delay(400)` in the product
 *                       service, there to exercise the skeleton while the
 *                       data came from a local array. The service reads the
 *                       API now, so the wait is real and the constant is not.
 *
 *   FEATURED_REVIEWS    "reviews rendered before the show-all affordance".
 *                       There are no reviews to render.
 *
 * Fabricated commerce terms — a different and more serious class, because
 * these are terms of sale:
 *
 *   EMI_MONTHS          "Interest-free EMI tenure offered on the pricing
 *                       card". CartWise offers no financing. It is not a
 *                       lender, has no lending partner, and the number 12 was
 *                       chosen because it divides nicely.
 *
 *   FREE_DELIVERY_ABOVE "Free delivery above this order value". CartWise
 *                       ships nothing and has no order value — it takes no
 *                       orders. The ₹500 threshold described a shipping
 *                       policy that does not exist.
 *
 *   STORES[].delivery   "Tomorrow" / "2 days" / "3 days" per retailer. A
 *                       delivery promise made on a retailer's behalf, without
 *                       a feed from that retailer, to a destination CartWise
 *                       does not know.
 *
 * Delivery and payment terms are set by the retailer the "Visit store" link
 * sends the shopper to. CartWise is not a party to that transaction and now
 * says so instead of guessing at its terms.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 28 — STORES[].storeRating, THE LAST ONE
 *
 *   storeRating   4.5 Amazon · 4.3 Flipkart · 4.2 Croma · 4.1 Reliance Digital
 *                 · 4.0 Vijay Sales. Rendered beside a filled star on every
 *                 offer row and typed as "Retailer's own rating out of 5, shown
 *                 as trust signal".
 *
 * Chapter 26.5 identified this while removing the delivery estimates from the
 * same row, judged it the same class of claim, and deliberately did not take it
 * because that chapter's scope had already been widened twice. Chapter 27 then
 * did not carry it forward, so it stood while every comparable claim around it
 * was deleted. It is taken here.
 *
 * The values are not measurements. No survey was run, no retailer feedback is
 * collected, and no third-party rating feed is called — Chapter 24's and
 * Chapter 26's API research covered pricing and found nothing free; nobody ever
 * looked for a retailer-reputation source, because there was never an intention
 * to call one. The spread from 4.5 down to 4.0 encodes an assumed pecking order
 * and nothing else.
 *
 * REMOVED, NOT REPLACED. Any substitute — a flat default, an average, the
 * product's own customer rating borrowed across — is the same fabrication
 * wearing a different number. The offer row keeps what is real: who the
 * retailer is, what the reference price is, and whether the product is in
 * stock.
 * ---------------------------------------------------------------------------
 * ===========================================================================
 */

/** How many products each related rail shows. */
export const RELATED_LIMIT = 4;

/**
 * Fallback glyph per category.
 *
 * A missing image should read as "this is a laptop", not as a broken file —
 * same approach the homepage takes with its own category glyphs.
 */
export const categoryGlyph: Record<ProductCategory, LucideIcon> = {
    Smartphone: Smartphone,
    Laptop: Laptop,
    Headphones: Headphones,
    Earbuds: Headphones,
    Smartwatch: Watch,
    Television: Tv,
    Accessories: Package,
};

/** Icon per specification group id, keyed by the ids used in `specTemplates`. */
export const specGroupIcon: Record<string, LucideIcon> = {
    display: Monitor,
    processor: Cpu,
    memory: MemoryStick,
    battery: Battery,
    camera: Camera,
    audio: Headphones,
    connectivity: Wifi,
    physical: Ruler,
    box: Package,
};

/**
 * The retailers CartWise compares.
 *
 * `priceOffset` is a fixed multiplier applied to the base price so every
 * product gets a plausible, *stable* spread across stores without 5 × 23
 * hand-written rows. Deterministic by design: the same product always shows the
 * same store prices, which a random jitter could not guarantee across renders.
 */
export const STORES: ReadonlyArray<{
    id: string;
    name: string;
    monogram: string;
    gradient: string;
    priceOffset: number;
}> = [
    {
        id: "amazon",
        name: "Amazon",
        monogram: "AZ",
        gradient: "from-amber-500 to-orange-600",
        priceOffset: 1,
    },
    {
        id: "flipkart",
        name: "Flipkart",
        monogram: "FK",
        gradient: "from-blue-500 to-indigo-600",
        priceOffset: 1.012,
    },
    {
        id: "croma",
        name: "Croma",
        monogram: "CR",
        gradient: "from-teal-500 to-emerald-600",
        priceOffset: 1.024,
    },
    {
        id: "reliance-digital",
        name: "Reliance Digital",
        monogram: "RD",
        gradient: "from-violet-500 to-purple-600",
        priceOffset: 1.038,
    },
    {
        id: "vijay-sales",
        name: "Vijay Sales",
        monogram: "VS",
        gradient: "from-rose-500 to-pink-600",
        priceOffset: 1.047,
    },
];

/** The camera angles every product gallery renders. */
export const GALLERY_VIEWS: ReadonlyArray<string> = [
    "Front",
    "Back",
    "Side",
    "In use",
];

/**
 * Which specification groups a category shows, in order.
 *
 * Keeping the *structure* here and the *values* in the catalogue means a
 * smartphone and a television can't accidentally drift into showing different
 * group names for the same kind of information.
 */
export const specTemplates: Record<ProductCategory, string[]> = {
    Smartphone: [
        "display",
        "processor",
        "memory",
        "camera",
        "battery",
        "connectivity",
        "physical",
    ],
    Laptop: [
        "display",
        "processor",
        "memory",
        "battery",
        "connectivity",
        "physical",
    ],
    Headphones: ["audio", "battery", "connectivity", "physical"],
    Earbuds: ["audio", "battery", "connectivity", "physical"],
    Smartwatch: ["display", "processor", "battery", "connectivity", "physical"],
    Television: [
        "display",
        "processor",
        "audio",
        "connectivity",
        "physical",
    ],
    Accessories: ["connectivity", "battery", "physical"],
};

/** Human title for each specification group id. */
export const specGroupTitle: Record<string, string> = {
    display: "Display",
    processor: "Processor & performance",
    memory: "Memory & storage",
    battery: "Battery & charging",
    camera: "Camera",
    audio: "Audio",
    connectivity: "Connectivity",
    physical: "Dimensions & weight",
};
