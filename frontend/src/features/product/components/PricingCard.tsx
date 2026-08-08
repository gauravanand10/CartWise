import { BadgeIndianRupee, CreditCard, Truck } from "lucide-react";

import { discountPercent, formatPrice } from "../../../lib/currency";
import { deliveryEstimate, emiLabel, hasFreeDelivery } from "../utils/pricing";
import type { ProductDetail } from "../types/product";

interface PricingCardProps {
    product: ProductDetail;
}

/**
 * Price, saving, EMI and delivery.
 *
 * Every number here is derived from the same store offers the comparison
 * section below renders, so the "lowest price" badge and the store list can
 * never contradict each other.
 */
export default function PricingCard({ product }: PricingCardProps) {
    const discount = discountPercent(product.price, product.originalPrice);
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

                {discount > 0 && (
                    <span className="mb-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                        {discount}% off
                    </span>
                )}
            </div>

            {saving > 0 && (
                <p className="mt-1 text-sm font-medium text-emerald-700">
                    You save {formatPrice(saving)}
                </p>
            )}

            {isLowest && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <BadgeIndianRupee size={13} aria-hidden="true" />
                    Lowest price across {product.stores.length} stores —{" "}
                    {cheapestStore.name}
                </p>
            )}

            <dl className="mt-4 space-y-2.5 border-t border-slate-200 pt-4 text-sm">

                <div className="flex items-start gap-2.5">
                    <CreditCard
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-400"
                        aria-hidden="true"
                    />
                    <div className="min-w-0">
                        <dt className="font-medium text-slate-700">
                            No-cost EMI
                        </dt>
                        <dd className="text-slate-500">
                            {emiLabel(product.price)}
                        </dd>
                    </div>
                </div>

                <div className="flex items-start gap-2.5">
                    <Truck
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-400"
                        aria-hidden="true"
                    />
                    <div className="min-w-0">
                        <dt className="font-medium text-slate-700">
                            {product.inStock ? "Free delivery" : "Delivery"}
                        </dt>
                        <dd className="text-slate-500">
                            {product.inStock
                                ? `Get it by ${deliveryEstimate(true)}`
                                : deliveryEstimate(false)}
                            {product.inStock &&
                                !hasFreeDelivery(product.price) &&
                                " · delivery charges apply"}
                        </dd>
                    </div>
                </div>

            </dl>

        </div>
    );
}
