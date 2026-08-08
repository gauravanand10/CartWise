import Skeleton from "../../../../components/ui/Skeleton";

/**
 * Loading placeholder.
 *
 * Mirrors the real layout — square gallery, four thumbnails, title block,
 * pricing card, three action buttons — so the page does not jump when the
 * content lands. A generic spinner would tell the user nothing about what is
 * coming.
 */
export default function ProductSkeleton() {
    return (
        <div
            aria-busy="true"
            aria-live="polite"
            aria-label="Loading product"
            className="space-y-8"
        >
            <Skeleton className="h-4 w-64" rounded="sm" />

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 xl:gap-14">

                <div className="space-y-3 sm:space-y-4">
                    <Skeleton className="aspect-square w-full" rounded="lg" />

                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="aspect-square w-full" />
                        ))}
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="space-y-3">
                        <Skeleton className="h-3 w-32" rounded="sm" />
                        <Skeleton className="h-9 w-4/5" rounded="sm" />
                        <Skeleton className="h-4 w-full" rounded="sm" />
                        <Skeleton className="h-4 w-2/3" rounded="sm" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-7 w-24" rounded="full" />
                        ))}
                    </div>

                    <Skeleton className="h-44 w-full" rounded="lg" />

                    <div className="flex flex-wrap gap-2.5">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-11 min-w-[7rem] flex-1"
                                rounded="full"
                            />
                        ))}
                    </div>
                </div>

            </div>

            {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" rounded="lg" />
            ))}
        </div>
    );
}
