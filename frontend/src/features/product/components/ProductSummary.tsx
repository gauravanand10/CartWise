import { CheckCircle2, PackageX, Sparkles, Star } from "lucide-react";

import { formatCount } from "../../../lib/currency";
import { stockLabel } from "../utils/pricing";
import type { ProductDetail } from "../types/product";

interface ProductSummaryProps {
    product: ProductDetail;
}

/**
 * Identity block at the top of the hero: who made it, what it is, how it is
 * rated and whether it can actually be bought right now.
 *
 * Availability sits here rather than beside the price because "can I have it"
 * is the question a shopper asks before "how much" — burying it under the
 * pricing card is how stores end up with abandoned carts.
 */
export default function ProductSummary({ product }: ProductSummaryProps) {
    const lowStock = product.inStock && product.stockCount <= 5;

    return (
        <div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                    {product.brand}
                </span>

                <span aria-hidden="true" className="text-slate-300">
                    •
                </span>

                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {product.category}
                </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                {product.name}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {product.tagline}
            </p>

            {/* Rating, AI score, availability */}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5">

                <span className="inline-flex items-center gap-1.5 text-sm">
                    <Star
                        size={15}
                        className="fill-amber-400 text-amber-400"
                        aria-hidden="true"
                    />
                    <span className="font-semibold text-slate-900">
                        {product.rating}
                    </span>
                    {/* `-my-1 py-1` for a 28px tap target without changing the
                        row's visual height. */}
                    <a
                        href="#reviews"
                        className="-my-1 inline-block rounded py-1 text-slate-500 underline-offset-2 transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        {formatCount(product.reviewCount)} reviews
                    </a>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    <Sparkles size={12} aria-hidden="true" />
                    AI score {product.ai.score}
                </span>

                {product.inStock ? (
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${lowStock
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                            }`}
                    >
                        <CheckCircle2 size={12} aria-hidden="true" />
                        {stockLabel(product.stockCount)}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        <PackageX size={12} aria-hidden="true" />
                        Out of stock
                    </span>
                )}

            </div>

            {/* Tags */}

            {product.tags.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                        <li
                            key={tag}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                        >
                            {tag}
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
}
