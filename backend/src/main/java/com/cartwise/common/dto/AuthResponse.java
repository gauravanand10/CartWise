package com.cartwise.common.dto;

/**
 * What signup and login both return: who you are, and the token that proves it.
 *
 * <p>One shape for both endpoints because the client's next move is the same after either — store
 * the token, remember the user, send the token on subsequent calls. A separate {@code SignupResponse}
 * would differ from this only in name.
 *
 * <p>Returning the token in the body, rather than setting it as an {@code HttpOnly} cookie, is the
 * choice this chapter makes and it has a real trade-off: a body token must be stored by JavaScript,
 * which means script running on the page can read it, so any cross-site-scripting flaw becomes a
 * credential theft. A cookie closes that door but opens the CSRF one and needs the protections that
 * come with it. Bearer tokens keep the API usable from anything — the React app, curl, a future
 * mobile client — without any of them needing cookie semantics, and that is what decides it here.
 *
 * @param userId the account's numeric id. The frontend needs it because the wishlist routes are
 *               {@code /api/users/{userId}/wishlist}; it is not a secret and it is in the token
 *               anyway.
 * @param email  the account's email, so the UI can show who is signed in without decoding the token
 * @param token  the signed JWT, to be sent back as {@code Authorization: Bearer <token>}
 */
public record AuthResponse(Long userId, String email, String token) {

    /**
     * Overridden to keep the token out of logs.
     *
     * <p>The token is a bearer credential: anything holding it can act as this user until it
     * expires. That makes it exactly as sensitive as a password for as long as it lives, and a
     * response object printed into a log line is one of the easiest ways for it to escape.
     */
    @Override
    public String toString() {
        return "AuthResponse{userId=" + userId + ", email='" + email + "', token=***}";
    }
}
