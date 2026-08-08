import { Search } from "lucide-react";

import { trendingSearches } from "../data/trending";

interface EmptyStateProps {
    onPickSuggestion: (value: string) => void;
}

/**
 * Shown when there is nothing to search over at all — no query, no filters and
 * an empty catalogue.
 *
 * In normal operation the page browses the full catalogue instead of showing
 * this, so it's the honest fallback for a catalogue that failed to populate
 * rather than a screen users hit on the way in.
 */
export default function EmptyState({ onPickSuggestion }: EmptyStateProps) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center sm:py-20">

            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Search size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>

            <h2 className="mt-6 text-lg font-semibold text-slate-900 sm:text-xl">
                Start your search
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Search across every major store at once, or start from one of
                the popular queries below.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
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

        </section>
    );
}
