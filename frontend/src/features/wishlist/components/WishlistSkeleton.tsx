import Skeleton from "../../../components/ui/Skeleton";

interface WishlistSkeletonProps {
    /** Card count from the saved selection, so the shape matches what loads. */
    count: number;
}

/**
 * Loading placeholder.
 *
 * Sized from the selection that is already known and mirroring the real card
 * proportions and column ramp, so the grid does not reflow when the products
 * arrive.
 */
export default function WishlistSkeleton({ count }: WishlistSkeletonProps) {
    const cards = Math.max(1, Math.min(count, 8));

    return (
        <div
            aria-busy="true"
            aria-live="polite"
            aria-label="Loading wishlist"
            className="space-y-6"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Skeleton className="h-4 w-36" rounded="sm" />
                <Skeleton className="h-10 w-48" />
            </div>

            <ul className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
                {Array.from({ length: cards }).map((_, index) => (
                    <li key={index}>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <Skeleton className="h-40 w-full sm:h-48" rounded="sm" />

                            <div className="space-y-3 p-4">
                                <Skeleton className="h-3 w-16" rounded="sm" />
                                <Skeleton className="h-4 w-full" rounded="sm" />
                                <Skeleton className="h-4 w-2/3" rounded="sm" />
                                <Skeleton className="h-5 w-24" rounded="sm" />
                                <Skeleton className="h-9 w-full" rounded="full" />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
