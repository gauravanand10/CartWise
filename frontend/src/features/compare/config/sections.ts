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
// `discountPercent` was imported here for the ranked "Discount" row Chapter 28
// removed — see the note in the Price section below.
import { formatCount, formatPrice } from "../../../lib/currency";
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
            /*
             * Chapter 26.5.
             *
             * "In stock (18 units)" is gone. The unit count came from
             * `stockCount`, a number invented per product in a local file, and
             * CartWise has no inventory feed from any retailer — so it was a
             * specific false statement about someone else's warehouse dressed
             * up as a comparison metric. The row survives on the `inStock`
             * boolean the API genuinely carries, and loses its `metric`/`better`
             * pair because "in stock" is not a quantity one product can beat
             * another at.
             *
             * The "Released" row is gone entirely: `releasedAt` was never
             * researched for any product.
             */
            {
                id: "availability",
                label: "Availability",
                value: (p) => (p.inStock ? "In stock" : "Out of stock"),
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
            /*
             * Chapter 28 removed the "Discount" row.
             *
             * It rendered "17% off" or "No discount" per column, and — because
             * it carried `metric` and `better: "higher"` — it was also RANKED.
             * The table did not merely state a discount, it awarded a win to
             * whichever product was marked down furthest, and `buildVerdict`
             * counts those wins into "Best overall".
             *
             * That is the part worth removing rather than merely restyling. A
             * larger percentage off a higher original price is not evidence
             * that a product is better; the "original price" it is measured
             * against is a manufacturer's list figure, and ranking by distance
             * from it rewards whoever set the higher list price. The two rows
             * that remain — "Current price" ranked lower-is-better, and
             * "Original price" stated without a ranking — carry the same two
             * numbers with no inference drawn from them.
             *
             * CONSEQUENCE, STATED: the comparison now has one fewer comparable
             * row, so a product that used to win on discount alone no longer
             * banks that win. "Best overall" can therefore differ from what it
             * was for the same four products. That is a change in the verdict's
             * inputs, and it is the intended effect rather than a side effect.
             */
            {
                id: "lowest",
                label: "Best store price",
                value: (p) => formatPrice(p.lowestPrice),
                metric: (p) => p.lowestPrice,
                better: "lower",
            },
            /*
             * Chapter 26.5 removed the "EMI per month" row, which was
             * `price ÷ 12` presented as a monthly instalment and ranked
             * "lower is better" — so the table did not merely state a
             * financing figure, it recommended a product on the strength of
             * one. CartWise arranges no credit; there is no instalment.
             */
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
            /*
             * Chapter 26.5 removed "CartWise AI score" and "AI confidence".
             *
             * No model produced either number. The score was a literal in a
             * hand-written file and the confidence was
             * `80 + log10(reviewCount) * 4` — an arithmetic expression over the
             * rating count, presented as a system's certainty about a verdict.
             *
             * Deleting them cost this section nothing it could substantiate:
             * the two rows above are the real customer rating and the real
             * count behind it, which is the whole of what CartWise knows about
             * how a product is received.
             */
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
