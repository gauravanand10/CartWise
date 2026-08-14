package com.cartwise.security;

import com.cartwise.config.JwtProperties;
import com.cartwise.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Signs tokens and verifies them. The only class that knows what a CartWise token looks like.
 *
 * <p>A JWT is three base64url segments — header, claims, signature — and it is <strong>signed, not
 * encrypted</strong>. Anyone holding a token can read the user id and email inside it; what they
 * cannot do is change either one, because the signature is computed over the first two segments
 * with a key only this server has. That is the correct mental model for what goes in a token: facts
 * that are safe to show the bearer, not secrets.
 *
 * <p>Stateless verification is the property that earns the complexity. Nothing is stored server-side
 * and no database is consulted, so a token can be checked by any instance of this application. The
 * cost is that a token cannot be withdrawn before it expires — which is why the lifetime is short
 * and why revocation is listed as deferred rather than pretended at.
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    /** Claim holding the user's email. The subject holds the id; this is the human-readable half. */
    private static final String EMAIL_CLAIM = "email";

    /**
     * Claim holding the user's role, added in Chapter 19.
     *
     * <p>Carrying the role in the token is what keeps authorization stateless: the filter can build
     * a fully-populated {@code Authentication} without a database round trip on every request. The
     * price is documented on {@link AuthenticatedUser} — the claim is a snapshot taken at issue
     * time, so a role changed afterwards is not reflected until the user gets a new token.
     *
     * <p>Putting it in the token is safe in the way that matters. A JWT is signed, not encrypted,
     * so the bearer can read {@code "role":"USER"} — and could change it to {@code "ADMIN"} only by
     * producing a signature over the edited payload, which needs the server's key. Reading your own
     * role is not a leak; forging it is what the signature prevents.
     */
    private static final String ROLE_CLAIM = "role";

    private final SecretKey signingKey;
    private final java.time.Duration expiration;
    private final Clock clock;

    /**
     * @param properties validated at binding time — see {@link JwtProperties}, which rejects a
     *                   missing or too-short secret before this class is ever constructed
     * @param clock      the application {@link Clock} bean, so "now" is an injected input here as
     *                   everywhere else in CartWise rather than a static call to the system clock
     */
    public JwtTokenProvider(JwtProperties properties, Clock clock) {
        // The key is derived once and the raw string is never kept as a field: the less time the
        // secret spends in a String — which is immutable and stays in the heap until collected —
        // the smaller the window for it to reach a heap dump.
        this.signingKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
        this.expiration = properties.expiration();
        this.clock = clock;
    }

    /**
     * Issues a token for a user who has just proved who they are.
     *
     * <p>Called from exactly two places, both in {@code AuthService}: the end of a successful signup
     * and the end of a successful login. Nothing else may call it — issuing a token is the act of
     * granting access, so it belongs immediately after the check that justified it.
     *
     * <p>The id goes in the subject because that is the field JWT reserves for "who this token is
     * about". The email rides along as a custom claim so the frontend can show who is signed in
     * without a second request, and Chapter 19 adds the role so authorization needs no database.
     *
     * <p>The role is written as {@link Role#name()} — {@code "USER"}, {@code "ADMIN"} — and not as
     * {@link Role#authority()}. {@code ROLE_ADMIN} is Spring Security's internal spelling, and a
     * token is a wire format that outlives whichever framework happens to read it; a future client
     * or a different service should not have to know one library's prefix convention to understand
     * a claim. The prefix is applied where it belongs, in {@code JwtAuthenticationFilter}.
     *
     * <p>HS512, a symmetric algorithm: the same key signs and verifies. That suits a single service
     * verifying its own tokens. It would not suit a third party needing to verify without being able
     * to mint — that is what the asymmetric algorithms are for, and it is not this chapter's problem.
     */
    public String generateToken(Long userId, String email, Role role) {
        Instant issuedAt = clock.instant();

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim(EMAIL_CLAIM, email)
                .claim(ROLE_CLAIM, role.name())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(issuedAt.plus(expiration)))
                .signWith(signingKey, Jwts.SIG.HS512)
                .compact();
    }

    /**
     * Verifies a token and returns who it belongs to, or empty if it cannot be trusted.
     *
     * <p>One method rather than the more common {@code isValidToken} / {@code extractUserId} pair,
     * and deliberately so. Two methods means parsing and verifying the signature twice for every
     * request — and worse, it invites the shape where validity is checked once and the claims are
     * read later, leaving a gap in which the two answers could come from different code paths. A
     * single parse that either yields a principal or yields nothing has no such gap.
     *
     * <p>Every failure mode collapses to {@link Optional#empty()}: wrong signature, expired,
     * malformed, unsupported algorithm, a subject that is not a number, a role claim that is
     * missing or names no known role. The caller does not get to distinguish them and does not need
     * to — all of them mean "this request is not authenticated" — and telling the client which one
     * it was would help an attacker tune their next attempt.
     *
     * <p>Rejecting an absent or unknown role rather than defaulting to {@link Role#USER} is the
     * safe direction of the two, and worth being explicit about. Defaulting would mean a token this
     * server cannot fully understand still gets to act, at whatever privilege the default happens to
     * be; refusing means an incomprehensible token gets nothing. The visible consequence is that
     * tokens issued before this chapter — which carry no {@code role} claim — stop working, and a
     * browser holding one is signed out at its next request. For a change that alters what tokens
     * mean, invalidating the old ones is the correct outcome, not a regression.
     *
     * <p>The expiry check is not ours; jjwt performs it during parsing and throws. Pointing its
     * parser at the injected clock keeps that check on the same time source as token issuing.
     */
    public Optional<AuthenticatedUser> authenticate(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    // jjwt's own Clock type, a functional interface returning a Date. Bridged to the
                    // application Clock so issuing and verifying cannot disagree about the time.
                    .clock(() -> Date.from(clock.instant()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Role.valueOf throws IllegalArgumentException for an unknown name and
            // NullPointerException for an absent claim; both are caught below, so an unusable role
            // is handled by the same path as an unusable signature.
            Role role = Role.valueOf(claims.get(ROLE_CLAIM, String.class));

            return Optional.of(new AuthenticatedUser(
                    Long.valueOf(claims.getSubject()),
                    claims.get(EMAIL_CLAIM, String.class),
                    role));

        } catch (JwtException | IllegalArgumentException | NullPointerException ex) {
            // Debug, not warn: an expired token is a routine event on any long-lived browser tab,
            // and logging every one at warn would train whoever reads these logs to ignore them.
            // The token itself is never logged — it is a credential, and a log file is not a place
            // for one.
            log.debug("Rejected token: {}", ex.getClass().getSimpleName());
            return Optional.empty();
        }
    }
}
