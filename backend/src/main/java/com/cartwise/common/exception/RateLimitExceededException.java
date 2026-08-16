package com.cartwise.common.exception;

/**
 * Thrown when a caller has spent its allowance for an endpoint. Chapter 25.
 *
 * <p>Carries the retry delay because the handler needs it for the {@code Retry-After} header, and
 * the bucket that computed it is the only thing that knows it. Passing it in the exception keeps
 * {@link GlobalExceptionHandler} free of any knowledge of how limiting is implemented.
 *
 * <p>The message deliberately does not say which limit was hit or how much of it remains. A caller
 * probing for the exact threshold learns nothing from the response beyond "not now, try in N
 * seconds", which is everything a legitimate client needs and nothing an abusive one can tune
 * against.
 */
public class RateLimitExceededException extends RuntimeException {

    /** Machine-readable code, matching the convention of every other CartWise error. */
    public static final String CODE = "RATE_LIMIT_EXCEEDED";

    private final long retryAfterSeconds;

    public RateLimitExceededException(long retryAfterSeconds) {
        super("Too many requests. Try again in " + retryAfterSeconds + " seconds.");
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
