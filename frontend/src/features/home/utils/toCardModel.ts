import {
    Camera,
    Gamepad2,
    Headphones,
    Laptop,
    Monitor,
    Refrigerator,
    Smartphone,
    Tv,
    Watch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { HomeProduct, ProductCategory } from "../types/home";
import type { ProductCardModel } from "../../../types/product";

/**
 * Adapts the homepage's product shape to the shared card contract.
 *
 * Chapter 23 deleted `features/home/components/product/ProductCard.tsx` in
 * favour of the one in `components/ui`, and this file is the reason that was
 * possible at all. The two components were never a near-duplicate that could be
 * diffed and reconciled: they took **different data**.
 *
 *   HomeProduct.price          "₹1,29,999"   — a formatted string
 *   ProductCardModel.price     129999        — a number the card formats itself
 *
 * The same is true of `originalPrice` and `reviews`. The homepage's data was
 * authored pre-formatted, so its card printed strings straight through and could
 * not compute anything from them — which is exactly why it needed a separate
 * `discount: "Save ₹9,901"` field where the shared card derives the percentage.
 *
 * Rather than reformat the homepage's data files or teach the shared card to
 * accept either shape, the conversion happens here, once, at the two call sites
 * that need it. The shared card keeps a single unambiguous contract, and the
 * homepage keeps its authored copy.
 */

/**
 * Parses "₹1,29,900" → 129900.
 *
 * Indian digit grouping is irregular (2,2,3 rather than 3,3,3), so this strips
 * every non-digit instead of trying to parse the separators. Duplicated from
 * `data/products.ts`, which needs the same thing to compute its price-drop
 * ordering — worth noting rather than sharing, because that copy operates on the
 * catalogue before badges are applied and this one operates on finished records.
 *
 * Returns 0 for an unparseable value, which the card renders as ₹0 rather than
 * NaN. A price that cannot be read is a data bug, and ₹0 is the version of it
 * somebody notices.
 */
function parseRupees(value: string | undefined): number {
    if (!value) return 0;
    return Number(value.replace(/\D/g, "")) || 0;
}

/**
 * Parses "19,412" → 19412, and tolerates "2.1k"-style values by ignoring them.
 *
 * The shared card formats review counts itself via `formatCount`, so it needs a
 * number. Homepage data stores them already grouped.
 */
function parseCount(value: string): number {
    return Number(value.replace(/\D/g, "")) || 0;
}

/**
 * Category-appropriate fallback glyph, so a missing asset reads as "phone"
 * rather than as a generic broken image.
 *
 * This map is copied from `components/product/ProductImage`, a thin wrapper over
 * `SafeImage` that exists to supply exactly this. That component survives — the
 * AI-pick and flash-deal cards still render through it — so the map is now in
 * two places, which is the one duplication this merge added. It is a nine-entry
 * literal over a closed union, so a category added to `ProductCategory` without
 * updating both is a type error in both, not a silent fallback. Keeping the map
 * here
 * — in the homepage feature that owns the `ProductCategory` union — is what lets
 * the shared card take a plain `fallbackIcon` and stay ignorant of a vocabulary
 * ("phones", "tvs") that is not the one `ProductCardModel.category` uses
 * ("Smartphone", "Television").
 */
const categoryGlyph: Record<ProductCategory, LucideIcon> = {
    phones: Smartphone,
    laptops: Laptop,
    audio: Headphones,
    wearables: Watch,
    tvs: Tv,
    monitors: Monitor,
    gaming: Gamepad2,
    cameras: Camera,
    appliances: Refrigerator,
};

/** The glyph for a homepage category. */
export function glyphFor(category: ProductCategory): LucideIcon {
    return categoryGlyph[category];
}

/**
 * Converts one homepage product into the shared card model.
 *
 * Two fields have no source in `HomeProduct` and are given deliberate values:
 *
 *   brand    — empty string. The homepage card never rendered a brand, and the
 *              data has no field for one. The shared card now skips the brand
 *              line when it is empty, so the homepage renders as it always did
 *              rather than showing a blank accent-coloured row.
 *
 *   inStock  — always true. The homepage data models no stock state, and its
 *              card had no out-of-stock treatment. Defaulting to `false` would
 *              invent an "Out of stock" veil across the entire homepage;
 *              defaulting to `true` reproduces exactly what shipped. This is the
 *              one assumption in this file, and it is an assumption about
 *              *missing* data rather than a reinterpretation of present data.
 */
export function toCardModel(product: HomeProduct): ProductCardModel {
    return {
        slug: product.slug,
        name: product.name,
        brand: "",
        category: product.category,
        price: parseRupees(product.price),
        originalPrice: product.originalPrice
            ? parseRupees(product.originalPrice)
            : undefined,
        rating: product.rating,
        reviews: parseCount(product.reviews),
        inStock: true,
        image: product.image,
        aiScore: product.aiScore,
    };
}
