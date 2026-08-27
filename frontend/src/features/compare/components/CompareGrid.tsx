import { Plus } from "lucide-react";

import CompareProductColumn from "./CompareProductColumn";
import ComparisonSection from "./ComparisonSection";
import { MAX_COMPARE } from "../constants";
import type { CompareVerdict, ResolvedSection } from "../types/compare";
import type { ProductDetail } from "../../product/types/product";

interface CompareGridProps {
    products: ProductDetail[];
    sections: ResolvedSection[];
    verdict: CompareVerdict | null;
    differencesOnly: boolean;
    onRemove: (slug: string) => void;
    onAdd: () => void;
}

/**
 * Column templates, keyed by how many products are being compared.
 *
 * Written out as literals rather than composed at runtime so Tailwind can see
 * them: a template string built from a variable would never be generated.
 *
 * Below `lg` the product columns are fixed-width and the grid scrolls
 * sideways — the readable pattern for a comparison on a phone, with the
 * attribute label pinned to the left edge. From `lg` the columns become
 * fractional so the whole comparison always fits with no scrolling at all.
 */
const COLUMN_TEMPLATES: Record<number, string> = {
    1: "grid-cols-[120px_repeat(1,minmax(190px,1fr))] lg:grid-cols-[220px_repeat(1,minmax(0,1fr))]",
    2: "grid-cols-[120px_repeat(2,minmax(190px,1fr))] lg:grid-cols-[220px_repeat(2,minmax(0,1fr))]",
    3: "grid-cols-[120px_repeat(3,190px)] lg:grid-cols-[200px_repeat(3,minmax(0,1fr))]",
    4: "grid-cols-[120px_repeat(4,190px)] lg:grid-cols-[180px_repeat(4,minmax(0,1fr))]",
};

export default function CompareGrid({
    products,
    sections,
    verdict,
    differencesOnly,
    onRemove,
    onAdd,
}: CompareGridProps) {
    // The header reserves a slot for "add another product", so the body has to
    // use the same count or the columns would not line up.
    const canAdd = products.length < MAX_COMPARE;
    const columnCount = canAdd ? products.length + 1 : products.length;
    const columnsClass =
        COLUMN_TEMPLATES[columnCount] ?? COLUMN_TEMPLATES[MAX_COMPARE];

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white sm:rounded-[24px]">
            {/*
                One scroll container for the header and every section, so they
                scroll together and stay aligned. `lg:overflow-x-visible` drops
                the container entirely once the fractional columns fit.
            */}
            <div className="overflow-x-auto lg:overflow-x-visible">

                <div className={`grid items-stretch ${columnsClass}`}>

                    {/* Empty corner above the label column. */}
                    <div className="sticky left-0 z-10 bg-white" />

                    {products.map((product, index) => (
                        <div
                            key={product.slug}
                            className="border-l border-slate-100"
                        >
                            <CompareProductColumn
                                product={product}
                                onRemove={() => onRemove(product.slug)}
                                // Chapter 29: both are arrays now, because a
                                // drawn verdict is a real state. Every tied
                                // column gets the badge rather than the badge
                                // going to whichever product was added first.
                                isBestOverall={verdict?.bestOverall.includes(index) ?? false}
                                isBestValue={verdict?.bestValue.includes(index) ?? false}
                            />
                        </div>
                    ))}

                    {canAdd && (
                        <div className="border-l border-slate-100 p-3 sm:p-4">
                            <button
                                type="button"
                                onClick={onAdd}
                                className="
                                    flex
                                    h-full
                                    min-h-[180px]
                                    w-full
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border-2
                                    border-dashed
                                    border-slate-200
                                    px-2
                                    text-slate-500
                                    transition
                                    hover:border-blue-300
                                    hover:bg-blue-50/50
                                    hover:text-blue-700
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-blue-500
                                "
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                                    <Plus size={17} aria-hidden="true" />
                                </span>
                                <span className="text-center text-xs font-semibold leading-snug">
                                    Add another
                                    <br />
                                    product
                                </span>
                            </button>
                        </div>
                    )}

                </div>

                {sections.map((section) => (
                    <ComparisonSection
                        key={section.id}
                        section={section}
                        columnsClass={columnsClass}
                        differencesOnly={differencesOnly}
                        valueCount={products.length}
                        emptySlots={canAdd ? 1 : 0}
                    />
                ))}

            </div>
        </div>
    );
}
