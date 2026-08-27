import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { ReactElement } from "react";

import ProductCard from "./ProductCard";
import { MAX_COMPARE } from "../../features/compare/constants";
import { renderWithProviders as baseRender } from "../../test/renderWithProviders";
import { TEST_USER_ID } from "../../test/fakeBackend";
import type { ProductCardModel } from "../../types/product";

/**
 * Renders a card as a signed-in user.
 *
 * Chapter 23.5 made both toggles user-scoped API calls. Signed out they are
 * no-ops by design — the correct behaviour for a guest, and useless for a suite
 * whose subject is what the toggles do. Every test below therefore needs a
 * session, so it is supplied here rather than repeated at twenty-three call
 * sites, and the tests themselves are unchanged.
 *
 * The requests land on the in-memory fake installed by `test/setup.ts`, so a
 * click still ends in a durable "pressed" rather than an optimistic flip that
 * rolls back when an unstubbed `fetch` rejects. That the assertions below still
 * pass unmodified is the point: the behaviour they describe did not change, only
 * what it costs to produce it.
 */
function renderWithProviders(ui: ReactElement) {
    return baseRender(ui, { signedInAs: TEST_USER_ID });
}

/**
 * The shared product tile — the one component that appears on the browse grid, in search results,
 * on the wishlist and in every related-products rail.
 *
 * The tests are written the way the component is used: find controls by their accessible name, click
 * them, and assert on what changed for a user or a screen reader. Nothing here reaches for a class
 * name or a test id, because the styling is the part most likely to change for reasons that are not
 * bugs — and a test that breaks on a Tailwind edit is a test people learn to ignore.
 */

const product: ProductCardModel = {
    slug: "iphone-16-pro",
    name: "iPhone 16 Pro",
    brand: "Apple",
    category: "Smartphone",
    price: 119900,
    originalPrice: 134900,
    rating: 4.8,
    reviews: 19412,
    inStock: true,
    image: "",
};

function make(overrides: Partial<ProductCardModel> = {}): ProductCardModel {
    return { ...product, ...overrides };
}

const heart = (name = product.name) =>
    screen.getByRole("button", { name: new RegExp(`${name} (to|from) wishlist`, "i") });

/**
 * The compare toggle has *three* accessible names, not two, and a helper that only knew about
 * "add"/"remove" could never find the button in the state this component is most interesting in:
 *
 *   - `Add {name} to comparison`
 *   - `Remove {name} from comparison`
 *   - `Comparison is full — remove a product to add {name}`
 *
 * Matching on "comparison" and the product name in either order covers all three, and still cannot
 * collide with the wishlist button, whose name never contains the word.
 */
const compare = (name = product.name) =>
    screen.getByRole("button", {
        name: new RegExp(`(comparison.*${name}|${name}.*comparison)`, "i"),
    });

