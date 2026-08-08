import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import type { SpecGroup } from "../types/product";

interface SpecGroupPanelProps {
    group: SpecGroup;
    /** Groups after the first start collapsed to keep the page scannable. */
    defaultOpen?: boolean;
}

/**
 * One collapsible specification group.
 *
 * The rows are a `<dl>` rather than a table: each is a label/value pair, not a
 * grid of comparable cells, and a definition list reads correctly in a screen
 * reader at any width. That also removes the need for a horizontally scrolling
 * table on a phone.
 */
export default function SpecGroupPanel({
    group,
    defaultOpen = false,
}: SpecGroupPanelProps) {
    const [open, setOpen] = useState(defaultOpen);
    const panelId = useId();

    const Icon = group.icon;

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">

            <h3>
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-3
                        bg-white
                        px-4
                        py-3.5
                        text-left
                        transition
                        hover:bg-slate-50
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-inset
                        focus-visible:ring-blue-500
                    "
                >
                    <span className="flex min-w-0 items-center gap-2.5">
                        <Icon
                            size={16}
                            className="shrink-0 text-slate-400"
                            aria-hidden="true"
                        />
                        <span className="truncate text-sm font-semibold text-slate-900">
                            {group.title}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">
                            {group.items.length}
                        </span>
                    </span>

                    <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""
                            }`}
                    />
                </button>
            </h3>

            {/*
                Unmounted rather than hidden when closed: 6 groups × ~6 rows is
                ~250 nodes per product, and none of them need to exist until the
                group is opened.
            */}
            {open && (
                <dl id={panelId} className="divide-y divide-slate-100 border-t border-slate-100">
                    {group.items.map((item) => (
                        <div
                            key={item.label}
                            className="grid grid-cols-1 gap-0.5 px-4 py-3 sm:grid-cols-3 sm:gap-4"
                        >
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:text-[13px] sm:normal-case sm:tracking-normal">
                                {item.label}
                            </dt>
                            <dd className="text-sm text-slate-800 sm:col-span-2">
                                {item.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}

        </div>
    );
}
