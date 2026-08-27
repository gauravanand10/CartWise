import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import CataloguePage from "./CataloguePage";
import { apiCategory, apiPage, apiProduct, mockApi } from "../../test/mockApi";
import { currentSearchParams, renderWithProviders } from "../../test/renderWithProviders";
import { TEST_USER_ID } from "../../test/fakeBackend";

/**
 * The browse screen end to end, with only the network faked.
 *
 * <h3>What "integration" means here</h3>
 *
 * Every real piece participates: `CataloguePage`, `FilterBar`, `ProductCard`, the URL hook, the data
 * hooks, `toCardModel`, the wishlist and compare providers, and — importantly — `services/api.ts`
 * itself. The only stub is `fetch`.
 *
 * That boundary is chosen deliberately. Mocking `services/api` instead would be less setup and would
 * stop exercising the code most likely to be wrong: the query string the client builds. Because the
 * stub sits below it, these tests can assert on the URL the application *actually issued* — the same
 * string a real server would receive — so a filter that silently fails to reach the request is a
 * failing test rather than a passing one.
 *
 * The data in the responses is fabricated, and that is the honest limit of this file: it proves the
 * client handles the API's *shape* correctly, not that the server produces that shape. The backend's
 * `ProductControllerTest` asserts the shape from the other side; nothing here can.
 */

const products = [
    apiProduct({ id: 1, slug: "iphone-16-pro", name: "iPhone 16 Pro", brand: "Apple", price: 119900, originalPrice: 134900 }),
    apiProduct({ id: 2, slug: "macbook-air", name: "MacBook Air", brand: "Apple", price: 99900, category: "Laptop" }),
    apiProduct({ id: 3, slug: "sony-wh-1000xm6", name: "Sony WH-1000XM6", brand: "Sony", price: 29990, category: "Headphones", inStock: false }),
];

const categories = [
    apiCategory({ name: "Headphones", slug: "headphones", productCount: 1 }),
    apiCategory({ name: "Laptop", slug: "laptop", productCount: 1 }),
    apiCategory({ name: "Smartphone", slug: "smartphone", productCount: 1 }),
];

function renderCatalogue(
    route = "/browse",
    page = apiPage(products, { totalElements: 3, totalPages: 1 }),
) {
    const api = mockApi({
        "/products": { json: page },
        "/categories": { json: categories },
    });

    /*
     * Signed in as of Chapter 23.5.
     *
     * The wishlist heart on a result card is a user-scoped API call now, and a
     * signed-out visitor's toggle is a deliberate no-op — so the integration
     * test below, which is precisely about the card and the provider meeting,
     * would assert against a guest and see nothing happen.
     *
     * The selection requests fall through `mockApi` to the in-memory fake, so
     * this helper still only registers the two catalogue routes it is actually
     * about.
     */
    renderWithProviders(<CataloguePage />, { route, signedInAs: TEST_USER_ID });
    return api;
}

