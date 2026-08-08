import { Link } from "react-router-dom";

import type { FlashDeal } from "../../types/home";
import { surfaceCard } from "../../styles";
import ProductImage from "../product/ProductImage";
import CountdownTimer from "./CountdownTimer";

interface FlashDealCardProps {
    deal: FlashDeal;
}

export default function FlashDealCard({ deal }: FlashDealCardProps) {
    const {
        slug,
        name,
        image,
        category,
        price,
        originalPrice,
        discountPercent,
        store,
        endsInSeconds,
        claimedPercent,
    } = deal;

    return (
        // `relative` anchors the stretched link on the title, making the whole
        // deal card a single click target for the product page.
        <article
            className={`group relative flex h-full flex-col p-3 sm:p-4 ${surfaceCard}`}
        >

            <div className="relative">
                <ProductImage
                    src={image}
                    alt={name}
                    category={category}
                    heightClass="h-32 sm:h-40"
                />

                <span
                    className="
                        absolute
                        left-3
                        top-3
                        rounded-full
                        bg-gradient-to-r
                        from-orange-500
                        to-rose-500
                        px-2.5
                        py-1
                        text-[11px]
                        font-bold
                        text-white
                        shadow-sm
                    "
                >
                    {discountPercent}% OFF
                </span>
            </div>

            <div className="mt-3 flex-1 sm:mt-4">
                <h3 className="text-sm font-semibold text-slate-900 sm:text-[15px]">
                    <Link
                        to={`/product/${slug}`}
                        className="
                            line-clamp-1
                            rounded
                            after:absolute
                            after:inset-0
                            after:content-['']
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                        "
                    >
                        {name}
                    </Link>
                </h3>

                <p className="mt-1 truncate text-xs text-slate-500 sm:text-[13px]">
                    at <span className="font-medium text-slate-700">{store}</span>
                </p>

                <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:mt-3">
                    <span className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                        {price}
                    </span>

                    <span className="text-xs text-slate-400 line-through sm:text-[13px]">
                        {originalPrice}
                    </span>
                </div>
            </div>

            {/* Scarcity + urgency */}

            <div className="mt-4 space-y-3">
                <div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500"
                            style={{ width: `${claimedPercent}%` }}
                        />
                    </div>

                    <p className="mt-1.5 text-[11px] font-medium text-slate-500">
                        {claimedPercent}% claimed
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-500">
                        Ends in
                    </span>

                    <CountdownTimer seconds={endsInSeconds} />
                </div>
            </div>

        </article>
    );
}
