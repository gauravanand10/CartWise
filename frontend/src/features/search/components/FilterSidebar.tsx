import { useEffect, useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import BrandFilter from "./filters/BrandFilter";
import CategoryFilter from "./filters/CategoryFilter";
import FilterGroup from "./filters/FilterGroup";
import PriceFilter from "./filters/PriceFilter";
import RatingFilter from "./filters/RatingFilter";
import type { SearchFilter } from "../types/filter";

interface Facet {
    value: string;
    count: number;
}

const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface FilterSidebarProps {
    filter: SearchFilter;
    onChange: (patch: Partial<SearchFilter>) => void;
    onReset: () => void;
    activeFilterCount: number;
    categories: Facet[];
    brands: Facet[];
    priceBounds: { min: number; max: number };
    /** Mobile only — the panel is always visible from `lg`. */
    open: boolean;
    onClose: () => void;
}

/**
 * All product facets in one panel.
 *
 * Below `lg` it becomes a full-screen sheet toggled from the results toolbar;
 * a permanently stacked sidebar would push the actual results a full screen
 * down on a phone.
 */
export default function FilterSidebar({
    filter,
    onChange,
    onReset,
    activeFilterCount,
    categories,
    brands,
    priceBounds,
    open,
    onClose,
}: FilterSidebarProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // The sheet declares `aria-modal="true"`, so it has to behave like one:
    // without this, Tab walked straight out into the ~65 controls behind it,
    // Escape did nothing and the results list scrolled under the overlay.
    useEffect(() => {
        if (!open) return;

        const opener = document.activeElement as HTMLElement | null;
        const dialog = dialogRef.current;
        dialog?.focus();

        const root = document.documentElement;
        const previousOverflowY = root.style.overflowY;
        const previousPaddingRight = root.style.paddingRight;

        // Locking the scroll removes a classic scrollbar, which widens the page
        // behind the sheet — a visible 9px jump on a narrow desktop window.
        // Reserve the space it gave up. Zero on overlay-scrollbar platforms, so
        // real phones are unaffected either way. The overlay itself is
        // `position: fixed`, so root padding never shifts it.
        const scrollbar = window.innerWidth - root.clientWidth;
        root.style.overflowY = "hidden";
        if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }

            if (event.key !== "Tab" || !dialog) return;

            const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || active === dialog)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            root.style.overflowY = previousOverflowY;
            root.style.paddingRight = previousPaddingRight;
            opener?.focus();
        };
    }, [open, onClose]);

    const priceActive =
        filter.price.min > priceBounds.min || filter.price.max < priceBounds.max;

    const panel = (
        <div className="flex h-full flex-col">

            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <SlidersHorizontal size={16} aria-hidden="true" />
                    Filters
                </h2>

                <div className="flex items-center gap-1">
                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={onReset}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            Clear all
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close filters"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pt-2">

                <FilterGroup
                    title="Category"
                    activeCount={filter.category !== "All" ? 1 : 0}
                >
                    <CategoryFilter
                        categories={categories}
                        selected={filter.category}
                        onChange={(category) => onChange({ category })}
                    />
                </FilterGroup>

                <FilterGroup title="Brand" activeCount={filter.brands.length}>
                    <BrandFilter
                        brands={brands}
                        selected={filter.brands}
                        onChange={(next) => onChange({ brands: next })}
                    />
                </FilterGroup>

                <FilterGroup title="Price" activeCount={priceActive ? 1 : 0}>
                    <PriceFilter
                        bounds={priceBounds}
                        value={filter.price}
                        onChange={(price) => onChange({ price })}
                    />
                </FilterGroup>

                <FilterGroup
                    title="Customer rating"
                    activeCount={filter.minRating > 0 ? 1 : 0}
                >
                    <RatingFilter
                        value={filter.minRating}
                        onChange={(minRating) => onChange({ minRating })}
                    />
                </FilterGroup>

                <FilterGroup
                    title="Availability"
                    activeCount={filter.inStockOnly ? 1 : 0}
                >
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                        <input
                            type="checkbox"
                            checked={filter.inStockOnly}
                            onChange={(event) =>
                                onChange({ inStockOnly: event.target.checked })
                            }
                            className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                        />
                        In stock only
                    </label>
                </FilterGroup>

            </div>
        </div>
    );

    return (
        <>
            {/* Desktop: static sidebar column. */}
            <aside className="hidden rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-40 lg:block lg:max-h-[calc(100vh-11rem)]">
                {panel}
            </aside>

            {/* Mobile: sheet. Unmounted when closed so its controls stay out of
                the tab order. */}
            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/40"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Filters"
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex w-[min(22rem,90vw)] flex-col bg-white p-5 shadow-2xl focus:outline-none"
                    >
                        {panel}
                    </div>
                </div>
            )}
        </>
    );
}
