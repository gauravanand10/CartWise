import { useId } from "react";

import { formatPrice } from "../../utils/searchUtils";
import type { PriceRange } from "../../types/filter";

interface PriceFilterProps {
    bounds: { min: number; max: number };
    value: PriceRange;
    onChange: (range: PriceRange) => void;
}

/** Preset brackets, as a fraction of the catalogue's price ceiling. */
const PRESETS = [
    { label: "Under ₹25,000", max: 25_000 },
    { label: "₹25,000 – ₹75,000", min: 25_000, max: 75_000 },
    { label: "₹75,000 – ₹1,50,000", min: 75_000, max: 150_000 },
    { label: "Over ₹1,50,000", min: 150_000 },
];

/**
 * Price filter: quick brackets plus a draggable upper bound.
 *
 * A single max slider rather than a dual-thumb range — one native input is
 * fully keyboard accessible for free, where a custom two-thumb control would
 * need its own focus and arrow-key handling to match.
 */
export default function PriceFilter({
    bounds,
    value,
    onChange,
}: PriceFilterProps) {
    // The sidebar renders twice below `lg` — a display:none desktop column plus
    // the mobile sheet — so a hard-coded id would appear twice in the document
    // and the sheet's <label> would resolve to the hidden input instead.
    const sliderId = useId();

    const isPreset = (preset: (typeof PRESETS)[number]) =>
        value.min === (preset.min ?? bounds.min) &&
        value.max === (preset.max ?? bounds.max);

    return (
        <div className="space-y-4">

            <ul className="space-y-0.5">
                {PRESETS.map((preset) => {
                    const active = isPreset(preset);

                    return (
                        <li key={preset.label}>
                            <button
                                type="button"
                                aria-pressed={active}
                                onClick={() =>
                                    onChange({
                                        min: preset.min ?? bounds.min,
                                        max: preset.max ?? bounds.max,
                                    })
                                }
                                className={`
                                    w-full
                                    rounded-lg
                                    px-3
                                    py-2
                                    text-left
                                    text-sm
                                    transition
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-blue-500
                                    ${active
                                        ? "bg-slate-900 font-semibold text-white"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }
                                `}
                            >
                                {preset.label}
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="px-1">
                <label
                    htmlFor={sliderId}
                    className="flex items-center justify-between text-xs font-medium text-slate-500"
                >
                    <span>Max price</span>
                    <span className="font-semibold text-slate-900">
                        {formatPrice(value.max)}
                    </span>
                </label>

                {/*
                    The element itself is 24px tall so the drag target clears the
                    WCAG 2.2 minimum on touch; the visible 6px track and 16px
                    thumb are drawn on the slider's pseudo-elements, so the
                    control still *looks* like a hairline rail.
                */}
                <input
                    id={sliderId}
                    type="range"
                    min={bounds.min}
                    max={bounds.max}
                    step={1000}
                    value={value.max}
                    onChange={(event) =>
                        onChange({
                            // Never let the ceiling drop below the floor.
                            min: Math.min(value.min, Number(event.target.value)),
                            max: Number(event.target.value),
                        })
                    }
                    className="
                        mt-1
                        h-6
                        w-full
                        cursor-pointer
                        appearance-none
                        bg-transparent
                        focus-visible:outline-none
                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:appearance-none
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:bg-blue-600
                        [&::-moz-range-track]:h-1.5
                        [&::-moz-range-track]:rounded-full
                        [&::-moz-range-track]:bg-slate-200
                        [&::-webkit-slider-runnable-track]:h-1.5
                        [&::-webkit-slider-runnable-track]:rounded-full
                        [&::-webkit-slider-runnable-track]:bg-slate-200
                        [&::-webkit-slider-thumb]:-mt-[5px]
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-blue-600
                        focus-visible:[&::-webkit-slider-thumb]:ring-2
                        focus-visible:[&::-webkit-slider-thumb]:ring-blue-500
                        focus-visible:[&::-webkit-slider-thumb]:ring-offset-2
                    "
                />

                <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                    <span>{formatPrice(bounds.min)}</span>
                    <span>{formatPrice(bounds.max)}</span>
                </div>
            </div>

        </div>
    );
}
