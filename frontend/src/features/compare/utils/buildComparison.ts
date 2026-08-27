import { Store } from "lucide-react";

import { COMPARISON_SECTIONS } from "../config/sections";
import { SPEC_DIRECTION, parseMetric, resolveWinners } from "./metrics";
import { formatPrice } from "../../../lib/currency";
import type {
    CompareVerdict,
    ResolvedRow,
    ResolvedSection,
    RowConfig,
    SectionConfig,
} from "../types/compare";
import type { ProductDetail } from "../../product/types/product";

/**
 * Turns the declarative section config plus the selected products into rows the
 * UI can render directly.
 *
 * All comparison logic lives here: the components receive resolved values,
 * winner indices and difference flags, and never compute anything themselves.
 */

/** Rows derived from the products' own specification groups. */
function deriveSpecRows(
    section: SectionConfig,
    products: ProductDetail[],
): RowConfig[] {
    const excluded = new Set(section.exclude ?? []);
    const labels: string[] = [];
    const seen = new Set<string>();

    // Union across products, keeping catalogue order: two products in the same
    // category can legitimately list different rows, and dropping the ones only
    // one of them has would hide exactly the differences a shopper came for.
    for (const groupId of section.specGroups ?? []) {
        for (const product of products) {
            const group = product.specGroups.find((entry) => entry.id === groupId);
            if (!group) continue;

            for (const item of group.items) {
                if (excluded.has(item.label) || seen.has(item.label)) continue;
                seen.add(item.label);
                labels.push(item.label);
            }
        }
    }

    return labels.map((label) => ({
        id: `${section.id}-${label}`,
        label,
        value: (product) => {
            for (const groupId of section.specGroups ?? []) {
                const group = product.specGroups.find((g) => g.id === groupId);
                const item = group?.items.find((entry) => entry.label === label);
                if (item) return item.value;
            }
            return "";
        },
        metric: (product) => {
            if (!SPEC_DIRECTION[label]) return undefined;

            for (const groupId of section.specGroups ?? []) {
                const group = product.specGroups.find((g) => g.id === groupId);
                const item = group?.items.find((entry) => entry.label === label);
                if (item) return parseMetric(item.value);
            }
            return undefined;
        },
        better: SPEC_DIRECTION[label],
    }));
}

/**
 * Rows that restate the product's price, and therefore share one vote.
 *
 * `price` is the current price, `lowest` is the best store price, and every
 * `store-*` row is that same price multiplied by a fixed per-retailer offset.
 * They are one fact wearing seven labels. See the note in `buildVerdict`.
 */
const PRICE_SIGNAL = "price";

function signalFor(rowId: string): string | undefined {
    if (rowId === "price" || rowId === "lowest") return PRICE_SIGNAL;
    if (rowId.startsWith("store-")) return PRICE_SIGNAL;
    return undefined;
}

function resolveRow(
    config: RowConfig,
    products: ProductDetail[],
): ResolvedRow {
    const values = products.map((product) => config.value(product));
    const metrics = products.map((product) => config.metric?.(product));

    const present = values.filter((value) => value !== "");

    return {
        id: config.id,
        label: config.label,
        values,
        emphasis: config.emphasis ?? false,
        winners: resolveWinners(metrics, config.better),
        // A row where one product has no value at all is a difference too.
        differs:
            present.length !== values.length ||
            new Set(values).size > 1,
        signal: signalFor(config.id),
    };
}

/**
 * Store offers, as one row per retailer.
 *
 * Modelled as ordinary rows rather than a bespoke matrix component: a store's
 * price is exactly a labelled, comparable, lower-is-better value, so it gets
 * winner badges, difference highlighting and the "differences only" filter for
 * free. Store names come from the products themselves, so this cannot be
 * declared in the static config.
 */
function buildStoreSection(products: ProductDetail[]): ResolvedSection | null {
    const names: string[] = [];
    const seen = new Set<string>();

    for (const product of products) {
        for (const offer of product.stores) {
            if (seen.has(offer.name)) continue;
            seen.add(offer.name);
            names.push(offer.name);
        }
    }

    if (names.length === 0) return null;

    const rows: ResolvedRow[] = names.map((name) => {
        const offers = products.map((product) =>
            product.stores.find((offer) => offer.name === name),
        );

        const values = offers.map((offer) =>
            offer
                ? offer.inStock
                    ? formatPrice(offer.price)
                    : `${formatPrice(offer.price)} · unavailable`
                : "",
        );

        // Out-of-stock offers are excluded from the ranking: an unbuyable price
        // is not the best price.
        const metrics = offers.map((offer) =>
            offer && offer.inStock ? offer.price : undefined,
        );

        return {
            id: `store-${name}`,
            label: name,
            values,
            emphasis: false,
            winners: resolveWinners(metrics, "lower"),
            differs: new Set(values).size > 1,
            // Same underlying number as the Price section's rows. Rendered in
            // full, counted once. See `buildVerdict`.
            signal: PRICE_SIGNAL,
        };
    });

    return {
        id: "stores",
        title: "Store prices",
        icon: Store,
        collapsed: false,
        rows,
        differenceCount: rows.filter((row) => row.differs).length,
    };
}

