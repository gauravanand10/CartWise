import { Check, Heart, Scale, Sparkles, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

    /*
     * ---------------------------------------------------------------------
     * The three props below arrived in Chapter 23, when the homepage's own
     * near-duplicate card was merged into this one.
     *
     * They are all optional and all default to "render nothing", which is the
     * property that made the merge safe: the six call sites that already used
     * this component pass none of them and render exactly as before. Only the
     * homepage grid and rail pass them, and they are the behaviours that card
     * had which this one did not.
     *
     * They are deliberately separate props rather than new fields on
     * ProductCardModel. That model is the cross-feature product contract —
     * search results, the wishlist and the compare picker all build one — and
     * `badge` is not a fact about a product. It is a fact about the *section
     * rendering* it: the same iPhone is "Trending" in one rail and "Viewed" in
     * another. Putting it on the model would invite it to be persisted.
     * ---------------------------------------------------------------------
     */

    /**
     * Section label, e.g. "Trending" or "Best match".
     *
     * Stacked *below* the computed discount badge rather than sharing its
     * corner, because a product can legitimately have both and the homepage's
     * card could never show them together — it had no computed discount badge
     * at all.
     */
    badge?: string;

    /** Cheapest retailer, rendered as "Lowest at {store}". */
    store?: string;

    /**
     * Glyph shown when the image is missing or fails to load.
     *
     * The homepage wrapped SafeImage in a `ProductImage` that mapped a category
     * to a phone/laptop/TV glyph, so an absent asset read as the kind of thing
     * it was. Passing the icon in keeps that behaviour without this component
     * having to know the homepage's category union — which is a different
     * vocabulary ("phones", "tvs") from ProductCardModel.category ("Smartphone",
     * "Television") and must not leak in here.
     */
    fallbackIcon?: LucideIcon;
}

/**
 * The shared product tile.
 *
 * One component serves Search results, the Chapter 20 browse grid, the wishlist
 * and every Related Products rail — the previous arrangement had a
 * near-identical card inside the search feature and would have needed a third
 * for product details.
 *
 * The whole card is clickable via a *stretched* link on the title
 * (`after:absolute after:inset-0`) rather than by wrapping everything in an
 * <a>: the wishlist and compare buttons have to stay real buttons, and nesting
 * a button inside an anchor is invalid HTML with unpredictable activation.
 *
 * ---------------------------------------------------------------------------
 * TWO ZONES, ONE CARD  (Chapter 20)
 *
 * This is the only component that appears in both halves of the design system,
 * which makes it the hardest thing in the chapter. It sits on the pastel,
 * colour-blocked browse grid (DISCOVERY) and on the calm wishlist page
 * (DECISION), and those two contexts want opposite things from it.
 *
 * The resolution is that **the card belongs to neither zone: it is a neutral
 * object that the zone frames.** Concretely:
 *
 *   - The card's own surface is always `bg-card` with a hairline border. It
 *     never adopts a tile pastel, so it reads as a distinct object sitting on
 *     the discovery grid rather than dissolving into it, and it needs no
 *     variant prop to look right on the wishlist.
 *   - Colour inside the card is only ever semantic. `success` on the discount
 *     badge, `danger` on the out-of-stock veil, `accent-primary` on the compare
 *     toggle, `ink`/`ink-muted` on everything else. There is no decorative
 *     colour anywhere on it.
 *
 * That second rule is what makes it safe in the decision zone, and it is the
 * two-zone rule applied at component scale: if the card had a cheerful
 * pastel header, that colour would be competing with the green that means "this
 * is the cheaper one" the moment two cards sit side by side for comparison.
 *
 * The alternative — a `variant="discovery" | "decision"` prop — was rejected.
 * It doubles the states to verify, and every caller then has to know which zone
 * it is in, which is a design rule enforced by convention at 30 call sites
 * rather than by the component.
 * ---------------------------------------------------------------------------
 */