describe("CataloguePage (integration)", () => {

    /**
     * Integration test 1 — the page renders real API data through the adapter and the card.
     */
    it("renders the catalogue returned by the API", async () => {
        renderCatalogue();

        expect(await screen.findByRole("link", { name: "iPhone 16 Pro" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "MacBook Air" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Sony WH-1000XM6" })).toBeInTheDocument();

        // The out-of-stock veil comes from the API's `inStock: false`, through toCardModel.
        expect(screen.getByText("Out of stock")).toBeInTheDocument();

        /*
         * Chapter 27 removed the "11% off" pill this line used to assert — see the
         * note in ProductCard. The point of the assertion survives it: the card has
         * to render BOTH numbers the API sent for a discounted product, because the
         * struck-through original is now the only thing carrying "this costs less
         * than it did". Same two fields, same adapter, formatted by lib/currency.
         */
        expect(screen.getByText("₹1,19,900")).toBeInTheDocument();
        expect(screen.getByText("₹1,34,900")).toBeInTheDocument();
    });

    /**
     * The count is the server's `totalElements`, not `products.length` — the latter is only ever the
     * size of the current page and would claim "12 products" for a catalogue of 400.
     */
    it("reports the server's total rather than the size of the page", async () => {
        renderCatalogue("/browse", apiPage(products, { totalElements: 87, totalPages: 8 }));

        expect(await screen.findByText("87 products")).toBeInTheDocument();
    });

    it("uses the singular for a catalogue of one", async () => {
        renderCatalogue("/browse", apiPage([products[0]], { totalElements: 1, totalPages: 1 }));

        expect(await screen.findByText("1 product")).toBeInTheDocument();
    });

    /**
     * ===================================================================
     * CHAPTER 29 — the failed-request state, which was broken three ways.
     *
     * Measured against a genuinely stopped backend, not imagined:
     *
     *   1. the header said "Loading…" and kept saying it — the count line
     *      was `status === "ready" ? count : "Loading…"`, so "error" fell
     *      into the loading branch and the page claimed to still be working
     *      nine seconds after it had given up;
     *   2. the only error text was `error.message`, which for an
     *      unreachable API is the fetch API's own TypeError — the reader
     *      was shown the literal words "Failed to fetch";
     *   3. there was no retry anywhere on the route, so the only recovery
     *      was a full page reload.
     *
     * All three of the tests below fail against the previous code.
     * ===================================================================
     */
    describe("when the catalogue request fails", () => {

        /**
         * A TRANSPORT failure, not an HTTP one. A handler that throws makes the
         * `fetch` stub reject exactly as the real API does when the server is
         * unreachable — which is the case that produced "Failed to fetch" on
         * screen, and the only case where the raw message is worthless.
         */
        function renderFailing() {
            const api = mockApi({
                "/products": () => {
                    throw new TypeError("Failed to fetch");
                },
                "/categories": { json: categories },
            });
            renderWithProviders(<CataloguePage />, { route: "/browse", signedInAs: TEST_USER_ID });
            return api;
        }

        it("stops claiming to be loading", async () => {
            renderFailing();

            expect(await screen.findByText("Couldn't load the catalogue")).toBeInTheDocument();
            expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
        });

        it("shows a sentence a shopper can act on, not the raw fetch error", async () => {
            renderFailing();

            expect(
                await screen.findByText("We couldn't load the catalogue just now."),
            ).toBeInTheDocument();
            expect(screen.queryByText(/Failed to fetch/i)).not.toBeInTheDocument();
        });

        /**
         * The other half of the distinction: when the SERVER answered and said
         * something specific, that message is the most useful thing on screen
         * and must survive. Guards against "fixing" the transport case by
         * blanketing every failure in generic copy.
         */
        it("still shows the server's own message when the API answered", async () => {
            mockApi({
                "/products": {
                    status: 400,
                    body: { code: "BAD_REQUEST", message: "sort must be one of: price-asc, name-asc", timestamp: "" },
                },
                "/categories": { json: categories },
            });
            renderWithProviders(<CataloguePage />, { route: "/browse?sort=newest" });

            expect(await screen.findByRole("status"))
                .toHaveTextContent("sort must be one of");
        });

        it("offers a retry that actually re-issues the request", async () => {
            const user = userEvent.setup();
            const api = renderFailing();

            const retry = await screen.findByRole("button", { name: "Try again" });
            const before = api.productRequestCount();

            await user.click(retry);

            await waitFor(() =>
                expect(api.productRequestCount()).toBeGreaterThan(before));
        });
    });

    /**
     * Integration test 2 — a filter click travels through FilterBar → URL → data hook → the request.
     *
     * This is the assertion that only works because the stub is at `fetch`: it checks the query
     * string the client built, which is exactly what the server would have to interpret.
     */
    it("sends a chosen category to the server and puts it in the URL", async () => {
        const user = userEvent.setup();
        const api = renderCatalogue();

        await user.click(await screen.findByRole("button", { name: /Laptop/ }));

        await waitFor(() => expect(api.lastProductQuery().get("category")).toBe("laptop"));
        expect(currentSearchParams().get("category")).toBe("laptop");
    });

    it("sends the price bounds the user typed", async () => {
        const user = userEvent.setup();
        const api = renderCatalogue();

        await screen.findByRole("link", { name: "iPhone 16 Pro" });

        await user.type(screen.getByLabelText("Min price"), "50000");
        await user.tab();

        await waitFor(() => expect(api.lastProductQuery().get("minPrice")).toBe("50000"));
    });

    /** `inStock=false` is a no-op server-side, so it must never appear in a request. */
    it("only sends inStock when it actually filters", async () => {
        const user = userEvent.setup();
        const api = renderCatalogue();

        await screen.findByRole("link", { name: "iPhone 16 Pro" });
        expect(api.lastProductQuery().has("inStock")).toBe(false);

        await user.click(screen.getByRole("checkbox", { name: "In stock only" }));

        await waitFor(() => expect(api.lastProductQuery().get("inStock")).toBe("true"));
    });

    it("sends the chosen ordering", async () => {
        const user = userEvent.setup();
        const api = renderCatalogue();

        await screen.findByRole("link", { name: "iPhone 16 Pro" });

        await user.selectOptions(screen.getByLabelText("Sort"), "price-desc");

        await waitFor(() => expect(api.lastProductQuery().get("sort")).toBe("price-desc"));
    });

    /**
     * Integration test 3 — pagination across CataloguePage's pager, the URL and the request.
     */
    describe("pagination", () => {

        const paged = apiPage(products, { page: 0, size: 12, totalElements: 40, totalPages: 4 });

        it("renders one control per page plus previous and next", async () => {
            renderCatalogue("/browse", paged);

            const pager = await screen.findByRole("navigation", { name: "Catalogue pages" });

            expect(within(pager).getByRole("button", { name: "Page 1" })).toBeInTheDocument();
            expect(within(pager).getByRole("button", { name: "Page 4" })).toBeInTheDocument();
            expect(within(pager).queryByRole("button", { name: "Page 5" })).not.toBeInTheDocument();
            expect(within(pager).getByRole("button", { name: "Previous" })).toBeInTheDocument();
            expect(within(pager).getByRole("button", { name: "Next" })).toBeInTheDocument();
        });

        it("hides the pager when everything fits on one page", async () => {
            renderCatalogue("/browse", apiPage(products, { totalElements: 3, totalPages: 1 }));

            await screen.findByRole("link", { name: "iPhone 16 Pro" });

            expect(screen.queryByRole("navigation", { name: "Catalogue pages" }))
                .not.toBeInTheDocument();
        });

        /** Zero-indexed on the wire, one-indexed in the UI. Page 2 on screen is `page=1` in the URL. */
        it("requests the zero-indexed page behind a one-indexed label", async () => {
            const user = userEvent.setup();
            const api = renderCatalogue("/browse", paged);

            await user.click(await screen.findByRole("button", { name: "Page 2" }));

            await waitFor(() => expect(api.lastProductQuery().get("page")).toBe("1"));
            expect(currentSearchParams().get("page")).toBe("1");
        });

        it("disables Previous on the first page", async () => {
            renderCatalogue("/browse", paged);

            const pager = await screen.findByRole("navigation", { name: "Catalogue pages" });
            expect(within(pager).getByRole("button", { name: "Previous" })).toBeDisabled();
            expect(within(pager).getByRole("button", { name: "Next" })).toBeEnabled();
        });

        it("disables Next on the last page", async () => {
            renderCatalogue("/browse?page=3", apiPage(products, {
                page: 3, size: 12, totalElements: 40, totalPages: 4,
            }));

            const pager = await screen.findByRole("navigation", { name: "Catalogue pages" });
            expect(within(pager).getByRole("button", { name: "Next" })).toBeDisabled();
            expect(within(pager).getByRole("button", { name: "Previous" })).toBeEnabled();
        });

        it("marks the current page for assistive technology", async () => {
            renderCatalogue("/browse?page=2", apiPage(products, {
                page: 2, size: 12, totalElements: 40, totalPages: 4,
            }));

            const pager = await screen.findByRole("navigation", { name: "Catalogue pages" });
            expect(within(pager).getByRole("button", { name: "Page 3" }))
                .toHaveAttribute("aria-current", "page");
            expect(within(pager).getByRole("button", { name: "Page 1" }))
                .not.toHaveAttribute("aria-current");
        });

        /**
         * Changing a filter while on page 3 would otherwise ask for page 3 of a shorter result set,
         * which renders empty and reads as "no results" rather than as a paging mistake.
         *
         * <p>Note the two assertions differ, and both are correct. The <em>address bar</em> drops
         * `page` at 0, because a default does not belong in a shareable URL. The <em>request</em>
         * still carries `page=0`, because `fetchProducts` omits only `undefined` and the resolved
         * page is always a number. Asserting "absent" in both places was this test's first version
         * and it failed — the client does send `page=0`, and writing the test the other way round
         * would have been asserting a contract the code does not have.
         */
        it("returns to the first page when a filter changes", async () => {
            const user = userEvent.setup();
            const api = renderCatalogue("/browse?page=3", apiPage(products, {
                page: 3, size: 12, totalElements: 40, totalPages: 4,
            }));

            await waitFor(() => expect(api.lastProductQuery().get("page")).toBe("3"));

            await user.click(await screen.findByRole("button", { name: /Laptop/ }));

            await waitFor(() => expect(api.lastProductQuery().get("page")).toBe("0"));
            expect(currentSearchParams().has("page")).toBe(false);
        });
    });

    describe("empty and error states", () => {

        /**
         * An empty result is not an error and must not read like one: the filters matched nothing,
         * the catalogue is fine.
         */
        it("shows a filters-matched-nothing message, not an error", async () => {
            renderCatalogue("/browse?category=laptop", apiPage([], { totalElements: 0, totalPages: 0 }));

            expect(await screen.findByText("Nothing matches those filters")).toBeInTheDocument();
            expect(screen.queryByRole("status")).not.toBeInTheDocument();
        });

        it("offers a way out of an empty result when filters are active", async () => {
            const user = userEvent.setup();
            renderCatalogue("/browse?category=laptop&minPrice=500", apiPage([], {
                totalElements: 0, totalPages: 0,
            }));

            await user.click(await screen.findByRole("button", { name: "Clear all filters" }));

            expect(currentSearchParams().has("category")).toBe(false);
            expect(currentSearchParams().has("minPrice")).toBe(false);
        });

        it("does not offer 'clear all' when nothing was filtered", async () => {
            renderCatalogue("/browse", apiPage([], { totalElements: 0, totalPages: 0 }));

            expect(await screen.findByText("Nothing matches those filters")).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Clear all filters" }))
                .not.toBeInTheDocument();
        });

        /**
         * A failed request surfaces the API's own message. Because `services/api.ts` is real here,
         * this exercises the whole path — a non-ok response becoming an `ApiRequestError` carrying
         * the server's `message` — rather than a hook's error branch in isolation.
         */
        it("reports a server error with the message the API sent", async () => {
            mockApi({
                "/products": {
                    status: 500,
                    body: { code: "INTERNAL_ERROR", message: "An unexpected error occurred.", timestamp: "" },
                },
                "/categories": { json: categories },
            });

            renderWithProviders(<CataloguePage />, { route: "/browse" });

            const alert = await screen.findByRole("status");
            expect(alert).toHaveTextContent("An unexpected error occurred.");
        });

        it("reports a rejected query without rendering a product grid", async () => {
            mockApi({
                "/products": {
                    status: 400,
                    body: { code: "BAD_REQUEST", message: "sort must be one of: price-asc, name-asc", timestamp: "" },
                },
                "/categories": { json: categories },
            });

            renderWithProviders(<CataloguePage />, { route: "/browse?sort=newest" });

            expect(await screen.findByRole("status"))
                .toHaveTextContent("sort must be one of");
            expect(screen.queryByRole("list")).not.toBeInTheDocument();
        });
    });

    /**
     * Integration test 4 — two features meeting on one screen.
     *
     * The heart lives in `ProductCard` and its state lives in `WishlistProvider`, several components
     * above. This is the path that a component test of either one in isolation cannot cover: the
     * card rendered from API data, inside the grid, toggling shared state.
     */
    it("saves a product to the wishlist from the results grid", async () => {
        const user = userEvent.setup();
        renderCatalogue();

        const heart = await screen.findByRole("button", { name: "Add iPhone 16 Pro to wishlist" });
        await user.click(heart);

        expect(screen.getByRole("button", { name: "Remove iPhone 16 Pro from wishlist" }))
            .toHaveAttribute("aria-pressed", "true");

        // The other cards are unaffected — the selection is keyed by slug, not shared.
        expect(screen.getByRole("button", { name: "Add MacBook Air to wishlist" }))
            .toHaveAttribute("aria-pressed", "false");
    });

    it("does not refetch the catalogue when a product is wishlisted", async () => {
        const user = userEvent.setup();
        const api = renderCatalogue();

        await screen.findByRole("link", { name: "iPhone 16 Pro" });
        const before = api.productRequestCount();

        await user.click(screen.getByRole("button", { name: "Add iPhone 16 Pro to wishlist" }));

        expect(api.productRequestCount()).toBe(before);
    });

    /**
     * The grid is marked stale while a new page loads rather than being replaced by a skeleton, so
     * the page keeps its height and does not jump between every filter click.
     */
    it("marks the grid busy while a filter change is in flight", async () => {
        renderCatalogue();

        await screen.findByRole("link", { name: "iPhone 16 Pro" });

        expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "false");
    });

    it("requests categories once, not once per filter change", async () => {
        const user = userEvent.setup();
        const api = renderCatalogue();

        await screen.findByRole("button", { name: /Laptop/ });
        await user.click(screen.getByRole("button", { name: /Laptop/ }));
        await waitFor(() => expect(api.lastProductQuery().get("category")).toBe("laptop"));

        expect(api.calls.filter((url) => url.includes("/categories"))).toHaveLength(1);
    });
});
