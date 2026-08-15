package com.cartwise.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cartwise.common.dto.AuthResponse;
import com.cartwise.common.exception.EmailAlreadyRegisteredException;
import com.cartwise.common.exception.InvalidCredentialsException;
import com.cartwise.entity.Role;
import com.cartwise.entity.User;
import com.cartwise.repository.UserRepository;
import com.cartwise.security.JwtTokenProvider;
import com.cartwise.security.PasswordHasher;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;

/**
 * Registration and sign-in — the most security-sensitive class in CartWise.
 *
 * <p>The repository and the token provider are mocked; {@link PasswordHasher} is real. That split is
 * deliberate. Mocking the hasher would make every password check return whatever the test said, which
 * is precisely the thing worth verifying actually happens; mocking the repository keeps the test off
 * a database it does not need. The hasher is wrapped in a Mockito spy so the timing-equalisation
 * behaviour can be observed without changing what it does.
 */
class AuthServiceTest {

    private static final String EMAIL = "ada@example.com";
    private static final String PASSWORD = "a-good-enough-password";
    private static final String TOKEN = "signed.jwt.value";

    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordHasher passwordHasher = spy(new PasswordHasher());
    private final JwtTokenProvider jwtTokenProvider = mock(JwtTokenProvider.class);

    private final AuthService authService =
            new AuthService(userRepository, passwordHasher, jwtTokenProvider);

    /** A persisted user, as the repository would return one. */
    private User existingUser(String email, String rawPassword, Role role) {
        User user = new User(email, passwordHasher.hash(rawPassword), role);
        setId(user, 1L);
        return user;
    }

    /**
     * {@link User} has no id setter — ids come from the database. Reflection is the honest way to
     * build a "already persisted" instance in a test that has no database; the alternative is adding
     * a setter to production code purely so a test can call it, which is the worse trade.
     */
    private static void setId(User user, Long id) {
        try {
            var field = User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("User.id field has been renamed", e);
        }
    }

    @Nested
    @DisplayName("signup")
    class Signup {

        @Test
        @DisplayName("registers a new account and returns a token")
        void registersAndReturnsToken() {
            when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(call -> {
                User saved = call.getArgument(0);
                setId(saved, 99L);
                return saved;
            });
            when(jwtTokenProvider.generateToken(99L, EMAIL, Role.USER)).thenReturn(TOKEN);

            AuthResponse response = authService.signup(EMAIL, PASSWORD);

            assertThat(response.userId()).isEqualTo(99L);
            assertThat(response.email()).isEqualTo(EMAIL);
            assertThat(response.token()).isEqualTo(TOKEN);
        }

        /**
         * The password is stored hashed, never in plaintext. Asserted on the entity that is actually
         * persisted rather than on a call count, because the value in that field is the thing a
         * database leak would expose.
         */
        @Test
        @DisplayName("stores a BCrypt hash, never the password itself")
        void storesAHashNotThePassword() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(call -> call.getArgument(0));

            authService.signup(EMAIL, PASSWORD);

            User saved = savedUser();
            assertThat(saved.getPasswordHash()).isNotEqualTo(PASSWORD);
            assertThat(saved.getPasswordHash()).startsWith("$2a$");
            assertThat(passwordHasher.matches(PASSWORD, saved.getPasswordHash())).isTrue();
        }

        /**
         * The whole authorization model in one assertion. The signup body is attacker-controlled and
         * this endpoint is deliberately reachable without a token, so a role taken from input here —
         * even "only when present" — would be a self-service route to administrator.
         */
        @Test
        @DisplayName("always creates a USER, never an ADMIN")
        void alwaysCreatesAnOrdinaryUser() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(call -> call.getArgument(0));

            authService.signup("someone@example.com", PASSWORD);

