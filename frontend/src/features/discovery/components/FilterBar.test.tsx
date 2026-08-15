import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useCatalogueParams } from "../hooks/useCatalogueParams";

import FilterBar from "./FilterBar";
import { apiCategory, mockApi } from "../../../test/mockApi";
import { currentSearchParams, renderWithProviders } from "../../../test/renderWithProviders";

/**
 * The filter controls, and the URL they write to.
 *
 * Every control here is *controlled* — its value comes from the query string rather than from local
 * state — so each test asserts both halves: that clicking changes the URL, and that starting at that
 * URL renders the control in the matching state. Those are the two directions that make a filtered
 * view linkable, and a control that only did one of them would look correct on screen and produce a
 * link that does nothing.
 */

/** Renders the bar wired to the real hook, exactly as `CataloguePage` does. */
function Harness() {
    return <FilterBar params={useCatalogueParams()} />;
}

function renderBar(route = "/browse") {
    mockApi({
        "/categories": {
            json: [
                apiCategory({ name: "Smartphone", slug: "smartphone", productCount: 3 }),
                apiCategory({ name: "Laptop", slug: "laptop", productCount: 2 }),
                apiCategory({ name: "Home Appliances", slug: "home-appliances", productCount: 1 }),
            ],
        },
    });

    return renderWithProviders(<Harness />, { route });
}

const chip = (name: string | RegExp) => screen.getByRole("button", { name });
const minPrice = () => screen.getByLabelText("Min price");
const maxPrice = () => screen.getByLabelText("Max price");
const inStock = () => screen.getByRole("checkbox", { name: "In stock only" });
const sort = () => screen.getByLabelText("Sort");

