import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface SearchHeaderProps {
    /** The search bar. Slotted in so the header stays presentational. */
    children: ReactNode;
}

/**
 * Page hero.
 *
 * Holds the search bar because search is the page's whole purpose — putting it
 * anywhere below the fold would bury the primary control. The old hard-coded
 * "20 products / 50ms / 100% responsive" tiles are gone; SearchStats now
 * reports that kind of information from the live result set instead.
 */
export default function SearchHeader({ children }: SearchHeaderProps) {
    return (
        // No `overflow-hidden` on the section itself: it would clip the search
        // dropdown, which has to escape the hero's bottom edge. The decorative
        // blooms get their own clipping layer instead.
        <section className="relative rounded-[24px] bg-gradient-to-br from-fuchsia-600 via-purple-700 to-violet-700 px-6 py-10 text-white shadow-2xl sm:rounded-[32px] sm:px-10 sm:py-12 lg:px-12">

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px] sm:rounded-[32px]"
            >
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto max-w-3xl text-center">

                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur sm:text-sm">
                    <Sparkles size={14} aria-hidden="true" />
                    Compared across 9 stores
                </span>

                <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    Find the best price
                </h1>

                <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-fuchsia-100 sm:text-base">
                    Search once and compare specifications, ratings and
                    reference prices across every major retailer.
                </p>

                {/* The dropdown overlays content below, so this wrapper owns a
                    stacking context above the hero's decorative blooms. */}
                <div className="relative z-20 mt-7 text-left">
                    {children}
                </div>

            </div>

        </section>
    );
}
