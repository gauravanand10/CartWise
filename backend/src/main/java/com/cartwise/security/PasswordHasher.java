package com.cartwise.security;

import java.nio.charset.StandardCharsets;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Turns a password into something safe to store, and checks a password against what was stored.
 *
 * <p>BCrypt, and specifically <em>because</em> it is slow. A general-purpose hash like SHA-256 is
 * designed to be fast, which is the wrong property here: speed is exactly what lets someone who has
 * stolen the table try billions of candidate passwords per second against it. BCrypt's cost factor
 * makes each attempt take milliseconds, turning that attack from hours into years, and the factor
 * can be raised as hardware improves without changing any stored hash — the cost is recorded inside
 * each hash string, so old and new hashes verify side by side.
 *
 * <p>It also salts every password with fresh randomness, which is why two users with the same
 * password get different hashes and why a precomputed rainbow table is useless against this table.
 * The salt is stored inside the hash string, not in a column of its own — see
 * {@link com.cartwise.entity.User}.
 *
 * <p>A thin wrapper around {@link BCryptPasswordEncoder} rather than direct use of it, so that the
 * application depends on the idea "hash this password" rather than on one library's class. Moving
 * to Argon2 later is then a change to this file plus a re-hash-on-login strategy, not a change
 * everywhere a password is handled.
 */
@Component
public class PasswordHasher {

    /**
     * BCrypt hashes at most the first 72 bytes of input and silently ignores the rest.
     *
     * <p>That is a genuine trap: two different 100-character passwords sharing their first 72 bytes
     * would both verify against the same hash. Rejecting anything longer, rather than accepting it
     * and quietly truncating, is what keeps "your password was accepted" an honest statement.
     */
    public static final int MAX_PASSWORD_BYTES = 72;

    /**
     * Cost factor 10 — BCrypt's default and Spring Security's.
     *
     * <p>Roughly 50–100ms per hash on ordinary hardware: slow enough to make offline cracking
     * expensive, fast enough that a login does not feel broken. Stated as a constant because it is a
     * security parameter someone should be able to find and reason about, not a magic default buried
     * in a constructor call.
     */
    private static final int COST_FACTOR = 10;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder(COST_FACTOR);

    /**
     * Hashes a password for storage.
     *
     * <p>The returned string contains the algorithm, cost, salt and hash together, e.g.
     * {@code $2a$10$N9qo8uLOickgx2ZMRZoMy...}. It is what goes in the database; the input to this
     * method must never be.
     */
    public String hash(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    /**
     * Checks a submitted password against a stored hash.
     *
     * <p>The comparison happens inside BCrypt, which re-derives the hash using the salt embedded in
     * {@code storedHash} and compares in constant time — a plain {@code equals} on two hashes would
     * leak, through how long it took to fail, roughly how many leading characters matched.
     *
     * <p>Returns false rather than throwing when the stored value is not a BCrypt hash at all;
     * Spring's encoder logs a warning and declines. A user row whose hash is unreadable must fail to
     * log in, not fail with an error that says something about the row.
     */
    public boolean matches(String rawPassword, String storedHash) {
        return encoder.matches(rawPassword, storedHash);
    }

    /**
     * Whether a password is short enough for BCrypt to hash in full.
     *
     * <p>Bytes, not characters: the limit is on the encoded form, and a password of emoji or
     * accented characters reaches 72 bytes well before it reaches 72 characters.
     */
    public boolean isWithinLengthLimit(String rawPassword) {
        return rawPassword.getBytes(StandardCharsets.UTF_8).length <= MAX_PASSWORD_BYTES;
    }
}
