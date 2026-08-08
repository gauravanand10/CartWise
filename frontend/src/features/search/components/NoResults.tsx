import { SearchX } from "lucide-react";

import { trendingSearches } from "../data/trending";

interface NoResultsProps {
    query: string;
    activeFilterCount: number;
    onClearFilters: () => void;
    onResetSearch: () => void;
    onPickSuggestion: (value: string) => void;
}

/**
 * Shown when a query or filter combination matches nothing.
 *
 * Distinct from EmptyState: here the user *did* search, so the job is to
 * explain why there's nothing and offer the most likely fix. When filters are
 * active they're the usual culprit, so clearing them is the primary action.
 */
export default function NoResults({
    query,
    activeFilterCount,
    onClearFilters,
    onResetSearch,
    onPickSuggestion,
}: NoResultsProps) {
    const trimmed = query.trim();

    return (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center sm:py-20">

            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <SearchX size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>

            <h2 className="mt-6 text-lg font-semibold text-slate-900 sm:text-xl">
                No products found
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                {trimmed
                    ? <>Nothing matched <span className="font-medium text-slate-700">“{trimmed}”</span>{activeFilterCount > 0 ? " with the filters you've applied." : "."}</>
                    : "No products match the filters you've applied."}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                {activeFilterCount > 0 && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
                    </button>
                )}

                <button
                    type="button"
                    onClick={onResetSearch}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    Reset search
                </button>
            </div>

            <div className="mt-9 border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Try one of these
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {trendingSearches.map((term) => (
                        <button
                            key={term}
                            type="button"
                            onClick={() => onPickSuggestion(term)}
                            className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </div>

        </section>
    );
}
