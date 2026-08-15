import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import CompareProvider from "../features/compare/context/CompareProvider";
import WishlistProvider from "../features/wishlist/context/WishlistProvider";

/**
 * Renders a component with the providers the real application wraps it in.
 *
 * `ProductCard` reads both selection contexts and renders a `<Link>`, so three providers are the
 * minimum for it to mount at all. Using the *real* providers rather than mock context values is
 * deliberate: the wishlist toggle, the comparison's four-item cap and their persistence are the
 * behaviour under test, and a stubbed context would let a test assert that the stub behaves.
 *
 * `MemoryRouter` rather than `BrowserRouter`: it keeps history in memory, so a test can start at any
 * URL and read the resulting one without touching `window.history` — which is what makes the
 * URL-is-the-state tests possible.
 */

interface Options extends Omit<RenderOptions, "wrapper"> {
    /** The URL the test starts at, e.g. `/browse?category=laptop`. */
    route?: string;
    /** Set when the component under test reads route params; renders it at this path pattern. */
    path?: string;
}

/**
 * Records the current location so a test can assert on the URL the app navigated to.
 *
 * A component rather than a returned value, because the location changes as the test interacts and
 * anything captured at render time would be a stale snapshot. Reading `locationRef.current` after an
 * interaction gives the URL as it stands at that moment.
 */
export const locationRef: { current: { pathname: string; search: string } } = {
    current: { pathname: "/", search: "" },
};

function LocationRecorder() {
    const location = useLocation();
    locationRef.current = { pathname: location.pathname, search: location.search };
    return null;
}

/** Reads the current query string as `URLSearchParams`, for assertions about filters. */
export function currentSearchParams(): URLSearchParams {
    return new URLSearchParams(locationRef.current.search);
}

export function renderWithProviders(
    ui: ReactElement,
    { route = "/", path, ...options }: Options = {},
): RenderResult {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter initialEntries={[route]}>
                <WishlistProvider>
                    <CompareProvider>
                        <LocationRecorder />
                        {path ? (
                            <Routes>
                                <Route path={path} element={children} />
                            </Routes>
                        ) : (
                            children
                        )}
                    </CompareProvider>
                </WishlistProvider>
            </MemoryRouter>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}
