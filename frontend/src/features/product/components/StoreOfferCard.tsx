import { ExternalLink, Star, Truck } from "lucide-react";

import SafeImage from "../../../components/ui/SafeImage";
import { formatPrice } from "../../../lib/currency";
import type { StoreOffer } from "../types/product";

interface StoreOfferCardProps {
    offer: StoreOffer;
    /** Marks the cheapest in-stock offer. */
    best: boolean;
    productName: string;
}

/**
 * One retailer's offer.
 *
 * The store logo goes through SafeImage with a gradient monogram fallback, so
 * the row still looks deliberate while `/assets/stores/*` is empty — the same
 * treatment brand tiles get on the homepage.
 */
export default function StoreOfferCard({
    offer,
    best,
    productName,
}: StoreOfferCardProps) {
    return (
        <li
            className={`
                relative
                flex
                flex-col
                gap-4
                rounded-2xl
                border
                bg-white
                p-4
                transition
                sm:flex-row
                sm:items-center
                sm:justify-between
                ${best
                    ? "border-blue-300 ring-1 ring-blue-100"
                    : "border-slate-200 hover:border-slate-300"
                }
            `}
        >
            {best && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Best price
                </span>
            )}

            <div className="flex min-w-0 items-center gap-3">
                {/*
                    Monogram underneath, logo on top. `/assets/stores/*` is
                    empty, so the monogram is what actually shows today; when a
                    real logo lands it simply covers the tile. Layering beats a
                    conditional because SafeImage only learns the file is
                    missing after the request fails.
                */}
                <span
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${offer.gradient}`}
                >
                    <span
                        aria-hidden="true"
                        className="text-xs font-bold tracking-wide text-white"
                    >
                        {offer.monogram}
                    </span>

                    <SafeImage
                        src={offer.logo}
                        alt=""
                        className="absolute inset-0 flex items-center justify-center"
                        imgClassName="h-full w-full object-contain p-1.5"
                        iconClassName="hidden"
                    />
                </span>

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                        {offer.name}
                    </p>

                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                            <Star
                                size={11}
                                className="fill-amber-400 text-amber-400"
                                aria-hidden="true"
                            />
                            {offer.storeRating}
                        </span>

                        <span className="inline-flex items-center gap-1">
                            <Truck size={11} aria-hidden="true" />
                            {offer.delivery}
                        </span>

                        <span
                            className={
                                offer.inStock
                                    ? "font-medium text-emerald-700"
                                    : "font-medium text-slate-400"
                            }
                        >
                            {offer.inStock ? "In stock" : "Unavailable"}
                        </span>
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-lg font-semibold tracking-tight text-slate-900">
                    {formatPrice(offer.price)}
                </span>

                <button
                    type="button"
                    disabled={!offer.inStock}
                    aria-label={`Visit ${offer.name} for ${productName}`}
                    className="
                        inline-flex
                        h-10
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        bg-slate-900
                        px-4
                        text-[13px]
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-600
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                        focus-visible:ring-offset-2
                        disabled:cursor-not-allowed
                        disabled:bg-slate-200
                        disabled:text-slate-500
                    "
                >
                    Visit store
                    <ExternalLink size={13} aria-hidden="true" />
                </button>
            </div>
        </li>
    );
}
