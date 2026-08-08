import { ArrowUpDown } from "lucide-react";

import { SORT_OPTIONS } from "../constants";
import type { SortOption } from "../types/search";

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

/**
 * Native <select> rather than a custom menu.
 *
 * It gets keyboard support, type-ahead and the platform's own mobile picker
 * for free — all of which a bespoke dropdown would have to reimplement.
 */
export default function SortDropdown({ value, onChange }: SortDropdownProps) {
    return (
        <div className="flex items-center gap-2">
            <label
                htmlFor="sort"
                className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500 sm:flex"
            >
                <ArrowUpDown size={14} aria-hidden="true" />
                Sort
            </label>

            <select
                id="sort"
                value={value}
                onChange={(event) => onChange(event.target.value as SortOption)}
                className="
                    h-10
                    cursor-pointer
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-3
                    pr-8
                    text-sm
                    font-medium
                    text-slate-800
                    transition
                    hover:border-slate-300
                    focus:border-blue-400
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-500/10
                "
            >
                {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
