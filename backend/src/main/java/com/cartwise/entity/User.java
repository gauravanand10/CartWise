package com.cartwise.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * A registered person, and the credential that proves they are that person.
 *
 * <p>Chapter 16 left this a deliberate stub — id and email, enough for a foreign key to point at.
 * Chapter 18 fills in the half that authentication needs and nothing beyond it.
 *
 * <p><strong>There is no {@code passwordSalt} column, and its absence is the point.</strong> BCrypt
 * generates a random salt per password and encodes it <em>inside</em> the hash string it returns:
 * {@code $2a$10$<22 chars of salt><31 chars of hash>}. {@link #passwordHash} therefore already
 * holds the salt, and {@code BCryptPasswordEncoder.matches} reads it back out of there to verify.
 * A separate salt column could only hold a second copy of a value that is already stored — and a
 * column that must never disagree with part of another column is a bug waiting for someone to
 * update one of them.
 *
 * <p>Chapter 19 adds {@link #role}, the one thing that decides what this account may do beyond its
 * own data.
 *
 * <p>Deliberately still absent, and for the same reason as in Chapter 16 — a half-specified column
 * invites something to start writing to it: no fine-grained permissions or groups, no
 * email-verified flag, no account status or lockout counters, no password-reset token, no
 * refresh-token or session state, no last-login timestamp. Verification, reset and OAuth are later
 * chapters.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique because it is how a person is identified, and how login looks them up. */
    @Column(nullable = false, unique = true, length = 254)
    private String email;

    /**
     * The BCrypt output for this user's password — algorithm, cost, salt and hash in one string.
     *
     * <p>Named {@code passwordHash} rather than {@code password} so that no code reads as though it
     * holds one. Nothing in this application can recover the password from it, which is the
     * property that makes a database leak survivable.
     *
     * <p>60 characters is BCrypt's fixed output length; the column is sized larger so that raising
     * the cost factor or moving to a different encoder later is not blocked by a column width.
     */
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    /**
     * What this account is permitted to do. Never null — see {@link Role}.
     *
     * <p>{@code EnumType.STRING} so the column holds {@code 'USER'} / {@code 'ADMIN'} rather than
     * {@code 0} / {@code 1}. With ordinals, adding a constant anywhere but the end of the enum
     * would silently re-label every existing row, which for a permissions column means quietly
     * promoting or demoting real users by editing a Java file.
     *
     * <p>{@code nullable = false} with no database default. A user without a role is not a state
     * this application can act on — every authorization decision would have to guess — so the
     * constraint makes it unrepresentable instead of leaving the guess to be written later. The
     * consequence is that every insert must name a role, which is why {@code data.sql} had to
     * change and why the constructor below takes one.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /**
     * {@code Instant}, not {@code LocalDateTime}, matching {@link Product} and {@link Wishlist}.
     *
     * <p>A {@code LocalDateTime} records a wall-clock reading with no timezone, so two servers in
     * different regions would write times that cannot be compared. An account creation time is a
     * moment, and {@code Instant} is the type that means a moment.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Required by JPA. Not for application use. */
    protected User() {}

    /**
     * Registers a user with an already-hashed password.
     *
     * <p>The parameter is named {@code passwordHash} and this class offers no overload taking a raw
     * password, so hashing cannot be forgotten at a call site — the type system will not let a
     * plaintext password reach the constructor without someone deliberately mislabelling it.
     * {@link com.cartwise.service.AuthService} is the only caller, and it hashes first.
     *
     * <p>No setters, matching the other entities. A user's email and password do change in a real
     * product, but each is a specific operation with its own rules (re-verification, current
     * password required) that belongs to the chapter that implements it, not to a pair of setters
     * that would let any code change either at any time. Chapter 19 adds the first such operation:
     * {@link #changeRole}.
     *
     * <p>{@code role} is a required argument rather than defaulting to {@link Role#USER} here.
     * Defaulting would put the policy "new accounts are ordinary users" inside the entity, where
     * nothing announces it; as a parameter it is stated at the one call site that registers people
     * — {@code AuthService.signup} — and any future code path that creates a user is forced to say
     * out loud what it is creating.
     *
     * <p>The timestamps are not parameters either. {@link #onCreate} owns them, and a constructor
     * that also accepted them would give the same two columns two sources that could disagree.
     */
    public User(String email, String passwordHash, Role role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    /**
     * Changes what this account may do.
     *
     * <p>A named operation rather than a {@code setRole}, and the difference is not cosmetic: this
     * is the single most consequential mutation in the application — it is how someone gains the
     * ability to change everyone else's — and it should be greppable. Searching for
     * {@code changeRole} finds every place a privilege is granted; searching for {@code setRole}
     * would eventually find a mapper doing it as a side effect of copying fields.
     *
     * <p>No check here that the caller is an admin, and that is not an oversight. An entity has no
     * idea who is calling it; enforcing that would mean reaching for the security context from
     * inside the persistence layer, which puts an authorization rule somewhere nobody reviewing
     * authorization would look. The rule lives in {@code SecurityConfig} and this method is only
     * reachable through {@code /api/admin/**}.
     */
    public void changeRole(Role newRole) {
        this.role = newRole;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    /**
     * The stored BCrypt string.
     *
     * <p>Read by exactly one caller — the login check in {@code AuthService} — and it must never be
     * put in a DTO, a log line or a response body. It is not a secret that grants access on its
     * own, but it is the input to an offline cracking attempt, so it stays inside the service layer.
     */
    public String getPasswordHash() {
        return passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Deliberately overridden so a user cannot be printed with its hash.
     *
     * <p>The default {@code toString} for an entity is rarely called on purpose, and exactly for
     * that reason it turns up in a log line or an exception message written by someone who did not
     * think about what the object contains. This one names the account without exposing the
     * credential.
     */
    @Override
    public String toString() {
        // Role is included where the hash is not: it is not a credential, and a log line about a
        // refused request is far more useful when it says what the account actually was.
        return "User{id=" + id + ", email='" + email + "', role=" + role + "}";
    }
}
