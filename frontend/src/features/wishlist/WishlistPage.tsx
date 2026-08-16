import WishlistEmpty from "./components/WishlistEmpty";
import WishlistError from "./components/WishlistError";
import WishlistGrid from "./components/WishlistGrid";
import WishlistSkeleton from "./components/WishlistSkeleton";
import WishlistToolbar from "./components/WishlistToolbar";

import { useWishlist } from "./hooks/useWishlist";
import { useWishlistSelection } from "./hooks/useWishlistSelection";

/**
 * Wishlist.
 *
 * MainLayout owns the `<main>` landmark and the width container, so this page
 * only adds its own vertical rhythm — the same contract Search, Product Details
 * and Compare follow.
 *
 * All wishlist logic lives in `useWishlist` and the provider; this component
 * only picks which state to render.
 */
export default function WishlistPage() {
    const {
        slugs,
        clear,
        error: selectionError,
        retry: retrySelection,
    } = useWishlistSelection();
    const { products, suggestions, status, error, retry, sort, setSort } =
        useWishlist();

    if (status === "loading") {
        return <WishlistSkeleton count={slugs.length} />;
    }

    /*
     * Two error sources now, and they fail at different layers.
     *
     * `useWishlist`'s error means the saved slugs could not be resolved into
     * products. The selection's error is new in Chapter 23.5 and means the
     * wishlist itself could not be read from or written to the server — which,
     * since the selection is what the resolution reads, is the more fundamental
     * of the two and the one worth showing first.
     *
     * Checked before `status`, because a selection that failed to load reports
     * `status === "empty"`: there are no slugs, so there is nothing to resolve
     * and nothing went wrong downstream. Rendering the empty state there would
     * tell a user whose request had just failed that they have saved nothing —
     * confidently, and wrongly.
     */
    if (selectionError) {
        return (
            <WishlistError
                message={selectionError}
                onRetry={retrySelection}
                onClear={clear}
            />
        );
    }

    if (status === "error") {
        return (
            <WishlistError message={error} onRetry={retry} onClear={clear} />
        );
    }

    if (status === "empty") {
        return <WishlistEmpty suggestions={suggestions} />;
    }

    return (
        <div className="space-y-6">

            <header>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Your wishlist
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                    Everything you've saved, ready to revisit or line up
                    side-by-side in a comparison.
                </p>
            </header>

            <WishlistToolbar
                count={products.length}
                sort={sort}
                onSortChange={setSort}
                onClear={clear}
            />

            <WishlistGrid products={products} />

        </div>
    );
}
