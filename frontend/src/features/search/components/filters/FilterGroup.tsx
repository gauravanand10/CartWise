import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface FilterGroupProps {
    title: string;
    children: ReactNode;
    /** Start collapsed — useful for long facet lists further down the sidebar. */
    defaultOpen?: boolean;
    /** Small count badge beside the title when the group is narrowing results. */
    activeCount?: number;
}

/**
 * Collapsible section shell shared by every filter.
 *
 * Keeps the disclosure behaviour, spacing and heading treatment in one place
 * so the four filters stay visually identical.
 */
export default function FilterGroup({
    title,
    children,
    defaultOpen = true,
    activeCount = 0,
}: FilterGroupProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-slate-100 py-4 first:pt-0 last:border-b-0 last:pb-0">
            <h3>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    // `-my-2 py-2` grows the tap target from 20px to 36px
                    // without moving anything: the negative margin gives the
                    // padding back to the layout, so the visual rhythm of the
                    // sidebar is unchanged while touch gets a real target.
                    className="
                        -my-2
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-2
                        rounded-lg
                        py-2
                        text-left
                        text-sm
                        font-semibold
                        text-slate-900
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                    "
                >
                    <span className="flex items-center gap-2">
                        {title}

                        {activeCount > 0 && (
                            <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                                {activeCount}
                            </span>
                        )}
                    </span>

                    <ChevronDown
                        size={16}
                        className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        aria-hidden="true"
                    />
                </button>
            </h3>

            {open && <div className="mt-3">{children}</div>}
        </div>
    );
}
