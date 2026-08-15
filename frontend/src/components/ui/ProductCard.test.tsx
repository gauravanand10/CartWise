import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import ProductCard from "./ProductCard";
import { MAX_COMPARE } from "../../features/compare/constants";
import { renderWithProviders } from "../../test/renderWithProviders";
import type { ProductCardModel } from "../../types/product";

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

        it("shows the discount as a rounded percentage off", () => {
            renderWithProviders(
                <ProductCard product={make({ price: 100, originalPrice: 125 })} />,
            );

            expect(screen.getByText("20% off")).toBeInTheDocument();
        });

        /**
         * `discountPercent` returns 0 rather than a negative when the "original" is not higher, so a
         * mispriced row shows no badge instead of "−15% off".
         */
        it("shows no discount badge when the original price is not higher", () => {
            renderWithProviders(
                <ProductCard product={make({ price: 100, originalPrice: 100 })} />,
            );

            expect(screen.queryByText(/% off/)).not.toBeInTheDocument();
        });

        it("shows no discount badge when there is no original price", () => {
            renderWithProviders(<ProductCard product={make({ originalPrice: undefined })} />);

            expect(screen.queryByText(/% off/)).not.toBeInTheDocument();
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
