import { createContext } from "react";

/** Who is signed in. Mirrors the fields of the API's `AuthResponse` worth showing. */
export interface AuthUser {
    id: number;
    email: string;
}

/**
 * Whether the app knows yet who the user is.
 *
 * Three states rather than a boolean, because "not signed in" and "not yet
 * determined" must not render the same thing. A `ProtectedRoute` that treated
 * `loading` as `unauthenticated` would bounce a signed-in user to the login page
 * on every reload, for the one frame before the session was read.
 *
 * `loading` is deliberately brief here — the session is read synchronously from
 * localStorage at module load — but it is modelled anyway, because the moment a
 * token is ever validated against the server it stops being brief.
 */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
    /** The signed-in user, or null when signed out. */
    user: AuthUser | null;
    status: AuthStatus;
    /** Convenience for the common check. Equivalent to `status === "authenticated"`. */
    isAuthenticated: boolean;

    /**
     * Exchanges credentials for a session.
     *
     * Rejects with the API's `ApiRequestError` on failure — status 401 for any
     * credential problem. Deliberately not caught here: the login form is the
     * only thing that can render the message, and swallowing it would leave the
     * form unable to tell a wrong password from a dead server.
     */
    login: (email: string, password: string) => Promise<void>;

    /** Registers and signs in as the new account. Rejects with 400 or 409. */
    signup: (email: string, password: string) => Promise<void>;

    logout: () => void;
}

/**
 * Authentication state, shared app-wide.
 *
 * A separate context from Wishlist and Compare, matching how those two are kept
 * apart from each other — but unlike that pair, this one is a genuine dependency
 * of both: a wishlist is a user's wishlist, so the providers that fetch them
 * have to know who is asking. That is why `AuthProvider` wraps them in
 * `App.tsx` rather than sitting beside them.
 *
 * `null` default so `useAuth` fails loudly when the provider is missing, rather
 * than reporting everyone as signed out — which would look like a working app
 * that has quietly stopped authenticating anyone.
 */
export const AuthContext = createContext<AuthState | null>(null);
