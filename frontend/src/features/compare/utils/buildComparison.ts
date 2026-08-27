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

/**
 * The overall recommendation.
 *
 * "Best overall" counts row wins rather than trusting a single score, so it is
 * traceable — the user can scroll the table and see where the wins came from.
 * "Best value" is AI score per rupee, which is what separates a good product
 * from a good purchase.
 */
export function buildVerdict(
    products: ProductDetail[],
    sections: ResolvedSection[],
): CompareVerdict {
    const wins = products.map(() => 0);
    let comparableRows = 0;

    for (const section of sections) {
        for (const row of section.rows) {
            if (row.winners.length === 0) continue;

            comparableRows += 1;
            for (const index of row.winners) wins[index] += 1;
        }
    }

    const bestOverall = wins.reduce(
        (best, count, index) => (count > wins[best] ? index : best),
        0,
    );

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

    const bestValue = valuePerRupee.reduce(
        (best, score, index) => (score > valuePerRupee[best] ? index : best),
        0,
    );

    return { bestOverall, bestValue, wins, comparableRows };
}
