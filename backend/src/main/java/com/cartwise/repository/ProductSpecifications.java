package com.cartwise.repository;

import com.cartwise.common.CategorySlug;
import com.cartwise.common.dto.ProductQuery;
import com.cartwise.entity.Product;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/**
 * Turns a {@link ProductQuery} into a {@code WHERE} clause.
 *
 * <p><strong>Specifications rather than a {@code @Query}, and the reason is the combinatorics.</strong>
 * Five optional filters make thirty-two possible shapes of query. Written as JPQL that has to cope
 * with all of them, every predicate becomes the familiar
 * {@code (:brand IS NULL OR lower(p.brand) = :brand)} — which works, but means the query text no
 * longer tells you what it does, and every unused filter still appears in the SQL sent to
 * PostgreSQL. Specifications compose only the predicates that were actually asked for, so a request
 * with no filters produces a query with no {@code WHERE} clause at all, and one with two filters
 * produces exactly two conditions.
 *
 * <p>The cost is honest: a Specification is harder to read than a SQL string, and the generated SQL
 * is not visible in the source. That is why this chapter's verification pastes the actual statement
 * from {@code show-sql} rather than asserting the filters reach the database.
 *
 * <p><strong>Everything here runs in the database.</strong> Nothing in this class or its callers
 * loads a list and filters it in Java — the specification becomes a {@code WHERE} clause, the sort
 * becomes {@code ORDER BY}, and the page becomes {@code LIMIT}/{@code OFFSET}. Filtering in memory
 * would work identically at eight rows and fall over at eighty thousand, and the failure would
 * arrive as a slow endpoint rather than as an error anyone could act on.
 */
public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    /**
     * Builds the combined predicate for a query, or {@code null} when nothing was filtered.
     *
     * <p>Returning null is not an oversight — it is what {@code JpaSpecificationExecutor} expects
     * for "no restriction", and it is what produces a bare {@code SELECT ... ORDER BY ... LIMIT}
     * with no {@code WHERE} clause for an unfiltered browse.
     */
    public static Specification<Product> from(ProductQuery query) {
        List<Specification<Product>> predicates = new ArrayList<>();

        if (query.categorySlug() != null) {
            predicates.add(hasCategorySlug(query.categorySlug()));
        }
        if (query.brand() != null) {
            predicates.add(hasBrand(query.brand()));
        }
        if (query.minPrice() != null) {
            predicates.add(priceAtLeast(query.minPrice()));
        }
        if (query.maxPrice() != null) {
            predicates.add(priceAtMost(query.maxPrice()));
        }
        // Only true filters. `?inStock=false` means "do not apply this filter", not "show me things
        // that are out of stock" — the UI control is a checkbox that is either on or absent, and
        // there is no screen that wants unavailable products only.
        if (Boolean.TRUE.equals(query.inStockOnly())) {
            predicates.add(inStock());
        }

        return predicates.stream().reduce(Specification::and).orElse(null);
    }

    /**
     * Matches a category by its URL form, case-insensitively.
     *
     * <p>The slug is converted back to a comparable name ({@code "home-appliances"} →
     * {@code "home appliances"}) and compared against {@code lower(category)}. Comparing in the
     * other direction — slugifying the column in SQL — would need a nested {@code replace(lower(…))}
     * that no index can serve and that reads worse.
     *
     * <p><strong>The {@code lower()} call has an index consequence worth stating.</strong> A plain
     * B-tree index on {@code category} cannot satisfy {@code lower(category) = ?}: PostgreSQL will
     * not use it, because the indexed value and the compared value are different expressions. Making
     * this predicate index-backed needs a functional index — {@code CREATE INDEX … ON products
     * (lower(category))} — which JPA's {@code @Index} cannot express. The index that is declared on
     * the entity still earns its place for the grouping in
     * {@code ProductRepository.findCategoryCounts} and for any exact-match query, and at the current
     * table size PostgreSQL would choose a sequential scan over either. This is recorded as a known
     * limitation rather than left to be discovered from a query plan.
     */
    private static Specification<Product> hasCategorySlug(String slug) {
        String comparable = CategorySlug.toComparableName(slug);
        return (root, query, cb) -> cb.equal(cb.lower(root.get("category")), comparable);
    }

    /** Same case-insensitive treatment as category, so {@code ?brand=apple} finds "Apple". */
    private static Specification<Product> hasBrand(String brand) {
        String comparable = brand.toLowerCase(Locale.ROOT);
        return (root, query, cb) -> cb.equal(cb.lower(root.get("brand")), comparable);
    }

    /** Inclusive, as the parameter name says: {@code minPrice=69999} includes a product at 69999. */
    private static Specification<Product> priceAtLeast(BigDecimal min) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), min);
    }

    /** Inclusive upper bound, mirroring {@link #priceAtLeast}. */
    private static Specification<Product> priceAtMost(BigDecimal max) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), max);
    }

    private static Specification<Product> inStock() {
        return (root, query, cb) -> cb.isTrue(root.get("inStock"));
    }
}
