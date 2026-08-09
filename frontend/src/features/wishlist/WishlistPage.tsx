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
    const { slugs, clear } = useWishlistSelection();
    const { products, suggestions, status, error, retry, sort, setSort } =
        useWishlist();

    if (status === "loading") {
        return <WishlistSkeleton count={slugs.length} />;
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
