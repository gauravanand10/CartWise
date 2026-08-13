package com.cartwise.common.exception;

import jakarta.persistence.EntityNotFoundException;
import java.time.Clock;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Turns uncaught exceptions into the shared {@link ApiError} shape.
 *
 * <p>This is the cross-cutting concern that most justifies a {@code common} package: it belongs
 * to no single controller, yet every controller depends on it. Extending
 * {@link ResponseEntityExceptionHandler} matters — it keeps Spring MVC's own exceptions (unknown
 * path, wrong method, unreadable body) mapped to their correct 4xx statuses, so the catch-all
 * below only ever sees genuinely unexpected failures rather than swallowing 404s into 500s.
 *
 * <p>Chapter 17 adds the domain handlers the Chapter 15 version promised: not-found, bad input and
 * constraint conflicts. The reason each exists is the same — without it, an ordinary outcome
 * reaches the catch-all and is reported as a 500, which tells the client to retry something that
 * will never succeed.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final Clock clock;

    public GlobalExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    /**
     * A named thing was asked for and does not exist → 404.
     *
     * <p>The exception's message is passed through because services raise it with text they wrote
     * ("No product with slug foo") — it names the missing resource and nothing else. That is a
     * deliberate contract with the services, not a general policy of echoing exception messages;
     * the catch-all below does the opposite for exactly that reason.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError("NOT_FOUND", ex.getMessage(), Instant.now(clock)));
    }

    /**
     * The request itself was malformed → 400.
     *
     * <p>Raised by controllers for missing or empty fields. Logged at debug, not error: a client
     * sending a bad request is not a server fault, and logging it at error would fill production
     * logs with other people's mistakes.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleBadRequest(IllegalArgumentException ex) {
        log.debug("Rejected bad request: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiError("BAD_REQUEST", ex.getMessage(), Instant.now(clock)));
    }

    /**
     * A database constraint refused the write → 409.
     *
     * <p>The case that makes this real is two concurrent requests saving the same product for the
     * same user: both pass the service's existence check, one inserts, the other violates
     * {@code uk_wishlist_user_product}. That is a conflict with another request, not a server
     * failure, and 409 says so — a 500 would invite a retry that would fail identically.
     *
     * <p>The message is fixed rather than taken from the exception, which would otherwise leak
     * constraint and column names to the client. The real cause is logged at warn, where it is
     * useful to whoever is on call.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleConflict(DataIntegrityViolationException ex) {
        log.warn("Constraint violation on write", ex);
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(
                        "CONFLICT",
                        "The request conflicts with the current state of the resource.",
                        Instant.now(clock)));
    }

    /**
     * Last-resort handler: log the real cause server-side, return a generic body to the client.
     *
     * <p>Reached only by exceptions no handler above claims — genuine bugs. The body says nothing
     * about them on purpose: a stack trace or a JDBC message in an HTTP response is a gift to
     * anyone probing the service, and useless to a legitimate client either way.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiError("INTERNAL_ERROR", "An unexpected error occurred.",
                        Instant.now(clock)));
    }

    /**
     * Re-bodies every exception Spring MVC handles itself into {@link ApiError}.
     *
     * <p>The base class already maps unknown paths, wrong methods, unparseable JSON and path
     * variables of the wrong type to correct 4xx statuses — that part needs no help. What it does
     * not do is emit CartWise's error shape, so without this override a client would have to parse
     * two different error formats depending on how far into the request the failure happened.
     * Overriding this one method covers all of them at once.
     *
     * <p>The code is the status' own name ({@code BAD_REQUEST}, {@code METHOD_NOT_ALLOWED}) and the
     * message is its reason phrase. Neither carries any detail from the exception, because these
     * failures happen before any application code runs and their messages describe parser and
     * dispatcher internals.
     */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex,
            @Nullable Object body,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {

        HttpStatus status = HttpStatus.resolve(statusCode.value());
        String code = status != null ? status.name() : "ERROR";
        String message = status != null ? status.getReasonPhrase() : "Request failed.";

        log.debug("Spring MVC rejected request with {}: {}", statusCode.value(), ex.getMessage());

        return new ResponseEntity<>(new ApiError(code, message, Instant.now(clock)), headers,
                statusCode);
    }
}
