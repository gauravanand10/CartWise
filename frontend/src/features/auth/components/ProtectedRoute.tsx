import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

/**
 * Gates its child routes behind a session.
 *
 * Applied to `/wishlist` and `/compare`, which require login. That is not a
 * product preference imposed here — it is what the backend already enforces:
 * both resources are nested under `/api/users/{userId}/…` and answer 401
 * without a token, so a signed-out visitor has nothing to show. Rendering the
 * pages for a guest would mean rendering a permanently empty wishlist with
 * controls that silently do nothing, which is a worse answer than "sign in".
 *
 * Used as a layout route wrapping an `<Outlet />` rather than as a per-page
 * wrapper component. Both work; this one keeps the rule visible in
 * `AppRoutes` — a reader can see which routes are protected by looking at the
 * route table, instead of opening each page to check whether someone remembered
 * to wrap it.
 */
export default function ProtectedRoute() {
    const { status } = useAuth();
    const location = useLocation();

    /*
     * `loading` renders nothing rather than redirecting.
     *
     * This is why `AuthStatus` has three states instead of being a boolean. A
     * `loading` treated as "not signed in" would bounce a signed-in user to the
     * login page for the one frame before the session is read — and because the
     * redirect is a real navigation, they would stay there.
     *
     * Today the session is read synchronously from localStorage so this branch
     * is effectively unreachable. It is written anyway, because the moment a
     * token is validated against the server — which is what a `/api/auth/me`
     * endpoint would bring — it stops being unreachable, and the failure it
     * prevents is one that only shows up for users with slow connections.
     */
    if (status === "loading") return null;

    if (status === "unauthenticated") {
        /*
         * `state.from` carries where they were headed, so `AuthForm` can send
         * them back after signing in. `replace` keeps the protected URL out of
         * history — otherwise Back from the login page returns to the route
         * that just redirected, and bounces again.
         */
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname + location.search }}
            />
        );
    }

    return <Outlet />;
}
