package com.cartwise.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Rate limits, bound from {@code cartwise.rate-limit}. Chapter 25.
 *
 * <p>Three buckets rather than one, because the three things being defended are not the same thing
 * and a single shared limit would either be too loose for the worst of them or too tight for the
 * rest.
 *
 * <ul>
 *   <li><strong>auth</strong> — login and signup. Defends against credential stuffing and signup
 *       spam, and is the tightest of the three because a legitimate human signs in once or twice,
 *       not ten times a minute. Keyed per client IP: there is no authenticated user yet at the
 *       moment these are called, which is the entire point of calling them.
 *   <li><strong>write</strong> — wishlist and comparison writes. Generous, because toggling hearts
 *       across a catalogue page is a normal thing to do quickly and a limit that fires during
 *       ordinary use is a bug wearing a security hat. Keyed per authenticated user.
 *   <li><strong>admin</strong> — the Chapter 24 image backfill. By far the tightest, and for a
 *       different reason from the others: it spends a <em>third party's</em> rate allowance. One
 *       operator holding the button down could exhaust the Openverse daily quota for everyone.
 *       Three per hour is more than a backfill is ever legitimately run.
 * </ul>
 *
 * <p>A capacity of zero or less disables the bucket. That is deliberate and worth keeping: it means
 * a limit can be switched off with an environment variable during a load test or an incident,
 * without a code change or a redeploy.
 *
 * @param authCapacity        requests permitted per refill window on the auth endpoints
 * @param authRefillSeconds   how long the auth window is
 * @param writeCapacity       requests permitted per window on wishlist/comparison writes
 * @param writeRefillSeconds  how long the write window is
 * @param adminCapacity       requests permitted per window on the image backfill
 * @param adminRefillSeconds  how long the admin window is
 */
@ConfigurationProperties(prefix = "cartwise.rate-limit")
public record RateLimitProperties(
        int authCapacity,
        long authRefillSeconds,
        int writeCapacity,
        long writeRefillSeconds,
        int adminCapacity,
        long adminRefillSeconds) {

    public Duration authRefill() {
        return Duration.ofSeconds(authRefillSeconds);
    }

    public Duration writeRefill() {
        return Duration.ofSeconds(writeRefillSeconds);
    }

    public Duration adminRefill() {
        return Duration.ofSeconds(adminRefillSeconds);
    }
}
