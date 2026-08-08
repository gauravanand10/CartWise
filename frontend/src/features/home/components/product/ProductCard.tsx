import { Heart, Scale, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";

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
        slug,
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
        // `relative` anchors the stretched link on the title below, which makes
        // the whole tile a single click target for the product page.
        <article
            className={`group relative flex h-full flex-col p-3 sm:p-4 ${surfaceCard}`}
        >

            {/* Media + overlay actions */}

            <div className="relative">
                <ProductImage
                    src={image}
                    alt={name}
                    category={category}
                    heightClass="h-32 min-[400px]:h-36 sm:h-44"
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

                {/*
                    Always visible up to `md`, hover-revealed above it.

                    Tailwind v4 gates `hover:` behind `@media (hover: hover)`, so
                    a purely hover-revealed control is unreachable on touch — the
                    buttons would have stayed at opacity 0 forever on every phone
                    and tablet. Keyboard users are covered by `focus-within`.
                */}

                <div
                    className="
                        absolute
                        right-2
                        top-2
                        z-10
                        flex
                        flex-col
                        gap-1.5
                        transition-opacity
                        duration-200
                        focus-within:opacity-100
                        sm:right-3
                        sm:top-3
                        sm:gap-2
                        md:opacity-0
                        md:group-hover:opacity-100
                    "
                >
                    <button
                        type="button"
                        aria-label={`Add ${name} to wishlist`}
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            bg-white/95
                            text-slate-600
                            shadow-sm
                            backdrop-blur-sm
                            transition
                            hover:bg-rose-500
                            hover:text-white
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                            md:h-8
                            md:w-8
                            md:bg-white
                        "
                    >
                        <Heart size={15} />
                    </button>

                    <button
                        type="button"
                        aria-label={`Compare ${name}`}
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            bg-white/95
                            text-slate-600
                            shadow-sm
                            backdrop-blur-sm
                            transition
                            hover:bg-blue-600
                            hover:text-white
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                            md:h-8
                            md:w-8
                            md:bg-white
                        "
                    >
                        <Scale size={15} />
                    </button>
                </div>
            </div>

            {/* Meta */}

            <div className="mt-3 flex-1 sm:mt-4">
                <h3 className="text-sm font-semibold leading-snug text-slate-900 sm:text-[15px]">
                    {/*
                        Stretched link: `after:inset-0` makes the whole card
                        clickable while keeping exactly one link in the tab
                        order, and leaves the wishlist and compare buttons as
                        real buttons rather than anchors nested inside an anchor.
                    */}
                    <Link
                        to={`/product/${slug}`}
                        className="
                            line-clamp-2
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

                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3">
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
                    <p className="mt-2 truncate text-xs text-slate-500 sm:text-[13px]">
                        Lowest at{" "}
                        <span className="font-medium text-slate-700">
                            {store}
                        </span>
                    </p>
                )}
            </div>

            {/* Price block — pinned to the bottom so rows stay aligned. */}

            <div className="mt-3 sm:mt-4">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                        {price}
                    </span>

                    {originalPrice && (
                        <span className="text-xs text-slate-400 line-through sm:text-[13px]">
                            {originalPrice}
                        </span>
                    )}
                </div>

                {discount && (
                    <p className="mt-1 text-xs font-medium text-emerald-600 sm:text-[13px]">
                        {discount}
                    </p>
                )}

                {/*
                    Presentational, not a control: the stretched link already
                    owns the card's activation, so a second focusable element
                    pointing at the same destination would just be a duplicate
                    stop for keyboard and screen-reader users. Label shortens on
                    the narrowest cards so it never wraps to two lines and
                    breaks the shared card height.
                */}

                <span
                    aria-hidden="true"
                    className="
                        mt-3
                        block
                        w-full
                        rounded-full
                        bg-slate-900
                        py-2.5
                        text-center
                        text-[13px]
                        font-semibold
                        text-white
                        transition
                        duration-200
                        group-hover:bg-blue-600
                        sm:mt-4
                        sm:text-sm
                    "
                >
                    <span className="sm:hidden">Details</span>
                    <span className="hidden sm:inline">View details</span>
                </span>
            </div>

        </article>
    );
}