describe("FilterBar", () => {

    describe("category chips", () => {

        it("renders a chip per category with its product count", async () => {
            renderBar();

            expect(await screen.findByRole("button", { name: /Smartphone/ })).toBeInTheDocument();
            expect(chip(/Laptop/)).toBeInTheDocument();
            expect(chip(/Home Appliances/)).toBeInTheDocument();
            expect(chip(/Smartphone\s*3/)).toBeInTheDocument();
        });

        it("marks 'All' as selected when no category is filtered", () => {
            renderBar("/browse");

            expect(chip("All")).toHaveAttribute("aria-pressed", "true");
        });

        it("writes the chosen category to the URL", async () => {
            const user = userEvent.setup();
            renderBar();

            await user.click(await screen.findByRole("button", { name: /Laptop/ }));

            expect(currentSearchParams().get("category")).toBe("laptop");
        });

        /** The other half: the same URL must reproduce the same visual state. */
        it("renders the matching chip as pressed when the URL names a category", async () => {
            renderBar("/browse?category=laptop");

            expect(await screen.findByRole("button", { name: /Laptop/ }))
                .toHaveAttribute("aria-pressed", "true");
            expect(chip("All")).toHaveAttribute("aria-pressed", "false");
        });

        /**
         * Clicking the selected chip clears it, so a filter can be undone where it was set rather
         * than only from a separate control the user has to go find.
         */
        it("clears the category when its own chip is clicked again", async () => {
            const user = userEvent.setup();
            renderBar("/browse?category=laptop");

            await user.click(await screen.findByRole("button", { name: /Laptop/ }));

            expect(currentSearchParams().has("category")).toBe(false);
        });

        it("clears the category from the 'All' chip", async () => {
            const user = userEvent.setup();
            renderBar("/browse?category=laptop");

            await user.click(chip("All"));

            expect(currentSearchParams().has("category")).toBe(false);
        });
    });

    describe("price inputs", () => {

        it("shows the bounds from the URL", () => {
            renderBar("/browse?minPrice=100&maxPrice=900");

            expect(minPrice()).toHaveValue(100);
            expect(maxPrice()).toHaveValue(900);
        });

        /**
         * The one uncontrolled control in the bar, and deliberately so: writing to the URL on every
         * keystroke would push a history entry per character and fire a request per character.
         */
        it("does not touch the URL while typing", async () => {
            const user = userEvent.setup();
            renderBar();

            await user.type(minPrice(), "500");

            expect(minPrice()).toHaveValue(500);
            expect(currentSearchParams().has("minPrice")).toBe(false);
        });

        it("commits on blur", async () => {
            const user = userEvent.setup();
            renderBar();

            await user.type(minPrice(), "500");
            await user.tab();

            expect(currentSearchParams().get("minPrice")).toBe("500");
        });

        it("commits on Enter", async () => {
            const user = userEvent.setup();
            renderBar();

            await user.type(maxPrice(), "900{Enter}");

            await waitFor(() => expect(currentSearchParams().get("maxPrice")).toBe("900"));
        });

        /**
         * An empty box means "no bound", which must map to an absent parameter rather than 0 — a
         * `minPrice` of 0 is a filter, an absent one is not.
         */
        it("removes the bound when the box is emptied", async () => {
            const user = userEvent.setup();
            renderBar("/browse?minPrice=100");

            await user.clear(minPrice());
            await user.tab();

            expect(currentSearchParams().has("minPrice")).toBe(false);
        });

        /**
         * The draft resyncs when the URL changes from anywhere other than these inputs — pressing
         * Back, clicking "clear filters", following a link. Without it the boxes keep showing the
         * previous filter while the results show the new one, and the boxes are the only part of the
         * page that is wrong.
         */
        it("resyncs the boxes when the filters are cleared from elsewhere", async () => {
            const user = userEvent.setup();
            renderBar("/browse?minPrice=100&maxPrice=900");

            expect(minPrice()).toHaveValue(100);

            await user.click(chip(/Clear \d+ filters?/));

            await waitFor(() => expect(minPrice()).toHaveValue(null));
            expect(maxPrice()).toHaveValue(null);
        });
    });

    describe("in-stock toggle", () => {

        it("is a real checkbox, unchecked by default", () => {
            renderBar();

            expect(inStock()).not.toBeChecked();
        });

        it("writes inStock=true when checked", async () => {
            const user = userEvent.setup();
            renderBar();

            await user.click(inStock());

            expect(currentSearchParams().get("inStock")).toBe("true");
        });

        /** Unchecking removes the parameter rather than writing `inStock=false`, which is a no-op. */
        it("removes the parameter when unchecked", async () => {
            const user = userEvent.setup();
            renderBar("/browse?inStock=true");

            expect(inStock()).toBeChecked();

            await user.click(inStock());

            expect(currentSearchParams().has("inStock")).toBe(false);
        });
    });

    describe("sort", () => {

        it("defaults to Name A–Z", () => {
            renderBar();

            expect(sort()).toHaveValue("name-asc");
        });

        it("writes the chosen ordering to the URL", async () => {
            const user = userEvent.setup();
            renderBar();

            await user.selectOptions(sort(), "price-desc");

            expect(currentSearchParams().get("sort")).toBe("price-desc");
        });

        it("shows the ordering the URL names", () => {
            renderBar("/browse?sort=rating-desc");

            expect(sort()).toHaveValue("rating-desc");
        });

        /** The default is not written out, so a plain `/browse` link stays clean. */
        it("removes the parameter when the default is chosen again", async () => {
            const user = userEvent.setup();
            renderBar("/browse?sort=price-desc");

            await user.selectOptions(sort(), "name-asc");

            expect(currentSearchParams().has("sort")).toBe(false);
        });
    });

    describe("the clear control", () => {

        it("is absent when nothing is filtered", () => {
            renderBar();

            expect(screen.queryByRole("button", { name: /Clear \d+ filter/ })).not.toBeInTheDocument();
        });

        it("counts the active filters, singular", () => {
            renderBar("/browse?category=laptop");

            expect(chip("Clear 1 filter")).toBeInTheDocument();
        });

        it("counts the active filters, plural", () => {
            renderBar("/browse?category=laptop&minPrice=100&inStock=true");

            expect(chip("Clear 3 filters")).toBeInTheDocument();
        });

        /** Sort is a view preference, not a filter — clearing filters must not also reorder. */
        it("clears the filters but keeps the sort", async () => {
            const user = userEvent.setup();
            renderBar("/browse?category=laptop&minPrice=100&sort=price-desc");

            await user.click(chip(/Clear \d+ filters?/));

            const params = currentSearchParams();
            expect(params.has("category")).toBe(false);
            expect(params.has("minPrice")).toBe(false);
            expect(params.get("sort")).toBe("price-desc");
        });
    });
});
