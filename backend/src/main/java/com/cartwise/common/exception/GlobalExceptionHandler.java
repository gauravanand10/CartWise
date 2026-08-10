package com.cartwise.common.exception;

import java.time.Clock;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Turns uncaught exceptions into the shared {@link ApiError} shape.
 *
 * <p>This is the cross-cutting concern that most justifies a {@code common} package: it belongs
 * to no single controller, yet every controller depends on it. Extending
 * {@link ResponseEntityExceptionHandler} matters — it keeps Spring MVC's own exceptions (unknown
 * path, wrong method, unreadable body) mapped to their correct 4xx statuses, so the catch-all
 * below only ever sees genuinely unexpected failures rather than swallowing 404s into 500s.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final Clock clock;

    public GlobalExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    /**
     * Last-resort handler: log the real cause server-side, return a generic body to the client.
     *
     * <p>Domain-specific handlers (not-found, validation failures) are added alongside the
     * features that can raise them, from Chapter 17 onward.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiError("INTERNAL_ERROR", "An unexpected error occurred.",
                        Instant.now(clock)));
    }
}
