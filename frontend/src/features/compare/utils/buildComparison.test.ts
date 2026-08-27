import { Store } from "lucide-react";
import { describe, expect, it } from "vitest";

import { buildSections, buildVerdict } from "./buildComparison";
import { getProductBySlug } from "../../product/services/productService";
import { apiProduct, mockApi } from "../../../test/mockApi";
import type { ResolvedRow, ResolvedSection } from "../types/compare";
import type { ProductDetail } from "../../product/types/product";

/**
 * The comparison verdict.
 *
 * ===========================================================================
 * WHY THIS FILE EXISTS
 *
 * `buildVerdict` is the only place in CartWise that makes a recommendation, and
 * until Chapter 29 it had no tests at all. It was wrong for four chapters in a
 * way no test could have noticed, because the bug was not in any single row: it
 * was that seven different rows all measured the product's price, so the
 * cheapest product banked seven votes before a specification was compared.
 * Chapter 28 measured the result across all 12,605 same-category four-product
 * comparisons the catalogue admits — the verdict named the WORST-rated product
 * 59.2% of the time and the best-rated one 8.5%.
 *
 * So the tests below are written against the two properties that actually
 * matter, rather than against a fixed expected winner:
 *
 *   1. rows that restate the same quantity vote ONCE between them
 *   2. a drawn verdict is reported as drawn, not resolved by array position
 *
 * The second is asserted by permuting the input order, which is the only way to
 * catch a positional tie-break — the old code passed every "who wins" assertion
 * you could write and still handed the crown to whichever product happened to
 * be first.
 * ===========================================================================
 */

function row(overrides: Partial<ResolvedRow> & { id: string }): ResolvedRow {
    return {
        label: overrides.id,
        values: [],
        emphasis: false,
        winners: [],
        differs: true,
        ...overrides,
    };
}

function section(id: string, rows: ResolvedRow[]): ResolvedSection {
    return { id, title: id, icon: Store, collapsed: false, rows, differenceCount: rows.length };
}

/** buildVerdict reads only `price` and `rating` off each product. */
function products(specs: Array<{ price: number; rating: number }>): ProductDetail[] {
    return specs.map((s, i) => ({ slug: `p${i}`, name: `P${i}`, ...s }) as unknown as ProductDetail);
}

const FOUR = products([
    { price: 100, rating: 4.0 },
    { price: 200, rating: 4.5 },
    { price: 300, rating: 4.9 },
    { price: 400, rating: 4.2 },
]);

describe("buildVerdict — one vote per signal", () => {

    /**
     * The regression that started this. Seven rows, all won by product 0,
     * all measuring the same price. They must be worth one vote, not seven.
     */
    it("counts the price rows once between them, not once each", () => {
        const sections = [
            section("price", [
                row({ id: "price", winners: [0], signal: "price" }),
                row({ id: "lowest", winners: [0], signal: "price" }),
            ]),
            section("stores", [
                row({ id: "store-Amazon", winners: [0], signal: "price" }),
                row({ id: "store-Flipkart", winners: [0], signal: "price" }),
                row({ id: "store-Croma", winners: [0], signal: "price" }),
                row({ id: "store-Reliance Digital", winners: [0], signal: "price" }),
                row({ id: "store-Vijay Sales", winners: [0], signal: "price" }),
            ]),
        ];

        const verdict = buildVerdict(FOUR, sections);

        expect(verdict.wins[0]).toBe(1);
        expect(verdict.comparableSignals).toBe(1);
    });

    it("still counts unsignalled rows individually", () => {
        const sections = [
            section("ratings", [
                row({ id: "rating", winners: [2] }),
                row({ id: "reviews", winners: [2] }),
            ]),
            section("memory", [
                row({ id: "memory-RAM", winners: [1] }),
                row({ id: "memory-Storage", winners: [1] }),
            ]),
        ];

        const verdict = buildVerdict(FOUR, sections);

        expect(verdict.wins).toEqual([0, 2, 2, 0]);
        expect(verdict.comparableSignals).toBe(4);
    });

    /**
     * The shape of the old bug, end to end: price wins seven rows, quality wins
     * two. Under row-counting the cheapest product took it 7–2. Under signal
     * counting the better product takes it 2–1.
     */
    it("no longer lets price outvote every quality signal combined", () => {
        const sections = [
            section("price", [
                row({ id: "price", winners: [0], signal: "price" }),
                row({ id: "lowest", winners: [0], signal: "price" }),
            ]),
            section("stores", [
                row({ id: "store-A", winners: [0], signal: "price" }),
                row({ id: "store-B", winners: [0], signal: "price" }),
                row({ id: "store-C", winners: [0], signal: "price" }),
                row({ id: "store-D", winners: [0], signal: "price" }),
                row({ id: "store-E", winners: [0], signal: "price" }),
            ]),
            section("ratings", [
                row({ id: "rating", winners: [2] }),
                row({ id: "reviews", winners: [2] }),
            ]),
        ];

        const verdict = buildVerdict(FOUR, sections);

        expect(verdict.wins[0]).toBe(1);
        expect(verdict.wins[2]).toBe(2);
        expect(verdict.bestOverall).toEqual([2]);
    });

    it("ignores rows nobody wins", () => {
        const sections = [
            section("overview", [
                row({ id: "brand", winners: [] }),
                row({ id: "category", winners: [] }),
            ]),
            section("ratings", [row({ id: "rating", winners: [1] })]),
        ];

        expect(buildVerdict(FOUR, sections).comparableSignals).toBe(1);
    });

    it("awards a win to every joint winner of a single row", () => {
        const sections = [section("phys", [row({ id: "phys-Weight", winners: [0, 1, 2] })])];

        expect(buildVerdict(FOUR, sections).wins).toEqual([1, 1, 1, 0]);
    });
});

