package com.cartwise.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.cartwise.config.JwtProperties;
import com.cartwise.entity.Role;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * Token signing and verification — the class that decides whether a request is anybody at all.
 *
 * <p>A unit test with no Spring context. {@link JwtTokenProvider} takes its two collaborators as
 * constructor arguments ({@link JwtProperties} and a {@link Clock}), which is what makes expiry
 * testable without waiting: "24 hours later" is a second provider reading a clock 24 hours ahead,
 * not a {@code Thread.sleep}.
 *
 * <p>The negative cases carry the weight here. A test that only proves a valid token round-trips
 * would pass just as happily against an implementation that accepted every token it was given.
 */
class JwtTokenProviderTest {

    /** Two distinct keys, both >= 64 bytes because HS512 refuses anything shorter. */
    private static final String SECRET =
            "cartwise-unit-test-signing-key-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    private static final String OTHER_SECRET =
            "a-completely-different-signing-key-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

    private static final Instant NOW = Instant.parse("2026-08-15T12:00:00Z");
    private static final Duration LIFETIME = Duration.ofHours(24);

    private static final Long USER_ID = 42L;
    private static final String EMAIL = "ada@example.com";

    private final JwtTokenProvider provider = providerAt(SECRET, NOW);

    private static JwtTokenProvider providerAt(String secret, Instant instant) {
        return new JwtTokenProvider(
                new JwtProperties(secret, LIFETIME),
                Clock.fixed(instant, ZoneOffset.UTC));
    }

