import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "../../../components/ui/ProductCard";
import { MAX_COMPARE, MIN_COMPARE } from "../constants";
import type { ProductCardModel } from "../../product/types/product";

interface CompareEmptyProps {
    suggestions: ProductCardModel[];
}

/**
 * Nothing selected — or everything removed.
 *
 * Offers products to compare rather than just explaining the feature: the user
 * arrived wanting to compare something, so the fastest route out of this state
 * is a list they can add from. The cards are the shared `ProductCard`, so they
 * carry the same compare button as everywhere else in the app.
 */
export default function CompareEmpty({ suggestions }: CompareEmptyProps) {
    return (
        <div className="space-y-8">

            <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center sm:rounded-[24px] sm:py-20">

                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Scale size={26} strokeWidth={1.5} aria-hidden="true" />
                </span>

                <h1 className="mt-6 text-lg font-semibold text-slate-900 sm:text-xl">
                    Nothing to compare yet
                </h1>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    Add {MIN_COMPARE} to {MAX_COMPARE} products and CartWise will
                    line up their specifications, prices and store offers
                    side-by-side, then tell you which one wins and why.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                    <Link
                        to="/search"
                        className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
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
                    aria-labelledby="compare-suggestions"
                    className="rounded-2xl border border-slate-200 bg-white p-5 sm:rounded-[24px] sm:p-6 lg:p-8"
                >
                    <h2
                        id="compare-suggestions"
                        className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
                    >
                        Popular products to compare
                    </h2>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Use the scales icon on any card to add it to the
                        comparison.
                    </p>

                    <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {suggestions.slice(0, 4).map((product) => (
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
