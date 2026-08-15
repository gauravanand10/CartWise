import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { useCatalogueParams, type CatalogueParams } from "./useCatalogueParams";

/**
 * The URL *is* the filter state.
 *
 * That claim is the whole design of the discovery surface, and it has two halves that must both
 * hold or neither is worth anything:
 *
 *   1. Reading — rendering at a given URL reproduces exactly that filter state, so a pasted or
 *      bookmarked link works.
 *   2. Writing — changing a filter is reflected in the URL, so Back undoes it and the link is
 *      shareable.
 *
 * Chapter 14 held these filters in component state and recorded the consequence: a filtered view
 * could not be linked, bookmarked or reloaded, and Back walked out of the page. Every test below is
 * one of those four symptoms, asserted so the regression is visible rather than rediscovered.
 */

/** Exposes the hook's return value and the live URL so a test can drive and observe both. */
let params: CatalogueParams;

function Probe() {
    params = useCatalogueParams();
    const location = useLocation();

    return <output data-testid="url">{location.pathname + location.search}</output>;
}

function renderAt(route: string) {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <Probe />
        </MemoryRouter>,
    );
}

const url = () => screen.getByTestId("url").textContent ?? "";
const search = () => new URLSearchParams(url().split("?")[1] ?? "");

describe("useCatalogueParams", () => {

    describe("reading the URL", () => {

        it("has no filters and server-matching defaults at a bare path", () => {
            renderAt("/browse");

            expect(params.category).toBeUndefined();
            expect(params.brand).toBeUndefined();
            expect(params.minPrice).toBeUndefined();
            expect(params.maxPrice).toBeUndefined();
            expect(params.inStockOnly).toBe(false);
            expect(params.sort).toBe("name-asc");
            expect(params.page).toBe(0);
            expect(params.activeFilterCount).toBe(0);
        });

        it("reproduces every filter from a pasted URL", () => {
            renderAt("/browse?category=laptop&brand=Apple&minPrice=100&maxPrice=900&inStock=true&sort=price-desc&page=2");

            expect(params.category).toBe("laptop");
            expect(params.brand).toBe("Apple");
            expect(params.minPrice).toBe(100);
            expect(params.maxPrice).toBe(900);
            expect(params.inStockOnly).toBe(true);
            expect(params.sort).toBe("price-desc");
            expect(params.page).toBe(2);
            expect(params.activeFilterCount).toBe(5);
        });

        it("builds a query ready to hand straight to the API", () => {
            renderAt("/browse?category=laptop&sort=rating-desc&page=1");

            expect(params.query).toMatchObject({
                category: "laptop",
                sort: "rating-desc",
                page: 1,
                size: 12,
            });
        });

        /**
         * `inStock=false` is dropped rather than sent. It is a no-op server-side, so sending it
         * would put a parameter that means nothing into every request and every shared URL.
         */
        it("omits inStock from the query unless it actually filters", () => {
            renderAt("/browse");
            expect(params.query.inStock).toBeUndefined();

            renderAt("/browse?inStock=true");
            expect(params.query.inStock).toBe(true);
        });

        describe("hand-edited values are validated, not trusted", () => {

            /**
             * The address bar is user-editable, so its contents are input. `?page=abc` must show
             * page 0 rather than being forwarded to the server, which would answer 400 — an error
             * page for a typo.
             */
            it("falls back to page 0 for an unparseable page", () => {
                renderAt("/browse?page=abc");
                expect(params.page).toBe(0);
            });

            it("falls back to page 0 for a negative page", () => {
                renderAt("/browse?page=-3");
                expect(params.page).toBe(0);
            });

            it("falls back to page 0 for a fractional page", () => {
                renderAt("/browse?page=1.5");
                expect(params.page).toBe(0);
            });

            it("drops a non-numeric price bound", () => {
                renderAt("/browse?minPrice=cheap&maxPrice=");
                expect(params.minPrice).toBeUndefined();
                expect(params.maxPrice).toBeUndefined();
            });

            it("drops a negative price bound", () => {
                renderAt("/browse?minPrice=-50");
                expect(params.minPrice).toBeUndefined();
            });

            it("keeps a zero price bound, which is a real filter", () => {
                renderAt("/browse?minPrice=0");
                expect(params.minPrice).toBe(0);
                expect(params.activeFilterCount).toBe(1);
            });

            it("falls back to the default sort for a value the API would reject", () => {
                renderAt("/browse?sort=newest");
                expect(params.sort).toBe("name-asc");
            });
        });
    });

    describe("writing to the URL", () => {

        it("puts a chosen filter in the query string", () => {
            renderAt("/browse");

            act(() => params.update({ category: "laptop" }));

            expect(search().get("category")).toBe("laptop");
        });

        it("removes a filter set to undefined", () => {
            renderAt("/browse?category=laptop");

            act(() => params.update({ category: undefined }));

            expect(search().has("category")).toBe(false);
        });

        it("merges a new filter without disturbing the others", () => {
            renderAt("/browse?category=laptop&sort=price-desc");

            act(() => params.update({ brand: "Apple" }));

            expect(search().get("category")).toBe("laptop");
            expect(search().get("sort")).toBe("price-desc");
            expect(search().get("brand")).toBe("Apple");
        });

        /**
         * Changing a filter while on page 3 would otherwise ask for page 3 of a different, usually
         * shorter result set — which renders empty and reads as "no results" rather than as a paging
         * mistake.
         */
        it("returns to page 0 when a filter changes", () => {
            renderAt("/browse?page=3");

            act(() => params.update({ category: "laptop" }));

            expect(search().has("page")).toBe(false);
            expect(params.page).toBe(0);
        });

        it("keeps the page when the page itself is what changed", () => {
            renderAt("/browse?category=laptop");

            act(() => params.update({ page: 2 }));

            expect(search().get("page")).toBe("2");
            expect(search().get("category")).toBe("laptop");
        });

        /** Defaults are not written out, so a plain `/browse` link stays clean. */
        it("does not write the default sort into the URL", () => {
            renderAt("/browse?sort=price-desc");

            act(() => params.update({ sort: "name-asc" }));

            expect(search().has("sort")).toBe(false);
            expect(params.sort).toBe("name-asc");
        });

        it("does not write page 0 into the URL", () => {
            renderAt("/browse?page=3");

            act(() => params.update({ page: 0 }));

            expect(search().has("page")).toBe(false);
        });

        it("drops a filter set to false", () => {
            renderAt("/browse?inStock=true");

            act(() => params.update({ inStock: false }));

            expect(search().has("inStock")).toBe(false);
            expect(params.inStockOnly).toBe(false);
        });
    });

    describe("clear", () => {

        it("removes every filter", () => {
            renderAt("/browse?category=laptop&brand=Apple&minPrice=100&inStock=true");

            act(() => params.clear());

            expect(params.activeFilterCount).toBe(0);
            expect(search().has("category")).toBe(false);
            expect(search().has("brand")).toBe(false);
            expect(search().has("minPrice")).toBe(false);
            expect(search().has("inStock")).toBe(false);
        });

        /**
         * Sort and size are view preferences, not filters. Clearing what you searched for should not
         * also reset how the results are ordered — that is a second, unasked-for change.
         */
        it("keeps a non-default sort and the page size", () => {
            renderAt("/browse?category=laptop&sort=price-desc&size=24");

            act(() => params.clear());

            expect(search().get("sort")).toBe("price-desc");
            expect(search().get("size")).toBe("24");
        });

        it("drops the page, since the result set has changed", () => {
            renderAt("/browse?category=laptop&page=2");

            act(() => params.clear());

            expect(search().has("page")).toBe(false);
        });
    });

    describe("activeFilterCount", () => {

        it("counts only filters, not sort or page", () => {
            renderAt("/browse?sort=price-desc&page=3");
            expect(params.activeFilterCount).toBe(0);
        });

        it("counts each price bound separately", () => {
            renderAt("/browse?minPrice=100&maxPrice=900");
            expect(params.activeFilterCount).toBe(2);
        });
    });
});
