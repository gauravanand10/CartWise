import type { FlashDeal } from "../../types/home";
import { surfaceCard } from "../../styles";
import ProductImage from "../product/ProductImage";
import CountdownTimer from "./CountdownTimer";

interface FlashDealCardProps {
    deal: FlashDeal;
}

export default function FlashDealCard({ deal }: FlashDealCardProps) {
    const {
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
        <article className={`group flex h-full flex-col p-4 ${surfaceCard}`}>

            <div className="relative">
                <ProductImage
                    src={image}
                    alt={name}
                    category={category}
                    heightClass="h-40"
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

            <div className="mt-4 flex-1">
                <h3 className="line-clamp-1 text-[15px] font-semibold text-slate-900">
                    {name}
                </h3>

                <p className="mt-1 text-[13px] text-slate-500">
                    at <span className="font-medium text-slate-700">{store}</span>
                </p>

                <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <span className="text-xl font-semibold tracking-tight text-slate-900">
                        {price}
                    </span>

                    <span className="text-[13px] text-slate-400 line-through">
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