export function buildSections(products: ProductDetail[]): ResolvedSection[] {
    if (products.length === 0) return [];

    const configured = COMPARISON_SECTIONS.map((section) => {
        const configs = section.specGroups
            ? deriveSpecRows(section, products)
            : (section.rows ?? []);

        const rows = configs
            .map((config) => resolveRow(config, products))
            // Drop rows no selected product has data for — an all-dashes row is
            // noise, not information.
            .filter((row) => row.values.some((value) => value !== ""));

        return {
            id: section.id,
            title: section.title,
            icon: section.icon,
            description: section.description,
            collapsed: section.collapsed ?? false,
            rows,
            differenceCount: rows.filter((row) => row.differs).length,
        };
    }).filter((section) => section.rows.length > 0);

    const stores = buildStoreSection(products);

    return stores ? [...configured, stores] : configured;
}

/** Every index sharing the maximum of `scores`. Length > 1 is a genuine tie. */
function topIndices(scores: number[]): number[] {
    if (scores.length === 0) return [];

    const max = Math.max(...scores);
    return scores
        .map((score, index) => ({ score, index }))
        .filter((entry) => entry.score === max)
        .map((entry) => entry.index);
}

/**
 * The overall recommendation.
 *
 * "Best overall" counts wins rather than trusting a single score, so it stays
 * traceable — the reader can scroll the table and see where the wins came from.
 *
 * ===========================================================================
 * CHAPTER 29 — ONE VOTE PER SIGNAL, NOT PER ROW
 *
 * THE BUG. This counted one win per ranked ROW, and the table has seven rows
 * that all measure the same thing. Per-store prices are `product.price` times a
 * fixed per-retailer offset (see data/offers.ts), so all five `store-*` rows are
 * won by whichever product is cheapest — and then "Current price" and "Best
 * store price" award that same product twice more. Before a single
 * specification was compared, the cheapest product had banked seven votes.
 *
 * Chapter 28 measured the consequence across all 12,605 same-category
 * four-product comparisons the catalogue admits:
 *
 *     winner is the CHEAPEST product   83.7%
 *     winner is the BEST-RATED         8.5%      (chance would be 25%)
 *     winner is the WORST-RATED        59.2%
 *
 * A recommendation that names the worst-rated product more often than the
 * best-rated one is not a weak recommendation, it is an inverted one. The
 * Headphones example: boAt Nirvana 751 ANC (rated 4.1) beat the Sony
 * WH-1000XM6 (rated 4.9) by nine wins to one, and seven of those nine were the
 * same £-per-unit fact counted seven times.
 *
 * THE FIX. Rows carrying the same `signal` cast ONE vote between them, decided
 * by the first such row encountered — which is "Current price", the canonical
 * statement of the quantity. Every other row remains its own signal.
 *
 * THE RESULTING WEIGHT DISTRIBUTION, stated plainly:
 *
 *     price                     1 vote   (was 7)
 *     customer rating           1 vote
 *     number of ratings         1 vote
 *     each comparable spec      1 vote each
 *
 * WHY EQUAL WEIGHTS RATHER THAN A TUNED CURVE. Any other split needs a number
 * nobody can source — "price is worth 2.5 specifications" is exactly the kind
 * of invented figure the last four chapters have been deleting. One vote per
 * independent comparable dimension is a rule that can be stated in a sentence
 * and checked against the table, which is the property that made row-counting
 * worth keeping in the first place.
 *
 * The rows are all still RENDERED. Nothing is hidden from the reader; the five
 * store rows are genuinely useful to look at. They simply stop voting seven
 * times for one fact.
 *
 * TIES ARE NO LONGER HIDDEN. `bestOverall` and `bestValue` are arrays. The old
 * `count > wins[best]` reduction silently handed a drawn verdict to whichever
 * product sat earliest in the array — that is, whichever the user added to the
 * comparison first. See the note on CompareVerdict.
 * ===========================================================================
 */
export function buildVerdict(
    products: ProductDetail[],
    sections: ResolvedSection[],
): CompareVerdict {
    const wins = products.map(() => 0);
    const countedSignals = new Set<string>();
    let comparableSignals = 0;

    for (const section of sections) {
        for (const row of section.rows) {
            if (row.winners.length === 0) continue;

            if (row.signal) {
                // Already voted for by an earlier row measuring the same thing.
                if (countedSignals.has(row.signal)) continue;
                countedSignals.add(row.signal);
            }

            comparableSignals += 1;
            for (const index of row.winners) wins[index] += 1;
        }
    }

    const bestOverall = topIndices(wins);

    /*
     * "Best value" — quality per rupee.
     *
     * Chapter 26.5 changed the numerator and not the idea. It was
     * `product.ai.score`, a fabricated 0–100 CartWise score; it is now the real
     * customer rating the API carries. The rating's range is 0–5 rather than
     * 0–100, which is irrelevant here: this array is only ever compared against
     * itself to find a maximum, so a uniform change of scale cannot change the
     * winner. What DOES change is that the number is now something a reader
     * could verify.
     */
    const valuePerRupee = products.map(
        (product) => product.rating / Math.max(1, product.price),
    );

    const bestValue = topIndices(valuePerRupee);

    return { bestOverall, bestValue, wins, comparableSignals };
}
