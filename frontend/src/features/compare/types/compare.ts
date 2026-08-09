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

/** The overall recommendation drawn from the resolved comparison. */
export interface CompareVerdict {
    /** Index of the product winning the most comparable rows. */
    bestOverall: number;
    /** Index of the cheapest product with the highest AI score per rupee. */
    bestValue: number;
    /** Row wins per product, by index. */
    wins: number[];
    comparableRows: number;
}

/** What the Compare page should render right now. */
export type CompareStatus = "empty" | "loading" | "error" | "ready";

/** Outcome of trying to add a product to the comparison. */
export type AddResult = "added" | "duplicate" | "full";
