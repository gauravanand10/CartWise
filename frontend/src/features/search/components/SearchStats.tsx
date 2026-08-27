import { IndianRupee, Package, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatPrice } from "../utils/searchUtils";
import type { SearchProduct } from "../types/search";

interface SearchStatsProps {
    results: SearchProduct[];
    query: string;
}

interface Stat {
    icon: LucideIcon;
    label: string;
    value: string;
}

/**
 * Live summary of the current result set.
 *
 * Deliberately derived from `results` rather than the catalogue: after
 * filtering, "what am I actually looking at" is the useful question, and a
 * static product count would answer a different one.
 */
export default function SearchStats({ results, query }: SearchStatsProps) {
    if (results.length === 0) return null;

    const prices = results.map((p) => p.price);
    const lowest = Math.min(...prices);
    const highest = Math.max(...prices);

    const averageRating =
        results.reduce((sum, p) => sum + p.rating, 0) / results.length;

    const stats: Stat[] = [
        {
            icon: Package,
            /*
             * Chapter 29: the no-query label was "Products", which read as a
             * statement about the catalogue. It is not — this page searches a
             * 20-product local file while the catalogue holds 100, so "Products
             * 20" told the reader the shop was a fifth of its real size.
             * "Results shown" describes what it actually counts. The 80
             * missing products are a separate, larger problem; see the note in
             * services/searchService.ts.
             */
            label: query.trim() ? `Matches for "${query.trim()}"` : "Results shown",
            value: String(results.length),
        },
        {
            icon: IndianRupee,
            label: "Price range",
            value:
                lowest === highest
                    ? formatPrice(lowest)
                    : `${formatPrice(lowest)} – ${formatPrice(highest)}`,
        },
        {
            icon: Star,
            label: "Average rating",
            value: averageRating.toFixed(1),
        },
    ];

    return (
        <dl className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <div
                        key={stat.label}
                        data-numeric
                        className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sunken text-ink-subtle">
                            <Icon size={16} aria-hidden="true" />
                        </span>

                        <div className="min-w-0">
                            <dt className="truncate text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                                {stat.label}
                            </dt>
                            <dd className="truncate text-sm font-semibold text-ink">
                                {stat.value}
                            </dd>
                        </div>
                    </div>
                );
            })}
        </dl>
    );
}
