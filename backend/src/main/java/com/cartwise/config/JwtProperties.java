package com.cartwise.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Token settings bound from the {@code cartwise.jwt} prefix.
 *
 * <p>Configuration rather than constants, for the same reason as {@link CorsProperties}: a signing
 * key compiled into a class is the same key in every environment, published in the repository, and
 * unchangeable without a redeploy. Anyone who reads the source can then mint a token for any user.
 *
 * <p>The prefix is {@code cartwise.jwt} to sit alongside {@code cartwise.cors} — CartWise-owned
 * settings live under one namespace so it is obvious which properties this application defines and
 * which come from Spring.
 *
 * @param secret     HMAC signing key. Must be at least 64 bytes: the tokens are signed with HS512,
 *                   and jjwt refuses a key shorter than the algorithm's output with a
 *                   {@code WeakKeyException} rather than signing something weak. Validated at
 *                   startup by the compact constructor below, so a misconfigured key fails the boot
 *                   instead of the first login.
 * @param expiration how long an issued token remains valid. A {@link Duration} rather than a count
 *                   of milliseconds, so the YAML reads {@code 24h} and cannot be misread by a
 *                   factor of a thousand.
 */
@ConfigurationProperties(prefix = "cartwise.jwt")
public record JwtProperties(String secret, Duration expiration) {

    /** HS512 produces a 512-bit MAC, so the key must carry at least that much material. */
    private static final int MINIMUM_SECRET_BYTES = 64;

    public JwtProperties {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "cartwise.jwt.secret is not set. In production it comes from the JWT_SECRET "
                            + "environment variable; an unset key must stop the application rather "
                            + "than fall back to a default that would be identical everywhere.");
        }

        // Length is checked here, not where the key is built, so the failure names the property.
        // The value itself is never included in the message — a startup log is exactly the wrong
        // place for it to appear.
        int bytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;
        if (bytes < MINIMUM_SECRET_BYTES) {
            throw new IllegalStateException(
                    "cartwise.jwt.secret must be at least " + MINIMUM_SECRET_BYTES
                            + " bytes for HS512; the configured value is " + bytes + " bytes.");
        }

        if (expiration == null || expiration.isZero() || expiration.isNegative()) {
            throw new IllegalStateException(
                    "cartwise.jwt.expiration must be a positive duration, e.g. 24h.");
        }
    }
}
