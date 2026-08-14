package com.cartwise.common.exception;

/**
 * Signup was attempted with an email that already has an account.
 *
 * <p>Reported as 409 Conflict: the request was well-formed and the caller was allowed to make it,
 * but it conflicts with the current state of the resource. 400 would suggest the client had sent
 * something malformed and should fix the shape of the request, which is not the case.
 *
 * <p>This does disclose that an address is registered — a signup form cannot avoid it, since the
 * user has to be told why their registration failed. Note the asymmetry with login, which must
 * <em>not</em> disclose the same thing: there, an attacker chooses the address and learns something
 * about a stranger's account; here, a person is being told about the account they are trying to
 * create. Suppressing it would mean either failing silently or claiming success without creating
 * anything.
 *
 * <p>The message never contains the address, so the fact does not travel any further than the
 * response to the person who typed it.
 */
public class EmailAlreadyRegisteredException extends RuntimeException {

    public EmailAlreadyRegisteredException(String message) {
        super(message);
    }
}
