import { X } from "lucide-react";

import { formatPrice } from "../utils/searchUtils";
import type { SearchFilter } from "../types/filter";

interface ActiveFiltersProps {
    filter: SearchFilter;
    onChange: (patch: Partial<SearchFilter>) => void;
    onReset: () => void;
    priceBounds: { min: number; max: number };
}

interface Chip {
    key: string;
    label: string;
    clear: () => void;
}

/**
 * Removable chips for every filter currently narrowing the results.
 *
 * On mobile the filter panel is a closed sheet, so without this the only clue
 * that results are filtered would be a number badge — these make each
 * constraint visible and individually undoable.
 */
export default function ActiveFilters({
    filter,
    onChange,
    onReset,
    priceBounds,
}: ActiveFiltersProps) {
    const chips: Chip[] = [];

    if (filter.category !== "All") {
        chips.push({
            key: "category",
            label: filter.category,
            clear: () => onChange({ category: "All" }),
        });
    }

    for (const brand of filter.brands) {
        chips.push({
            key: `brand-${brand}`,
            label: brand,
            clear: () =>
                onChange({ brands: filter.brands.filter((b) => b !== brand) }),
        });
    }

    if (filter.price.min > priceBounds.min || filter.price.max < priceBounds.max) {
        chips.push({
            key: "price",
            label: `${formatPrice(filter.price.min)} – ${formatPrice(filter.price.max)}`,
            clear: () => onChange({ price: { ...priceBounds } }),
        });
    }

    if (filter.minRating > 0) {
        chips.push({
            key: "rating",
            label: `${filter.minRating}★ & up`,
            clear: () => onChange({ minRating: 0 }),
        });
    }

    if (filter.inStockOnly) {
        chips.push({
            key: "stock",
            label: "In stock only",
            clear: () => onChange({ inStockOnly: false }),
        });
    }

    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filters:</span>

            {chips.map((chip) => (
                <button
                    key={chip.key}
                    type="button"
                    onClick={chip.clear}
                    aria-label={`Remove filter ${chip.label}`}
                    className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-slate-200
                        bg-white
                        py-1.5
                        pl-3
                        pr-2
                        text-xs
                        font-medium
                        text-slate-700
                        transition
                        hover:border-slate-300
                        hover:bg-slate-50
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                    "
                >
                    {chip.label}
                    <X size={12} className="text-slate-400" aria-hidden="true" />
                </button>
            ))}

            {chips.length > 1 && (
                <button
                    type="button"
                    onClick={onReset}
                    className="rounded-full px-2 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    Clear all
                </button>
            )}
        </div>
    );
}
