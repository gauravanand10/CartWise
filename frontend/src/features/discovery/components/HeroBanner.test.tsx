import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import HeroBanner from "./HeroBanner";
import { renderWithProviders } from "../../../test/renderWithProviders";

/**
 * The promo rail: dots, arrow keys, and the fact that it never moves on its own.
 *
 * <h3>jsdom has no layout, and this test has to work around it honestly.</h3>
 *
 * `HeroBanner` derives the active dot from real geometry — `card.offsetLeft`, `rail.scrollLeft` —
 * and jsdom reports 0 for every one of them because it does no layout at all. Left alone, the
 * component would compute "nearest card = 0" forever and every navigation assertion would pass
 * vacuously, which is worse than not testing it.
 *
 * {@link installRailGeometry} therefore supplies the numbers a browser would: each card 300px wide
 * at successive offsets, and a `scrollTo` that actually moves `scrollLeft` and fires the `scroll`
 * event the component listens for. What is verified is the component's own logic — index clamping,
 * nearest-card selection, which dot is marked current — against a simulated layout.
 *
 * <strong>What this cannot verify</strong> is that CSS scroll-snap lands where the component
 * expects, or that `snap-start` behaves as the source comments describe. Those are browser
 * behaviours, and confirming them needs a real browser. That is out of scope for this chapter and
 * recorded here rather than implied by a passing test.
 */

const SLIDE_COUNT = 4;
const CARD_WIDTH = 300;

/**
 * Gives the rail and its cards the geometry a browser would compute.
 *
 * `offsetLeft` is a read-only accessor on `HTMLElement.prototype`, so it is redefined per element;
 * `scrollLeft` is redefined as a plain writable value so the component's reads see what `scrollTo`
 * has written.
 */
function installRailGeometry(rail: HTMLElement) {
    Object.defineProperty(rail, "offsetLeft", { value: 0, configurable: true });

    Array.from(rail.children).forEach((child, index) => {
        Object.defineProperty(child, "offsetLeft", {
            value: index * CARD_WIDTH,
            configurable: true,
        });
    });

    let scrollLeft = 0;
    Object.defineProperty(rail, "scrollLeft", {
        get: () => scrollLeft,
        set: (value: number) => {
            scrollLeft = value;
        },
        configurable: true,
    });

    rail.scrollTo = ((options: ScrollToOptions) => {
        scrollLeft = options.left ?? 0;
        rail.dispatchEvent(new Event("scroll"));
    }) as HTMLElement["scrollTo"];
}

const rail = () => screen.getByRole("group", { name: /Highlight \d+ of \d+/ });
const dots = () => screen.getAllByRole("button", { name: /^Show / });
const currentDot = () => dots().findIndex((dot) => dot.getAttribute("aria-current") === "true");

