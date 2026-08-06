import { Heart, Scale, Sparkles, Star } from "lucide-react";

import type { HomeProduct } from "../../types/home";
import { surfaceCard } from "../../styles";
import ProductImage from "./ProductImage";

interface ProductCardProps {
    product: HomeProduct;
}

/**
 * The canonical product tile, used by every grid and rail on the homepage.
 *
 * Layout is a fixed vertical rhythm with the price block pinned to the bottom
 * (`mt-auto`), so cards in a row line up regardless of how long the product
 * name wraps.
 */
export default function ProductCard({ product }: ProductCardProps) {
    const {
        name,
        image,
        category,
        price,
        originalPrice,
        discount,
        rating,
        reviews,
        aiScore,
        badge,
        store,
    } = product;

    return (
        <article className={`group flex h-full flex-col p-4 ${surfaceCard}`}>

            {/* Media + overlay actions */}

            <div className="relative">
                <ProductImage
                    src={image}
                    alt={name}
                    category={category}
                    heightClass="h-44"
                />

                {badge && (
                    <span
                        className="
                            absolute
                            left-3
                            top-3
                            rounded-full
                            bg-white/90
                            px-2.5
                            py-1
                            text-[11px]
                            font-semibold
                            text-slate-700
                            shadow-sm
                            backdrop-blur-sm
                        "
                    >
                        {badge}
                    </span>
                )}

                {/* Revealed on hover for pointer users; always available to keyboards. */}

                <div
                    className="
                        absolute
                        right-3
                        top-3
                        flex
                        flex-col
                        gap-2
                        opacity-0
                        transition-opacity
                        duration-200
                        group-hover:opacity-100
                        focus-within:opacity-100
                    "
                >
                    <button
                        type="button"
                        aria-label={`Add ${name} to wishlist`}
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-slate-600
                            shadow-sm
                            transition
                            hover:bg-rose-500
                            hover:text-white
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                        "
                    >
                        <Heart size={15} />
                    </button>

                    <button
                        type="button"
                        aria-label={`Compare ${name}`}
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-slate-600
                            shadow-sm
                            transition
                            hover:bg-blue-600
                            hover:text-white
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                        "
                    >
                        <Scale size={15} />
                    </button>
                </div>
            </div>

            {/* Meta */}

            <div className="mt-4 flex-1">
                <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900">
                    {name}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="inline-flex items-center gap-1 text-[13px]">
                        <Star
                            size={13}
                            className="fill-amber-400 text-amber-400"
                            aria-hidden="true"
                        />
                        <span className="font-semibold text-slate-800">
                            {rating}
                        </span>
                        <span className="text-slate-400">({reviews})</span>
                    </span>

                    {aiScore !== undefined && (
                        <span
                            className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                bg-violet-50
                                px-2
                                py-0.5
                                text-[11px]
                                font-semibold
                                text-violet-700
                            "
                        >
                            <Sparkles size={11} aria-hidden="true" />
                            {aiScore}
                        </span>
                    )}
                </div>

                {store && (
                    <p className="mt-2 truncate text-[13px] text-slate-500">
                        Lowest at{" "}
                        <span className="font-medium text-slate-700">
                            {store}
                        </span>
                    </p>
                )}
            </div>

            {/* Price block — pinned to the bottom so rows stay aligned. */}

            <div className="mt-4">
                <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xl font-semibold tracking-tight text-slate-900">
                        {price}
                    </span>

                    {originalPrice && (
                        <span className="text-[13px] text-slate-400 line-through">
                            {originalPrice}
                        </span>
                    )}
                </div>

                {discount && (
                    <p className="mt-1 text-[13px] font-medium text-emerald-600">
                        {discount}
                    </p>
                )}

                <button
                    type="button"
                    className="
                        mt-4
                        w-full
                        rounded-full
                        bg-slate-900
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        duration-200
                        hover:bg-blue-600
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                        focus-visible:ring-offset-2
                    "
                >
                    Compare prices
                </button>
            </div>

        </article>
    );
}
