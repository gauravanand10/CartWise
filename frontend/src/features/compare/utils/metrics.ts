import type { BetterDirection } from "../types/compare";
import type { ProductDetail } from "../../product/types/product";

/** Finds a specification value by label, across every group. */
export function specValue(
    product: ProductDetail,
    label: string,
): string | undefined {
    for (const group of product.specGroups) {
        const item = group.items.find((entry) => entry.label === label);
        if (item) return item.value;
    }

    return undefined;
}

/** Unit multipliers, applied after the leading number is extracted. */
const UNIT_SCALE: ReadonlyArray<[RegExp, number]> = [
    // Storage and memory: normalise everything to GB so "1 TB" beats "512 GB".
    [/\btb\b/i, 1024],
    [/\bgb\b/i, 1],
    [/\bmb\b/i, 1 / 1024],
    // Mass: normalise to grams so "1.24 kg" is not read as 1.24.
    [/\bkg\b/i, 1000],
    [/\bg\b/i, 1],
    // Energy: Wh is roughly 270 mAh at phone voltages — close enough to rank.
    [/\bwh\b/i, 270],
    [/\bmah\b/i, 1],
];

/**
 * Pulls a comparable number out of a specification string.
 *
 * "1 TB NVMe SSD" → 1024, "1.24 kg" → 1240, "2,600 nits" → 2600.
 *
 * Unit normalisation is the whole point: reading the leading number alone would
 * rank "512 GB" above "1 TB" and "199 g" above "1.24 kg", producing winner
 * badges that are confidently wrong.
 */
export function parseMetric(raw?: string): number | undefined {
    if (!raw) return undefined;

    const match = /(-?\d+(?:[.,]\d+)?)/.exec(raw.replace(/,(?=\d{3}\b)/g, ""));
    if (!match) return undefined;

    const base = Number(match[1].replace(",", "."));
    if (Number.isNaN(base)) return undefined;

    for (const [pattern, scale] of UNIT_SCALE) {
        if (pattern.test(raw)) return base * scale;
    }

    return base;
}

/**
 * Which specification labels can be ranked, and which way is better.
 *
 * Only labels where a number genuinely means "more is better" (or worse) appear
 * here. Anything absent — chipset names, codec lists, colours — is shown
 * side-by-side with no winner badge, because declaring a winner on
 * incomparable data is worse than declaring none.
 */
export const SPEC_DIRECTION: Readonly<Record<string, BetterDirection>> = {
    // Display
    "Screen size": "higher",
    "Refresh rate": "higher",
    "Peak brightness": "higher",
    Brightness: "higher",
    // Memory and storage
    RAM: "higher",
    Storage: "higher",
    // Battery
    Capacity: "higher",
    "Wired charging": "higher",
    "Wireless charging": "higher",
    "Rated battery life": "higher",
    "Rated screen time": "higher",
    "Typical use": "higher",
    "Low-power mode": "higher",
    "Playback (ANC on)": "higher",
    "Playback (ANC off)": "higher",
    "Buds (ANC on)": "higher",
    "With case": "higher",
    "Battery life": "higher",
    // Camera
    "Main camera": "higher",
    "Front camera": "higher",
    // Audio
    Speakers: "higher",
    // Physical — lighter and smaller win
    Weight: "lower",
    "Bud weight": "lower",
    "Case weight": "lower",
    "Weight (with stand)": "lower",
    "Power consumption": "lower",
};

/**
 * Indices of the winning products for a set of metrics.
 *
 * Returns an empty array when fewer than two products have a comparable value,
 * or when every product ties — a badge on all four columns communicates
 * nothing.
 */
export function resolveWinners(
    metrics: Array<number | undefined>,
    better?: BetterDirection,
): number[] {
    if (!better) return [];

    const scored = metrics
        .map((metric, index) => ({ metric, index }))
        .filter(
            (entry): entry is { metric: number; index: number } =>
                typeof entry.metric === "number",
        );

    if (scored.length < 2) return [];

    const best = scored.reduce(
        (winner, entry) =>
            better === "higher"
                ? Math.max(winner, entry.metric)
                : Math.min(winner, entry.metric),
        better === "higher" ? -Infinity : Infinity,
    );

    const winners = scored
        .filter((entry) => entry.metric === best)
        .map((entry) => entry.index);

    return winners.length === metrics.length ? [] : winners;
}
