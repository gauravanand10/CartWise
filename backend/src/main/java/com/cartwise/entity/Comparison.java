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
import org.hibernate.annotations.Check;

/**
 * One product in a user's comparison, at a known column position.
 *
 * <p>The four-item cap that {@code MAX_COMPARE} enforces in the React provider is enforced here
 * by two constraints working together rather than by application code:
 *
 * <ul>
 *   <li>{@code position} is checked to be between 0 and 3, so no fifth slot can be named;
 *   <li>{@code (user_id, position)} is unique, so each of those four slots holds at most one row.
 * </ul>
 *
 * <p>Four legal positions, each usable once, is a maximum of four rows per user — expressed as a
 * property of the data rather than a rule some caller has to remember. {@code MAX_COMPARE} on the
 * client stays as it is; it now agrees with the schema instead of being the only thing saying so.
 *
 * <p>{@code (user_id, product_id)} is unique too, matching the client's "duplicate" outcome: the
 * same product cannot occupy two columns of one comparison.
 *
 * <p>Persistence shape only — reordering, capping and the add/remove outcomes are Chapter 17.
 */
@Entity
@Table(
        name = "comparisons",
        uniqueConstraints = {
            @UniqueConstraint(
                    name = "uk_comparison_user_position",
                    columnNames = {"user_id", "position"}),
            @UniqueConstraint(
                    name = "uk_comparison_user_product",
                    columnNames = {"user_id", "product_id"})
        })
@Check(name = "ck_comparison_position_range", constraints = "position BETWEEN 0 AND 3")
public class Comparison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Owning user. Association, not a bare id, so the foreign key is real. See {@link Wishlist}. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_comparison_user"))
    private User user;

    /** The product occupying this column. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_comparison_product"))
    private Product product;

    /**
     * Zero-based column position, 0 to 3.
     *
     * <p>Stored rather than derived from insertion order because the comparison grid is
     * positional — the user sees columns in a specific order, and "which column" has to survive a
     * removal in the middle.
     */
    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Required by JPA. Not for application use. */
    protected Comparison() {}

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

    public int getPosition() {
        return position;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
