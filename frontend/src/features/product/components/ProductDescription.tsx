import { Check, FileText, Package } from "lucide-react";

import ProductSection from "./ProductSection";

interface ProductDescriptionProps {
    overview: string;
    highlights: string[];
    features: string[];
    boxContents: string[];
}

/**
 * Overview, highlights, features and what's in the box.
 *
 * Four related blocks in one section rather than four sections: they answer the
 * same question ("what is this thing") and splitting them would give the page
 * four more headings without adding any structure a reader benefits from.
 */
export default function ProductDescription({
    overview,
    highlights,
    features,
    boxContents,
}: ProductDescriptionProps) {
    return (
        <ProductSection
            id="description"
            title="About this product"
            icon={FileText}
        >
            <div className="space-y-7">

                <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                    {overview}
                </p>

                <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                        Highlights
                    </h3>

                    <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        {highlights.map((item) => (
                            <li
                                key={item}
                                className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-700"
                            >
                                <Check
                                    size={15}
                                    className="mt-0.5 shrink-0 text-blue-600"
                                    aria-hidden="true"
                                />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                        Features
                    </h3>

                    <ul className="mt-3 space-y-2">
                        {features.map((item) => (
                            <li
                                key={item}
                                className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300"
                                />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Package size={15} className="text-slate-400" aria-hidden="true" />
                        What's in the box
                    </h3>

                    <ul className="mt-3 flex flex-wrap gap-2">
                        {boxContents.map((item) => (
                            <li
                                key={item}
                                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </ProductSection>
    );
}
