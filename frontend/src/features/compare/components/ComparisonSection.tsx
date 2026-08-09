import { useId, useState } from "react";
import { ChevronDown, Crown } from "lucide-react";

import type { ResolvedSection } from "../types/compare";

interface ComparisonSectionProps {
    section: ResolvedSection;
    /** Grid template shared with the header, so columns stay aligned. */
    columnsClass: string;
    /** Hides rows where every product has the same value. */
    differencesOnly: boolean;
    /** How many products have values in this row. */
    valueCount: number;
    /** Blank trailing cells that keep the grid aligned with the "add" column. */
    emptySlots: number;
}

/**
 * One category of the comparison.
 *
 * Its own grid using the same column template as the header rather than
 * `display: contents` on a shared grid — that keeps each section
 * independently collapsible and lets it carry its own border and heading,
 * which a flattened wrapper cannot.
 */
export default function ComparisonSection({
    section,
    columnsClass,
    differencesOnly,
    valueCount,
    emptySlots,
}: ComparisonSectionProps) {
    const [open, setOpen] = useState(!section.collapsed);
    const panelId = useId();

    const Icon = section.icon;

    const rows = differencesOnly
        ? section.rows.filter((row) => row.differs)
        : section.rows;

    // Nothing left to show once identical rows are filtered out.
    if (differencesOnly && rows.length === 0) return null;

    return (
        <section aria-labelledby={`${panelId}-heading`} className="border-t border-slate-200">

            <h3 id={`${panelId}-heading`}>
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="
                        sticky
                        left-0
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-3
                        bg-slate-50
                        px-3
                        py-3
                        text-left
                        transition
                        hover:bg-slate-100
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-inset
                        focus-visible:ring-blue-500
                        sm:px-4
                    "
                >
                    <span className="flex min-w-0 items-center gap-2.5">
                        <Icon
                            size={15}
                            className="shrink-0 text-slate-400"
                            aria-hidden="true"
                        />
                        <span className="truncate text-sm font-semibold text-slate-900">
                            {section.title}
                        </span>

                        {section.differenceCount > 0 && (
                            <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                                {section.differenceCount} differ
                            </span>
                        )}
                    </span>

                    <ChevronDown
                        size={15}
                        aria-hidden="true"
                        className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""
                            }`}
                    />
                </button>
            </h3>

            {/* Unmounted when closed: a four-product comparison runs to ~50 rows
                × 5 cells, and none of them need to exist until opened. */}
            {open && (
                <div id={panelId} role="table" aria-label={section.title}>
                    {rows.map((row) => (
                        <div
                            key={row.id}
                            role="row"
                            className={`grid items-stretch border-t border-slate-100 ${columnsClass} ${row.differs ? "bg-white" : "bg-slate-50/40"
                                }`}
                        >
                            {/* Sticky so the attribute name stays visible while the
                                product columns scroll sideways on a phone. */}
                            <div
                                role="rowheader"
                                className="sticky left-0 z-10 flex items-center bg-inherit px-3 py-3 sm:px-4"
                            >
                                <span className="text-xs font-medium text-slate-500 sm:text-[13px]">
                                    {row.label}
                                </span>
                            </div>

                            {Array.from({ length: valueCount }, (_, index) => {
                                const isWinner = row.winners.includes(index);
                                const value = row.values[index];

                                return (
                                    <div
                                        key={index}
                                        role="cell"
                                        className={`flex items-center gap-1.5 border-l border-slate-100 px-3 py-3 ${isWinner ? "bg-emerald-50/70" : ""
                                            }`}
                                    >
                                        {isWinner && (
                                            <Crown
                                                size={12}
                                                className="mt-0.5 shrink-0 self-start text-emerald-600"
                                                aria-label="Best in this row"
                                            />
                                        )}

                                        <span
                                            className={`text-xs leading-relaxed sm:text-[13px] ${row.emphasis
                                                ? "font-semibold text-slate-900"
                                                : isWinner
                                                    ? "font-medium text-emerald-900"
                                                    : "text-slate-700"
                                                }`}
                                        >
                                            {value || "—"}
                                        </span>
                                    </div>
                                );
                            })}

                            {/* Deliberately empty, not "—": this column has no
                                product yet, which is different from a product
                                having no value. */}
                            {Array.from({ length: emptySlots }, (_, index) => (
                                <div
                                    key={`empty-${index}`}
                                    role="cell"
                                    className="border-l border-slate-100"
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}

        </section>
    );
}
