import { Crown, Star, X } from "lucide-react";
import { Link } from "react-router-dom";

import SafeImage from "../../../components/ui/SafeImage";
import { formatCount, formatPrice } from "../../../lib/currency";
import { categoryGlyph } from "../../product/constants";
import type { ProductDetail } from "../../product/types/product";

interface CompareProductColumnProps {
    product: ProductDetail;
    onRemove: () => void;
    /** Marks the product winning the most comparable rows. */
    isBestOverall: boolean;
    /** Marks the best AI score per rupee. */
    isBestValue: boolean;
}

/**
 * One product's header column: image, identity, rating, price and remove.
 *
 * Sticky at the top of the grid so the column a value belongs to is still
 * identifiable after scrolling into the specification rows — without it, a
 * fifty-row comparison becomes unreadable the moment the headers leave the
 * viewport.
 */
export default function CompareProductColumn({
    product,
    onRemove,
    isBestOverall,
    isBestValue,
}: CompareProductColumnProps) {
    return (
        <div className="flex h-full flex-col p-3 sm:p-4">

            <div className="relative">
                <SafeImage
                    src={product.images[0]?.src}
                    alt={product.name}
                    icon={categoryGlyph[product.category]}
                    className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 sm:h-32"
                    imgClassName="h-full w-full object-contain p-2"
                    iconClassName="h-9 w-9 text-slate-300"
                />

                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={`Remove ${product.name} from comparison`}
                    className="
                        absolute
                        -right-1
                        -top-1
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-slate-200
                        bg-white
                        text-slate-500
                        shadow-sm
                        transition
                        hover:border-rose-200
                        hover:bg-rose-50
                        hover:text-rose-600
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                    "
                >
                    <X size={14} aria-hidden="true" />
                </button>
            </div>

            {(isBestOverall || isBestValue) && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {isBestOverall && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            <Crown size={10} aria-hidden="true" />
                            Best overall
                        </span>
                    )}

                    {isBestValue && (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Best value
                        </span>
                    )}
                </div>
            )}

            <p className="mt-2.5 truncate text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                {product.brand}
            </p>

            <h3 className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">
                {/* `-my-1 py-1` lifts the tap target from 19px to 27px, clearing
                    the WCAG 2.2 minimum, while the negative margin hands the
                    padding back so the column's spacing is unchanged. */}
                <Link
                    to={`/product/${product.slug}`}
                    className="-my-1 line-clamp-2 rounded py-1 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    {product.name}
                </Link>
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-xs">
                <Star
                    size={12}
                    className="fill-amber-400 text-amber-400"
                    aria-hidden="true"
                />
                <span className="font-semibold text-slate-800">
                    {product.rating}
                </span>
                <span className="truncate text-slate-400">
                    ({formatCount(product.reviewCount)})
                </span>
            </div>

            <div className="mt-auto pt-3">
                <p className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                    {formatPrice(product.price)}
                </p>

                {product.originalPrice && (
                    <p className="text-[11px] text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                    </p>
                )}
            </div>

        </div>
    );
}
