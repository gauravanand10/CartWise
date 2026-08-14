package com.cartwise.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Reads the {@code Authorization} header on every request and, if it carries a valid token, records
 * who the caller is for the rest of that request.
 *
 * <p><strong>It authenticates; it never rejects.</strong> A request with no token, or a bad one,
 * passes through unauthenticated and meets the authorization rules in {@code SecurityConfig} — which
 * answer 401 if the endpoint required a caller and let it through if it did not. Rejecting here
 * instead would mean this filter deciding which endpoints are public, duplicating a decision that
 * already lives in one place.
 *
 * <p>The result goes into the {@link SecurityContextHolder}, not into a request attribute. That is
 * not a stylistic preference: {@code .anyRequest().authenticated()} reads the security context and
 * nothing else, so a token recorded only as an attribute would leave every authenticated endpoint
 * answering 401 no matter how valid the token was.
 *
 * <p>{@link OncePerRequestFilter} because a servlet container may dispatch the same request through
 * the chain more than once — a forward, an error page — and re-authenticating on each pass would be
 * wasted signature verification at best.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null) {
            jwtTokenProvider.authenticate(token).ifPresent(user -> {
                // The authority list is where Chapter 19 lands, and it is the whole mechanism.
                //
                // `hasRole("ADMIN")` in SecurityConfig does not read the token, the principal, or
                // anything else this filter returns — it looks in exactly this collection for the
                // string "ROLE_ADMIN". Chapter 18 passed List.of() here, correctly, because nothing
                // checked authorities; leaving it empty now would mean a perfectly valid admin token
                // is refused 403 on every admin route, with nothing in any log to say why. The
                // ROLE_ prefix comes from Role.authority(), which is the only place it is applied.
                var authorities = List.of(new SimpleGrantedAuthority(user.role().authority()));

                var authentication =
                        new UsernamePasswordAuthenticationToken(user, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Pulls the token out of {@code Authorization: Bearer <token>}.
     *
     * <p>Returns null for a missing header, a scheme that is not Bearer, or a Bearer header with
     * nothing after it — all of which are simply "no token offered" rather than errors worth
     * reporting. The scheme comparison is case-sensitive on the prefix as written by every client
     * that follows RFC 6750; a client sending {@code bearer} lowercase would be treated as offering
     * no token, which is a limitation worth knowing about rather than a silent behaviour.
     */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(AUTHORIZATION_HEADER);

        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            return null;
        }

        String token = header.substring(BEARER_PREFIX.length()).trim();
        return token.isEmpty() ? null : token;
    }
}
