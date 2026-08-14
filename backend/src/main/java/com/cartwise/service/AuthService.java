package com.cartwise.service;

import com.cartwise.common.dto.AuthResponse;
import com.cartwise.common.exception.EmailAlreadyRegisteredException;
import com.cartwise.common.exception.InvalidCredentialsException;
import com.cartwise.entity.Role;
import com.cartwise.entity.User;
import com.cartwise.repository.UserRepository;
import com.cartwise.security.JwtTokenProvider;
import com.cartwise.security.PasswordHasher;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registration and sign-in: the two operations that turn a stranger into a known user.
 *
 * <p>All of the rules live here rather than in the controller — what a valid password is, when an
 * email counts as taken, what a caller is told when login fails. The controller's only jobs are to
 * accept JSON and to name the status codes.
 *
 * <p>The class is small but it is the most security-sensitive code in CartWise, so two properties
 * matter more than brevity: a raw password never leaves this class except into
 * {@link PasswordHasher}, and every failure path out of {@link #login} is indistinguishable from the
 * others to the caller.
 */
@Service
public class AuthService {

    /** Enough to resist casual guessing; not so much that people write it on a note. */
    private static final int MIN_PASSWORD_LENGTH = 8;

    /** The column is {@code varchar(254)} — the maximum length of an email address per RFC 5321. */
    private static final int MAX_EMAIL_LENGTH = 254;

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * A hash of a random string nobody knows, used only to burn the same time a real check would.
     *
     * <p>See {@link #login}. Computed once at startup rather than being a constant in the source,
     * so there is no fixed hash in the repository that could be recognised, and no risk of it ever
     * being a hash of a real password.
     */
    private final String dummyHash;

    public AuthService(
            UserRepository userRepository,
            PasswordHasher passwordHasher,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.jwtTokenProvider = jwtTokenProvider;
        this.dummyHash = passwordHasher.hash(UUID.randomUUID().toString());
    }

    /**
     * Registers an account and signs the new user straight in.
     *
     * <p>Returning a token from signup rather than making the client log in immediately afterwards:
     * the password was just verified by the act of choosing it, so a second round-trip would prove
     * nothing that this request has not already established.
     *
     * <p>The uniqueness check is not the real guarantee — the unique constraint on {@code email} is.
     * Two simultaneous signups with the same address can both pass this check, and the loser hits
     * the constraint and gets a 409 from the {@code DataIntegrityViolationException} handler. The
     * check exists so the ordinary case gets the clearer error, not so the race is prevented.
     *
     * @throws IllegalArgumentException          if the email or password fails validation (→ 400)
     * @throws EmailAlreadyRegisteredException   if the address already has an account (→ 409)
     */
    @Transactional
    public AuthResponse signup(String email, String rawPassword) {
        String normalisedEmail = normaliseEmail(email);
        validateEmail(normalisedEmail);
        validatePassword(rawPassword);

        if (userRepository.existsByEmail(normalisedEmail)) {
            // No address in the message. The person typing it already knows what they typed, and
            // this string can end up in a log that is read by people who should not learn it.
            throw new EmailAlreadyRegisteredException("An account with that email already exists.");
        }

        // Role.USER, always, with no way for the request to influence it. The registration body is
        // attacker-controlled and this endpoint is the one deliberately reachable without a token,
        // so a role taken from input here — even "only when the field is present" — would be a
        // self-service route to administrator. Privilege is granted by an existing admin through
        // /api/admin/users/{id}/role or not at all; that is the whole authorization model in one
        // constant.
        User user = userRepository.save(
                new User(normalisedEmail, passwordHasher.hash(rawPassword), Role.USER));

        return toAuthResponse(user);
    }

    /**
     * Verifies credentials and issues a token.
     *
     * <p>Both failure modes — unknown email, wrong password — throw the same
     * {@link InvalidCredentialsException} with the same message, so the response cannot be used to
     * discover which addresses are registered.
     *
     * <p>Identical responses are not enough on their own, which is what the dummy hash is for. If an
     * unknown email returned immediately while a known one spent ~80ms in BCrypt, the response time
     * would answer the question the status code refused to. Hashing the submitted password against
     * a throwaway hash makes the two paths cost the same. It is a small measure against a real
     * technique, and it costs one BCrypt call on a path that has already failed.
     *
     * <p>{@code readOnly} because logging in changes nothing. There is no last-login column to
     * update and no session row to write — the token is the entire result, and it is not stored.
     *
     * @throws IllegalArgumentException     if email or password is absent (→ 400)
     * @throws InvalidCredentialsException  if the credentials do not match an account (→ 401)
     */
    @Transactional(readOnly = true)
    public AuthResponse login(String email, String rawPassword) {
        if (email == null || email.isBlank() || rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("email and password are required");
        }

        Optional<User> account = userRepository.findByEmail(normaliseEmail(email));

        if (account.isEmpty()) {
            passwordHasher.matches(rawPassword, dummyHash);
            throw new InvalidCredentialsException();
        }

        User user = account.get();
        if (!passwordHasher.matches(rawPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return toAuthResponse(user);
    }

    /**
     * Builds the response both endpoints return, token included.
     *
     * <p>The role written into the token is read from the freshly-loaded (or freshly-saved) row, so
     * the token always reflects the account as it stands at the moment it is issued. That is the
     * only point at which the two can be brought back into agreement: once issued, a token's role
     * claim is fixed until it expires, whatever the database does afterwards.
     *
     * <p>The role is deliberately <em>not</em> added to {@link AuthResponse}. The client already
     * receives it inside the token and can decode it; putting it in the body as well would create
     * two sources for the same fact, and the tempting next step — a frontend branching on the body
     * field — is a permission check running in a place the user controls. Authorization decisions
     * belong to the server, and keeping the role out of the response body keeps that boundary
     * visible.
     */
    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole()));
    }

    /**
     * Trims and lower-cases an address before it is stored or looked up.
     *
     * <p>Without this, {@code Ada@Example.com} and {@code ada@example.com} become two accounts,
     * because the unique constraint compares bytes. Worse, whichever one a person did not use at
     * signup then fails to log in with a correct password. Normalising on both paths — signup and
     * login — is what makes them the same address.
     *
     * <p>Only the domain half is genuinely case-insensitive by the standards; the local part may
     * legally be case-sensitive. Practically no mail provider treats it that way, and matching what
     * users expect is worth more here than matching the RFC exactly.
     */
    private String normaliseEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    /**
     * The deliberately shallow email check: present, bounded, and shaped like an address.
     *
     * <p>No regex attempting RFC 5322. Those patterns are famously either wrong or unreadable, they
     * reject valid addresses that real people own, and they answer a question this application
     * cannot answer anyway — whether mail actually reaches the address. Only sending a message and
     * seeing it confirmed proves that, and email verification is a later chapter.
     */
    private void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required");
        }
        if (email.length() > MAX_EMAIL_LENGTH) {
            throw new IllegalArgumentException(
                    "email must be at most " + MAX_EMAIL_LENGTH + " characters");
        }

        int at = email.indexOf('@');
        boolean looksLikeAddress = at > 0                          // something before the @
                && at < email.length() - 1                          // something after it
                && email.indexOf('@', at + 1) < 0                   // exactly one @
                && !email.contains(" ");
        if (!looksLikeAddress) {
            throw new IllegalArgumentException("email must be a valid email address");
        }
    }

    /**
     * Length only: a floor, and BCrypt's ceiling.
     *
     * <p>No complexity rules — no required symbol, digit or capital. Those requirements are known to
     * push people toward predictable substitutions ({@code Password1!}) that add far less entropy
     * than the extra characters a longer passphrase gives for free, and current NIST guidance advises
     * against them. Length is the requirement that actually helps.
     *
     * <p>The upper bound is not a policy choice but a property of the algorithm: BCrypt hashes only
     * the first 72 bytes and ignores the rest, so accepting a longer password would mean accepting
     * one that is not fully checked at login. See {@link PasswordHasher#MAX_PASSWORD_BYTES}.
     */
    private void validatePassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("password is required");
        }
        if (rawPassword.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalArgumentException(
                    "password must be at least " + MIN_PASSWORD_LENGTH + " characters");
        }
        if (!passwordHasher.isWithinLengthLimit(rawPassword)) {
            throw new IllegalArgumentException(
                    "password must be at most " + PasswordHasher.MAX_PASSWORD_BYTES + " bytes");
        }
    }
}
