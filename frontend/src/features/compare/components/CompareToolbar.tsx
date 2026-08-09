import { Filter, Plus, Trash2 } from "lucide-react";

import { MAX_COMPARE } from "../constants";

interface CompareToolbarProps {
    count: number;
    differenceCount: number;
    differencesOnly: boolean;
    onToggleDifferences: () => void;
    onAdd: () => void;
    onClear: () => void;
    isFull: boolean;
}

/**
 * Comparison-wide controls.
 *
 * "Differences only" is the single most useful control on this page: a
 * four-product comparison runs to fifty-odd rows and most of them agree, so
 * hiding the matches is what turns a wall of text into an answer.
 */
export default function CompareToolbar({
    count,
    differenceCount,
    differencesOnly,
    onToggleDifferences,
    onAdd,
    onClear,
    isFull,
}: CompareToolbarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">

            <p className="text-sm text-slate-600" aria-live="polite">
                <span className="font-semibold text-slate-900">{count}</span> of{" "}
                {MAX_COMPARE} products ·{" "}
                <span className="font-semibold text-slate-900">
                    {differenceCount}
                </span>{" "}
                {differenceCount === 1 ? "difference" : "differences"}
            </p>

            <div className="flex flex-wrap items-center gap-2">

                <button
                    type="button"
                    onClick={onToggleDifferences}
                    aria-pressed={differencesOnly}
                    className={`
                        inline-flex
                        h-10
                        items-center
                        gap-2
                        rounded-xl
                        border
                        px-3.5
                        text-sm
                        font-medium
                        transition
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                        ${differencesOnly
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }
                    `}
                >
                    <Filter size={15} aria-hidden="true" />
                    Differences only
                </button>

                <button
                    type="button"
                    onClick={onAdd}
                    disabled={isFull}
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
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <Plus size={15} aria-hidden="true" />
                    Add product
                </button>

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
