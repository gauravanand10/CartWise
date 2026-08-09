import { Check } from "lucide-react";
import { Link } from "react-router-dom";

import { useCompareSelection } from "../../../compare";
import type { AIPick } from "../../types/home";
import ProductImage from "../product/ProductImage";

interface AIPickCardProps {
    pick: AIPick;
}

/**
 * A recommendation card that leads with the AI's verdict and the evidence
 * behind it, rather than with the spec sheet.
 */
export default function AIPickCard({ pick }: AIPickCardProps) {
    const {
        slug,
        name,
        image,
        category,
        price,
        score,
        confidence,
        verdict,
        reasons,
        gradient,
    } = pick;

    // The Compare control adds the product on the way to /compare, so the page
    // it opens actually contains what the user pressed it for.
    const { add } = useCompareSelection();

    return (
        // `relative` anchors the stretched link on the title below.
        <article
            className="
                group
                relative
                flex
                h-full
                flex-col
                overflow-hidden
                rounded-[28px]
                border
                border-slate-200/70
                bg-white
                shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)]
                transition-[transform,box-shadow]
                duration-300
                ease-out
                hover:-translate-y-1.5
                hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_28px_56px_-16px_rgba(15,23,42,0.22)]
            "
        >
            {/* Score header */}

            <div
                className={`
                    relative
                    overflow-hidden
                    bg-gradient-to-br
                    ${gradient}
                    px-4
                    py-3.5
                    sm:px-5
                    sm:py-4
                `}
            >
                <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

                <div className="relative flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                            AI score
                        </p>

                        <p className="mt-0.5 text-2xl font-semibold text-white">
                            {score}
                            <span className="text-base font-normal text-white/60">
                                /100
                            </span>
                        </p>
                    </div>

                    <span
                        className="
                            rounded-full
                            border
                            border-white/25
                            bg-white/15
                            px-2.5
                            py-1
                            text-[11px]
                            font-semibold
                            text-white
                            backdrop-blur-sm
                        "
                    >
                        {confidence}% confidence
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <ProductImage
                    src={image}
                    alt={name}
                    category={category}
                    heightClass="h-32 sm:h-36"
                />

                <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                    {/* Stretched link: the card opens the product, while the
                        Compare control below stays its own target. */}
                    <Link
                        to={`/product/${slug}`}
                        className="
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

                <p className="mt-1 text-sm font-medium text-blue-700">
                    {verdict}
                </p>

                <ul className="mt-4 flex-1 space-y-2">
                    {reasons.map((reason) => (
                        <li
                            key={reason}
                            className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-600"
                        >
                            <Check
                                size={14}
                                className="mt-0.5 shrink-0 text-emerald-600"
                                aria-hidden="true"
                            />
                            {reason}
                        </li>
                    ))}
                </ul>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-lg font-semibold tracking-tight text-slate-900">
                        {price}
                    </span>

                    {/* `relative z-10` keeps this above the stretched link so it
                        stays its own target rather than being swallowed by the
                        card-wide overlay. */}
                    <Link
                        to="/compare"
                        onClick={() => add(slug)}
                        aria-label={`Add ${name} to comparison and open compare`}
                        className="
                            relative
                            z-10
                            rounded-full
                            bg-slate-900
                            px-4
                            py-2
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
                        Compare
                    </Link>
                </div>
            </div>
        </article>
    );
}
