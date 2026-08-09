import { Heart, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "../../../components/ui/ProductCard";
import type { ProductCardModel } from "../../product/types/product";

interface WishlistEmptyProps {
    suggestions: ProductCardModel[];
}

/**
 * Nothing saved — or everything removed.
 *
 * Offers products rather than only explaining the feature: the fastest way out
 * of an empty wishlist is a list the user can save from without leaving the
 * page. The tiles are the shared `ProductCard`, so their hearts are the same
 * control as everywhere else and saving one moves this page straight into its
 * populated state.
 */
export default function WishlistEmpty({ suggestions }: WishlistEmptyProps) {
    return (
        <div className="space-y-8">

            <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center sm:rounded-[24px] sm:py-20">

                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                    <Heart size={26} strokeWidth={1.5} aria-hidden="true" />
                </span>

                <h1 className="mt-6 text-lg font-semibold text-slate-900 sm:text-xl">
                    Nothing saved yet
                </h1>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    Tap the heart on any product and it will appear here, ready
                    to revisit, compare or buy when the price is right.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                    <Link
                        to="/search"
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        <Search size={15} aria-hidden="true" />
                        Browse all products
                    </Link>

                    <Link
                        to="/"
                        className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        Go to homepage
                    </Link>
                </div>

            </section>

            {suggestions.length > 0 && (
                <section
                    aria-labelledby="wishlist-suggestions"
                    className="rounded-2xl border border-slate-200 bg-white p-5 sm:rounded-[24px] sm:p-6 lg:p-8"
                >
                    <h2
                        id="wishlist-suggestions"
                        className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
                    >
                        <Sparkles size={17} className="text-violet-600" aria-hidden="true" />
                        Popular right now
                    </h2>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Save one with the heart to start your wishlist.
                    </p>

                    <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {suggestions.map((product) => (
                            <li key={product.slug} className="h-full">
                                <ProductCard product={product} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

        </div>
    );
}
