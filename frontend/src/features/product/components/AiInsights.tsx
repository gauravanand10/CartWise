import { Minus, Plus, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

import ProductSection from "./ProductSection";
import type { AiVerdict } from "../types/product";

interface AiInsightsProps {
    ai: AiVerdict;
    productName: string;
}

/**
 * The CartWise verdict: summary, pros, cons and who the product is for.
 *
 * Static mock content — nothing here calls a model, and the copy is authored in
 * `data/editorial.ts`. The section is labelled as generated so it reads as an
 * opinion rather than as specification data.
 */
export default function AiInsights({ ai, productName }: AiInsightsProps) {
    return (
        <ProductSection
            id="ai-verdict"
            title="CartWise AI verdict"
            icon={Sparkles}
            description={`Generated from ${productName} specifications, pricing history and review sentiment.`}
            action={
                <div className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5">
                    <span className="text-lg font-bold leading-none text-violet-700">
                        {ai.score}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-500">
                        / 100
                    </span>
                </div>
            }
        >
            <div className="space-y-6">

                <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 p-4 sm:p-5">
                    <p className="text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                        {ai.summary}
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                        <div
                            className="h-1.5 flex-1 overflow-hidden rounded-full bg-white"
                            role="img"
                            aria-label={`Confidence ${ai.confidence} percent`}
                        >
                            {/*
                                Inline width: the value is continuous data, and
                                Tailwind cannot generate a class per percentage.
                                The wrapper carries the accessible label so the
                                bar itself needs no ARIA of its own.
                            */}
                            <div
                                className="h-full rounded-full bg-violet-600 transition-all duration-500"
                                style={{ width: `${ai.confidence}%` }}
                            />
                        </div>

                        <span className="shrink-0 text-xs font-semibold text-violet-700">
                            {ai.confidence}% confidence
                        </span>
                    </div>
                </div>

                {/* Pros and cons */}

                <div className="grid gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                            <ThumbsUp size={15} aria-hidden="true" />
                            Pros
                        </h3>

                        <ul className="mt-3 space-y-2">
                            {ai.pros.map((pro) => (
                                <li
                                    key={pro}
                                    className="flex items-start gap-2 text-sm leading-relaxed text-emerald-900"
                                >
                                    <Plus
                                        size={14}
                                        className="mt-0.5 shrink-0 text-emerald-600"
                                        aria-hidden="true"
                                    />
                                    {pro}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-800">
                            <ThumbsDown size={15} aria-hidden="true" />
                            Cons
                        </h3>

                        <ul className="mt-3 space-y-2">
                            {ai.cons.map((con) => (
                                <li
                                    key={con}
                                    className="flex items-start gap-2 text-sm leading-relaxed text-rose-900"
                                >
                                    <Minus
                                        size={14}
                                        className="mt-0.5 shrink-0 text-rose-500"
                                        aria-hidden="true"
                                    />
                                    {con}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Best for */}

                <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                        Best for
                    </h3>

                    <ul className="mt-3 flex flex-wrap gap-2">
                        {ai.bestFor.map((use) => (
                            <li
                                key={use}
                                className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                            >
                                {use}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Who should buy / avoid */}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Who should buy it
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {ai.whoShouldBuy}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Who should avoid it
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {ai.whoShouldAvoid}
                        </p>
                    </div>
                </div>

            </div>
        </ProductSection>
    );
}
