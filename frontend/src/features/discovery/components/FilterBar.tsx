import { useState } from "react";

import { SORT_OPTIONS, type CatalogueParams } from "../hooks/useCatalogueParams";
import { useCategories } from "../hooks/useCatalogue";
import { tileSurface } from "../tiles";

interface FilterBarProps {
    params: CatalogueParams;
}

/**
 * Category chips, price range, stock toggle and sort — all writing to the URL.
 *
 * Every control here is a *controlled* input whose value comes from
 * `useCatalogueParams`, which reads the query string. Nothing holds filter state
 * locally, so pasting a URL, pressing Back, or reloading all produce exactly the
 * same view as clicking would have.
 *
 * The one exception is the price fields, and it is deliberate. They keep a local
 * draft while being typed and commit on blur or Enter, because writing to the
 * URL on every keystroke would push a history entry per character and fire a
 * request per character. The draft resyncs whenever the URL changes underneath
 * it — see the effect below — so Back still moves the inputs.
 */
export default function FilterBar({ params }: FilterBarProps) {
    const { categories } = useCategories();

    const urlMin = params.minPrice?.toString() ?? "";
    const urlMax = params.maxPrice?.toString() ?? "";

    const [minDraft, setMinDraft] = useState(urlMin);
    const [maxDraft, setMaxDraft] = useState(urlMax);

    // Resyncs the drafts when the URL changes from anywhere other than these
    // inputs — pressing Back, clicking "clear filters", following a link.
    // Without it the results and the price boxes disagree, and the boxes are the
    // one part of the page still showing the previous filter.
    //
    // Adjusting state *during render* rather than in an effect. The effect
    // version is the documented prop-to-state anti-pattern: it renders once with
    // stale values, then re-renders, so the wrong numbers are briefly painted.
    // React's own guidance is this shape — compare against the previous value,
    // and if it changed, set during render. React restarts the render
    // immediately without committing the intermediate result, so nothing stale
    // reaches the DOM.
    const [lastUrlPrices, setLastUrlPrices] = useState({ min: urlMin, max: urlMax });

    if (lastUrlPrices.min !== urlMin || lastUrlPrices.max !== urlMax) {
        setLastUrlPrices({ min: urlMin, max: urlMax });
        setMinDraft(urlMin);
        setMaxDraft(urlMax);
    }

    const commitPrices = () => {
        // Empty means "no bound", which is why this maps to undefined rather
        // than 0 — a minPrice of 0 is a filter, an absent minPrice is not.
        params.update({
            minPrice: minDraft.trim() === "" ? undefined : Number(minDraft),
            maxPrice: maxDraft.trim() === "" ? undefined : Number(maxDraft),
        });
    };

    const onPriceKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            // Blur so the commit does not also run again from the blur handler,
            // and so the soft keyboard closes on mobile.
            event.currentTarget.blur();
        }
    };

    return (
        <div className="flex flex-col gap-5">

            {/* ---- Category chips ---- */}
            <div>
                <h2 className="sr-only">Filter by category</h2>

                <div
                    className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
                    role="group"
                    aria-label="Category"
                >
                    <button
                        type="button"
                        onClick={() => params.update({ category: undefined })}
                        aria-pressed={params.category === undefined}
                        className={`
                            shrink-0
                            rounded-full
                            px-4
                            py-2
                            text-sm
                            font-bold
                            transition
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-ink
                            focus-visible:ring-offset-2
                            focus-visible:ring-offset-surface
                            ${params.category === undefined
                                ? "bg-ink text-white"
                                : "bg-card text-ink-muted hover:text-ink"}
                        `}
                    >
                        All
                    </button>

                    {categories.map((category) => {
                        const selected = params.category === category.slug;

                        return (
                            <button
                                key={category.slug}
                                type="button"
                                onClick={() =>
                                    // Clicking the selected chip clears it, so a
                                    // filter can be undone where it was set
                                    // rather than only from a separate control.
                                    params.update({
                                        category: selected ? undefined : category.slug,
                                    })
                                }
                                aria-pressed={selected}
                                className={`
                                    shrink-0
                                    rounded-full
                                    px-4
                                    py-2
                                    text-sm
                                    font-bold
                                    text-ink
                                    transition
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-ink
                                    focus-visible:ring-offset-2
                                    focus-visible:ring-offset-surface
                                    ${selected
                                        ? "ring-2 ring-ink"
                                        : "opacity-80 hover:opacity-100"}
                                    ${tileSurface(category.slug)}
                                `}
                            >
                                {category.name}
                                <span className="ml-1.5 font-medium text-ink-muted">
                                    {category.productCount}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ---- Price, stock, sort ---- */}
            <div className="flex flex-wrap items-end gap-x-4 gap-y-3">

                <div className="flex items-end gap-2">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                            Min price
                        </span>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={minDraft}
                            onChange={(event) => setMinDraft(event.target.value)}
                            onBlur={commitPrices}
                            onKeyDown={onPriceKeyDown}
                            placeholder="Any"
                            className="
                                w-28
                                rounded-xl
                                border
                                border-ink-muted/25
                                bg-card
                                px-3
                                py-2
                                text-sm
                                text-ink
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-ink
                            "
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                            Max price
                        </span>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={maxDraft}
                            onChange={(event) => setMaxDraft(event.target.value)}
                            onBlur={commitPrices}
                            onKeyDown={onPriceKeyDown}
                            placeholder="Any"
                            className="
                                w-28
                                rounded-xl
                                border
                                border-ink-muted/25
                                bg-card
                                px-3
                                py-2
                                text-sm
                                text-ink
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-ink
                            "
                        />
                    </label>
                </div>

                {/*
                    A real checkbox rather than a styled div. It is keyboard
                    operable, announces its own state, and works with the label
                    for free — all of which a div with an onClick has to
                    reimplement and usually only half does.
                */}
                <label className="flex cursor-pointer items-center gap-2 py-2">
                    <input
                        type="checkbox"
                        checked={params.inStockOnly}
                        onChange={(event) =>
                            params.update({ inStock: event.target.checked || undefined })
                        }
                        className="
                            h-4
                            w-4
                            accent-accent-primary
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-ink
                        "
                    />
                    <span className="text-sm font-semibold text-ink">In stock only</span>
                </label>

                <label className="ml-auto flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                        Sort
                    </span>
                    <select
                        value={params.sort}
                        onChange={(event) =>
                            params.update({
                                sort: event.target.value as typeof params.sort,
                            })
                        }
                        className="
                            rounded-xl
                            border
                            border-ink-muted/25
                            bg-card
                            px-3
                            py-2
                            text-sm
                            font-semibold
                            text-ink
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-ink
                        "
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                {params.activeFilterCount > 0 && (
                    <button
                        type="button"
                        onClick={params.clear}
                        className="
                            rounded-full
                            px-4
                            py-2
                            text-sm
                            font-bold
                            text-accent-primary
                            underline
                            underline-offset-4
                            transition
                            hover:text-ink
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-ink
                            focus-visible:ring-offset-2
                        "
                    >
                        Clear {params.activeFilterCount} filter
                        {params.activeFilterCount === 1 ? "" : "s"}
                    </button>
                )}
            </div>
        </div>
    );
}
