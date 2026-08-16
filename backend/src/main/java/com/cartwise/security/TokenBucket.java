package com.cartwise.security;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * An in-memory token bucket, keyed by caller. Chapter 25.
 *
 * <p><strong>Why this and not Bucket4j, Resilience4j, or Redis.</strong> The chapter's brief rules
 * out new infrastructure, and Redis would be exactly that — a second process to run, monitor and
 * back up, for a limit this application can enforce in a hash map. Bucket4j would have been
 * reasonable and is roughly forty lines heavier in dependency surface than the thirty lines of
 * arithmetic below; the deciding factor is that a token bucket is genuinely this simple, and a
 * dependency whose behaviour you would have to read the source of anyway is not saving you
 * anything.
 *
 * <p><strong>The limitation this carries, stated plainly:</strong> the state lives in one JVM's
 * heap. Run two instances behind a load balancer and each enforces the limit independently, so the
 * effective limit doubles; restart the process and every bucket resets. That is acceptable here
 * and only here, because CartWise deploys as a single container (see docker-compose.yml) and
 * horizontal scaling is explicitly out of this chapter's scope. <em>The moment a second replica
 * exists, this class is wrong</em> and the state has to move somewhere shared. It is written to be
 * easy to replace for that reason: one method, one meaning.
 *
 * <p>Refill is continuous rather than a fixed window. A window that resets on the minute lets a
 * caller spend the whole allowance at 59.9s and the whole of the next at 60.1s — twice the
 * intended rate, at the worst possible moment. Tokens here accrue smoothly at
 * {@code capacity / refill}, so the long-run rate is the configured one no matter how the requests
 * are spaced.
 */
public class TokenBucket {

    /**
     * One caller's bucket.
     *
     * <p>Mutable and guarded by its own monitor rather than built from atomics: the update reads
     * the timestamp, computes the accrual and writes both fields, and that has to be one atomic
     * step. Two atomics would let two threads each see the same "last refill" and each grant a
     * token the bucket only had one of.
     */
    private static final class Bucket {
        private double tokens;
        private long lastRefillNanos;

        private Bucket(double tokens, long nowNanos) {
            this.tokens = tokens;
            this.lastRefillNanos = nowNanos;
        }
    }

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final int capacity;
    private final double tokensPerNano;
    private final boolean enabled;

    /**
     * @param capacity how many requests a single key may make per refill period; zero or less
     *                 disables the limit entirely
     * @param refill   the period over which a full capacity accrues
     */
    public TokenBucket(int capacity, Duration refill) {
        this.capacity = capacity;
        this.enabled = capacity > 0 && !refill.isZero() && !refill.isNegative();
        this.tokensPerNano = this.enabled
                ? (double) capacity / refill.toNanos()
                : 0d;
    }

    /**
     * Takes one token for {@code key}, or reports that there was none to take.
     *
     * @return true if the request may proceed
     */
    public boolean tryConsume(String key) {
        if (!enabled) {
            return true;
        }

        long now = System.nanoTime();

        Bucket bucket = buckets.computeIfAbsent(key, ignored -> new Bucket(capacity, now));

        synchronized (bucket) {
            // Accrue whatever has been earned since the last look, capped at capacity so an idle
            // caller cannot bank an unlimited burst.
            double accrued = (now - bucket.lastRefillNanos) * tokensPerNano;
            bucket.tokens = Math.min(capacity, bucket.tokens + accrued);
            bucket.lastRefillNanos = now;

            if (bucket.tokens < 1d) {
                return false;
            }

            bucket.tokens -= 1d;
            return true;
        }
    }

    /**
     * Whole seconds until {@code key} has a token again, for the {@code Retry-After} header.
     *
     * <p>Rounded up and floored at one: telling a caller to retry after zero seconds invites an
     * immediate retry that is guaranteed to fail again.
     */
    public long secondsUntilRefill(String key) {
        if (!enabled) {
            return 0;
        }

        Bucket bucket = buckets.get(key);
        if (bucket == null) {
            return 0;
        }

        synchronized (bucket) {
            double deficit = 1d - bucket.tokens;
            if (deficit <= 0) {
                return 0;
            }
            double nanos = deficit / tokensPerNano;
            return Math.max(1L, (long) Math.ceil(nanos / 1_000_000_000d));
        }
    }

    /**
     * Drops buckets that have been idle long enough to have fully refilled.
     *
     * <p>Without this the map is a slow memory leak keyed by IP address — every caller that ever
     * hit a limited endpoint stays resident forever. A fully refilled bucket is indistinguishable
     * from a brand new one, so discarding it changes no behaviour.
     *
     * <p>Called on a schedule by {@link com.cartwise.security.RateLimitInterceptor}. Not called on
     * every request: sweeping the whole map to serve one lookup would make the common path scale
     * with the number of distinct callers.
     */
    public void evictFullBuckets() {
        if (!enabled) {
            return;
        }

        long now = System.nanoTime();

        buckets.entrySet().removeIf(entry -> {
            Bucket bucket = entry.getValue();
            synchronized (bucket) {
                double accrued = (now - bucket.lastRefillNanos) * tokensPerNano;
                return bucket.tokens + accrued >= capacity;
            }
        });
    }
}
