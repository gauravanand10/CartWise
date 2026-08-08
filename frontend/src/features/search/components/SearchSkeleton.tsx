import { PRODUCTS_PER_PAGE } from "../constants";

/**
 * Loading placeholder.
 *
 * Mirrors the result grid's column ramp and card proportions so the layout
 * doesn't jump when real results replace it.
 */
export default function SearchSkeleton() {
    return (
        <div
            className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5"
            aria-busy="true"
            aria-live="polite"
            aria-label="Loading results"
        >
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                    <div className="h-40 animate-pulse bg-slate-200 sm:h-48" />

                    <div className="space-y-3 p-4">
                        <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                        <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                        <div className="h-9 w-full animate-pulse rounded-full bg-slate-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}
