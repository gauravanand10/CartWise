import { useEffect, useState } from "react";

import {
    fetchCategories,
    fetchProducts,
    type ApiCategory,
    type ApiPage,
    type ApiProduct,
    type ProductQueryParams,
} from "../../../services/api";

/**
 * Data loading for the discovery surface — the first code in CartWise that
 * renders from the real backend rather than from a mock module.
 *
 * Both hooks share the same shape: a status enum, the data, and an error string.
 * A single `loading` boolean cannot distinguish "still loading" from "loaded and
 * empty", which is exactly the difference between a skeleton and an empty state
 * — and getting it wrong shows a spinner forever on an empty catalogue.
 */

export type LoadStatus = "loading" | "ready" | "error";

interface CatalogueState {
    status: LoadStatus;
    page: ApiPage<ApiProduct> | null;
    error: string;
}

/**
 * One page of products for the given query.
 *
 * The query is serialised into the effect's dependency list rather than passed
 * by reference. `useCatalogueParams` rebuilds the object on every render, so
 * depending on the object itself would refetch on every render forever; the
 * string is stable whenever the values are.
 */
export function useCatalogue(query: ProductQueryParams): CatalogueState {
    const [state, setState] = useState<CatalogueState>({
        status: "loading",
        page: null,
        error: "",
    });

    const key = JSON.stringify(query);

    useEffect(() => {
        // Guards against a slow earlier request landing after a fast later one
        // and overwriting it — the classic filter race, where clicking two
        // categories quickly leaves the first one's results on screen.
        let cancelled = false;

        const run = async () => {
            // Deliberately keeps the previous page visible while the next loads,
            // rather than blanking to a skeleton on every filter change. The
            // grid flashing empty between every click is worse than a brief
            // moment of stale content, which the dimming in CataloguePage
            // signals honestly.
            setState((current) => ({ ...current, status: "loading", error: "" }));

            try {
                const result = await fetchProducts(query);
                if (!cancelled) {
                    setState({ status: "ready", page: result, error: "" });
                }
            } catch (error) {
                if (!cancelled) {
                    setState({
                        status: "error",
                        page: null,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Could not load the catalogue.",
                    });
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
        // `key` stands in for `query`; see above.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return state;
}

interface CategoriesState {
    status: LoadStatus;
    categories: ApiCategory[];
    error: string;
}

/**
 * Every category with at least one product.
 *
 * Fetched once on mount. The list changes only when the catalogue does, and
 * nothing in this session can change the catalogue, so refetching would be work
 * with no possible new answer.
 */
export function useCategories(): CategoriesState {
    const [state, setState] = useState<CategoriesState>({
        status: "loading",
        categories: [],
        error: "",
    });

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                const data = await fetchCategories();
                if (!cancelled) {
                    setState({ status: "ready", categories: data, error: "" });
                }
            } catch (error) {
                if (!cancelled) {
                    setState({
                        status: "error",
                        categories: [],
                        error:
                            error instanceof Error
                                ? error.message
                                : "Could not load categories.",
                    });
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}
