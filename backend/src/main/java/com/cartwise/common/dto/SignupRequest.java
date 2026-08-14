package com.cartwise.common.dto;

/**
 * Body of {@code POST /api/auth/signup}.
 *
 * <p>Two fields, because this chapter registers an account and nothing more — no display name, no
 * marketing consent, no password confirmation. A confirmation field in particular belongs to the
 * form, not to the API: whether the user typed it twice is a question the browser can answer, and
 * sending both to the server would mean transmitting the password twice for no gain.
 *
 * @param email    the address that will identify the account; normalised and validated by
 *                 {@code AuthService}
 * @param password the raw password. It exists in this object for the length of one request and is
 *                 hashed before anything is persisted — it must never be logged, echoed in a
 *                 response, or included in an error message.
 */
public record SignupRequest(String email, String password) {

    /**
     * Overridden so a request object cannot print the password it carries.
     *
     * <p>Records generate a {@code toString} that includes every component, which is a good default
     * everywhere except here. This one exists because the generated version would put a plaintext
     * password into any log line, exception message or debugger output that touched the object.
     */
    @Override
    public String toString() {
        return "SignupRequest{email='" + email + "', password=***}";
    }
}
