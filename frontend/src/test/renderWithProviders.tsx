import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import AuthProvider from "../features/auth/context/AuthProvider";
import CompareProvider from "../features/compare/context/CompareProvider";
import WishlistProvider from "../features/wishlist/context/WishlistProvider";
import { setSession } from "../services/api";

/**
 * Renders a component with the providers the real application wraps it in.
 *
 * `ProductCard` reads both selection contexts and renders a `<Link>`, so four providers are now the
 * minimum for it to mount at all. Using the *real* providers rather than mock context values is
 * deliberate: the wishlist toggle, the comparison's four-item cap and their persistence are the
 * behaviour under test, and a stubbed context would let a test assert that the stub behaves.
 *
 * `AuthProvider` joined in Chapter 23.5 and must stay outermost, mirroring `App.tsx`: both selection
 * providers call `useAuth()`, which throws when it is missing. That is exactly what happened when
 * this helper was left alone — 87 tests failed at once with "useAuth must be used inside
 * <AuthProvider>", none of them about authentication.
 *
 * <p>No session is established here, so every test runs as a signed-out user. That is the right
 * default and it is worth being explicit about what it means after the rewire: signed out, the
 * selection providers hold an empty list, never fetch, and their mutators are no-ops. Tests that
 * assert on toggling behaviour therefore need a session — see the auth-aware tests added alongside
 * the providers — and the ones that do not are unaffected because they never depended on a mutation
 * reaching a server that did not exist.
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
    /**
     * Sign in as this user id before rendering, or stay signed out (the default).
     *
     * Chapter 23.5. The wishlist and comparison are user-scoped now, so a signed
     * out render has empty selections and no-op mutators — correct behaviour,
     * and useless for a test about toggling. Those tests pass `signedInAs` and
     * get a session plus the fake backend installed by `setup.ts`.
     *
     * Signed out is the default deliberately, so that the many tests which never
     * touch a selection keep making no requests at all. Defaulting to signed in
     * would have every catalogue and carousel test quietly fetch two endpoints
     * it does not care about.
     */
    signedInAs?: number;
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
    { route = "/", path, signedInAs, ...options }: Options = {},
): RenderResult {
    // Set before render, not in an effect: AuthProvider seeds its state from
    // `getSession()` in a `useState` initialiser, so a session established after
    // the first render would not be seen until something else re-rendered.
    if (signedInAs !== undefined) {
        setSession({
            userId: signedInAs,
            email: `user${signedInAs}@example.test`,
            // Never verified — the fake backend does not check it, and the real
            // one is not running. It exists because `AuthSession` requires it.
            token: "test-token",
        });
    }

    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter initialEntries={[route]}>
                <AuthProvider>
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
                </AuthProvider>
            </MemoryRouter>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}
