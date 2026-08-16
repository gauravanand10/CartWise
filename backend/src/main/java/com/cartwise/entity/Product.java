package com.cartwise.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * A catalogue product — the thing a wishlist entry or a comparison entry points at.
 *
 * <p>The field set is deliberately the one the existing frontend already renders, not an
 * aspirational schema: {@code ProductCardModel} in the React app needs slug, name, brand,
 * rating, review count, price, original price, stock and one image, and that is what is here.
 * Everything the product *detail* page additionally shows — spec groups, store offers, reviews,
 * the AI verdict, the image gallery — is still frontend mock data and gets its own tables in a
 * later chapter rather than being guessed at now.
 *
 * <p>{@code slug} is the identity the rest of the system uses. The React router addresses
 * products as {@code /product/:slug}, and the wishlist and comparison both persist slugs, so the
 * numeric {@code id} is a database concern that never needs to reach a URL or the client.
 */
/*
 * Indexes added in Chapter 20, when category and price became filterable and sortable.
 *
 * They are not a speedup today and this comment will not pretend otherwise: the table holds eight
 * rows, and PostgreSQL's planner will sequentially scan eight rows in preference to any index every
 * single time — reading the whole table costs one page, and an index lookup costs more. Nothing
 * measurable was gained by adding these, and a benchmark against this seed data would show noise.
 *
 * They are here because the query shapes they serve are now permanent parts of the API contract, and
 * an index is cheapest to add before the table it covers is large. Their value is entirely at a size
 * this database has never reached.
 *
 * What each one actually serves:
 *   idx_products_category — the GROUP BY in findCategoryCounts, and any exact-match category
 *                           predicate. NOT the ?category= filter, which compares lower(category)
 *                           and needs a functional index a JPA @Index cannot declare. See
 *                           ProductSpecifications.
 *   idx_products_price    — the ?minPrice/?maxPrice range predicates and ORDER BY price, both of
 *                           which a B-tree serves directly since neither wraps the column in a
 *                           function.
 *
 * No index on brand, rating or in_stock. brand has the same lower() problem as category; rating and
 * in_stock have too few distinct values for an index to beat a scan. Adding indexes that cannot be
 * used costs write throughput and buys nothing.
 */
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_category", columnList = "category"),
        @Index(name = "idx_products_price", columnList = "price")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * URL-safe identity, e.g. {@code iphone-16-pro}.
     *
     * <p>Unique because it is the real business key — two products sharing a slug would make
     * {@code /product/:slug} ambiguous, and {@code findBySlug} would have to guess.
     */
    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 80)
    private String brand;

    /**
     * Matches the frontend's {@code ProductCategory} union — "Smartphone", "Laptop",
     * "Headphones", "Earbuds", "Smartwatch", "Television", "Accessories".
     *
     * <p>Stored as text rather than a JPA enum on purpose: the catalogue's category list is
     * data that will change without a code change, and an enum would turn adding a category
     * into a redeploy. A lookup table is the eventual answer, not an enum.
     */
    @Column(nullable = false, length = 60)
    private String category;

    /**
     * Current selling price in rupees.
     *
     * <p>{@code numeric(12,2)}, never a floating-point type: binary floats cannot represent
     * decimal money exactly, and a catalogue whose totals drift by paise is a bug that only
     * shows up in production. Precision 12 leaves room well past the most expensive item the
     * catalogue carries.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** Pre-discount price. Null when the product is not discounted, which is why it is nullable. */
    @Column(name = "original_price", precision = 12, scale = 2)
    private BigDecimal originalPrice;

    /** Average rating out of 5, one decimal place — the precision the frontend actually shows. */
    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(name = "review_count", nullable = false)
    private int reviewCount;

    /**
     * Availability as the card renders it.
     *
     * <p>A boolean rather than the frontend's {@code stockCount}: real inventory is not the
     * catalogue's business, and until there is an orders table to decrement against, a count
     * here would be a number nothing maintains.
     */
    @Column(name = "in_stock", nullable = false)
    private boolean inStock;

    /** Primary card/gallery image. Nullable — the frontend already renders a placeholder. */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /*
     * Chapter 24 — provenance and licensing for the image above.
     *
     * These six exist because the photograph is not ours. Images come from Openverse, which indexes
     * Creative Commons and public-domain works, and the CC licences that cover almost all of them
     * grant use *on condition* of attribution. Displaying imageUrl without being able to display
     * imageAttribution is not a cosmetic omission, it is using the work outside its licence — which
     * is why these are part of the entity rather than a side table nobody joins.
     *
     * All nullable. A product whose Openverse search returned nothing keeps its seeded placeholder
     * URL and leaves every one of these null, and that combination is the signal the API uses to
     * tell the frontend "this is a placeholder, not a licensed photograph".
     */

    /** Openverse's UUID for the work, so it can be re-fetched without repeating the search. */
    @Column(name = "image_external_id", length = 64)
    private String imageExternalId;

    @Column(name = "image_creator", length = 200)
    private String imageCreator;

    /** Licence code as Openverse reports it — {@code by}, {@code by-sa}, {@code cc0}, … */
    @Column(name = "image_license", length = 40)
    private String imageLicense;

    @Column(name = "image_license_url", length = 300)
    private String imageLicenseUrl;

    /** The credit line Openverse composes. Stored verbatim rather than reassembled from the parts. */
    @Column(name = "image_attribution", length = 500)
    private String imageAttribution;

    /** The provider's page for the original work — not the image bytes. */
    @Column(name = "image_source_url", length = 500)
    private String imageSourceUrl;

    /** When the fetch last succeeded. Null means never fetched, or fetched and nothing matched. */
    @Column(name = "image_fetched_at")
    private Instant imageFetchedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Required by JPA. Not for application use. */
    protected Product() {}

    /**
     * Set the timestamps in JPA lifecycle callbacks rather than with Hibernate's
     * {@code @CreationTimestamp}, so the entity stays plain JPA and the behaviour is visible
     * in this file instead of implied by a provider-specific annotation.
     */
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

    public String getSlug() {
        return slug;
    }

    public String getName() {
        return name;
    }

    public String getBrand() {
        return brand;
    }

    public String getCategory() {
        return category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public boolean isInStock() {
        return inStock;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getImageExternalId() {
        return imageExternalId;
    }

    public String getImageCreator() {
        return imageCreator;
    }

    public String getImageLicense() {
        return imageLicense;
    }

    public String getImageLicenseUrl() {
        return imageLicenseUrl;
    }

    public String getImageAttribution() {
        return imageAttribution;
    }

    public String getImageSourceUrl() {
        return imageSourceUrl;
    }

    public Instant getImageFetchedAt() {
        return imageFetchedAt;
    }

    /**
     * Attaches a fetched photograph and everything needed to credit it.
     *
     * <p>One setter for all seven fields rather than seven setters, because they are one fact and
     * are only ever valid together. A caller that could set {@code imageUrl} alone could leave the
     * catalogue displaying a Creative Commons photograph with no attribution beside it, which is
     * the exact failure these columns exist to prevent — so the type system is used to make that
     * unexpressible rather than merely discouraged.
     *
     * <p>Sets {@code imageFetchedAt} itself, from the same clock, so "has an image" and "was
     * fetched at" cannot disagree.
     */
    public void applyImage(
            String url,
            String externalId,
            String creator,
            String license,
            String licenseUrl,
            String attribution,
            String sourceUrl) {
        this.imageUrl = url;
        this.imageExternalId = externalId;
        this.imageCreator = creator;
        this.imageLicense = license;
        this.imageLicenseUrl = licenseUrl;
        this.imageAttribution = attribution;
        this.imageSourceUrl = sourceUrl;
        this.imageFetchedAt = Instant.now();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
