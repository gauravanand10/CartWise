import { Clock, Search, Tag, TrendingUp, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Suggestion } from "../utils/searchUtils";

export interface DropdownItem {
    value: string;
    kind: Suggestion["kind"] | "recent" | "trending";
}

const ICONS: Record<DropdownItem["kind"], LucideIcon> = {
    product: Search,
    brand: Tag,
    category: Tag,
    recent: Clock,
    trending: TrendingUp,
};

const KIND_LABEL: Partial<Record<DropdownItem["kind"], string>> = {
    brand: "Brand",
    category: "Category",
};

interface SearchSuggestionsProps {
    items: DropdownItem[];
    /** Keyboard cursor position across the *whole* dropdown, or -1 for none. */
    activeIndex: number;
    /**
     * Position of this list's first row within the whole dropdown.
     *
     * The dropdown can render two lists (recent + trending) but the keyboard
     * cursor and `aria-activedescendant` address one continuous sequence, so
     * each list needs to know where it starts.
     */
    indexOffset?: number;
    /** Heading above the list, e.g. "Recent searches". */
    heading?: string;
    onSelect: (value: string) => void;
    /** Receives the global index. */
    onHoverIndex: (index: number) => void;
    /** Shown next to the heading when provided (e.g. "Clear"). */
    onClearAll?: () => void;
    onRemoveItem?: (value: string) => void;
    /** id prefix so the input can point `aria-activedescendant` at a row. */
    idPrefix: string;
}

/**
 * The listbox half of the search combobox.
 *
 * Purely presentational — the owning SearchBar holds the active index and all
 * keyboard handling, so this component stays reusable for suggestions, recent
 * searches and trending alike.
 */
export default function SearchSuggestions({
    items,
    activeIndex,
    indexOffset = 0,
    heading,
    onSelect,
    onHoverIndex,
    onClearAll,
    onRemoveItem,
    idPrefix,
}: SearchSuggestionsProps) {
    if (items.length === 0) return null;

    return (
        <div>
            {heading && (
                <div className="flex items-center justify-between px-4 pb-1 pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {heading}
                    </span>

                    {onClearAll && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="rounded text-xs font-semibold text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}

            <ul role="listbox" aria-label={heading ?? "Suggestions"}>
                {items.map((item, localIndex) => {
                    const index = localIndex + indexOffset;
                    const Icon = ICONS[item.kind];
                    const active = index === activeIndex;

                    return (
                        <li key={`${item.kind}-${item.value}`} role="none">
                            <div
                                id={`${idPrefix}-${index}`}
                                role="option"
                                aria-selected={active}
                                onMouseEnter={() => onHoverIndex(index)}
                                className={`
                                    group
                                    flex
                                    cursor-pointer
                                    items-center
                                    gap-3
                                    px-4
                                    py-2.5
                                    text-sm
                                    ${active ? "bg-slate-100" : ""}
                                `}
                            >
                                {/*
                                    The row itself is the option (ARIA needs the
                                    role on the focusable-looking element), so the
                                    click target is a plain button filling it.
                                */}
                                <button
                                    type="button"
                                    onClick={() => onSelect(item.value)}
                                    className="flex min-w-0 flex-1 items-center gap-3 text-left focus:outline-none"
                                    tabIndex={-1}
                                >
                                    <Icon
                                        size={15}
                                        className="shrink-0 text-slate-400"
                                        aria-hidden="true"
                                    />

                                    <span className="truncate text-slate-700">
                                        {item.value}
                                    </span>

                                    {KIND_LABEL[item.kind] && (
                                        <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 group-hover:bg-white">
                                            {KIND_LABEL[item.kind]}
                                        </span>
                                    )}
                                </button>

                                {onRemoveItem && (
                                    <button
                                        type="button"
                                        aria-label={`Remove ${item.value} from recent searches`}
                                        onClick={() => onRemoveItem(item.value)}
                                        className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
