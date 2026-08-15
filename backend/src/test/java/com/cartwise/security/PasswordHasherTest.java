package com.cartwise.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * Password hashing and verification.
 *
 * <p>Real BCrypt, not a mock. Mocking the encoder here would leave nothing under test — the class is
 * a wrapper, and every property worth asserting (salting, the 72-byte limit, a refusal to verify
 * against a corrupt stored value) is a property of BCrypt itself. The cost is that this class is the
 * slowest unit test in the suite at roughly 50–100ms per hash, which is BCrypt working as intended.
 */
class PasswordHasherTest {

    private final PasswordHasher hasher = new PasswordHasher();

    private static final String PASSWORD = "correct-horse-battery-staple";

    @Nested
    @DisplayName("verifying a password")
    class Matching {

        @Test
        @DisplayName("the original password matches its hash")
        void correctPasswordMatches() {
            assertThat(hasher.matches(PASSWORD, hasher.hash(PASSWORD))).isTrue();
        }

        @Test
        @DisplayName("a different password does not match")
        void wrongPasswordDoesNotMatch() {
            assertThat(hasher.matches("wrong-password", hasher.hash(PASSWORD))).isFalse();
        }

        /**
         * One character off, and one case off. Written separately from the obviously-wrong password
         * above because a comparison that truncated or normalised its input would still pass that
         * one.
         */
        @Test
        @DisplayName("a near miss does not match")
        void nearMissDoesNotMatch() {
            String stored = hasher.hash(PASSWORD);

            assertThat(hasher.matches(PASSWORD + "x", stored)).isFalse();
            assertThat(hasher.matches(PASSWORD.substring(0, PASSWORD.length() - 1), stored))
                    .isFalse();
            assertThat(hasher.matches(PASSWORD.toUpperCase(), stored)).isFalse();
        }

        @Test
        @DisplayName("an empty password does not match a real hash")
        void emptyDoesNotMatch() {
            assertThat(hasher.matches("", hasher.hash(PASSWORD))).isFalse();
        }

        /**
         * A recorded asymmetry in the library, found by this test rather than assumed.
         *
         * <p>{@code hash("")} succeeds and returns a well-formed 60-character BCrypt string, but
         * {@code matches("", thatHash)} returns <strong>false</strong> — Spring Security's encoder
         * treats an empty raw password as "no password offered" and declines before comparing. An
         * empty password can therefore be stored and can never be used to log in.
         *
         * <p>Unreachable in CartWise: {@code AuthService} refuses anything under 8 characters at
         * signup, so no such hash can be created through the API. Asserted anyway, because the day
         * that minimum is relaxed this becomes an account nobody can sign in to, with a stored hash
         * that looks perfectly valid in the database.
         */
        @Test
        @DisplayName("an empty password hashes but can never be verified — a library asymmetry")
        void emptyPasswordHashesButNeverMatches() {
            String stored = hasher.hash("");

            assertThat(stored).hasSize(60).startsWith("$2a$10$");
            assertThat(hasher.matches("", stored)).isFalse();
        }
    }

    @Nested
    @DisplayName("salting")
    class Salting {

        /**
         * The property that makes a stolen table resistant to a precomputed rainbow table: the same
         * password hashed twice produces different output, because each hash carries fresh random
         * salt. If this ever fails, hashing has silently become deterministic and every user sharing
         * a password becomes identifiable from the table alone.
         */
        @Test
        @DisplayName("the same password hashed twice gives two different hashes")
        void sameInputProducesDifferentHashes() {
            String first = hasher.hash(PASSWORD);
            String second = hasher.hash(PASSWORD);

            assertThat(first).isNotEqualTo(second);
        }

        @Test
        @DisplayName("both of those hashes still verify the original password")
        void bothSaltedHashesVerify() {
            assertThat(hasher.matches(PASSWORD, hasher.hash(PASSWORD))).isTrue();
            assertThat(hasher.matches(PASSWORD, hasher.hash(PASSWORD))).isTrue();
        }

        @Test
        @DisplayName("two users with the same password get unrelated hashes")
        void twoUsersSharingAPasswordAreNotLinkable() {
            String ada = hasher.hash("shared-password-value");
            String grace = hasher.hash("shared-password-value");

            assertThat(ada).isNotEqualTo(grace);
            assertThat(hasher.matches("shared-password-value", ada)).isTrue();
            assertThat(hasher.matches("shared-password-value", grace)).isTrue();
        }
    }

    @Nested
    @DisplayName("the stored hash format")
    class HashFormat {

        /**
         * The cost factor is recorded inside the hash string, which is what lets it be raised later
         * without invalidating hashes already stored. Asserting the prefix pins both the algorithm
         * and the cost that {@link PasswordHasher} documents.
         */
        @Test
        @DisplayName("records the BCrypt algorithm and cost factor 10")
        void hashCarriesAlgorithmAndCost() {
            assertThat(hasher.hash(PASSWORD)).startsWith("$2a$10$");
        }

        @Test
        @DisplayName("is BCrypt's fixed 60-character length")
        void hashIsSixtyCharacters() {
            assertThat(hasher.hash(PASSWORD)).hasSize(60);
        }

