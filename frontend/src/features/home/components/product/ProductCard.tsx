import { Check, Heart, Scale, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { useCompareSelection } from "../../../compare";
import { useWishlistSelection } from "../../../wishlist";
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

    const { toggle, isComparing, isFull } = useCompareSelection();
    const comparing = isComparing(slug);

    const { toggle: toggleWishlist, isWishlisted } = useWishlistSelection();
    const wishlisted = isWishlisted(slug);

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
                            bg-card/90
                            px-2.5
                            py-1
                            text-[11px]
                            font-semibold
                            text-ink-muted
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
                        sm:right-3
                        sm:top-3
                        sm:gap-2
                        ${comparing || wishlisted
                            ? ""
                            : "md:opacity-0 md:group-hover:opacity-100"}
                    `}
                >
                    <button
                        type="button"
                        onClick={() => toggleWishlist(slug)}
                        aria-pressed={wishlisted}
                        aria-label={
                            wishlisted
                                ? `Remove ${name} from wishlist`
                                : `Add ${name} to wishlist`
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
                            focus-visible:ring-ink
                            md:h-8
                            md:w-8
                            ${wishlisted
                                ? "bg-danger text-white"
                                : "bg-card/95 text-ink-muted hover:bg-danger hover:text-white md:bg-card"
                            }
                        `}
                    >
                        <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
                    </button>

                    <button
                        type="button"
                        onClick={() => toggle(slug)}
                        disabled={isFull && !comparing}
                        aria-pressed={comparing}
                        aria-label={
                            comparing
                                ? `Remove ${name} from comparison`
                                : isFull
                                    ? `Comparison is full — remove a product to add ${name}`
                                    : `Add ${name} to comparison`
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
                            focus-visible:ring-ink
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            md:h-8
                            md:w-8
                            ${comparing
                                ? "bg-accent-primary text-white"
                                : "bg-card/95 text-ink-muted hover:bg-accent-primary hover:text-white md:bg-card"
                            }
                        `}
                    >
                        {comparing ? <Check size={15} /> : <Scale size={15} />}
                    </button>
                </div>
            </div>

            {/* Meta */}

            <div className="mt-3 flex-1 sm:mt-4">
                <h3 className="text-sm font-semibold leading-snug text-ink sm:text-[15px]">
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
                            focus-visible:ring-ink
                        "
                    >
                        {name}
                    </Link>
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3">
                    <span className="inline-flex items-center gap-1 text-[13px]">
                        <Star
                            size={13}
                            className="fill-rating text-rating"
                            aria-hidden="true"
                        />
                        <span className="font-semibold text-ink">
                            {rating}
                        </span>
                        <span className="text-ink-muted">({reviews})</span>
                    </span>

                    {aiScore !== undefined && (
                        <span
                            className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                bg-tile-lilac
                                px-2
                                py-0.5
                                text-[11px]
                                font-semibold
                                text-ink
                            "
                        >
                            <Sparkles size={11} aria-hidden="true" />
                            {aiScore}
                        </span>
                    )}
                </div>

                {store && (
                    <p className="mt-2 truncate text-xs text-ink-muted sm:text-[13px]">
                        Lowest at{" "}
                        <span className="font-medium text-ink-muted">
                            {store}
                        </span>
                    </p>
                )}
            </div>

            {/* Price block — pinned to the bottom so rows stay aligned. */}

            <div className="mt-3 sm:mt-4">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
                        {price}
                    </span>

                    {originalPrice && (
                        <span className="text-xs text-ink-muted line-through sm:text-[13px]">
                            {originalPrice}
                        </span>
                    )}
                </div>

                {discount && (
                    <p className="mt-1 text-xs font-medium text-success sm:text-[13px]">
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
                        bg-ink
                        py-2.5
                        text-center
                        text-[13px]
                        font-semibold
                        text-white
                        transition
                        duration-200
                        group-hover:bg-accent-primary
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