describe("buildVerdict — honest ties", () => {

    it("reports every product sharing the top score", () => {
        const sections = [
            section("a", [row({ id: "r1", winners: [0] })]),
            section("b", [row({ id: "r2", winners: [1] })]),
        ];

        expect(buildVerdict(FOUR, sections).bestOverall).toEqual([0, 1]);
    });

    /**
     * The positional tie-break, caught the only way it can be: the same draw,
     * with the products supplied in a different order. The old reduction
     * (`count > wins[best]`) returned index 0 both times and so reported a
     * different PRODUCT depending purely on insertion order.
     */
    it("does not let input order decide a drawn verdict", () => {
        const ab = buildVerdict(FOUR, [
            section("a", [row({ id: "r1", winners: [0] })]),
            section("b", [row({ id: "r2", winners: [1] })]),
        ]);
        const ba = buildVerdict(FOUR, [
            section("b", [row({ id: "r2", winners: [1] })]),
            section("a", [row({ id: "r1", winners: [0] })]),
        ]);

        expect(ab.bestOverall).toEqual(ba.bestOverall);
        expect(ab.bestOverall.length).toBeGreaterThan(1);
    });

    it("reports a single winner as a single winner", () => {
        const sections = [
            section("a", [row({ id: "r1", winners: [3] })]),
            section("b", [row({ id: "r2", winners: [3] })]),
            section("c", [row({ id: "r3", winners: [0] })]),
        ];

        expect(buildVerdict(FOUR, sections).bestOverall).toEqual([3]);
    });

    it("reports a four-way draw rather than crowning the first product", () => {
        const verdict = buildVerdict(FOUR, [section("a", [])]);

        expect(verdict.wins).toEqual([0, 0, 0, 0]);
        expect(verdict.bestOverall).toEqual([0, 1, 2, 3]);
    });

    it("ties best value when two products share a rating-per-rupee", () => {
        // 4.0/100 and 8.0/200 are the same ratio.
        const tied = products([
            { price: 100, rating: 4.0 },
            { price: 200, rating: 8.0 },
            { price: 400, rating: 1.0 },
        ]);

        expect(buildVerdict(tied, []).bestValue).toEqual([0, 1]);
    });
});

describe("buildVerdict — wired to the real sections", () => {

    /**
     * The unit tests above hand-build rows, so they cannot prove the `signal`
     * is actually attached where it matters. This one goes through the real
     * `buildSections`, which is what assigns it.
     */
    it("tags every price and store row with the price signal", async () => {
        mockApi({
            "/affiliate/retailers": {
                json: [
                    { id: "amazon", name: "Amazon", status: "NONE" },
                    { id: "croma", name: "Croma", status: "NONE" },
                ],
            },
            "/products/cheap": { json: apiProduct({ slug: "cheap", name: "Cheap", price: 10000, originalPrice: 20000, rating: 4.0 }) },
            "/products/good": { json: apiProduct({ slug: "good", name: "Good", price: 90000, rating: 4.9 }) },
        });

        const loaded = [
            await getProductBySlug("cheap"),
            await getProductBySlug("good"),
        ] as ProductDetail[];

        const sections = buildSections(loaded);

        const priceRows = sections
            .flatMap((s) => s.rows)
            .filter((r) => r.id === "price" || r.id === "lowest" || r.id.startsWith("store-"));

        expect(priceRows.length).toBeGreaterThan(2);
        expect(priceRows.every((r) => r.signal === "price")).toBe(true);

        // The cheaper product wins every one of those rows...
        const priceRowsWonByCheap = priceRows.filter((r) => r.winners.includes(0));
        expect(priceRowsWonByCheap).toHaveLength(priceRows.length);

        // ...and they are worth exactly one vote between them. Under the old
        // row-counting this product's total would have included all four.
        const verdict = buildVerdict(loaded, sections);
        const nonPriceWinsForCheap = sections
            .flatMap((s) => s.rows)
            .filter((r) => r.signal !== "price" && r.winners.includes(0)).length;

        expect(verdict.wins[0]).toBe(nonPriceWinsForCheap + 1);
    });

    it("leaves rating and specification rows unsignalled", async () => {
        mockApi({
            "/affiliate/retailers": { json: [{ id: "amazon", name: "Amazon", status: "NONE" }] },
            "/products/a": { json: apiProduct({ slug: "a", name: "A", price: 10000, rating: 4.1 }) },
            "/products/b": { json: apiProduct({ slug: "b", name: "B", price: 20000, rating: 4.8 }) },
        });

        const loaded = [
            await getProductBySlug("a"),
            await getProductBySlug("b"),
        ] as ProductDetail[];

        const nonPrice = buildSections(loaded)
            .flatMap((s) => s.rows)
            .filter((r) => r.id !== "price" && r.id !== "lowest" && !r.id.startsWith("store-"));

        expect(nonPrice.length).toBeGreaterThan(0);
        expect(nonPrice.every((r) => r.signal === undefined)).toBe(true);
    });
});