        @Test
        @DisplayName("never contains the password it was derived from")
        void hashDoesNotLeakThePassword() {
            assertThat(hasher.hash(PASSWORD)).doesNotContain(PASSWORD);
        }
    }

    /**
     * A user row whose stored value is not a BCrypt hash at all — truncated by a bad migration,
     * left over from another scheme, or simply blank. That user must fail to log in, not crash the
     * login endpoint with a 500 that says something about their row.
     */
    @Nested
    @DisplayName("a corrupt stored hash")
    class CorruptStoredHash {

        @ParameterizedTest
        @ValueSource(strings = {
                "",
                "   ",
                "not-a-hash",
                "$2a$10$tooshort",
                "plaintext-password-stored-by-mistake",
                "$1$abcdefgh$xxxxxxxxxxxxxxxxxxxxxx"
        })
        @DisplayName("does not match, and does not throw")
        void malformedHashReturnsFalse(String stored) {
            assertThatCode(() -> assertThat(hasher.matches(PASSWORD, stored)).isFalse())
                    .doesNotThrowAnyException();
        }

        /**
         * The most dangerous corrupt value of all: the password stored as plaintext. It must not
         * match itself, or a failed migration would turn into an authentication bypass.
         */
        @Test
        @DisplayName("a plaintext password stored as the hash does not verify against itself")
        void plaintextStoredValueDoesNotSelfVerify() {
            assertThat(hasher.matches(PASSWORD, PASSWORD)).isFalse();
        }
    }

    @Nested
    @DisplayName("the 72-byte limit")
    class LengthLimit {

        @Test
        @DisplayName("a password at exactly 72 bytes is within the limit")
        void exactlySeventyTwoBytesIsAllowed() {
            String password = "a".repeat(PasswordHasher.MAX_PASSWORD_BYTES);

            assertThat(password.getBytes(StandardCharsets.UTF_8)).hasSize(72);
            assertThat(hasher.isWithinLengthLimit(password)).isTrue();
        }

        @Test
        @DisplayName("one byte over is not")
        void seventyThreeBytesIsRejected() {
            assertThat(hasher.isWithinLengthLimit("a".repeat(73))).isFalse();
        }

        /**
         * Bytes, not characters — the limit is on the encoded form. An emoji is four bytes in UTF-8,
         * so 20 of them are 80 bytes and must be refused despite being 20 characters. Measuring in
         * characters here would accept a password BCrypt then silently truncates.
         */
        @Test
        @DisplayName("counts bytes, not characters, for multi-byte input")
        void multiByteCharactersCountAsTheirByteLength() {
            String emoji = "🔐".repeat(20);

            assertThat(emoji).hasSize(40);                                   // UTF-16 code units
            assertThat(emoji.getBytes(StandardCharsets.UTF_8)).hasSize(80);  // what BCrypt sees
            assertThat(hasher.isWithinLengthLimit(emoji)).isFalse();
        }

        @Test
        @DisplayName("an 18-emoji password is 72 bytes and allowed")
        void multiByteAtTheBoundaryIsAllowed() {
            String emoji = "🔐".repeat(18);

            assertThat(emoji.getBytes(StandardCharsets.UTF_8)).hasSize(72);
            assertThat(hasher.isWithinLengthLimit(emoji)).isTrue();
        }

        /**
         * The write path refuses rather than truncates — and this is Spring Security 7 behaviour that
         * was <em>found by running this test</em>, not assumed from the usual account of BCrypt.
         * Older write-ups (and older versions) describe {@code encode} silently hashing the first 72
         * bytes; this encoder throws instead.
         *
         * <p>That does not make {@code AuthService}'s own length check redundant. Without it the
         * failure would still be an {@code IllegalArgumentException} and still become a 400, but the
         * message would be the library's rather than one naming the limit and the property.
         */
        @Test
        @DisplayName("hashing refuses a password past 72 bytes rather than truncating it")
        void hashingRefusesOverlongPasswords() {
            assertThatThrownBy(() -> hasher.hash("a".repeat(73)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("72 bytes");
        }

        /**
         * <strong>The verification path does not enforce the same limit, and that is the finding
         * worth keeping.</strong> A 73-byte password verifies against the hash of its first 72 bytes,
         * because {@code matches} hands the whole string to BCrypt, which reads only 72 of it.
         *
         * <p>So the guard has to live on the write path, which is where {@link PasswordHasher} and
         * {@code AuthService} both put it: no hash can be created from more than 72 bytes, so the
         * only way to reach this behaviour is with a password that was already exactly 72 bytes — at
         * which point the "attacker" already knows the entire real password. It is a property to
         * understand rather than a hole, and it is asserted here so that moving the length check to
         * the read path, or dropping it, becomes a visible change rather than a silent one.
         */
        @Test
        @DisplayName("verification does NOT enforce the limit — anything past 72 bytes is ignored")
        void verificationIgnoresBytesPastSeventyTwo() {
            String stored = hasher.hash("x".repeat(72));

            assertThat(hasher.matches("x".repeat(72) + "ANY-SUFFIX-AT-ALL", stored)).isTrue();
        }
    }
}
