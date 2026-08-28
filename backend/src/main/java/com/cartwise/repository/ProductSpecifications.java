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

        if (query.text() != null) {
            predicates.add(matchesText(query.text()));
        }
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
     * Free-text search across name, brand and category. Chapter 30.
     *
     * <h2>Why {@code ILIKE} rather than PostgreSQL full-text search</h2>
     *
     * <p>The obvious "proper" answer is a {@code tsvector} column with a GIN index and
     * {@code to_tsquery}. It is the wrong tool for this data, and the reason is what the strings
     * actually are.
     *
     * <p>Full-text search tokenises on word boundaries and stems. That is exactly right for prose
     * and exactly wrong for product names, which are mostly model designations: a shopper typing
     * {@code wh-1000} expects the Sony WH-1000XM6, and {@code xm6}, {@code s25}, {@code m4} and
     * {@code g14} are all real substrings of real product names in this catalogue that FTS would
     * either not match at all or match only after the whole token was typed. Stemming actively
     * hurts here — there is no linguistic root of "QN90F" worth finding.
     *
     * <p>{@code ILIKE '%term%'} is a substring match, which is the semantics a product-name search
     * box actually has. It also needs no schema change, no migration, and no trigger to keep a
     * derived column in step with the source.
     *
     * <p><strong>The cost, stated rather than discovered later:</strong> a leading-wildcard
     * {@code ILIKE} cannot use a B-tree index, so this is a sequential scan. Over a hundred rows
     * that is sub-millisecond and PostgreSQL would choose a scan over an index anyway. It stays
     * acceptable into the low tens of thousands. Past that the fix is a {@code pg_trgm} GIN index
     * — {@code CREATE INDEX … USING gin (name gin_trgm_ops)} — which makes exactly this predicate
     * index-backed <em>without changing the API or this method's semantics</em>. That is the
     * property that makes ILIKE the right starting point rather than a corner cut: the upgrade path
     * is additive.
     *
     * <h2>Multiple words are ANDed, each against any field</h2>
     *
     * <p>{@code "samsung galaxy"} splits into two terms, and a product matches only if BOTH appear
     * somewhere across its name, brand or category. So {@code "apple watch"} finds the Apple Watch
     * without also returning every other Apple product, and — because each term may match a
     * different field — {@code "sony headphones"} finds the WH-1000XM6 by matching the brand on one
     * term and the category on the other, which no single-field search could do.
     *
     * <p>Order-independent by construction: {@code "galaxy samsung"} matches the same rows.
     */
    private static Specification<Product> matchesText(String text) {
        // Split on any run of whitespace. A caller who pastes "  sony   wh-1000  " gets two terms,
        // not four with two empties.
        String[] terms = text.trim().toLowerCase(Locale.ROOT).split("\\s+");

        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> perTerm = new ArrayList<>();

            for (String term : terms) {
                if (term.isEmpty()) {
                    continue;
                }

                // Escaped so a product name containing % or _ cannot be searched for by accident,
                // and so a user typing "50%" searches for the characters rather than a wildcard.
                String pattern = "%" + escapeLike(term) + "%";

                perTerm.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, LIKE_ESCAPE),
                        cb.like(cb.lower(root.get("brand")), pattern, LIKE_ESCAPE),
                        cb.like(cb.lower(root.get("category")), pattern, LIKE_ESCAPE)));
            }

            // No usable terms (the input was punctuation or whitespace) means no restriction,
            // matching how a blank q is treated as absent in ProductQuery.of.
            return perTerm.isEmpty()
                    ? cb.conjunction()
                    : cb.and(perTerm.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    /** The character LIKE patterns below use to escape their own wildcards. */
    private static final char LIKE_ESCAPE = '\\';

    /**
     * Neutralises LIKE's wildcards in user input.
     *
     * <p>Without this, searching for {@code %} matches every product and searching for {@code _}
     * matches every product with at least one character — both of which look like a broken search
     * rather than a literal match. The escape character itself must be escaped first, or escaping
     * the wildcards would corrupt it.
     */
    private static String escapeLike(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
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