            assertThat(savedUser().getRole()).isEqualTo(Role.USER);
        }

        @Test
        @DisplayName("refuses an address that already has an account")
        void duplicateEmailIsRejected() {
            when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

            assertThatThrownBy(() -> authService.signup(EMAIL, PASSWORD))
                    .isInstanceOf(EmailAlreadyRegisteredException.class);

            verify(userRepository, never()).save(any());
        }

        /**
         * The conflict message must not echo the address back. It ends up in logs that are read by
         * people who should not learn who is registered, and the person typing it already knows what
         * they typed.
         */
        @Test
        @DisplayName("the duplicate-email error does not contain the address")
        void duplicateErrorDoesNotLeakTheAddress() {
            when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

            assertThat(catchThrowable(() -> authService.signup(EMAIL, PASSWORD)))
                    .hasMessageNotContaining(EMAIL);
        }

        @Test
        @DisplayName("normalises the address before storing it")
        void emailIsLowercasedAndTrimmed() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(call -> call.getArgument(0));

            authService.signup("  Ada@Example.COM  ", PASSWORD);

            assertThat(savedUser().getEmail()).isEqualTo("ada@example.com");
        }

        /**
         * The uniqueness check must run against the normalised form. Checking the raw input would let
         * {@code Ada@Example.com} register alongside an existing {@code ada@example.com} — two
         * accounts for one address, and the one that was not used at signup then fails to log in with
         * a correct password.
         */
        @Test
        @DisplayName("checks uniqueness against the normalised address")
        void uniquenessIsCheckedOnTheNormalisedForm() {
            when(userRepository.existsByEmail("ada@example.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.signup("ADA@EXAMPLE.COM", PASSWORD))
                    .isInstanceOf(EmailAlreadyRegisteredException.class);
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "no-at-sign",
                "@example.com",
                "ada@",
                "two@at@example.com",
                "has space@example.com",
                "   "
        })
        @DisplayName("refuses an address that is not shaped like one")
        void malformedEmailIsRejected(String email) {
            assertThatThrownBy(() -> authService.signup(email, PASSWORD))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("refuses an address longer than the column")
        void overlongEmailIsRejected() {
            String tooLong = "a".repeat(250) + "@example.com";

            assertThatThrownBy(() -> authService.signup(tooLong, PASSWORD))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("254");
        }

        @ParameterizedTest
        @ValueSource(strings = {"", "short", "1234567"})
        @DisplayName("refuses a password under 8 characters")
        void shortPasswordIsRejected(String password) {
            assertThatThrownBy(() -> authService.signup(EMAIL, password))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("accepts a password of exactly 8 characters")
        void eightCharacterPasswordIsAccepted() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(call -> call.getArgument(0));

            assertThat(authService.signup(EMAIL, "12345678")).isNotNull();
        }

        /**
         * Refused rather than silently truncated, which is what makes "your password was accepted" an
         * honest statement — BCrypt would hash only the first 72 bytes and ignore the rest.
         */
        @Test
        @DisplayName("refuses a password past BCrypt's 72-byte limit")
        void overlongPasswordIsRejected() {
            assertThatThrownBy(() -> authService.signup(EMAIL, "a".repeat(73)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("72");
        }

        @Test
        @DisplayName("refuses a null password")
        void nullPasswordIsRejected() {
            assertThatThrownBy(() -> authService.signup(EMAIL, null))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        private User savedUser() {
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            return captor.getValue();
        }
    }

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("returns a token for correct credentials")
        void correctCredentialsSucceed() {
            User user = existingUser(EMAIL, PASSWORD, Role.USER);
            when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
            when(jwtTokenProvider.generateToken(1L, EMAIL, Role.USER)).thenReturn(TOKEN);

            AuthResponse response = authService.login(EMAIL, PASSWORD);

            assertThat(response.userId()).isEqualTo(1L);
            assertThat(response.email()).isEqualTo(EMAIL);
            assertThat(response.token()).isEqualTo(TOKEN);
        }

        @Test
        @DisplayName("issues a token carrying the account's current role")
        void tokenCarriesTheStoredRole() {
            User admin = existingUser("root@example.com", PASSWORD, Role.ADMIN);
            when(userRepository.findByEmail("root@example.com")).thenReturn(Optional.of(admin));
            when(jwtTokenProvider.generateToken(1L, "root@example.com", Role.ADMIN))
                    .thenReturn(TOKEN);

            assertThat(authService.login("root@example.com", PASSWORD).token()).isEqualTo(TOKEN);
        }

        @Test
        @DisplayName("finds the account regardless of the case typed")
        void emailLookupIsCaseInsensitive() {
            User user = existingUser(EMAIL, PASSWORD, Role.USER);
            when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
            when(jwtTokenProvider.generateToken(any(), any(), any())).thenReturn(TOKEN);

            assertThat(authService.login("  ADA@Example.com ", PASSWORD)).isNotNull();
        }

        @Test
        @DisplayName("refuses a wrong password")
        void wrongPasswordIsRejected() {
            // Built before the stubbing call, not inside it: existingUser() hashes a password on the
            // spy, and a spy invocation part-way through a when(...) chain leaves Mockito's stubbing
            // state machine unfinished and fails the next interaction with UnfinishedStubbingException.
            User user = existingUser(EMAIL, PASSWORD, Role.USER);
            when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> authService.login(EMAIL, "not-the-password"))
                    .isInstanceOf(InvalidCredentialsException.class);
        }

        @Test
        @DisplayName("refuses an unknown address")
        void unknownEmailIsRejected() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login("nobody@example.com", PASSWORD))
                    .isInstanceOf(InvalidCredentialsException.class);
        }

        @ParameterizedTest
        @ValueSource(strings = {"", "   "})
        @DisplayName("refuses a blank address as a bad request, not a credential failure")
        void blankEmailIsABadRequest(String email) {
            assertThatThrownBy(() -> authService.login(email, PASSWORD))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("refuses an absent password as a bad request")
        void missingPasswordIsABadRequest() {
            assertThatThrownBy(() -> authService.login(EMAIL, null))
                    .isInstanceOf(IllegalArgumentException.class);
            assertThatThrownBy(() -> authService.login(EMAIL, ""))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    /**
     * The property that keeps this API from answering "is this address registered?".
     *
     * <p>Both failure paths must be indistinguishable to the caller — same exception, same message,
     * and comparable time spent. Anything that distinguishes them turns login into an oracle that
     * enumerates the user base one request at a time.
     */
    @Nested
    @DisplayName("login does not reveal which addresses are registered")
    class NoUserEnumeration {

        @Test
        @DisplayName("an unknown address and a wrong password fail identically")
        void bothFailuresAreIndistinguishable() {
            User known = existingUser("known@example.com", PASSWORD, Role.USER);
            when(userRepository.findByEmail("known@example.com")).thenReturn(Optional.of(known));
            when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

            Throwable wrongPassword =
                    catchThrowable(() -> authService.login("known@example.com", "wrong-password"));
            Throwable unknownEmail =
                    catchThrowable(() -> authService.login("unknown@example.com", "wrong-password"));

            assertThat(unknownEmail).hasSameClassAs(wrongPassword);
            assertThat(unknownEmail.getMessage()).isEqualTo(wrongPassword.getMessage());
        }

        /**
         * The message must name neither the address nor which half of the credential was wrong.
         */
        @Test
        @DisplayName("the failure message says nothing about the account")
        void messageRevealsNothing() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            assertThat(catchThrowable(() -> authService.login("someone@example.com", PASSWORD)))
                    .hasMessage("Invalid email or password.")
                    .hasMessageNotContaining("someone@example.com");
        }

        /**
         * Verified on the collaborator rather than on a return value, and deliberately so: the whole
         * point of this behaviour is that <em>nothing observable to the caller</em> differs between
         * the two paths, so there is no return value or response that could carry the evidence. What
         * distinguishes them is work done — a BCrypt comparison against a throwaway hash so that an
         * unknown address costs the same ~80ms a known one does. Timing is not assertable reliably in
         * a unit test; that the equalising call happens is.
         */
        @Test
        @DisplayName("an unknown address still pays the cost of a password check")
        void unknownEmailStillHashes() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            catchThrowable(() -> authService.login("unknown@example.com", PASSWORD));

            verify(passwordHasher).matches(eq(PASSWORD), anyString());
        }

        /**
         * The dummy hash must be a real BCrypt hash that the submitted password cannot match —
         * otherwise the equalising call would be cheap, or worse, could succeed.
         */
        @Test
        @DisplayName("the equalising comparison is against a hash nothing can match")
        void dummyHashNeverMatches() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
            catchThrowable(() -> authService.login("unknown@example.com", PASSWORD));
            verify(passwordHasher).matches(anyString(), captor.capture());

            String dummy = captor.getValue();
            assertThat(dummy).startsWith("$2a$10$");
            assertThat(new PasswordHasher().matches(PASSWORD, dummy)).isFalse();
        }
    }
}
