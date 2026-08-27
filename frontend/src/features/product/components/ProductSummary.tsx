import { CheckCircle2, PackageX, Star } from "lucide-react";

import { formatCount } from "../../../lib/currency";
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
                    {/*
                        Chapter 26.5: this was `<a href="#reviews">`, jumping to
                        the review section further down the page. That section
                        is gone, so the link had nowhere to land — a control
                        that looks clickable and does nothing. It is plain text
                        now.

                        The count itself stays because it is a real column
                        (`products.review_count`) rather than a tally of reviews
                        CartWise holds — which is exactly why it must not look
                        like a link to them. The wording says "ratings", not
                        "reviews", for the same reason.
                    */}
                    <span className="text-slate-500">
                        {formatCount(product.reviewCount)} ratings
                    </span>
                </span>

                {/*
                    Chapter 26.5 removed the "AI score 96" chip that stood here.
                    No model produced the number — it was a literal in a
                    hand-written catalogue file — and rendering an invented
                    figure beside a sparkles icon is the most confident-looking
                    way to state something untrue. Nothing replaces it: the
                    rating and rating count to the left are the real signal.
                */}

                {/*
                    "Only 3 left!" is gone with `stockCount`. CartWise holds no
                    inventory and receives no stock feed, so a unit count was a
                    false claim about a retailer's warehouse — and an urgency
                    cue, which makes inventing it worse than careless. The
                    boolean below is what the database actually stores.
                */}
                {product.inStock ? (
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                    >
                        <CheckCircle2 size={12} aria-hidden="true" />
                        In stock
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
