import { PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "../../../../components/ui/ProductCard";
import type { ProductCardModel } from "../../types/product";

interface ProductNotFoundProps {
    slug: string;
    /** Popular products, so the page is a fork in the road rather than a wall. */
    suggestions: ProductCardModel[];
}

/**
 * The slug does not match any product.
 *
 * Deliberately not the generic 404: the user asked for a *product*, so the
 * recovery path is other products, not the home page. Retrying is pointless
 * here — the URL will never resolve — so no retry button is offered.
 */
export default function ProductNotFound({
    slug,
    suggestions,
}: ProductNotFoundProps) {
    return (
        <div className="space-y-8">

            <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center sm:py-20">

                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <PackageSearch size={26} strokeWidth={1.5} aria-hidden="true" />
                </span>

                <h1 className="mt-6 text-lg font-semibold text-slate-900 sm:text-xl">
                    Product not found
                </h1>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    We don't have a product at{" "}
                    <span className="break-all font-medium text-slate-700">
                        /product/{slug}
                    </span>
                    . It may have been delisted, or the link may be mistyped.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                    <Link
                        to="/search"
                        className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        Search all products
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
                    aria-labelledby="not-found-suggestions"
                    className="rounded-2xl border border-slate-200 bg-white p-5 sm:rounded-[24px] sm:p-6 lg:p-8"
                >
                    <h2
                        id="not-found-suggestions"
                        className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
                    >
                        Popular right now
                    </h2>

                    <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {suggestions.map((item) => (
                            <li key={item.slug} className="h-full">
                                <ProductCard product={item} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

        </div>
    );
}