    private static SecretKey keyFor(String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Nested
    @DisplayName("a token this server issued")
    class ValidToken {

        @Test
        @DisplayName("round-trips the id, email and role it was given")
        void roundTrip() {
            String token = provider.generateToken(USER_ID, EMAIL, Role.USER);

            Optional<AuthenticatedUser> result = provider.authenticate(token);

            assertThat(result).isPresent();
            assertThat(result.get().id()).isEqualTo(USER_ID);
            assertThat(result.get().email()).isEqualTo(EMAIL);
            assertThat(result.get().role()).isEqualTo(Role.USER);
        }

        @Test
        @DisplayName("round-trips an admin role")
        void roundTripsAdmin() {
            String token = provider.generateToken(7L, "root@example.com", Role.ADMIN);

            assertThat(provider.authenticate(token))
                    .get()
                    .extracting(AuthenticatedUser::role)
                    .isEqualTo(Role.ADMIN);
        }

        @Test
        @DisplayName("is still valid one second before it expires")
        void validJustBeforeExpiry() {
            String token = provider.generateToken(USER_ID, EMAIL, Role.USER);

            JwtTokenProvider justBefore =
                    providerAt(SECRET, NOW.plus(LIFETIME).minusSeconds(1));

            assertThat(justBefore.authenticate(token)).isPresent();
        }

        /**
         * The role travels as {@code "USER"}, not as Spring Security's {@code "ROLE_USER"}. A token
         * is a wire format that outlives whichever framework reads it, and the prefix is one
         * library's internal spelling — applied in {@code JwtAuthenticationFilter}, not here.
         */
        @Test
        @DisplayName("writes the role without Spring Security's ROLE_ prefix")
        void roleClaimHasNoFrameworkPrefix() {
            String token = provider.generateToken(USER_ID, EMAIL, Role.ADMIN);

            String payload = new String(
                    Base64.getUrlDecoder().decode(token.split("\\.")[1]), StandardCharsets.UTF_8);

            assertThat(payload).contains("\"role\":\"ADMIN\"");
            assertThat(payload).doesNotContain("ROLE_");
        }
    }

    @Nested
    @DisplayName("a token that cannot be trusted is rejected")
    class RejectedToken {

        /**
         * The privilege-escalation attempt, written the way it would actually be made: decode the
         * payload, change {@code USER} to {@code ADMIN}, re-encode, keep the original signature. It
         * must fail — the signature is computed over the payload, so editing one invalidates the
         * other, and that is the entire security property of a signed token.
         */
        @Test
        @DisplayName("a payload edited to claim ADMIN fails the signature check")
        void tamperedPayloadIsRejected() {
            String token = provider.generateToken(USER_ID, EMAIL, Role.USER);
            String[] parts = token.split("\\.");

            String payload = new String(
                    Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            String escalated = payload.replace("\"role\":\"USER\"", "\"role\":\"ADMIN\"");
            assertThat(escalated).isNotEqualTo(payload);  // the edit actually happened

            String forged = parts[0]
                    + "." + Base64.getUrlEncoder().withoutPadding()
                            .encodeToString(escalated.getBytes(StandardCharsets.UTF_8))
                    + "." + parts[2];

            assertThat(provider.authenticate(forged)).isEmpty();
        }

        @Test
        @DisplayName("an altered signature is rejected")
        void tamperedSignatureIsRejected() {
            String token = provider.generateToken(USER_ID, EMAIL, Role.USER);
            String[] parts = token.split("\\.");

            char first = parts[2].charAt(0);
            String flipped = (first == 'A' ? 'B' : 'A') + parts[2].substring(1);

            assertThat(provider.authenticate(parts[0] + "." + parts[1] + "." + flipped)).isEmpty();
        }

        /**
         * A token signed with a different key. This is the case that would let any other service
         * holding any key mint CartWise credentials, and it is not covered by the tampering tests —
         * the signature there is internally consistent, just not ours.
         */
        @Test
        @DisplayName("a token signed with a different key is rejected")
        void differentKeyIsRejected() {
            String foreign = providerAt(OTHER_SECRET, NOW)
                    .generateToken(USER_ID, EMAIL, Role.ADMIN);

            assertThat(provider.authenticate(foreign)).isEmpty();
        }

        @Test
        @DisplayName("an expired token is rejected")
        void expiredIsRejected() {
            String token = provider.generateToken(USER_ID, EMAIL, Role.USER);

            JwtTokenProvider tomorrow = providerAt(SECRET, NOW.plus(LIFETIME).plusSeconds(1));

            assertThat(tomorrow.authenticate(token)).isEmpty();
        }

        /**
         * Malformed input must return empty rather than propagate. Every one of these arrives from
         * an {@code Authorization} header, which is entirely attacker-controlled — an exception
         * escaping here would become a 500 that reports the parser's opinion of the input.
         */
        @ParameterizedTest
        @ValueSource(strings = {
                "",
                "   ",
                "not-a-token",
                "a.b",
                "a.b.c",
                "...",
                "eyJhbGciOiJIUzUxMiJ9",
                "Bearer eyJhbGciOiJIUzUxMiJ9.e30.x"
        })
        @DisplayName("malformed input returns empty instead of throwing")
        void malformedIsRejectedWithoutThrowing(String malformed) {
            assertThat(provider.authenticate(malformed)).isEmpty();
        }

        @Test
        @DisplayName("null returns empty instead of throwing")
        void nullIsRejectedWithoutThrowing() {
            assertThat(provider.authenticate(null)).isEmpty();
        }

        /**
         * The {@code none} algorithm attack: a token asserting it is unsigned. jjwt refuses to parse
         * one through {@code parseSignedClaims}, which is why the production code uses that method
         * rather than the unsecured variant.
         */
        @Test
        @DisplayName("an unsigned token is rejected")
        void unsignedTokenIsRejected() {
            String unsigned = Jwts.builder()
                    .subject(String.valueOf(USER_ID))
                    .claim("email", EMAIL)
                    .claim("role", "ADMIN")
                    .compact();

            assertThat(provider.authenticate(unsigned)).isEmpty();
        }
    }

    /**
     * Claims that are correctly signed but unusable. These are the subtle ones: the signature
     * verifies, so a check that stopped there would accept them and hand the rest of the application
     * a principal it cannot act on.
     */
    @Nested
    @DisplayName("a correctly signed token with unusable claims is still rejected")
    class UnusableClaims {

        /** Builds a properly signed token with whatever claims the test wants to put in it. */
        private String signed(String subject, String email, String role) {
            var builder = Jwts.builder()
                    .subject(subject)
                    .issuedAt(Date.from(NOW))
                    .expiration(Date.from(NOW.plus(LIFETIME)));

            if (email != null) {
                builder.claim("email", email);
            }
            if (role != null) {
                builder.claim("role", role);
            }

            return builder.signWith(keyFor(SECRET), Jwts.SIG.HS512).compact();
        }

        /**
         * The compatibility consequence the production code documents: tokens issued before roles
         * existed carry no {@code role} claim and stop working. Refusing is the safe direction —
         * defaulting to {@link Role#USER} would let a token this server cannot fully understand act
         * anyway.
         */
        @Test
        @DisplayName("an absent role claim is rejected rather than defaulted to USER")
        void missingRoleIsRejected() {
            assertThat(provider.authenticate(signed("42", EMAIL, null))).isEmpty();
        }

        @Test
        @DisplayName("a role naming something this server does not know is rejected")
        void unknownRoleIsRejected() {
            assertThat(provider.authenticate(signed("42", EMAIL, "SUPERUSER"))).isEmpty();
        }

        @Test
        @DisplayName("a role in the wrong spelling is rejected")
        void frameworkPrefixedRoleIsRejected() {
            assertThat(provider.authenticate(signed("42", EMAIL, "ROLE_ADMIN"))).isEmpty();
        }

        @Test
        @DisplayName("a subject that is not a number is rejected")
        void nonNumericSubjectIsRejected() {
            assertThat(provider.authenticate(signed("not-a-number", EMAIL, "USER"))).isEmpty();
        }

        @Test
        @DisplayName("an absent subject is rejected")
        void missingSubjectIsRejected() {
            assertThat(provider.authenticate(signed(null, EMAIL, "USER"))).isEmpty();
        }
    }
}
