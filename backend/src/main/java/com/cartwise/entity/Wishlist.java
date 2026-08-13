package com.cartwise.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

/**
 * One saved product, belonging to one user.
 *
 * <p>A row per saved item rather than a list column: it is what makes "saved at" a real,
 * queryable value, and the frontend's default "Recently added" ordering is then a plain
 * {@code ORDER BY created_at DESC} instead of something reconstructed from array position. The
 * React provider currently fakes recency by prepending to a {@code string[]} in localStorage —
 * this table is what replaces that trick with a fact.
 *
 * <p>The unique constraint on {@code (user_id, product_id)} is the database's own version of the
 * invariant the frontend already enforces in memory: a product is either saved or not, never
 * saved twice. Enforcing it here matters because the client is not the only thing that will
 * write to this table once Chapter 17 exposes an API.
 *
 * <p>Persistence shape only — no add/remove/toggle logic. That is Chapter 17's service layer.
 */
@Entity
@Table(
        name = "wishlists",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_wishlist_user_product",
                        columnNames = {"user_id", "product_id"}))
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Owning user.
     *
     * <p>Modelled as an association rather than a bare {@code Long userId} so that Hibernate
     * emits a real {@code REFERENCES users(id)} constraint. A plain numeric column would be a
     * foreign key in name only — nothing would stop a row pointing at a user that never existed.
     *
     * <p>{@code LAZY} because loading a wishlist row must not drag a user (and later, a user's
     * whole graph) along with it.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_wishlist_user"))
    private User user;

    /** The saved product. Same reasoning as {@link #user} for the association and fetch type. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_wishlist_product"))
    private Product product;

    /** When the product was saved. Drives the frontend's "Recently added" sort. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Required by JPA. Not for application use. */
    protected Wishlist() {}

    /**
     * Saves a product for a user.
     *
     * <p>Added in Chapter 17: Chapter 16 modelled the table but nothing could create a row, because
     * the only constructor was JPA's. Both arguments are required and there are no setters, so a
     * {@code Wishlist} cannot exist in a half-built state where one of its foreign keys is null —
     * the invariant the {@code optional = false} associations declare is enforced at construction
     * too, not only at flush time.
     *
     * <p>{@code createdAt} is not a parameter: when a product was saved is a fact about the save,
     * decided by {@link #onCreate()}, not something a caller gets to assert.
     */
    public Wishlist(User user, Product product) {
        this.user = user;
        this.product = product;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Product getProduct() {
        return product;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
