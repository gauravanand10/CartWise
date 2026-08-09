import { Crown, Sparkles, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { formatPrice } from "../../../lib/currency";
import type { CompareVerdict } from "../types/compare";
import type { ProductDetail } from "../../product/types/product";

interface CompareVerdictCardProps {
    products: ProductDetail[];
    verdict: CompareVerdict;
}

/**
 * The recommendation, stated plainly at the top of the comparison.
 *
 * "Best overall" is the product that wins the most comparable rows, so the claim
 * is traceable — the reader can scroll down and see exactly which rows produced
 * it, rather than being handed an opaque score. "Best value" is a separate
 * answer because the strongest product and the smartest purchase are often
 * different ones.
 */
export default function CompareVerdictCard({
    products,
    verdict,
}: CompareVerdictCardProps) {
    const overall = products[verdict.bestOverall];
    const value = products[verdict.bestValue];

    if (!overall || !value) return null;

    const sameProduct = verdict.bestOverall === verdict.bestValue;

    return (
        <section
            aria-labelledby="verdict-heading"
            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 to-blue-50 p-5 sm:rounded-[24px] sm:p-6"
        >
            <h2
                id="verdict-heading"
                className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg"
            >
                <Sparkles size={17} className="text-violet-600" aria-hidden="true" />
                CartWise verdict
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {sameProduct ? (
                    <>
                        The <strong className="font-semibold text-slate-900">{overall.name}</strong>{" "}
                        wins on both counts — it takes{" "}
                        {verdict.wins[verdict.bestOverall]} of{" "}
                        {verdict.comparableRows} comparable specifications and
                        still offers the best score for the money.
                    </>
                ) : (
                    <>
                        The <strong className="font-semibold text-slate-900">{overall.name}</strong>{" "}
                        is the strongest product here, taking{" "}
                        {verdict.wins[verdict.bestOverall]} of{" "}
                        {verdict.comparableRows} comparable specifications — but
                        the{" "}
                        <strong className="font-semibold text-slate-900">{value.name}</strong>{" "}
                        gives you more for each rupee.
                    </>
                )}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <div className="rounded-xl border border-white bg-white/70 p-4">
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                        <Crown size={12} aria-hidden="true" />
                        Best overall
                    </p>

                    <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {overall.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                        {formatPrice(overall.price)} · AI score {overall.ai.score} ·{" "}
                        {verdict.wins[verdict.bestOverall]} row wins
                    </p>

                    <Link
                        to={`/product/${overall.slug}`}
                        className="mt-3 inline-block rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        View details
                    </Link>
                </div>

                <div className="rounded-xl border border-white bg-white/70 p-4">
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                        <Wallet size={12} aria-hidden="true" />
                        Best value
                    </p>

                    <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {value.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                        {formatPrice(value.price)} · AI score {value.ai.score} ·
                        cheapest per point
                    </p>

                    <Link
                        to={`/product/${value.slug}`}
                        className="mt-3 inline-block rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        View details
                    </Link>
                </div>

            </div>
        </section>
    );
}