export default function ProductCard({
    product,
    className = "",
    badge,
    store,
    fallbackIcon,
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
                w-full
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-ink-muted/15
                bg-card
                transition-[transform,box-shadow,border-color]
                duration-300
                focus-within:border-accent-primary
                focus-within:shadow-[0_20px_44px_-20px_rgba(31,26,46,0.28)]
                hover:-translate-y-1
                hover:border-ink-muted/30
                hover:shadow-[0_20px_44px_-20px_rgba(31,26,46,0.28)]
                motion-reduce:transition-none
                motion-reduce:hover:translate-y-0
                ${className}
            `}
        >
            <div className="relative">
                <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="flex h-40 w-full items-center justify-center overflow-hidden bg-surface sm:h-48"
                    imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    icon={fallbackIcon}
                    iconClassName="h-10 w-10 text-ink-muted/40"
                />

                {/*
                    Stacked rather than overlaid. The discount badge is computed
                    and semantic; `badge` is a caller-supplied section label and
                    neutral. Before the Chapter 23 merge these two lived in the
                    same corner of two different components and could never
                    collide; now that one component renders both, a column with
                    a gap is what keeps a discounted "Trending" product from
                    printing one on top of the other.
                */}
                {(discount > 0 || badge) && (
                    <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
                        {/* Semantic, not decorative: success means "this costs
                            less than it did". The same green cannot be used
                            ornamentally anywhere else on the card, or it stops
                            carrying that meaning. */}
                        {discount > 0 && (
                            <span className="rounded-full bg-success px-2 py-1 text-[11px] font-bold text-white">
                                {discount}% off
                            </span>
                        )}

                        {/* Neutral by design. A section label is not a claim
                            about the product, so it must not borrow success or
                            danger — "Bestseller" in green would read as a price
                            drop. */}
                        {badge && (
                            <span className="rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-ink-muted shadow-sm backdrop-blur-sm">
                                {badge}
                            </span>
                        )}
                    </div>
                )}

                {/*
                    Chapter 24 — the photograph's credit.

                    Required, not decorative: these images come from Openverse
                    under Creative Commons licences that permit this use only if
                    the creator is credited, so this element is part of what
                    makes displaying the image above it lawful.

                    Rendered as a `title` on a small marker rather than as a
                    visible caption on every tile. A grid of twenty cards cannot
                    carry twenty sentences of credit without becoming unreadable,
                    and the full credit line is reachable on hover, through the
                    accessibility tree, and in full on the product page. The
                    marker is always present when there is something to credit —
                    it is never conditional on hover — so the attribution cannot
                    be scrolled past without existing.

                    Absent entirely for placeholder images, where there is no
                    creator and nothing to credit.
                */}
                {product.imageAttribution && (
                    <span
                        title={product.imageAttribution}
                        className="absolute bottom-1 left-1 z-10 rounded bg-card/80 px-1 py-0.5 text-[9px] font-medium leading-none text-ink-muted backdrop-blur-sm"
                    >
                        <span className="sr-only">Image credit: </span>
                        CC
                    </span>
                )}

                {!product.inStock && (
                    <span className="absolute inset-0 flex items-center justify-center bg-card/75 text-xs font-bold uppercase tracking-wide text-danger backdrop-blur-[1px]">
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
                            focus-visible:ring-ink
                            focus-visible:ring-offset-1
                            md:h-8
                            md:w-8
                            ${wishlisted
                                ? "bg-danger text-white"
                                : "bg-card/95 text-ink-muted hover:bg-danger hover:text-white"
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
                            focus-visible:ring-ink
                            focus-visible:ring-offset-1
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            md:h-8
                            md:w-8
                            ${comparing
                                ? "bg-accent-primary text-white"
                                : "bg-card/95 text-ink-muted hover:bg-accent-primary hover:text-white"
                            }
                        `}
                    >
                        {comparing ? <Check size={15} /> : <Scale size={15} />}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-4">

                {/*
                    `product.brand` is guarded rather than assumed. Every model
                    built from the API or the mock catalogue carries one, but the
                    homepage's card never rendered a brand and its data has no
                    such field — so the adapter that feeds it here supplies an
                    empty string. Rendering that unguarded printed an empty
                    accent-coloured line and a stray gap above every homepage
                    title. An empty brand is a real state now, so it is handled.
                */}
                {(product.brand || product.aiScore !== undefined) && (
                    <div className="flex items-center justify-between gap-2">
                        {product.brand && (
                            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-accent-primary">
                                {product.brand}
                            </p>
                        )}

                        {/* `ml-auto` rather than relying on justify-between,
                            which would park the score on the *left* when there
                            is no brand beside it to push it over. */}
                        {product.aiScore !== undefined && (
                            <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-tile-lilac px-2 py-0.5 text-[11px] font-semibold text-ink">
                                <Sparkles size={11} aria-hidden="true" />
                                {product.aiScore}
                            </span>
                        )}
                    </div>
                )}

                <h3 className="mt-1 text-sm font-semibold leading-snug text-ink sm:text-[15px]">
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
                            focus-visible:ring-ink
                        "
                    >
                        {product.name}
                    </Link>
                </h3>

                <div className="mt-2 flex items-center gap-1.5 text-[13px]">
                    {/* `rating` is its own token, not an accent. A filled star
                        is a convention strong enough that tinting it purple
                        would read as a different symbol, and it encodes meaning
                        rather than decorating — which is what earns it a place
                        in the decision zone. Measured at 4.02:1 against the page
                        surface, above the 3:1 that WCAG 1.4.11 asks of a
                        non-text graphic; the number beside it carries the
                        information, which is why the star is aria-hidden. */}
                    <Star
                        size={13}
                        className="fill-rating text-rating"
                        aria-hidden="true"
                    />
                    <span className="font-semibold text-ink">
                        {product.rating}
                    </span>
                    <span className="truncate text-ink-muted">
                        ({formatCount(product.reviews)})
                    </span>
                </div>

                {/* Homepage-only today. `ink-muted` on both halves rather than
                    an accent on the retailer name: which shop is cheapest is
                    context, not a recommendation, and colouring it would make
                    it compete with the price directly below. */}
                {store && (
                    <p className="mt-2 truncate text-xs text-ink-muted sm:text-[13px]">
                        Lowest at <span className="font-medium">{store}</span>
                    </p>
                )}

                <div className="mt-auto pt-4">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-lg font-semibold tracking-tight text-ink">
                            {formatPrice(product.price)}
                        </span>

                        {product.originalPrice && (
                            <span className="text-xs text-ink-muted line-through">
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
                            bg-ink
                            py-2.5
                            text-center
                            text-[13px]
                            font-semibold
                            text-white
                            transition
                            group-hover:bg-accent-primary
                        "
                    >
                        {product.inStock ? "View details" : "See availability"}
                    </span>
                </div>
            </div>
        </article>
    );
}
