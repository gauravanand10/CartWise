import { ArrowUpDown, Scale, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { WISHLIST_SORT_OPTIONS } from "../constants";
import type { WishlistSort } from "../types/wishlist";

interface WishlistToolbarProps {
    count: number;
    sort: WishlistSort;
    onSortChange: (value: WishlistSort) => void;
    onClear: () => void;
}

/**
 * Count, ordering and wishlist-wide actions.
 *
 * A native `<select>` for sorting, matching the Search page: it gets keyboard
 * support, type-ahead and the platform's own mobile picker for free, where a
 * bespoke menu would have to reimplement all three.
 */
export default function WishlistToolbar({
    count,
    sort,
    onSortChange,
    onClear,
}: WishlistToolbarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">

            <p className="text-sm text-slate-600" aria-live="polite">
                <span className="font-semibold text-slate-900">{count}</span>{" "}
                {count === 1 ? "saved product" : "saved products"}
            </p>

            <div className="flex flex-wrap items-center gap-2">

                <div className="flex items-center gap-2">
                    <label
                        htmlFor="wishlist-sort"
                        className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500 sm:flex"
                    >
                        <ArrowUpDown size={14} aria-hidden="true" />
                        Sort
                    </label>

                    <select
                        id="wishlist-sort"
                        value={sort}
                        onChange={(event) =>
                            onSortChange(event.target.value as WishlistSort)
                        }
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
                        {WISHLIST_SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Wishlist and Compare stay separate lists; this is navigation
                    between them, not a transfer of state. */}
                <Link
                    to="/compare"
                    className="
                        inline-flex
                        h-10
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3.5
                        text-sm
                        font-medium
                        text-slate-700
                        transition
                        hover:border-slate-300
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                    "
                >
                    <Scale size={15} aria-hidden="true" />
                    Compare
                </Link>

                <button
                    type="button"
                    onClick={onClear}
                    className="
                        inline-flex
                        h-10
                        items-center
                        gap-2
                        rounded-xl
                        px-3.5
                        text-sm
                        font-medium
                        text-slate-500
                        transition
                        hover:bg-rose-50
                        hover:text-rose-700
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                    "
                >
                    <Trash2 size={15} aria-hidden="true" />
                    Clear all
                </button>

            </div>
        </div>
    );
}
