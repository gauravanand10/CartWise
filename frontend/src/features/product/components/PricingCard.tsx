import { BadgeIndianRupee, Store } from "lucide-react";

// `discountPercent` was imported here for the "N% off" pill Chapter 28 removed.
//
// This was its last call site in the application — Chapter 27 took it out of
// ProductCard and this chapter took it out of the comparison table, so the
// helper is now exported from lib/currency.ts with nothing importing it. It is
// deliberately kept rather than deleted: it is a pure two-line function whose
// only interesting property is the null-guard that returns 0 instead of a
// negative, and pruning library utilities is not what this chapter is for.
// Recorded here so the next reader knows it is unreferenced by design.
import { formatPrice } from "../../../lib/currency";
import type { ProductDetail } from "../types/product";

interface PricingCardProps {
    product: ProductDetail;
}

/**
 * Price and saving.
 *
 * Every number here is derived from the same store offers the comparison
 * section below renders, so the "lowest price" badge and the store list can
 * never contradict each other. Chapter 26.5 removed the EMI and delivery rows
 * that used to follow them — see the block comment further down.
 */
export default function PricingCard({ product }: PricingCardProps) {
    const saving = (product.originalPrice ?? product.price) - product.price;

    const isLowest = product.lowestPrice >= product.price;
    const cheapestStore = product.stores.reduce((best, store) =>
        store.price < best.price ? store : best,
    );

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:rounded-[20px] sm:p-5">

            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    {formatPrice(product.price)}
                </span>

                {product.originalPrice && (
                    <span className="pb-1 text-sm text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                    </span>
                )}

                {/*
                    Chapter 28 removed the "N% off" pill that stood here — a
                    `bg-emerald-600` chip in bold white, directly beside the
                    price.

                    Chapter 27 took the identical pill off every product card in
                    the application and left this one because the product page
                    was outside that chapter's stated scope, which meant the
                    grid was calm and the page a shopper actually decides on
                    still shouted. The two numbers the percentage is computed
                    from are both printed on the line above it, so removing it
                    withholds nothing.
                */}
            </div>

            {saving > 0 && (
                <p className="mt-1 text-sm font-medium text-emerald-700">
                    You save {formatPrice(saving)}
                </p>
            )}

            {isLowest && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <BadgeIndianRupee size={13} aria-hidden="true" />
                    Lowest reference price of {product.stores.length} stores —{" "}
                    {cheapestStore.name}
                </p>
            )}

            {/*
                =================================================================
                CHAPTER 26.5 — TWO CLAIMS OUT, ONE STATEMENT IN

                This block used to be a `<dl>` with two rows:

                  "No-cost EMI"     "₹10,834/month for 12 months", computed as
                                    price ÷ 12. CartWise is not a lender, has no
                                    lending partner, and arranges no credit. The
                                    tenure was a constant named EMI_MONTHS.

                  "Free delivery"   "Get it by Thursday, 23 Aug", computed as
                                    today + 2 days, with "delivery charges
                                    apply" below ₹500. CartWise ships nothing,
                                    takes no orders, and does not know where the
                                    shopper lives.

                Both sat directly under the price, in the position a checkout
                page uses for terms of sale — which is exactly what a reader
                would take them for. They are a sharper version of the problem
                the fabricated homepage sections had: not a soft claim about a
                product, but a specific commercial term, stated in rupees and
                dates, on behalf of a transaction CartWise is not part of.

                What replaces them is the true statement, and no number. The
                shopper does have to know something about delivery and payment
                before clicking through, and the honest thing to tell them is
                who actually decides it.
                =================================================================
            */}
            <div className="mt-4 flex items-start gap-2.5 border-t border-slate-200 pt-4">
                <Store
                    size={16}
                    className="mt-0.5 shrink-0 text-slate-400"
                    aria-hidden="true"
                />

                <p className="min-w-0 text-sm leading-relaxed text-slate-500">
                    Delivery, payment and financing terms are set by the
                    retailer, not by CartWise. Check them on the store's own
                    page before you buy.
                </p>
            </div>

        </div>
    );
}
