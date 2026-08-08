import { Star } from "lucide-react";

import { RATING_OPTIONS } from "../../constants";

interface RatingFilterProps {
    value: number;
    onChange: (rating: number) => void;
}

/** "N stars & up" list. Selecting the active option again clears the filter. */
export default function RatingFilter({ value, onChange }: RatingFilterProps) {
    return (
        <ul className="space-y-0.5">
            {RATING_OPTIONS.map((rating) => {
                const active = value === rating;

                return (
                    <li key={rating}>
                        <button
                            type="button"
                            aria-pressed={active}
                            // Toggling off on re-click means the group needs no
                            // separate "Any rating" row.
                            onClick={() => onChange(active ? 0 : rating)}
                            className={`
                                flex
                                w-full
                                items-center
                                gap-2
                                rounded-lg
                                px-3
                                py-2
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
                            <Star
                                size={14}
                                className="fill-amber-400 text-amber-400"
                                aria-hidden="true"
                            />

                            <span>{rating} & up</span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
