import type { LucideIcon } from "lucide-react";

import type { ProductDetail } from "../../product/types/product";

/**
 * Product Comparison domain model.
 *
 * Products are addressed by slug — the same identity Product Details uses — so
 * a comparison is fully described by a list of slugs and can be persisted,
 * shared or restored without carrying product data around.
 *
 * Deliberately N-product rather than the previous left/right pair: a two-slot
 * model cannot express three or four columns, and the winner of a row has to be
 * "which of these products", not "left or right".
 */

/** Which direction is better for a numeric row. */
export type BetterDirection = "higher" | "lower";

/** One comparable attribute, declared once and applied to every product. */
export interface RowConfig {
    id: string;
    label: string;
    /** Human-readable value for a product. Empty string renders as "—". */
    value: (product: ProductDetail) => string;
    /**
     * Normalised number used to pick a winner. Return `undefined` when the
     * attribute is not comparable for this product.
     */
    metric?: (product: ProductDetail) => number | undefined;
    better?: BetterDirection;
    /** Renders the value in a stronger style, e.g. the headline price. */
    emphasis?: boolean;
}

/**
 * A comparison section.
 *
 * Either declares its rows explicitly, or derives them from the product's own
 * specification groups — the latter means a new spec row added in Chapter 11
 * shows up in the comparison automatically instead of having to be re-declared
 * here.
 */
export interface SectionConfig {
    id: string;
    title: string;
    icon: LucideIcon;
    description?: string;
    rows?: RowConfig[];
    /** Spec group ids to derive rows from, in order. */
    specGroups?: string[];
    /** Labels to leave out of derived rows, because another section owns them. */
    exclude?: string[];
    /** Collapsed on first render. Long spec sections default to this. */
    collapsed?: boolean;
}

/** A row resolved against the products currently being compared. */
export interface ResolvedRow {
    id: string;
    label: string;
    values: string[];
    emphasis: boolean;
    /** Indices of the winning products. Empty when there is no winner. */
    winners: number[];
    /** True when the products do not all share the same value. */
    differs: boolean;
    /**
     * Which underlying quantity this row measures, when it shares one with other
     * rows. Rows carrying the same signal cast ONE vote between them in
     * `buildVerdict` — see the long note there.
     *
     * Undefined means the row is its own independent signal, which is the case
     * for every specification and both rating rows.
     */
    signal?: string;
}

export interface ResolvedSection {
    id: string;
    title: string;
    icon: LucideIcon;
    description?: string;
    collapsed: boolean;
    rows: ResolvedRow[];
    /** How many rows in this section actually differ. */
    differenceCount: number;
}

/**
 * The overall recommendation drawn from the resolved comparison.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 29 — BOTH VERDICTS ARE NOW ARRAYS, AND THAT IS THE POINT.
 *
 * They were single indices, which made a genuine tie unrepresentable: the old
 * `bestOverall` was computed with `count > wins[best]` scanning left to right,
 * so when two products drew, the one the user happened to add to the comparison
 * FIRST silently took the crown and the UI presented it as a decisive result.
 * Chapter 28's sweep measured 447 of 12,605 four-product comparisons in exactly
 * that state — 3.5% of verdicts were a coin flip wearing a certainty.
 *
 * An array cannot hide that. One entry is a winner; more than one is a tie, and
 * the card is obliged to say so.
 * ---------------------------------------------------------------------------
 */
export interface CompareVerdict {
    /**
     * Indices of the product(s) winning the most comparable signals.
     * Length > 1 is a genuine tie and must be rendered as one.
     */
    bestOverall: number[];
    /**
     * Indices of the product(s) with the best customer rating per rupee.
     * Length > 1 is a genuine tie.
     */
    bestValue: number[];
    /** Signal wins per product, by index. */
    wins: number[];
    /**
     * How many independent signals were comparable.
     *
     * Renamed from `comparableRows` in Chapter 29 because it is no longer a row
     * count: the seven rows that all restate the product's price now contribute
     * one signal between them, so rows and signals are different numbers and
     * calling this "rows" would overstate what the verdict weighed.
     */
    comparableSignals: number;
}

/** What the Compare page should render right now. */
export type CompareStatus = "empty" | "loading" | "error" | "ready";

/** Outcome of trying to add a product to the comparison. */
export type AddResult = "added" | "duplicate" | "full";
