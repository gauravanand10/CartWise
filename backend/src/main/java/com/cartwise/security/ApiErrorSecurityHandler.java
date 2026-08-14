package com.cartwise.security;

import com.cartwise.common.exception.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/**
 * Writes {@link ApiError} for the two failures that happen inside the filter chain.
 *
 * <p>{@code GlobalExceptionHandler} cannot help here. It is a {@code @RestControllerAdvice}, which
 * only sees exceptions thrown once a request has reached a controller — and a request rejected for
 * having no token never gets that far. Without this class those rejections would return Spring
 * Security's own empty response, and the frontend would have to handle a second error format for
 * the two cases it is most likely to hit.
 *
 * <p>One class implementing both interfaces because the two are the same job — serialise an error —
 * differing only in status and meaning, and the distinction between those two meanings is worth
 * stating once, here:
 *
 * <ul>
 *   <li><strong>401 Unauthorized</strong> — the request did not say who it was from. No token, an
 *       expired one, a forged one. The fix is to authenticate; retrying unchanged will not help.
 *   <li><strong>403 Forbidden</strong> — the request said who it was from, and that user is not
 *       allowed this. Authenticating again changes nothing, because the credential was never the
 *       problem.
 * </ul>
 *
 * <p>Answering 401 where 403 is meant sends a client into a pointless re-login loop; answering 403
 * where 401 is meant hides from it that its token has simply expired.
 */
@Component
public class ApiErrorSecurityHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final JsonMapper jsonMapper;
    private final Clock clock;

    public ApiErrorSecurityHandler(JsonMapper jsonMapper, Clock clock) {
        this.jsonMapper = jsonMapper;
        this.clock = clock;
    }

    /**
     * No usable credential was presented for an endpoint that requires one → 401.
     *
     * <p>The message is fixed and says nothing about why the token was unacceptable. "Expired",
     * "bad signature" and "malformed" are all useful to an attacker probing what this server
     * accepts, and none of them change what a legitimate client does next: obtain a new token.
     *
     * <p>No {@code WWW-Authenticate} header, which the HTTP specification associates with 401. Its
     * effect in a browser is to trigger the native credential dialog, and CartWise's login is a page
     * in the React app; a browser popup appearing over it would be worse than a missing header.
     */
    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException)
            throws IOException {

        write(response, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED",
                "Authentication is required to access this resource.");
    }

    /**
     * The caller is authenticated but this resource is not theirs → 403.
     *
     * <p>Reached when a valid token is used against another user's wishlist. The message is
     * deliberately about permission and mentions neither the target user nor whether they exist —
     * a 403 that varied depending on whether the id was real would leak the same account list a 404
     * would.
     */
    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException)
            throws IOException {

        write(response, HttpStatus.FORBIDDEN, "FORBIDDEN",
                "You do not have permission to access this resource.");
    }

    private void write(HttpServletResponse response, HttpStatus status, String code, String message)
            throws IOException {

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        jsonMapper.writeValue(
                response.getOutputStream(), new ApiError(code, message, Instant.now(clock)));
    }
}
