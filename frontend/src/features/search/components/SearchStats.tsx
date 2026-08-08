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
            label: query.trim() ? `Matches for "${query.trim()}"` : "Products",
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
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Icon size={16} aria-hidden="true" />
                        </span>

                        <div className="min-w-0">
                            <dt className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                {stat.label}
                            </dt>
                            <dd className="truncate text-sm font-semibold text-slate-900">
                                {stat.value}
                            </dd>
                        </div>
                    </div>
                );
            })}
        </dl>
    );
}
