import { Check, Heart, Scale, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";

import SafeImage from "./SafeImage";
import { discountPercent, formatCount, formatPrice } from "../../lib/currency";
import { useCompareSelection } from "../../features/compare";
import { useWishlistSelection } from "../../features/wishlist";
import type { ProductCardModel } from "../../types/product";

interface ProductCardProps {
    product: ProductCardModel;
    /** Rendered by the search results grid and the related-product rails. */
    className?: string;
}

/**
 * The shared product tile.
 *
 * One component serves Search results and every Related Products rail — the
 * previous arrangement had a near-identical card inside the search feature and
 * would have needed a third for product details.
 *
 * The whole card is clickable via a *stretched* link on the title
 * (`after:absolute after:inset-0`) rather than by wrapping everything in an
 * <a>: the wishlist and compare buttons have to stay real buttons, and nesting
 * a button inside an anchor is invalid HTML with unpredictable activation.
 */
export default function ProductCard({
    product,
    className = "",
}: ProductCardProps) {
    const discount = discountPercent(product.price, product.originalPrice);

    const { toggle, isComparing, isFull } = useCompareSelection();
    const comparing = isComparing(product.slug);

    const { toggle: toggleWishlist, isWishlisted } = useWishlistSelection();
    const wishlisted = isWishlisted(product.slug);

    // Full *and* not already in the comparison is the only unusable case —
    // a selected product must stay clickable so it can be removed.
    const compareDisabled = isFull && !comparing;

    return (
        <article
            className={`
                group
                relative
                flex
                h-full
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                transition-[transform,box-shadow,border-color]
                duration-300
                focus-within:border-blue-400
                focus-within:shadow-[0_20px_44px_-20px_rgba(15,23,42,0.28)]
                hover:-translate-y-1
                hover:border-slate-300
                hover:shadow-[0_20px_44px_-20px_rgba(15,23,42,0.28)]
                ${className}
            `}
        >
            <div className="relative">
                <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="flex h-40 w-full items-center justify-center overflow-hidden bg-slate-50 sm:h-48"
                    imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    iconClassName="h-10 w-10 text-slate-300"
                />

                {discount > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">
                        {discount}% off
                    </span>
                )}

                {!product.inStock && (
                    <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-bold uppercase tracking-wide text-slate-600 backdrop-blur-[1px]">
                        Out of stock
                    </span>
                )}

                {/*
                    Above the stretched link so these stay clickable, and visible
                    without hover below `md`: Tailwind v4 gates `hover:` behind
                    `@media (hover: hover)`, so hover-only controls are
                    unreachable on touch.
                */}
                <div
                    className={`
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
                        ${comparing || wishlisted
                            ? ""
                            : "md:opacity-0 md:group-hover:opacity-100"}
                    `}
                >
                    {/* Filled heart plus `aria-pressed` so the saved state is
                        conveyed both visually and to assistive technology. */}
                    <button
                        type="button"
                        onClick={() => toggleWishlist(product.slug)}
                        aria-pressed={wishlisted}
                        aria-label={
                            wishlisted
                                ? `Remove ${product.name} from wishlist`
                                : `Add ${product.name} to wishlist`
                        }
                        title={wishlisted ? "Saved to wishlist" : "Save to wishlist"}
                        className={`
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            shadow-sm
                            backdrop-blur-sm
                            transition
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                            md:h-8
                            md:w-8
                            ${wishlisted
                                ? "bg-rose-500 text-white"
                                : "bg-white/95 text-slate-600 hover:bg-rose-500 hover:text-white"
                            }
                        `}
                    >
                        <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
                    </button>

                    {/*
                        Stays visible once selected, regardless of hover, so the
                        card carries its own state — otherwise a product could be
                        in the comparison with nothing on the card to say so.
                    */}
                    <button
                        type="button"
                        onClick={() => toggle(product.slug)}
                        disabled={compareDisabled}
                        aria-pressed={comparing}
                        aria-label={
                            comparing
                                ? `Remove ${product.name} from comparison`
                                : compareDisabled
                                    ? `Comparison is full — remove a product to add ${product.name}`
                                    : `Add ${product.name} to comparison`
                        }
                        title={
                            compareDisabled
                                ? "Comparison is full"
                                : comparing
                                    ? "Remove from comparison"
                                    : "Add to comparison"
                        }
                        className={`
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            shadow-sm
                            backdrop-blur-sm
                            transition
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            md:h-8
                            md:w-8
                            ${comparing
                                ? "bg-blue-600 text-white"
                                : "bg-white/95 text-slate-600 hover:bg-blue-600 hover:text-white"
                            }
                        `}
                    >
                        {comparing ? <Check size={15} /> : <Scale size={15} />}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-4">

                <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                        {product.brand}
                    </p>

                    {product.aiScore !== undefined && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                            <Sparkles size={11} aria-hidden="true" />
                            {product.aiScore}
                        </span>
                    )}
                </div>

                <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-900 sm:text-[15px]">
                    <Link
                        to={`/product/${product.slug}`}
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
                        {product.name}
                    </Link>
                </h3>

                <div className="mt-2 flex items-center gap-1.5 text-[13px]">
                    <Star
                        size={13}
                        className="fill-amber-400 text-amber-400"
                        aria-hidden="true"
                    />
                    <span className="font-semibold text-slate-800">
                        {product.rating}
                    </span>
                    <span className="truncate text-slate-400">
                        ({formatCount(product.reviews)})
                    </span>
                </div>

                <div className="mt-auto pt-4">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-lg font-semibold tracking-tight text-slate-900">
                            {formatPrice(product.price)}
                        </span>

                        {product.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/*
                        Presentational: the stretched link above already owns the
                        card's activation, so this must not be a second focus
                        stop announcing the same destination.
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
                            group-hover:bg-blue-600
                        "
                    >
                        {product.inStock ? "View details" : "See availability"}
                    </span>
                </div>
            </div>
        </article>
    );
}
