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

/** Simulated network latency, so the skeleton is exercised in development. */
export const PRODUCT_LATENCY_MS = 400;

/** How many products each related rail shows. */
export const RELATED_LIMIT = 4;

/** Reviews rendered before the "show all" affordance. */
export const FEATURED_REVIEWS = 3;

/** Interest-free EMI tenure offered on the pricing card. */
export const EMI_MONTHS = 12;

/** Free delivery above this order value. */
export const FREE_DELIVERY_ABOVE = 500;

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
    delivery: string;
    storeRating: number;
}> = [
    {
        id: "amazon",
        name: "Amazon",
        monogram: "AZ",
        gradient: "from-amber-500 to-orange-600",
        priceOffset: 1,
        delivery: "Tomorrow",
        storeRating: 4.5,
    },
    {
        id: "flipkart",
        name: "Flipkart",
        monogram: "FK",
        gradient: "from-blue-500 to-indigo-600",
        priceOffset: 1.012,
        delivery: "Tomorrow",
        storeRating: 4.3,
    },
    {
        id: "croma",
        name: "Croma",
        monogram: "CR",
        gradient: "from-teal-500 to-emerald-600",
        priceOffset: 1.024,
        delivery: "2 days",
        storeRating: 4.2,
    },
    {
        id: "reliance-digital",
        name: "Reliance Digital",
        monogram: "RD",
        gradient: "from-violet-500 to-purple-600",
        priceOffset: 1.038,
        delivery: "3 days",
        storeRating: 4.1,
    },
    {
        id: "vijay-sales",
        name: "Vijay Sales",
        monogram: "VS",
        gradient: "from-rose-500 to-pink-600",
        priceOffset: 1.047,
        delivery: "3 days",
        storeRating: 4,
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