describe("ProductCard", () => {

    describe("what it renders", () => {

        it("shows the name, brand, rating and review count", () => {
            renderWithProviders(<ProductCard product={make()} />);

            expect(screen.getByRole("link", { name: "iPhone 16 Pro" })).toBeInTheDocument();
            expect(screen.getByText("Apple")).toBeInTheDocument();
            expect(screen.getByText("4.8")).toBeInTheDocument();
            // Indian digit grouping, from lib/currency.
            expect(screen.getByText("(19,412)")).toBeInTheDocument();
        });

        it("links to the product's own page by slug", () => {
            renderWithProviders(<ProductCard product={make()} />);

            expect(screen.getByRole("link", { name: "iPhone 16 Pro" }))
                .toHaveAttribute("href", "/product/iphone-16-pro");
        });

        /**
         * Chapter 27 deleted the green "N% off" pill from this card. These three tests used to
         * assert it rendered, did not render at 0%, and did not render without an original price.
         *
         * They are not deleted with it, because what they were really protecting is still true and
         * still worth protecting: the card has to show BOTH prices, since the struck-through
         * original is now the only thing on the card carrying "this costs less than it did". A
         * future edit that tidied away the second price would silently drop that information, and
         * nothing else in the suite would notice.
         *
         * The last of the three is inverted into a standing guard against the pattern coming back.
         */
        it("shows the price and the original price struck through", () => {
            renderWithProviders(
                <ProductCard product={make({ price: 100, originalPrice: 125 })} />,
            );

            expect(screen.getByText("₹100")).toBeInTheDocument();
            expect(screen.getByText("₹125")).toBeInTheDocument();
        });

        it("shows only the one price when there is no original price", () => {
            renderWithProviders(<ProductCard product={make({ originalPrice: undefined })} />);

            expect(screen.getByText("₹1,19,900")).toBeInTheDocument();
            expect(screen.queryByText("₹1,34,900")).not.toBeInTheDocument();
        });

        it("renders no discount chip, at any discount", () => {
            renderWithProviders(
                <ProductCard product={make({ price: 100, originalPrice: 125 })} />,
            );

            expect(screen.queryByText(/% off/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/save/i)).not.toBeInTheDocument();
        });

        it("marks an out-of-stock product and changes its call to action", () => {
            renderWithProviders(<ProductCard product={make({ inStock: false })} />);

            expect(screen.getByText("Out of stock")).toBeInTheDocument();
            expect(screen.getByText("See availability")).toBeInTheDocument();
            expect(screen.queryByText("View details")).not.toBeInTheDocument();
        });

        /**
         * `aiScore` has no column behind it, and `toCardModel` deliberately never sets it. The badge
         * must stay hidden rather than render an empty pill — if this fails, something has started
         * inventing a score.
         */
        it("hides the AI badge when there is no score", () => {
            renderWithProviders(<ProductCard product={make()} />);

            expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
        });
    });

    /**
     * Chapter 23 merged the homepage's own near-duplicate card into this one. These are the
     * behaviours that card had and this one did not, so they are the ones a future edit is most
     * likely to drop — nothing else in the suite would notice, because the six pre-existing call
     * sites pass none of these props.
     *
     * The absence cases matter as much as the presence ones: every prop here is optional, and
     * "renders nothing when not given" is what made the merge safe for callers that never opt in.
     */
    describe("the merged homepage behaviours", () => {

        it("renders a section badge when one is given", () => {
            renderWithProviders(<ProductCard product={make()} badge="Trending" />);

            expect(screen.getByText("Trending")).toBeInTheDocument();
        });

        it("renders no badge by default", () => {
            renderWithProviders(<ProductCard product={make()} />);

            expect(screen.queryByText("Trending")).not.toBeInTheDocument();
        });

        /**
         * This used to assert the discount pill and the section badge rendered together — the state
         * that made them a stacked column rather than one corner. Chapter 27 removed the pill, so
         * the column collapsed to a single element and the collision it guarded against can no
         * longer occur.
         *
         * What is asserted instead is that the section label survived the removal: it shared that
         * wrapper, and deleting a wrapper's first child is a normal way to lose its second.
         */
        it("still shows the section badge on a discounted product", () => {
            renderWithProviders(
                <ProductCard
                    product={make({ price: 100, originalPrice: 125 })}
                    badge="Bestseller"
                />,
            );

            expect(screen.getByText("Bestseller")).toBeInTheDocument();
            expect(screen.getByText("₹125")).toBeInTheDocument();
        });

        it("renders the cheapest store when one is given", () => {
            renderWithProviders(<ProductCard product={make()} store="Amazon" />);

            expect(screen.getByText(/Lowest at/)).toBeInTheDocument();
            expect(screen.getByText("Amazon")).toBeInTheDocument();
        });

        it("renders no store line by default", () => {
            renderWithProviders(<ProductCard product={make()} />);

            expect(screen.queryByText(/Lowest at/)).not.toBeInTheDocument();
        });

        /**
         * The homepage supplies no brand, so the adapter passes an empty string. Rendering it
         * unguarded printed an empty accent-coloured line above every homepage title — invisible in
         * a screenshot, and a stray gap in the layout.
         */
        it("omits the brand line when the brand is empty", () => {
            const { container } = renderWithProviders(
                <ProductCard product={make({ brand: "" })} />,
            );

            expect(screen.queryByText("Apple")).not.toBeInTheDocument();
            // No empty paragraph left behind where the brand used to be.
            expect(
                Array.from(container.querySelectorAll("p")).filter(
                    (node) => node.textContent === "",
                ),
            ).toHaveLength(0);
        });

        /**
         * With no brand to sit beside, the score must still sit at the end of its row rather than
         * sliding to the start — which is what `justify-between` alone would have done.
         */
        it("still shows the AI score when there is no brand", () => {
            renderWithProviders(
                <ProductCard product={make({ brand: "", aiScore: 96 })} />,
            );

            expect(screen.getByText("96")).toBeInTheDocument();
        });
    });

    describe("the wishlist toggle", () => {

        /**
         * `aria-pressed` is the whole reason this is a `<button>` and not a decorated `<div>`: it is
         * how a screen-reader user knows whether the product is saved, and it is the only signal
         * that distinguishes the two states without seeing the fill.
         */
        it("starts unpressed and reads as 'add'", () => {
            renderWithProviders(<ProductCard product={make()} />);

            expect(heart()).toHaveAttribute("aria-pressed", "false");
            expect(heart()).toHaveAccessibleName("Add iPhone 16 Pro to wishlist");
        });

        it("becomes pressed and reads as 'remove' after one click", async () => {
            const user = userEvent.setup();
            renderWithProviders(<ProductCard product={make()} />);

            await user.click(heart());

            expect(heart()).toHaveAttribute("aria-pressed", "true");
            expect(heart()).toHaveAccessibleName("Remove iPhone 16 Pro from wishlist");
        });

        it("returns to unpressed on a second click", async () => {
            const user = userEvent.setup();
            renderWithProviders(<ProductCard product={make()} />);

            await user.click(heart());
            await user.click(heart());

            expect(heart()).toHaveAttribute("aria-pressed", "false");
            expect(heart()).toHaveAccessibleName("Add iPhone 16 Pro to wishlist");
        });

        it("is operable by keyboard", async () => {
            const user = userEvent.setup();
            renderWithProviders(<ProductCard product={make()} />);

            heart().focus();
            await user.keyboard("{Enter}");

            expect(heart()).toHaveAttribute("aria-pressed", "true");
        });

        /**
         * Saving one product must not save another. Trivial-sounding, and exactly what breaks when a
         * selection is stored as a boolean somewhere instead of keyed by slug.
         */
        it("tracks each product separately", async () => {
            const user = userEvent.setup();
            renderWithProviders(
                <>
                    <ProductCard product={make()} />
                    <ProductCard product={make({ slug: "macbook-air", name: "MacBook Air" })} />
                </>,
            );

            await user.click(heart("iPhone 16 Pro"));

            expect(heart("iPhone 16 Pro")).toHaveAttribute("aria-pressed", "true");
            expect(heart("MacBook Air")).toHaveAttribute("aria-pressed", "false");
        });
    });

    describe("the compare toggle", () => {

        it("starts unpressed and reads as 'add'", () => {
            renderWithProviders(<ProductCard product={make()} />);

            expect(compare()).toHaveAttribute("aria-pressed", "false");
            expect(compare()).toHaveAccessibleName("Add iPhone 16 Pro to comparison");
        });

        it("becomes pressed and reads as 'remove' after one click", async () => {
            const user = userEvent.setup();
            renderWithProviders(<ProductCard product={make()} />);

            await user.click(compare());

            expect(compare()).toHaveAttribute("aria-pressed", "true");
            expect(compare()).toHaveAccessibleName("Remove iPhone 16 Pro from comparison");
        });

        /**
         * The four-item cap, exercised through the UI rather than against the provider directly.
         * Five cards, four selected, and the fifth must refuse — while the four already chosen stay
         * clickable, because a selected product has to remain removable.
         */
        describe(`the ${MAX_COMPARE}-item cap`, () => {

            const five = Array.from({ length: 5 }, (_, index) =>
                make({ slug: `product-${index}`, name: `Product ${index}` }));

            function renderFive() {
                return renderWithProviders(
                    <>
                        {five.map((item) => (
                            <ProductCard key={item.slug} product={item} />
                        ))}
                    </>,
                );
            }

            it(`disables the toggle on an unselected card once ${MAX_COMPARE} are chosen`, async () => {
                const user = userEvent.setup();
                renderFive();

                for (let index = 0; index < MAX_COMPARE; index++) {
                    await user.click(compare(`Product ${index}`));
                }

                expect(compare("Product 4")).toBeDisabled();
            });

            it("explains why, in the accessible name and the tooltip", async () => {
                const user = userEvent.setup();
                renderFive();

                for (let index = 0; index < MAX_COMPARE; index++) {
                    await user.click(compare(`Product ${index}`));
                }

                const blocked = screen.getByRole("button", {
                    name: /Comparison is full — remove a product to add Product 4/,
                });
                expect(blocked).toHaveAttribute("title", "Comparison is full");
            });

            /**
             * The condition is `isFull && !comparing`, and this is the half that a simpler
             * `disabled={isFull}` would get wrong: it would lock all four selections in with no way
             * to remove any of them, and the comparison could never be changed again.
             */
            it("leaves the already-selected cards clickable so a choice can be undone", async () => {
                const user = userEvent.setup();
                renderFive();

                for (let index = 0; index < MAX_COMPARE; index++) {
                    await user.click(compare(`Product ${index}`));
                }

                expect(compare("Product 0")).toBeEnabled();

                await user.click(compare("Product 0"));

                expect(compare("Product 0")).toHaveAttribute("aria-pressed", "false");
                // Space freed, so the fifth becomes available.
                expect(compare("Product 4")).toBeEnabled();
            });

            it(`never admits more than ${MAX_COMPARE} products`, async () => {
                const user = userEvent.setup();
                renderFive();

                for (const item of five) {
                    const button = compare(item.name);
                    if (!(button as HTMLButtonElement).disabled) {
                        await user.click(button);
                    }
                }

                const pressed = screen
                    .getAllByRole("button", { name: /comparison/i })
                    .filter((button) => button.getAttribute("aria-pressed") === "true");

                expect(pressed).toHaveLength(MAX_COMPARE);
            });
        });
    });

    /**
     * The two toggles are independent selections that happen to sit next to each other. A card that
     * wired them to one piece of state would pass every test above and fail this one.
     */
    it("keeps the wishlist and compare selections independent", async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<ProductCard product={make()} />);

        await user.click(heart());

        expect(within(container).getByRole("button", { name: /wishlist/i }))
            .toHaveAttribute("aria-pressed", "true");
        expect(within(container).getByRole("button", { name: /comparison/i }))
            .toHaveAttribute("aria-pressed", "false");
    });
});
