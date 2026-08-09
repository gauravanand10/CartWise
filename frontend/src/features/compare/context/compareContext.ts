import { createContext } from "react";

import type { AddResult } from "../types/compare";

export interface CompareSelection {
    /** Slugs currently in the comparison, in the order they were added. */
    slugs: string[];
    count: number;
    isFull: boolean;
    /** Adds a product, reporting why if it could not be added. */
    add: (slug: string) => AddResult;
    remove: (slug: string) => void;
    /** Adds if absent, removes if present. Returns what happened. */
    toggle: (slug: string) => AddResult | "removed";
    clear: () => void;
    isComparing: (slug: string) => boolean;
}

/**
 * Selection state, shared app-wide.
 *
 * Context rather than a prop chain because the consumers are deliberately far
 * apart — the navbar badge, product cards in three different features, the
 * Product Details actions and the Compare page all read or write the same list.
 *
 * `null` default so `useCompareSelection` can fail loudly when the provider is
 * missing, instead of silently no-opping every "Add to compare" click.
 */
export const CompareContext = createContext<CompareSelection | null>(null);
