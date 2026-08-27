package com.cartwise.security;

import com.cartwise.common.exception.RateLimitExceededException;
import com.cartwise.config.RateLimitProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Applies the Chapter 25 rate limits.
 *
 * <p><strong>A Spring MVC interceptor rather than a servlet filter</strong>, and that choice buys
 * two specific things. It runs inside the {@code DispatcherServlet}, so a
 * {@link RateLimitExceededException} thrown here is resolved by
 * {@link com.cartwise.common.exception.GlobalExceptionHandler} and comes out as the same
 * {@code ApiError} shape as every other failure in this API — a filter would have had to serialise
 * that JSON by hand and would drift the first time the error shape changed. And it runs
 * <em>after</em> the security filter chain, so the authenticated principal is already in the
 * {@code SecurityContext} and per-user keying is a lookup rather than a second token parse.
 *
 * <p>The cost of that placement is honest and worth naming: a request rejected here has already
 * been through JWT validation, so limiting does not protect the signature-checking work. It
 * protects the database and the downstream third party, which is where the expense actually is.
 *
 * <h2>Keying</h2>
 *
 * <p>Per-IP for the auth endpoints and per-user everywhere else, which is the distinction that
 * makes this a real limit rather than a denial-of-service on the whole userbase:
 *
 * <ul>
 *   <li>Login and signup have no authenticated user by definition, so the client IP is the only
 *       identity available. Keying them globally would mean one attacker locking every user in the
 *       world out of signing in.
 *   <li>Writes and the admin backfill do have one, and the user id is a far better key than an IP:
 *       it survives a phone changing networks, and it does not punish everyone behind a shared
 *       corporate NAT for one colleague's enthusiasm.
 * </ul>
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);

    private final TokenBucket authBucket;
    private final TokenBucket writeBucket;
    private final TokenBucket adminBucket;
    private final TokenBucket clickBucket;

    public RateLimitInterceptor(RateLimitProperties properties) {
        this.authBucket = new TokenBucket(properties.authCapacity(), properties.authRefill());
        this.writeBucket = new TokenBucket(properties.writeCapacity(), properties.writeRefill());
        this.adminBucket = new TokenBucket(properties.adminCapacity(), properties.adminRefill());
        this.clickBucket = new TokenBucket(properties.clickCapacity(), properties.clickRefill());
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) {

        String path = request.getRequestURI();
        String method = request.getMethod();

        TokenBucket bucket = null;
        String key = null;

        if (isAuthEndpoint(path)) {
            bucket = authBucket;
            key = clientIp(request);
        } else if (isAffiliateClick(path)) {
            // Per IP, not per user. Most clicks are anonymous by design — the endpoint is public
            // because a comparison site's outbound links have to be — so principalKey would collapse
            // essentially all traffic into one shared bucket and the first busy minute would lock
            // every visitor out of every retailer link at once.
            bucket = clickBucket;
            key = clientIp(request);
        } else if (isImageBackfill(path)) {
            bucket = adminBucket;
            key = principalKey(request);
        } else if (isUserWrite(path, method)) {
            bucket = writeBucket;
            key = principalKey(request);
        }

        if (bucket == null) {
            return true;
        }

        if (!bucket.tryConsume(key)) {
            long retryAfter = bucket.secondsUntilRefill(key);

            // Logged at WARN because a limit firing is worth noticing, and logged WITHOUT the key
            // when the key is an IP: see the note on clientIp below. The path is enough to tell a
            // brute-force attempt from a runaway client.
            log.warn("Rate limit exceeded for {} {} — retry after {}s", method, path, retryAfter);

            throw new RateLimitExceededException(retryAfter);
        }

        return true;
    }

    /** Login and signup. Public by necessity, which is exactly why they are limited hardest. */
    private static boolean isAuthEndpoint(String path) {
        return path.startsWith("/api/auth/");
    }

    /**
     * Chapter 26's outbound click tracking — both the redirect and the JSON variant.
     *
     * <p>Deliberately covers {@code /api/affiliate/click/**} and {@code /api/affiliate/clicks}
     * together, because they write the same row and limiting one would just move the abuse to the
     * other. {@code /api/affiliate/retailers} is excluded: it is a read of five configuration
     * entries with nothing to inflate.
     *
     * <p>The threat is specific and worth naming. This endpoint's output is the number a commercial
     * arrangement is settled on, it needs no account, and a loop over it costs an attacker nothing —
     * which is a different problem from the auth bucket's (guessing a password) or the admin
     * bucket's (spending a third party's quota). Fabricated clicks would not defraud a retailer,
     * since no commission is paid without a real purchase, but they would corrupt CartWise's own
     * report of which products and retailers people actually use.
     */
    private static boolean isAffiliateClick(String path) {
        return path.startsWith("/api/affiliate/click");
    }

    /**
     * Chapter 24's backfill. Matched before the generic write rule because it needs the much
     * tighter admin bucket — it is the only endpoint here that spends someone else's quota.
     */
    private static boolean isImageBackfill(String path) {
        return path.equals("/api/admin/products/images");
    }

    /**
     * Wishlist and comparison mutations.
     *
     * <p>Reads are deliberately unlimited. A GET costs one indexed query and rate-limiting it would
     * mostly punish a user scrolling their own wishlist; the writes are what create rows.
     */
    private static boolean isUserWrite(String path, String method) {
        boolean mutating = "POST".equals(method) || "DELETE".equals(method) || "PUT".equals(method);
        if (!mutating) {
            return false;
        }
        return path.startsWith("/api/users/")
                && (path.contains("/wishlist") || path.contains("/comparison"));
    }

    /**
     * The authenticated user's id, or the client IP when there is somehow no principal.
     *
     * <p>The fallback should be unreachable — every endpoint keyed this way sits behind
     * {@code authenticated()} in {@code SecurityConfig} — but "should be unreachable" is not a
     * reason to key a bucket on null and collapse every anonymous caller into one shared bucket.
     */
    private static String principalKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user) {
            return "user:" + user.id();
        }

        return "ip:" + clientIp(request);
    }

    /**
     * The caller's address, honouring {@code X-Forwarded-For} when present.
     *
     * <p>Behind the reverse proxy this application is designed to sit behind (see
     * {@code server.forward-headers-strategy}), {@code getRemoteAddr()} is the proxy — so without
     * this every request in the deployment shares one bucket and the auth limit becomes a global
     * outage the first time anyone mistypes a password.
     *
     * <p><strong>This header is caller-controlled and therefore spoofable</strong>, which is worth
     * stating rather than leaving implied: an attacker can rotate the value and get a fresh bucket
     * per forged address. It is trusted here because the deployment terminates TLS at a proxy that
     * overwrites it, and the alternative — ignoring it — breaks the limit outright for every real
     * user. If CartWise is ever exposed without such a proxy, this must become a check against a
     * list of trusted proxy addresses.
     *
     * <p>The first entry is taken because that is the originating client; later entries are the
     * proxies it passed through.
     */
    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");

        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            return (comma > 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }

        return request.getRemoteAddr();
    }

    /**
     * Discards buckets that have fully refilled.
     *
     * <p>Hourly, because the maps only grow with distinct callers and the cost of holding a stale
     * entry for an extra hour is a few dozen bytes. Without it this is a slow memory leak keyed by
     * IP address, which is the failure mode of every hand-rolled in-memory limiter that never got
     * this method.
     */
    @Scheduled(fixedDelay = 3_600_000L)
    void evictIdleBuckets() {
        authBucket.evictFullBuckets();
        writeBucket.evictFullBuckets();
        adminBucket.evictFullBuckets();
        clickBucket.evictFullBuckets();
    }
}
