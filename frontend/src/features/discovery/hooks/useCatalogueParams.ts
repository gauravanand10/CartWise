import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import type { ProductQueryParams, ProductSortValue } from "../../../services/api";

/**
 * The catalogue's filter state, held in the URL query string.
 *
 * **The URL is the state.** There is no `useState` mirror of it anywhere in this
 * feature, and that is the design rather than an implementation detail. Chapter
 * 14 built the search filters on component state and recorded the consequence at
 * the time: a filtered view could not be linked, bookmarked, or reloaded, and
 * the back button walked out of the page instead of undoing a filter. Holding
 * the state in one place — the address bar — fixes all four at once, because
 * they were all the same bug.
 *
 * The cost is that every change is a navigation, so filters must be applied
 * deliberately rather than on every keystroke of a price field. That shows up in
 * `FilterBar`, where the price inputs commit on blur or Enter.
 */

/** The valid sort values, as data, so the parser and the dropdown share one list. */
export const SORT_OPTIONS: ReadonlyArray<{ value: ProductSortValue; label: string }> = [
    { value: "name-asc", label: "Name A–Z" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
    { value: "rating-desc", label: "Rating" },
];

/** Mirrors the server's own default, so page 0 needs no `?sort=` in the URL. */
const DEFAULT_SORT: ProductSortValue = "name-asc";

/**
 * Page size when the URL does not say.
 *
 * Twelve divides evenly by the grid's 2, 3 and 4 column counts, so the last row
 * is never a ragged one or two cards at any breakpoint.
 */
const DEFAULT_SIZE = 12;

function isSortValue(value: string | null): value is ProductSortValue {
    return SORT_OPTIONS.some((option) => option.value === value);
}

/**
 * Reads a positive integer, or returns the fallback.
 *
 * Anything unparseable is treated as absent rather than passed through. A
 * hand-edited `?page=abc` should show page 0, not send the server a value it
 * will answer 400 to — the address bar is user-editable, so its contents are
 * input to be validated, not state to be trusted.
 */
function readInt(raw: string | null, fallback: number): number {
    if (raw === null) return fallback;

    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

/** Reads a price bound. Non-numeric and negative values are dropped. */
function readPrice(raw: string | null): number | undefined {
    if (raw === null || raw.trim() === "") return undefined;

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export interface CatalogueParams {
    /** The parsed query, ready to hand to `fetchProducts`. */
    query: ProductQueryParams;

    /** Raw values for the controls, so inputs can render what the URL says. */
    category: string | undefined;
    brand: string | undefined;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    inStockOnly: boolean;
    sort: ProductSortValue;
    page: number;

    /**
     * Merges a change into the URL. Passing `undefined` for a key removes it.
     * Any change except `page` resets to page 0.
     */
    update: (patch: Partial<Omit<CatalogueParams["query"], "size">>) => void;

    /** Clears every filter, keeping the sort. */
    clear: () => void;

    /** How many filters are active — drives the "clear" button's visibility. */
    activeFilterCount: number;
}

export function useCatalogueParams(): CatalogueParams {
    const [searchParams, setSearchParams] = useSearchParams();

    const category = searchParams.get("category") ?? undefined;
    const brand = searchParams.get("brand") ?? undefined;
    const minPrice = readPrice(searchParams.get("minPrice"));
    const maxPrice = readPrice(searchParams.get("maxPrice"));
    const inStockOnly = searchParams.get("inStock") === "true";

    const sortParam = searchParams.get("sort");
    const sort = isSortValue(sortParam) ? sortParam : DEFAULT_SORT;

    const page = readInt(searchParams.get("page"), 0);

    // `size` is read from the URL as well as `page`, so a paginated view is
    // fully described by its address — the same property every other filter has.
    // No UI control sets it; it exists because a page number without the page
    // size it was computed against is ambiguous, and because it makes pagination
    // exercisable against a catalogue smaller than one page. The server clamps
    // it to 1..100 regardless of what is typed here, so an absurd value is the
    // server's problem rather than a hole in the client.
    const size = readInt(searchParams.get("size"), DEFAULT_SIZE) || DEFAULT_SIZE;

    const query = useMemo<ProductQueryParams>(
        () => ({
            category,
            brand,
            minPrice,
            maxPrice,
            // Only send the parameter when it filters. `inStock=false` is a
            // no-op server-side, but sending it would put a meaningless
            // parameter in every request and in the shared URL.
            inStock: inStockOnly || undefined,
            sort,
            page,
            size,
        }),
        [category, brand, minPrice, maxPrice, inStockOnly, sort, page, size],
    );

    const update = useCallback(
        (patch: Partial<ProductQueryParams>) => {
            setSearchParams(
                (current) => {
                    const next = new URLSearchParams(current);

                    for (const [key, value] of Object.entries(patch)) {
                        if (
                            value === undefined ||
                            value === "" ||
                            value === false ||
                            value === null
                        ) {
                            next.delete(key);
                        } else {
                            next.set(key, String(value));
                        }
                    }

                    // Changing a filter while on page 3 would otherwise ask for
                    // page 3 of a different, usually shorter result set — which
                    // renders an empty page and looks like "no results". Only an
                    // explicit page change keeps the page.
                    if (!("page" in patch)) {
                        next.delete("page");
                    }

                    // The default sort is not written to the URL, so a plain
                    // /browse link stays clean and every other value is
                    // explicit. Same reason page 0 is dropped above.
                    if (next.get("sort") === DEFAULT_SORT) {
                        next.delete("sort");
                    }
                    if (next.get("page") === "0") {
                        next.delete("page");
                    }

                    return next;
                },
                // `replace: false` so each filter change is a history entry and
                // Back undoes exactly one of them. That is the behaviour Chapter
                // 14 could not offer, and it is the main thing users notice.
                { replace: false },
            );
        },
        [setSearchParams],
    );

    const clear = useCallback(() => {
        setSearchParams(
            (current) => {
                const next = new URLSearchParams();

                // Sort and size are view preferences, not filters — clearing
                // the filters should not also reset how the results are ordered
                // or how many are shown. Page is dropped, because clearing
                // filters changes the result set and page 3 of it is meaningless.
                const keptSort = current.get("sort");
                if (keptSort && keptSort !== DEFAULT_SORT) {
                    next.set("sort", keptSort);
                }

                const keptSize = current.get("size");
                if (keptSize) {
                    next.set("size", keptSize);
                }

                return next;
            },
            { replace: false },
        );
    }, [setSearchParams]);

    const activeFilterCount =
        (category ? 1 : 0) +
        (brand ? 1 : 0) +
        (minPrice !== undefined ? 1 : 0) +
        (maxPrice !== undefined ? 1 : 0) +
        (inStockOnly ? 1 : 0);

    return {
        query,
        category,
        brand,
        minPrice,
        maxPrice,
        inStockOnly,
        sort,
        page,
        update,
        clear,
        activeFilterCount,
    };
}
