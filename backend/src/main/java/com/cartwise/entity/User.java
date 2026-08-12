package com.cartwise.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A user — <strong>stub only</strong>.
 *
 * <p>This class exists because {@link Wishlist} and {@link Comparison} are per-user by nature and
 * a foreign key needs something to point at. It is not the user model; Chapter 18 owns that.
 *
 * <p>Deliberately absent, and not by oversight: no password or password hash, no roles or
 * authorities, no email-verified flag, no account status, no timestamps, no
 * refresh-token/session state. Adding any of them now would mean committing to an authentication
 * design before writing the authentication, and a half-specified credential column is worse than
 * no column — it invites something to start writing to it.
 *
 * <p>{@code email} alone is enough to identify a row while Chapters 16 and 17 work, and it is the
 * one field Chapter 18 is certain to keep.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique because it is how a person is identified, here and after Chapter 18. */
    @Column(nullable = false, unique = true, length = 254)
    private String email;

    /** Required by JPA. Not for application use. */
    protected User() {}

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }
}
