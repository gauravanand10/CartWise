import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

import ErrorBoundary from "./ErrorBoundary";

/**
 * The boundary that did not exist until Chapter 29.
 *
 * Every test here would have failed against the previous code, because there
 * was nothing to import. What they actually protect is the property that
 * mattered: a component throwing during render must not take the application
 * down to a blank page.
 *
 * React logs caught errors to `console.error` by design, and jsdom re-throws
 * them noisily, so the console is silenced per test rather than globally —
 * silencing it globally would hide a real error from an unrelated test.
 */

function Boom({ shouldThrow = true }: { shouldThrow?: boolean }) {
    if (shouldThrow) throw new Error("kaboom");
    return <p>rendered fine</p>;
}

describe("ErrorBoundary", () => {
    let consoleError: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleError.mockRestore();
    });

    it("renders its children when nothing throws", () => {
        render(
            <ErrorBoundary>
                <Boom shouldThrow={false} />
            </ErrorBoundary>,
        );

        expect(screen.getByText("rendered fine")).toBeInTheDocument();
    });

    /**
     * The bug, stated as a test. Without a boundary React unmounts the whole
     * tree and the container is left empty — a white screen with no navigation
     * and no way back.
     */
    it("catches a render-time throw instead of unmounting the tree", () => {
        const { container } = render(
            <ErrorBoundary>
                <Boom />
            </ErrorBoundary>,
        );

        expect(container).not.toBeEmptyDOMElement();
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("This page didn't load")).toBeInTheDocument();
    });

    it("offers a way out that does not require the router", () => {
        render(
            <ErrorBoundary>
                <Boom />
            </ErrorBoundary>,
        );

        expect(screen.getByRole("link", { name: "Go to homepage" }))
            .toHaveAttribute("href", "/");
        expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    });

    it("logs the error for whoever is debugging", () => {
        render(
            <ErrorBoundary>
                <Boom />
            </ErrorBoundary>,
        );

        expect(consoleError).toHaveBeenCalled();
        const logged = consoleError.mock.calls.flat().join(" ");
        expect(logged).toContain("kaboom");
    });

    /**
     * "Try again" has to actually retry. A boundary that has caught stays
     * caught, so clearing the state is the only thing that can re-render the
     * children — and if they now succeed, the user is back.
     */
    it("re-renders the children when 'Try again' is pressed and the cause is gone", async () => {
        const user = userEvent.setup();

        function Flaky() {
            const [broken, setBroken] = useState(true);
            return (
                <>
                    <button type="button" onClick={() => setBroken(false)}>
                        fix it
                    </button>
                    <ErrorBoundary>
                        <Boom shouldThrow={broken} />
                    </ErrorBoundary>
                </>
            );
        }

        render(<Flaky />);
        expect(screen.getByRole("alert")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "fix it" }));
        await user.click(screen.getByRole("button", { name: "Try again" }));

        expect(screen.getByText("rendered fine")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    /**
     * The reset key is what stops one broken page poisoning every subsequent
     * route. MainLayout passes the pathname; without it, navigating away from a
     * page that threw would keep showing the error screen until a full reload.
     */
    it("resets when the reset key changes, so navigating away clears the error", () => {
        const { rerender } = render(
            <ErrorBoundary resetKey="/product/broken">
                <Boom />
            </ErrorBoundary>,
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();

        rerender(
            <ErrorBoundary resetKey="/wishlist">
                <Boom shouldThrow={false} />
            </ErrorBoundary>,
        );

        expect(screen.getByText("rendered fine")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("stays caught while the reset key is unchanged", () => {
        const { rerender } = render(
            <ErrorBoundary resetKey="/same">
                <Boom />
            </ErrorBoundary>,
        );

        rerender(
            <ErrorBoundary resetKey="/same">
                <Boom shouldThrow={false} />
            </ErrorBoundary>,
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
    });
});
