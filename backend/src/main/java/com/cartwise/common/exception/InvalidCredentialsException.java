package com.cartwise.common.exception;

/**
 * Login failed. Deliberately the <em>only</em> way login can fail.
 *
 * <p>One exception for both "no account with that email" and "wrong password for that account", and
 * it carries one message for both, because the alternative is a user-enumeration oracle: an attacker
 * with a list of email addresses submits each with a junk password, and a 404-versus-401 difference
 * tells them exactly which addresses have accounts here. That list is worth money on its own, and it
 * is the first step of a credential-stuffing run against the accounts it identifies.
 *
 * <p>This is why the brief's suggested "404 if user not found" is not implemented. The status is 401
 * in both cases and the message is the same sentence in both cases — the response must be
 * indistinguishable, not merely similar. {@code AuthService} additionally equalises the time the two
 * paths take, since a reply that comes back too fast to have checked a password says the same thing
 * as a 404 would.
 */
public class InvalidCredentialsException extends RuntimeException {

    /** The single message both failure paths use. Any second message here would defeat the point. */
    public static final String MESSAGE = "Invalid email or password.";

    public InvalidCredentialsException() {
        super(MESSAGE);
    }
}
