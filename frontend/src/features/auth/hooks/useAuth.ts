import { useContext } from "react";

import { AuthContext } from "../context/authContext";
import type { AuthState } from "../context/authContext";

/**
 * Reads the app-wide authentication state.
 *
 * Throws rather than returning a signed-out fallback, matching
 * `useWishlistSelection` and `useCompareSelection`. The fallback would be
 * actively dangerous here in a way it is not for those two: a missing provider
 * would report every user as signed out, which renders as a working app that has
 * silently stopped authenticating anybody — a login page that never logs anyone
 * in, and protected routes that redirect forever.
 */
export function useAuth(): AuthState {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside <AuthProvider>.");
    }

    return context;
}
