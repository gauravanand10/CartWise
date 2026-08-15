package com.cartwise.testsupport;

import com.cartwise.entity.Product;
import java.lang.reflect.Field;
import java.math.BigDecimal;

/**
 * Builds {@link Product} instances for tests.
 *
 * <p><strong>Why reflection.</strong> {@code Product} has one constructor, {@code protected
 * Product()}, required by JPA and documented as "not for application use", and no setters. That is
 * correct production design — a catalogue product is written by the seed script and read by
 * everything else, so a public constructor would exist solely to be misused — but it leaves a test
 * with no supported way to make one.
 *
 * <p>The two alternatives were both worse. Adding a public constructor or setters to {@code Product}
 * would be changing production code to suit a test, and would put a mutation path into an entity that
 * deliberately has none. Persisting rows with raw SQL in every repository test would bypass the JPA
 * mapping that those tests exist to exercise.
 *
 * <p>The cost is honest and worth stating: this class breaks if a field is renamed, and it breaks at
 * run time rather than at compile time. {@link #set} therefore fails loudly with the field name
 * rather than returning a half-built object, so the failure names the rename that caused it.
 */
public final class ProductFixtures {

    private ProductFixtures() {
    }

    /** A product with every required field populated; override what a test cares about. */
    public static Builder product() {
        return new Builder();
    }

    /**
     * The eight-row shape the seed data uses, in the order a test can rely on for sorting.
     * Deliberately not read from {@code data.sql} — a test that shares a fixture file with the
     * application is a test that changes meaning when someone edits the seed.
     */
    public static final class Builder {

        private String slug = "test-product";
        private String name = "Test Product";
        private String brand = "TestBrand";
        private String category = "Smartphone";
        private BigDecimal price = new BigDecimal("999.00");
        private BigDecimal originalPrice;
        private BigDecimal rating = new BigDecimal("4.5");
        private int reviewCount = 10;
        private boolean inStock = true;
        private String imageUrl = "https://example.test/image.png";

        public Builder slug(String value) {
            this.slug = value;
            return this;
        }

        public Builder name(String value) {
            this.name = value;
            return this;
        }

        public Builder brand(String value) {
            this.brand = value;
            return this;
        }

        public Builder category(String value) {
            this.category = value;
            return this;
        }

        public Builder price(String value) {
            this.price = new BigDecimal(value);
            return this;
        }

        public Builder originalPrice(String value) {
            this.originalPrice = value == null ? null : new BigDecimal(value);
            return this;
        }

        public Builder rating(String value) {
            this.rating = new BigDecimal(value);
            return this;
        }

        public Builder reviewCount(int value) {
            this.reviewCount = value;
            return this;
        }

        public Builder inStock(boolean value) {
            this.inStock = value;
            return this;
        }

        public Builder imageUrl(String value) {
            this.imageUrl = value;
            return this;
        }

        /** An unsaved product, as {@code new} would give if there were a constructor for it. */
        public Product build() {
            Product product = instantiate();

            set(product, "slug", slug);
            set(product, "name", name);
            set(product, "brand", brand);
            set(product, "category", category);
            set(product, "price", price);
            set(product, "originalPrice", originalPrice);
            set(product, "rating", rating);
            set(product, "reviewCount", reviewCount);
            set(product, "inStock", inStock);
            set(product, "imageUrl", imageUrl);

            return product;
        }

        /**
         * A product that already has an id, for tests that never touch a database. Repository tests
         * must <em>not</em> use this — an id assigned by hand would collide with the identity
         * sequence and turn a persist into an update.
         */
        public Product buildWithId(long id) {
            Product product = build();
            set(product, "id", id);
            return product;
        }

        private static Product instantiate() {
            try {
                var constructor = Product.class.getDeclaredConstructor();
                constructor.setAccessible(true);
                return constructor.newInstance();
            } catch (ReflectiveOperationException e) {
                throw new IllegalStateException(
                        "Product's no-arg constructor is gone; ProductFixtures needs updating", e);
            }
        }
    }

    private static void set(Product product, String fieldName, Object value) {
        try {
            Field field = Product.class.getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(product, value);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(
                    "Product." + fieldName + " has been renamed or removed; "
                            + "ProductFixtures needs updating to match", e);
        }
    }
}
