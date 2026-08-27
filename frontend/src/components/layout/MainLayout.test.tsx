import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Link, Route, Routes } from "react-router-dom";

import MainLayout from "./MainLayout";
import { renderWithProviders } from "../../test/renderWithProviders";

/**
 * The layout's accessibility contract.
 *
 * ===========================================================================
 * BOTH OF THESE WERE MEASURED FAILURES BEFORE CHAPTER 29, IN A REAL BROWSER.
 *
 * Focus after an in-app navigation was `document.body` — React Router replaces
 * the DOM and moves nothing. For a screen-reader user that means a navigation
 * is announced not at all; for a keyboard user it means the next Tab starts at
 * the top of the document, back through the top bar, the logo, the search
 * field, the wishlist and compare buttons and the seven category chips, after
 * every single navigation.
 *
 * And there was no skip link anywhere, which is a WCAG 2.4.1 (Level A) failure
 * outright — not a judgement call about severity.
 * ===========================================================================
 */

function Pages() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route
                    path="/"
                    element={
                        <div>
                            <h1>Home page</h1>
                            <Link to="/second">Go to second</Link>
                        </div>
                    }
                />
                <Route
                    path="/second"
                    element={
                        <div>
                            <h1>Second page</h1>
                            <button type="button">A control on page two</button>
                        </div>
                    }
                />
            </Route>
        </Routes>
    );
}

describe("MainLayout accessibility", () => {

    it("exposes a skip link as the first focusable element", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pages />, { route: "/" });

        await user.tab();

        const skip = screen.getByRole("link", { name: "Skip to main content" });
        expect(skip).toHaveFocus();
        expect(skip).toHaveAttribute("href", "#main-content");
    });

    it("points the skip link at a main landmark that exists", () => {
        renderWithProviders(<Pages />, { route: "/" });

        const main = document.getElementById("main-content");
        expect(main).not.toBeNull();
        expect(main!.tagName).toBe("MAIN");
    });

    /**
     * `tabIndex={-1}` is what allows focus to be moved here programmatically
     * without the region itself becoming a tab stop. Without it the focus call
     * below silently does nothing.
     */
    it("makes the main region programmatically focusable but not a tab stop", () => {
        renderWithProviders(<Pages />, { route: "/" });

        expect(document.getElementById("main-content")).toHaveAttribute("tabindex", "-1");
    });

    it("moves focus to the main region after an in-app navigation", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pages />, { route: "/" });

        await user.click(screen.getByRole("link", { name: "Go to second" }));

        expect(await screen.findByText("Second page")).toBeInTheDocument();
        await waitFor(() =>
            expect(document.getElementById("main-content")).toHaveFocus());
    });

    /**
     * The other half: focus must NOT be stolen on a cold load. The browser's
     * own start-of-document position is correct there, and jumping into <main>
     * would skip a header the user never asked to skip.
     */
    it("leaves focus alone on first render", () => {
        renderWithProviders(<Pages />, { route: "/" });

        expect(document.getElementById("main-content")).not.toHaveFocus();
        expect(document.body).toHaveFocus();
    });

    /**
     * The practical payoff, asserted as behaviour rather than as a focus
     * assertion: after navigating, the first Tab lands on a control belonging
     * to the NEW page, not back at the top of the site chrome.
     */
    it("puts the next tab stop inside the new page rather than back in the header", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pages />, { route: "/" });

        await user.click(screen.getByRole("link", { name: "Go to second" }));
        await waitFor(() =>
            expect(document.getElementById("main-content")).toHaveFocus());

        await user.tab();

        expect(screen.getByRole("button", { name: "A control on page two" })).toHaveFocus();
    });
});
