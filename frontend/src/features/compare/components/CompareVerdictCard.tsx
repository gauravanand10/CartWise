import { Crown, Scale, Sparkles, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { formatPrice } from "../../../lib/currency";
import type { CompareVerdict } from "../types/compare";
import type { ProductDetail } from "../../product/types/product";

interface CompareVerdictCardProps {
    products: ProductDetail[];
    verdict: CompareVerdict;
}

/** "A", "A and B", "A, B and C". */
function listNames(names: string[]): string {
    if (names.length <= 1) return names[0] ?? "";
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * The recommendation, stated plainly at the top of the comparison.
 *
 * "Best overall" is the product that wins the most comparable signals, so the
 * claim is traceable — the reader can scroll down and see exactly which rows
 * produced it, rather than being handed an opaque score. "Best value" is a
 * separate answer because the strongest product and the smartest purchase are
 * often different ones.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 29 — THIS CARD CAN NOW SAY "TIED", AND SOMETIMES HAS TO.
 *
 * `bestOverall` and `bestValue` are arrays. When more than one product shares
 * the top score the card names all of them and calls it a tie, instead of
 * printing a single confident winner that was really decided by which product
 * the reader happened to add to the comparison first.
 *
 * That is not a cosmetic change. Chapter 28 measured 3.5% of four-product
 * comparisons sitting on a drawn top score, every one of them presented as a
 * decisive result with a crown on it. A verdict that cannot express "these two
 * are level" will state a preference it does not have.
 * ---------------------------------------------------------------------------
 */
export default function CompareVerdictCard({
    products,
    verdict,
}: CompareVerdictCardProps) {
    const overallNames = verdict.bestOverall.map((i) => products[i]?.name).filter(Boolean) as string[];
    const valueNames = verdict.bestValue.map((i) => products[i]?.name).filter(Boolean) as string[];

    if (overallNames.length === 0 || valueNames.length === 0) return null;

    const overallTied = verdict.bestOverall.length > 1;
    const valueTied = verdict.bestValue.length > 1;

    // Only claim "wins on both counts" when one product genuinely wins both
    // outright. Two ties that happen to overlap are not the same statement.
    const sweep =
        !overallTied &&
        !valueTied &&
        verdict.bestOverall[0] === verdict.bestValue[0];

    const topWins = verdict.wins[verdict.bestOverall[0]];

    const overallLead = products[verdict.bestOverall[0]];
    const valueLead = products[verdict.bestValue[0]];

    return (
        <section
            aria-labelledby="verdict-heading"
            className="rounded-2xl border border-line bg-sunken p-5 sm:rounded-[24px] sm:p-6"
        >
            <h2
                id="verdict-heading"
                className="flex items-center gap-2 text-base font-semibold tracking-tight text-ink sm:text-lg"
            >
                <Sparkles size={17} className="text-ink-subtle" aria-hidden="true" />
                CartWise verdict
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {overallTied ? (
                    <>
                        <strong className="font-semibold text-ink">
                            {listNames(overallNames)}
                        </strong>{" "}
                        are level here — each takes {topWins} of{" "}
                        {verdict.comparableSignals} comparable measures, so there
                        is no single strongest product in this set.
                    </>
                ) : sweep ? (
                    <>
                        The{" "}
                        <strong className="font-semibold text-ink">
                            {overallNames[0]}
                        </strong>{" "}
                        wins on both counts — it takes {topWins} of{" "}
                        {verdict.comparableSignals} comparable measures and still
                        offers the best rating for the money.
                    </>
                ) : (
                    <>
                        The{" "}
                        <strong className="font-semibold text-ink">
                            {overallNames[0]}
                        </strong>{" "}
                        is the strongest product here, taking {topWins} of{" "}
                        {verdict.comparableSignals} comparable measures — but{" "}
                        <strong className="font-semibold text-ink">
                            {listNames(valueNames)}
                        </strong>{" "}
                        {valueTied ? "give" : "gives"} you more rating per rupee.
                    </>
                )}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <div className="rounded-xl border border-line bg-card p-4">
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand">
                        {overallTied ? (
                            <Scale size={12} aria-hidden="true" />
                        ) : (
                            <Crown size={12} aria-hidden="true" />
                        )}
                        {overallTied ? "Tied for best overall" : "Best overall"}
                    </p>

                    <p className="mt-1.5 text-sm font-semibold text-ink">
                        {listNames(overallNames)}
                    </p>

                    <p className="mt-0.5 text-xs text-ink-muted">
                        {overallTied
                            ? `${topWins} of ${verdict.comparableSignals} measures each`
                            : `${formatPrice(overallLead.price)} · Rated ${overallLead.rating} of 5 · ${topWins} of ${verdict.comparableSignals} measures`}
                    </p>

                    {!overallTied && (
                        <Link
                            to={`/product/${overallLead.slug}`}
                            className="mt-3 inline-block rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        >
                            View details
                        </Link>
                    )}
                </div>

                <div className="rounded-xl border border-line bg-card p-4">
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                        <Wallet size={12} aria-hidden="true" />
                        {valueTied ? "Tied for best value" : "Best value"}
                    </p>

                    <p className="mt-1.5 text-sm font-semibold text-ink">
                        {listNames(valueNames)}
                    </p>

                    <p className="mt-0.5 text-xs text-ink-muted">
                        {valueTied
                            ? "Equal rating per rupee"
                            : `${formatPrice(valueLead.price)} · Rated ${valueLead.rating} of 5 · best rating per rupee`}
                    </p>

                    {!valueTied && (
                        <Link
                            to={`/product/${valueLead.slug}`}
                            className="mt-3 inline-block rounded-full border border-line-strong bg-card px-4 py-2 text-xs font-semibold text-ink transition hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        >
                            View details
                        </Link>
                    )}
                </div>

            </div>
        </section>
    );
}