describe("HeroBanner", () => {

    beforeEach(() => {
        renderWithProviders(<HeroBanner />);
        installRailGeometry(rail());
    });

    describe("structure", () => {

        it("announces itself as a carousel with a label", () => {
            expect(screen.getByRole("region", { name: "CartWise highlights" }))
                .toHaveAttribute("aria-roledescription", "carousel");
        });

        it("renders one dot per slide", () => {
            expect(dots()).toHaveLength(SLIDE_COUNT);
        });

        it("renders every slide's heading and call to action", () => {
            expect(screen.getByRole("heading", { name: "Compare specs side by side" }))
                .toBeInTheDocument();
            expect(screen.getByRole("link", { name: "Open compare" }))
                .toHaveAttribute("href", "/compare");
            expect(screen.getByRole("link", { name: "Show in stock" }))
                .toHaveAttribute("href", "/browse?inStock=true");
        });

        /**
         * The rail is focusable so arrow keys have somewhere to land. A scrollable region that
         * cannot be focused is unreachable for a keyboard user even though its contents are — one
         * of the quieter accessibility failures.
         */
        it("makes the rail itself focusable", () => {
            expect(rail()).toHaveAttribute("tabindex", "0");
        });

        it("starts on the first slide", () => {
            expect(currentDot()).toBe(0);
            expect(rail()).toHaveAccessibleName(`Highlight 1 of ${SLIDE_COUNT}`);
        });
    });

    describe("keyboard navigation", () => {

        it("advances one slide on ArrowRight", async () => {
            const user = userEvent.setup();
            rail().focus();

            await user.keyboard("{ArrowRight}");

            await waitFor(() => expect(currentDot()).toBe(1));
            expect(rail()).toHaveAccessibleName(`Highlight 2 of ${SLIDE_COUNT}`);
        });

        it("goes back one slide on ArrowLeft", async () => {
            const user = userEvent.setup();
            rail().focus();

            await user.keyboard("{ArrowRight}{ArrowRight}");
            await waitFor(() => expect(currentDot()).toBe(2));

            await user.keyboard("{ArrowLeft}");
            await waitFor(() => expect(currentDot()).toBe(1));
        });

        /** `goTo` clamps, so holding an arrow key at either end does not scroll past the rail. */
        it("does not move past the last slide", async () => {
            const user = userEvent.setup();
            rail().focus();

            await user.keyboard("{ArrowRight>8/}");

            await waitFor(() => expect(currentDot()).toBe(SLIDE_COUNT - 1));
        });

        it("does not move before the first slide", async () => {
            const user = userEvent.setup();
            rail().focus();

            await user.keyboard("{ArrowLeft>5/}");

            expect(currentDot()).toBe(0);
        });

        /**
         * The handler is on the container rather than on `window`, so arrow keys elsewhere on the
         * page are untouched. Asserted by pressing them somewhere else and seeing nothing move.
         */
        it("ignores arrow keys pressed outside the rail", async () => {
            const user = userEvent.setup();

            document.body.focus();
            await user.keyboard("{ArrowRight}");

            expect(currentDot()).toBe(0);
        });
    });

    describe("dot controls", () => {

        it("jumps to the slide a dot names", async () => {
            const user = userEvent.setup();

            await user.click(dots()[2]);

            await waitFor(() => expect(currentDot()).toBe(2));
        });

        it("moves the active marker off the previous dot", async () => {
            const user = userEvent.setup();

            await user.click(dots()[3]);

            await waitFor(() => expect(currentDot()).toBe(3));
            expect(dots()[0]).not.toHaveAttribute("aria-current", "true");
        });

        /**
         * Real buttons, each labelled with the slide it goes to — not dots-as-divs. The label names
         * the destination rather than saying "slide 3", which is meaningless read aloud.
         */
        it("labels each dot with its slide's heading", () => {
            expect(dots()[0]).toHaveAccessibleName("Show Compare specs side by side");
            // Chapter 27 reworded slide 2 — it promised price tracking that
            // does not exist. The assertion is still "the dot is named after
            // its slide's heading"; only the heading changed.
            expect(dots()[1]).toHaveAccessibleName("Show Save what you're deciding between");
        });

        it("keeps exactly one dot marked current", async () => {
            const user = userEvent.setup();

            await user.click(dots()[1]);

            await waitFor(() => {
                const marked = dots().filter((d) => d.getAttribute("aria-current") === "true");
                expect(marked).toHaveLength(1);
            });
        });
    });

    /**
     * The rail must not advance by itself. An auto-rotating carousel fails WCAG 2.2.2 without a
     * pause control, and it fails users more directly: it moves content out from under a pointer
     * mid-reach and restarts the reading of anyone slower than the interval.
     *
     * Asserted with real timers over a real interval. A fake-timer version would be faster and would
     * only prove that no timer fired — this proves nothing moved, whatever the mechanism.
     */
    it("does not advance on its own", async () => {
        expect(currentDot()).toBe(0);

        await new Promise((resolve) => setTimeout(resolve, 600));

        expect(currentDot()).toBe(0);
    });
});
