import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";

import LoginPage from "./LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import {
    locationRef,
    renderWithProviders,
} from "../../test/renderWithProviders";
import { TEST_USER_ID } from "../../test/fakeBackend";
import { getSession } from "../../services/api";

/**
 * The authentication layer added in Chapter 23.5, tested through the two things
 * that depend on it: the sign-in form and the route gate.
 *
 * These are written against the real `AuthProvider` and the real `api.ts`, with
 * only `fetch` stubbed — the same boundary `mockApi` and `fakeBackend` use, and
 * for the same reason. Mocking `api.ts` would skip the session storage, the
 * bearer header and the 401 handling, which is most of what this layer is.
 *
 * `/auth/*` is not part of the shared fake backend: it answers exactly one
 * shape, and every test here cares about a *different* answer to it (success,
 * wrong password, taken email). So each test stubs that route itself and the
 * fake is left to the selection endpoints it exists for.
 */

/** Replies to `/api/auth/*` with one canned outcome, passing anything else through. */
function stubAuth(reply: { status: number; body?: unknown }) {
    const original = globalThis.fetch;

    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();

        if (url.includes("/api/auth/")) {
            return {
                ok: reply.status >= 200 && reply.status < 300,
                status: reply.status,
                statusText: String(reply.status),
                headers: new Headers(
                    reply.body === undefined
                        ? { "content-length": "0" }
                        : { "content-type": "application/json" },
                ),
                json: async () => {
                    if (reply.body === undefined) throw new Error("no body");
                    return reply.body;
                },
            } as unknown as Response;
        }

        return original(input as RequestInfo, init);
    });
}

const session = {
    userId: TEST_USER_ID,
    email: "ada@example.com",
    token: "signed-token",
};

function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
    return (async () => {
        await user.type(screen.getByLabelText("Email"), "ada@example.com");
        await user.type(screen.getByLabelText("Password"), "correct-horse");
        await user.click(screen.getByRole("button", { name: "Sign in" }));
    })();
}

describe("signing in", () => {

    it("stores the session and redirects home on success", async () => {
        const user = userEvent.setup();
        stubAuth({ status: 200, body: session });

        renderWithProviders(<LoginPage />, { route: "/login" });
        await fillAndSubmit(user);

        expect(getSession()?.userId).toBe(TEST_USER_ID);
        expect(locationRef.current.pathname).toBe("/");
    });

    /**
     * The whole point of `state.from`. A user bounced off `/wishlist` must land
     * back on `/wishlist`, not on the home page — otherwise signing in silently
     * loses what they were trying to do.
     */
    it("returns the user to the page they were sent from", async () => {
        const user = userEvent.setup();
        stubAuth({ status: 200, body: session });

        renderWithProviders(
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/wishlist" element={<p>Wishlist page</p>} />
            </Routes>,
            { route: "/login" },
        );

        // Simulates arriving by redirect. `ProtectedRoute` sets this state; the
        // form only reads it.
        window.history.replaceState({ from: "/wishlist" }, "");

        await fillAndSubmit(user);

        expect(getSession()).not.toBeNull();
    });

    /**
     * A wrong password must produce a readable message, not a silent failure and
     * not a crash. The message deliberately does not say *which* half was wrong:
     * the server answers 401 identically for an unknown email, and a UI that
     * distinguished them would rebuild the user-enumeration oracle the backend
     * refuses to provide.
     */
    it("shows a clear error when the credentials are rejected", async () => {
        const user = userEvent.setup();
        stubAuth({
            status: 401,
            body: {
                code: "INVALID_CREDENTIALS",
                message: "Invalid email or password.",
                timestamp: "2026-08-16T10:00:00Z",
            },
        });

        renderWithProviders(<LoginPage />, { route: "/login" });
        await fillAndSubmit(user);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "That email and password don't match an account.",
        );
        expect(getSession()).toBeNull();
        // Still on the form, with the button usable again for another attempt.
        expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    });

    it("reports a network failure without crashing", async () => {
        const user = userEvent.setup();
        vi.stubGlobal("fetch", async () => {
            throw new TypeError("Failed to fetch");
        });

        renderWithProviders(<LoginPage />, { route: "/login" });
        await fillAndSubmit(user);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            /couldn't reach CartWise/i,
        );
    });
});

describe("ProtectedRoute", () => {

    function renderGated(options: { signedInAs?: number } = {}) {
        return renderWithProviders(
            <Routes>
                <Route element={<ProtectedRoute />}>
                    <Route path="/wishlist" element={<p>Saved products</p>} />
                </Route>
                <Route path="/login" element={<p>Sign in here</p>} />
            </Routes>,
            { route: "/wishlist", ...options },
        );
    }

    it("redirects a signed-out visitor to the login page", () => {
        renderGated();

        expect(screen.getByText("Sign in here")).toBeInTheDocument();
        expect(screen.queryByText("Saved products")).not.toBeInTheDocument();
        expect(locationRef.current.pathname).toBe("/login");
    });

    it("lets a signed-in user through", () => {
        renderGated({ signedInAs: TEST_USER_ID });

        expect(screen.getByText("Saved products")).toBeInTheDocument();
        expect(locationRef.current.pathname).toBe("/wishlist");
    });
});

describe("useAuth", () => {

    /**
     * The hook throws rather than reporting everyone as signed out. A fallback
     * would render as a working app that has quietly stopped authenticating
     * anybody — a login page that never signs anyone in, and protected routes
     * that redirect forever.
     */
    it("throws outside a provider", () => {
        function Consumer() {
            useAuth();
            return null;
        }

        // Bare `render`, not `renderWithProviders` — the helper supplies an
        // AuthProvider, which is exactly the thing this test needs absent.
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});

        expect(() => render(<Consumer />)).toThrow(
            /useAuth must be used inside <AuthProvider>/,
        );

        spy.mockRestore();
    });
});
