import {
    Battery,
    Camera,
    Cpu,
    Headphones,
    IndianRupee,
    Info,
    MemoryStick,
    Monitor,
    Ruler,
    Smartphone,
    Star,
    Wifi,
} from "lucide-react";

import { specValue } from "../utils/metrics";
import { discountPercent, formatCount, formatPrice } from "../../../lib/currency";
import { monthlyEmi } from "../../product/utils/pricing";
import type { SectionConfig } from "../types/compare";

/**
 * The comparison, declared as data.
 *
 * Nothing in the UI knows which attributes exist — sections and rows are read
 * from here, so adding a comparable attribute is a config change rather than
 * an edit to the page. Sections that derive from `specGroups` pick up new
 * specification rows from the product catalogue automatically.
 *
 * Sections whose products share no matching data resolve to zero rows and are
 * dropped, so comparing two laptops does not show an empty Camera block.
 */
export const COMPARISON_SECTIONS: SectionConfig[] = [
    {
        id: "overview",
        title: "Overview",
        icon: Info,
        rows: [
            { id: "brand", label: "Brand", value: (p) => p.brand },
            { id: "category", label: "Category", value: (p) => p.category },
            {
                id: "positioning",
                label: "Positioning",
                value: (p) => p.tagline,
            },
            {
                id: "tags",
                label: "Highlights",
                value: (p) => p.tags.join(", "),
            },
            {
                id: "availability",
                label: "Availability",
                value: (p) =>
                    p.inStock ? `In stock (${p.stockCount} units)` : "Out of stock",
                metric: (p) => p.stockCount,
                better: "higher",
            },
            {
                id: "released",
                label: "Released",
                value: (p) =>
                    new Date(p.releasedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                    }),
                metric: (p) => Date.parse(p.releasedAt),
                better: "higher",
            },
        ],
    },

    {
        id: "price",
        title: "Price",
        icon: IndianRupee,
        rows: [
            {
                id: "price",
                label: "Current price",
                value: (p) => formatPrice(p.price),
                metric: (p) => p.price,
                better: "lower",
                emphasis: true,
            },
            {
                id: "original",
                label: "Original price",
                value: (p) => (p.originalPrice ? formatPrice(p.originalPrice) : ""),
            },
            {
                id: "discount",
                label: "Discount",
                value: (p) => {
                    const percent = discountPercent(p.price, p.originalPrice);
                    return percent > 0 ? `${percent}% off` : "No discount";
                },
                metric: (p) => discountPercent(p.price, p.originalPrice),
                better: "higher",
            },
            {
                id: "lowest",
                label: "Best store price",
                value: (p) => formatPrice(p.lowestPrice),
                metric: (p) => p.lowestPrice,
                better: "lower",
            },
            {
                id: "emi",
                label: "EMI per month",
                value: (p) => formatPrice(monthlyEmi(p.price)),
                metric: (p) => monthlyEmi(p.price),
                better: "lower",
            },
        ],
    },

    {
        id: "ratings",
        title: "Ratings",
        icon: Star,
        rows: [
            {
                id: "rating",
                label: "Customer rating",
                value: (p) => `${p.rating} / 5`,
                metric: (p) => p.rating,
                better: "higher",
                emphasis: true,
            },
            {
                id: "reviews",
                label: "Number of ratings",
                value: (p) => formatCount(p.reviewCount),
                metric: (p) => p.reviewCount,
                better: "higher",
            },
            {
                id: "ai-score",
                label: "CartWise AI score",
                value: (p) => `${p.ai.score} / 100`,
                metric: (p) => p.ai.score,
                better: "higher",
            },
            {
                id: "ai-confidence",
                label: "AI confidence",
                value: (p) => `${p.ai.confidence}%`,
                metric: (p) => p.ai.confidence,
                better: "higher",
            },
        ],
    },

    {
        id: "display",
        title: "Display",
        icon: Monitor,
        specGroups: ["display"],
    },

    {
        id: "performance",
        title: "Processor & performance",
        icon: Cpu,
        specGroups: ["processor"],
        // Owned by the Software section below.
        exclude: ["Operating system", "Update policy"],
    },

    {
        id: "memory",
        title: "Memory & storage",
        icon: MemoryStick,
        specGroups: ["memory"],
    },

    {
        id: "camera",
        title: "Camera",
        icon: Camera,
        specGroups: ["camera"],
    },

    {
        id: "battery",
        title: "Battery & charging",
        icon: Battery,
        specGroups: ["battery"],
    },

    {
        id: "software",
        title: "Software",
        icon: Smartphone,
        rows: [
            {
                id: "os",
                label: "Operating system",
                value: (p) => specValue(p, "Operating system") ?? "",
            },
            {
                id: "updates",
                label: "Update policy",
                value: (p) => specValue(p, "Update policy") ?? "",
            },
            {
                id: "app",
                label: "Companion app",
                value: (p) => specValue(p, "App") ?? specValue(p, "Software") ?? "",
            },
        ],
    },

    {
        id: "audio",
        title: "Audio",
        icon: Headphones,
        specGroups: ["audio"],
    },

    {
        id: "connectivity",
        title: "Connectivity",
        icon: Wifi,
        specGroups: ["connectivity"],
    },

    {
        id: "physical",
        title: "Dimensions & build",
        icon: Ruler,
        specGroups: ["physical"],
        collapsed: true,
    },
];
