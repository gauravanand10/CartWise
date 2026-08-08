import { useCallback, useMemo, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import { getCatalogue } from "../services/searchService";
import { trendingSearches } from "../data/trending";
import { buildSuggestions } from "../utils/searchUtils";
import { useClickOutside } from "../hooks/useClickOutside";
import SearchSuggestions from "./SearchSuggestions";
import type { DropdownItem } from "./SearchSuggestions";

interface SearchBarProps {
    query: string;
    onQueryChange: (value: string) => void;
    /** Called when a query is committed (Enter or suggestion picked). */
    onSubmit: (value: string) => void;
    recent: string[];
    onRemoveRecent: (value: string) => void;
    onClearRecent: () => void;
    /** Shows a spinner in place of the search icon while results are in flight. */
    loading?: boolean;
}

const LISTBOX_ID = "search-suggestions";

/**
 * Search combobox: text input plus a dropdown that shows live suggestions
 * once the user types, and recent + trending searches before that.
 *
 * Implements the ARIA combobox pattern — arrow keys move a virtual cursor
 * while focus stays in the input, and `aria-activedescendant` tells a screen
 * reader which row is highlighted.
 */
export default function SearchBar({
    query,
    onQueryChange,
    onSubmit,
    recent,
    onRemoveRecent,
    onClearRecent,
    loading = false,
}: SearchBarProps) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useClickOutside(wrapperRef, () => setOpen(false), open);

    const catalogue = useMemo(() => getCatalogue(), []);
    const trimmed = query.trim();

    // One flat list drives both rendering and arrow-key movement, so the
    // highlighted index can never disagree with what's on screen.
    const items: DropdownItem[] = useMemo(() => {
        if (trimmed) {
            return buildSuggestions(catalogue, trimmed).map((s) => ({
                value: s.value,
                kind: s.kind,
            }));
        }

        return [
            ...recent.map((value) => ({ value, kind: "recent" as const })),
            ...trendingSearches
                .filter((t) => !recent.some((r) => r.toLowerCase() === t.toLowerCase()))
                .map((value) => ({ value, kind: "trending" as const })),
        ];
    }, [trimmed, catalogue, recent]);

    const recentCount = trimmed ? 0 : recent.length;

    const commit = useCallback(
        (value: string) => {
            onQueryChange(value);
            onSubmit(value);
            setOpen(false);
            setActiveIndex(-1);
            inputRef.current?.blur();
        },
        [onQueryChange, onSubmit],
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            const picked = activeIndex >= 0 ? items[activeIndex] : undefined;
            commit(picked ? picked.value : query);
            return;
        }

        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

        event.preventDefault();
        if (!open) setOpen(true);
        if (items.length === 0) return;

        // Wraps at both ends so the list is fully reachable in either direction.
        setActiveIndex((current) => {
            const delta = event.key === "ArrowDown" ? 1 : -1;
            const next = current + delta;
            if (next < 0) return items.length - 1;
            if (next >= items.length) return 0;
            return next;
        });
    };

    const showDropdown = open && items.length > 0;

    return (
        <div ref={wrapperRef} className="relative">

            <div
                className="
                    group
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    shadow-sm
                    transition
                    focus-within:border-blue-400
                    focus-within:ring-4
                    focus-within:ring-blue-500/10
                "
            >
                {loading ? (
                    <Loader2
                        size={18}
                        className="shrink-0 animate-spin text-blue-600"
                        aria-hidden="true"
                    />
                ) : (
                    <Search
                        size={18}
                        className="shrink-0 text-slate-400 transition-colors group-focus-within:text-blue-600"
                        aria-hidden="true"
                    />
                )}

                <input
                    ref={inputRef}
                    id="search-input"
                    type="text"
                    value={query}
                    onChange={(event) => {
                        onQueryChange(event.target.value);
                        setOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search products, brands or categories…"
                    aria-label="Search products"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls={LISTBOX_ID}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        activeIndex >= 0 ? `${LISTBOX_ID}-${activeIndex}` : undefined
                    }
                    className="
                        h-12
                        min-w-0
                        flex-1
                        bg-transparent
                        text-base
                        text-slate-900
                        outline-none
                        placeholder:text-slate-400
                        sm:h-14
                    "
                />

                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            onQueryChange("");
                            setActiveIndex(-1);
                            inputRef.current?.focus();
                        }}
                        aria-label="Clear search"
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                        "
                    >
                        <X size={16} />
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => commit(query)}
                    className="
                        my-2
                        hidden
                        shrink-0
                        rounded-xl
                        bg-slate-900
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-600
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                        focus-visible:ring-offset-2
                        sm:block
                    "
                >
                    Search
                </button>
            </div>

            {showDropdown && (
                <div
                    id={LISTBOX_ID}
                    className="
                        absolute
                        left-0
                        right-0
                        top-full
                        z-40
                        mt-2
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        pb-2
                        shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)]
                    "
                >
                    {trimmed ? (
                        <SearchSuggestions
                            items={items}
                            activeIndex={activeIndex}
                            heading="Suggestions"
                            onSelect={commit}
                            onHoverIndex={setActiveIndex}
                            idPrefix={LISTBOX_ID}
                        />
                    ) : (
                        <>
                            <SearchSuggestions
                                items={items.slice(0, recentCount)}
                                activeIndex={activeIndex}
                                heading="Recent searches"
                                onSelect={commit}
                                onHoverIndex={setActiveIndex}
                                onClearAll={onClearRecent}
                                onRemoveItem={onRemoveRecent}
                                idPrefix={LISTBOX_ID}
                            />

                            {/* Same id prefix and one continuous index space, so
                                arrowing from the last recent row into the first
                                trending row keeps `aria-activedescendant` valid. */}

                            <SearchSuggestions
                                items={items.slice(recentCount)}
                                activeIndex={activeIndex}
                                indexOffset={recentCount}
                                heading="Trending"
                                onSelect={commit}
                                onHoverIndex={setActiveIndex}
                                idPrefix={LISTBOX_ID}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
