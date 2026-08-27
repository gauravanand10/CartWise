package com.cartwise.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * One outbound click: somebody left CartWise for a retailer, via a product's offer. Chapter 26.
 *
 * <p>This is the only record CartWise keeps of the referral it is paid for. It is written before the
 * 302 is sent, so a stored row is a click that actually left rather than one that was merely
 * intended.
 *
 * <p><strong>The interesting design decision here is what the class does not have.</strong> No IP
 * address, no user agent, no referrer, no device or session identifier. Those are the fields a
 * click tracker accretes one at a time until it is a behavioural log of identifiable people, and
 * none of them is needed for the four questions this table exists to answer: how many, to whom, for
 * what, and when. See {@code V5__add_affiliate_clicks.sql}, where the same omissions are recorded
 * against the schema so a future migration cannot add one without meeting the argument.
 *
 * <p>Immutable after construction, and there are no setters. A click is a historical fact — nothing
 * about it can later turn out to have been different — so the type refuses to model an edit.
 */
@Entity
@Table(name = "affiliate_clicks", indexes = {
        @Index(name = "idx_affiliate_clicks_clicked_at", columnList = "clicked_at"),
        @Index(name = "idx_affiliate_clicks_product", columnList = "product_id"),
        @Index(name = "idx_affiliate_clicks_retailer", columnList = "retailer")
})
public class AffiliateClick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The product whose offer was clicked.
     *
     * <p>An association rather than a bare {@code Long productId}, for the reason {@link Wishlist}
     * gives: a plain numeric column is a foreign key in name only, and a clicks table full of ids
     * that resolve to nothing is a report that lies quietly.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_affiliate_click_product"))
    private Product product;

    /**
     * Who clicked, or null when nobody was signed in.
     *
     * <p>{@code optional = true} — and the nullability is load-bearing rather than lenient. Most
     * clicks on a public comparison site come from visitors with no account, and a sentinel "guest"
     * user would make "we do not know" indistinguishable from "this particular account", which is
     * exactly the distinction the analytics split depends on.
     *
     * <p>Nothing infers this from an address or a cookie. It is set only when the request already
     * carried a valid token, which the security filter chain had already validated for its own
     * reasons.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            foreignKey = @ForeignKey(name = "fk_affiliate_click_user"))
    private User user;

    /**
     * Retailer id as configuration names it — {@code amazon}, {@code flipkart}, …
     *
     * <p>A string, not an enum, and for the same reason {@link Product#getCategory()} is a string:
     * the retailer list is data that changes without a code change. Making it an enum would turn
     * "we signed up with a sixth retailer" into a redeploy plus a migration to rewrite a check
     * constraint.
     */
    @Column(nullable = false, length = 40)
    private String retailer;

    /** When the click happened. Set by {@link #onCreate()}, never by a caller. */
    @Column(name = "clicked_at", nullable = false, updatable = false)
    private Instant clickedAt;

    /** Required by JPA. Not for application use. */
    protected AffiliateClick() {}

    /**
     * Records a click.
     *
     * @param product  the product whose offer was clicked; required
     * @param user     the signed-in user, or {@code null} for an anonymous click
     * @param retailer the retailer id the click went to; required
     */
    public AffiliateClick(Product product, User user, String retailer) {
        this.product = product;
        this.user = user;
        this.retailer = retailer;
    }

    @PrePersist
    void onCreate() {
        this.clickedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    /** The signed-in user, or null for an anonymous click. */
    public User getUser() {
        return user;
    }

    public String getRetailer() {
        return retailer;
    }

    public Instant getClickedAt() {
        return clickedAt;
    }
}
