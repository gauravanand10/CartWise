import Skeleton from "../../../components/ui/Skeleton";

interface CompareSkeletonProps {
    /** Column count from the saved selection, so the shape matches what loads. */
    columns: number;
}

/**
 * Loading placeholder.
 *
 * Sized from the selection that is already known, so it renders the right number
 * of columns and the grid does not reflow when the products arrive.
 */
export default function CompareSkeleton({ columns }: CompareSkeletonProps) {
    const safeColumns = Math.max(2, Math.min(columns, 4));

    return (
        <div
            aria-busy="true"
            aria-live="polite"
            aria-label="Loading comparison"
            className="space-y-6"
        >
            <Skeleton className="h-5 w-72" rounded="sm" />

            <Skeleton className="h-36 w-full" rounded="lg" />

            <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="flex gap-3 p-4">
                    <div className="hidden w-40 shrink-0 sm:block" />

                    {Array.from({ length: safeColumns }).map((_, index) => (
                        <div key={index} className="flex-1 space-y-2.5">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-3 w-16" rounded="sm" />
                            <Skeleton className="h-4 w-full" rounded="sm" />
                            <Skeleton className="h-5 w-20" rounded="sm" />
                        </div>
                    ))}
                </div>

                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex gap-3 border-t border-slate-100 px-4 py-3.5"
                    >
                        <Skeleton className="h-4 w-28 shrink-0" rounded="sm" />

                        {Array.from({ length: safeColumns }).map((__, cell) => (
                            <Skeleton key={cell} className="h-4 flex-1" rounded="sm" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
