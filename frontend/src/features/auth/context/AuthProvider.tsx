import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AuthContext } from "./authContext";
import type { AuthState, AuthStatus, AuthUser } from "./authContext";
import {
    getSession,
    login as apiLogin,
    logout as apiLogout,
    signup as apiSignup,
} from "../../../services/api";
import type { AuthSession } from "../../../services/api";

/**
 * Provides the signed-in user to the whole app.
 *
 * Chapter 23.5. `services/api.ts` has had `login`, `signup`, `getSession` and
 * `setSession` since Chapter 18 and nothing ever called them — there was no
 * login page, no context and no route, so the wishlist and comparison endpoints
 * were unreachable by construction. This is the layer that was missing.
 *
 * ---------------------------------------------------------------------------
 * STORAGE IS NOT THIS FILE'S DECISION
 *
 * The token lives in localStorage under `cartwise.auth.session`, and that was
 * settled in Chapter 18 by `services/api.ts`, which owns the key, the read, the
 * write and the guard around both. This provider deliberately keeps none of its
 * own: it calls `getSession()` for the initial value and lets `login`/`signup`
 * persist through `setSession` internally.
 *
 * Holding a second copy here would be the actual bug available in this design —
 * `api.ts` clears the session by itself on a 401 from any non-auth endpoint, and
 * a provider caching the user in React state alone would keep rendering a signed
 * in navbar for a session the request layer had already discarded.
 * ---------------------------------------------------------------------------
 */

/** Projects the stored session down to the fields the UI shows. */
function toUser(session: AuthSession | null): AuthUser | null {
    return session ? { id: session.userId, email: session.email } : null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
    /*
     * Read lazily in `useState` rather than in an effect, and this is the whole
     * of "session restoration on reload".
     *
     * `api.ts` reads localStorage once at module load, so `getSession()` is
     * synchronous and already populated by the time this initialiser runs. An
     * effect would work too and would be worse: there would be one render where
     * a signed-in user is reported as signed out, which is one render in which
     * ProtectedRoute redirects them to the login page.
     */
    const [user, setUser] = useState<AuthUser | null>(() => toUser(getSession()));

    /*
     * There is no "validating" state, because there is nothing to validate
     * against. The backend has no `/api/auth/me` and no refresh endpoint — the
     * token is stateless and, per JwtTokenProvider, simply expires. So a
     * restored session is *trusted* until a request fails.
     *
     * That is a real and stated limitation rather than an oversight: reloading
     * with an expired token renders a signed-in navbar until the first protected
     * request answers 401, at which point `api.ts` clears the session. The
     * providers below react to that by reporting the user as signed out on their
     * next render. The alternative — a validation round-trip before the first
     * paint — costs every page load a blocking request to catch a case that
     * resolves itself within one interaction.
     */
    const status: AuthStatus = user ? "authenticated" : "unauthenticated";

    const login = useCallback(async (email: string, password: string) => {
        // `apiLogin` persists the session itself. Deliberately not wrapped in a
        // try/catch: the form needs the error to render a message, and a
        // provider that swallowed it would leave the form unable to tell a
        // rejected password from an unreachable server.
        const session = await apiLogin(email, password);
        setUser(toUser(session));
    }, []);

    const signup = useCallback(async (email: string, password: string) => {
        const session = await apiSignup(email, password);
        setUser(toUser(session));
    }, []);

    const logout = useCallback(() => {
        // Local only. The token is stateless — the backend keeps no record of it
        // and cannot revoke it — so signing out means forgetting it here, and
        // the token stays technically valid until it expires. That is the honest
        // consequence of stateless auth and the reason the lifetime is short.
        apiLogout();
        setUser(null);
    }, []);

    const value = useMemo<AuthState>(
        () => ({
            user,
            status,
            isAuthenticated: status === "authenticated",
            login,
            signup,
            logout,
        }),
        [user, status, login, signup, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
