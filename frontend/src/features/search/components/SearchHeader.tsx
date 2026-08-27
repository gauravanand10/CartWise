import type { ReactNode } from "react";

import { STORES } from "../../product/constants";

interface SearchHeaderProps {
    /** The search bar. Slotted in so the header stays presentational. */
    children: ReactNode;
}

/**
 * Page hero.
 *
 * Holds the search bar because search is the page's whole purpose — putting it
 * anywhere below the fold would bury the primary control.
 *
 * ===========================================================================
 * CHAPTER 29 — THE LAST UNRECONSTRUCTED HERO, AND A FALSE COUNT ON IT.
 *
 * This was the one surface Chapters 26–28 never reached. It carried, verbatim:
 *
 *   - `bg-gradient-to-br from-fuchsia-600 via-purple-700 to-violet-700` with
 *     `shadow-2xl` and two blurred decorative "blooms" — the exact
 *     fast-fashion hero treatment Chapter 27 deleted from `ui/HeroBanner.tsx`,
 *     surviving here because that file was dead and this one is routed.
 *   - `font-black` on the h1, against a design system whose whole typographic
 *     argument is weight contrast at 700.
 *   - **"Compared across 9 stores"** — a specific number with nothing behind
 *     it. CartWise compares FIVE. The homepage said "nine retailers" until
 *     Chapter 27 fixed it and the footer said seven until Chapter 27 derived it
 *     from `STORES`; this was the third copy of the same invented figure and
 *     the only one left.
 *   - "across every major retailer", which is the same overclaim in words
 *     rather than digits.
 *
 * The count is now derived from `STORES` — the same array the footer, the
 * product page's offer rows and the comparison table all read — so it cannot
 * drift again without the comparison itself changing. The gradient, the blooms
 * and the shadow are gone; the hero is the page ground with a rule under it,
 * and the search field is the only thing on it with any weight, which is what
 * a search page's hero is for.
 * ===========================================================================
 */
export default function SearchHeader({ children }: SearchHeaderProps) {
    const retailerCount = STORES.length;

    return (
        // No `overflow-hidden`: it would clip the search dropdown, which has to
        // escape the hero's bottom edge.
        <section className="border-b border-line pb-10 pt-2 sm:pb-12">

            <div className="mx-auto max-w-3xl text-center">

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    Compared across {retailerCount} retailers
                </p>

                <h1 className="mt-4 text-[34px] leading-[1.08] text-ink sm:text-5xl">
                    Find the best price
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted sm:text-base">
                    Search once and compare specifications, ratings and
                    reference prices side by side. Prices shown are reference
                    values, not live quotes.
                </p>

                {/* The dropdown overlays content below, so this wrapper owns a
                    stacking context above everything after it. */}
                <div className="relative z-20 mt-8 text-left">
                    {children}
                </div>

            </div>

        </section>
    );
}
