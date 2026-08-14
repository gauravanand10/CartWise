package com.cartwise.common.dto;

/**
 * Body of {@code POST /api/auth/login}.
 *
 * <p>Structurally identical to {@link SignupRequest} and kept separate anyway. They are the same
 * shape today by coincidence, not by rule: signup will grow fields that login must never accept,
 * and sharing one record would make that a breaking change instead of an addition. The name also
 * documents which endpoint a value came from at every point it is passed.
 *
 * @param email    the address to sign in as
 * @param password the raw password, checked against the stored hash and then discarded
 */
public record LoginRequest(String email, String password) {

    /** Overridden for the same reason as {@link SignupRequest#toString()} — never print a password. */
    @Override
    public String toString() {
        return "LoginRequest{email='" + email + "', password=***}";
    }
}
