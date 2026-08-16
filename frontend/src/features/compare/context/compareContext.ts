import { createContext } from "react";

import type { AddResult } from "../types/compare";

export interface CompareSelection {
    /** Slugs currently in the comparison, in column order. */
    slugs: string[];
    count: number;
    isFull: boolean;

    /**
     * Why the last load or write failed, or `""` when nothing has.
     *
     * Chapter 23.5, for the same reason the wishlist gained one: a localStorage
     * write either happened or the page was already broken, where a request has
     * a third outcome. `ComparePage` renders the existing `CompareError` from
     * this.
     *
     * Note what does NOT arrive here: a full comparison. That is an ordinary
     * outcome reported through `add`'s `"full"` result, not a failure — the
     * distinction matters because one wants a red error panel and the other
     * wants the picker to stay open.
     */
    error: string;

    /** Re-runs the load after a failure. Wired to `CompareError`'s "Try again". */
    retry: () => void;

    /*
     * The mutators return Promises as of Chapter 23.5. Same names, same
     * arguments, same result *values* — `add` still resolves to one of the three
     * `AddResult` members and `toggle` to those plus `"removed"`. Only the
     * wrapper changed, because the answer is no longer knowable synchronously.
     */

    /** Adds a product, reporting why if it could not be added. */
    add: (slug: string) => Promise<AddResult>;
    remove: (slug: string) => Promise<void>;
    /** Adds if absent, removes if present. Resolves with what happened. */
    toggle: (slug: string) => Promise<AddResult | "removed">;
    clear: () => Promise<void>;
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
