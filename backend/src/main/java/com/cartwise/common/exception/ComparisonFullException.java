package com.cartwise.common.exception;

/**
 * Thrown when a product cannot be compared because the comparison already holds its maximum.
 *
 * <p>Its own exception type rather than an {@link IllegalArgumentException}, because the request was
 * not malformed. The slug was real, the caller was entitled to it, and the same request would have
 * succeeded a moment earlier — what refused it is the current state of the resource. That is a 409,
 * and mapping it through {@code IllegalArgumentException} would have answered 400 and told the
 * client its message was wrong when its message was fine.
 *
 * <p>Carries the limit rather than hardcoding a sentence, so the message cannot drift out of step
 * with {@code ComparisonService.MAX_COMPARISON_PRODUCTS} the way a copied literal would.
 */
public class ComparisonFullException extends RuntimeException {

    private final int limit;

    public ComparisonFullException(int limit) {
        super("A comparison holds at most " + limit + " products.");
        this.limit = limit;
    }

    /** The cap that was hit. Exposed so a client-facing message can state the number. */
    public int getLimit() {
        return limit;
    }
}
