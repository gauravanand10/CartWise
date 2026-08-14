package com.cartwise.common.dto;

import java.util.Arrays;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.JpaSort;

/**
 * The orderings {@code GET /api/products} accepts, and the only ones it accepts.
 *
 * <p>A closed set rather than a pass-through to Spring Data's {@code ?sort=field,dir} syntax, which
 * would be less code and a worse idea. That syntax lets a caller order by <em>any</em> property
 * name, which turns every column into part of the public contract — including ones that should not
 * be orderable and ones that do not exist, where the failure surfaces as a 500 from deep inside
 * Hibernate. An enum means the set of valid orderings is visible in one place, documented, and
 * rejectable with a helpful message.
 *
 * <p>The wire values are hyphenated ({@code price-asc}) because they appear in URLs and in the
 * frontend's query string, where hyphens are conventional and underscores are not. The constant
 * names cannot contain hyphens, so the two are mapped explicitly by {@link #from} rather than by
 * {@code valueOf}.
 */
public enum ProductSort {

    /** Cheapest first — the default expectation when someone sorts by price. */
    PRICE_ASC("price-asc", Sort.by(Sort.Direction.ASC, "price")),

    PRICE_DESC("price-desc", Sort.by(Sort.Direction.DESC, "price")),

    /** Best rated first. Ascending is not offered: nobody browses worst-first. */
    RATING_DESC("rating-desc", Sort.by(Sort.Direction.DESC, "rating")),

    /**
     * A–Z by name, case-insensitively.
     *
     * <p>Ordered by {@code lower(name)} rather than {@code name}, which was a bug found by reading
     * the actual response rather than by reasoning about it. A plain {@code ORDER BY name} against
     * this database sorts by byte value, so every capital letter precedes every lowercase one and
     * {@code "iPhone 16 Pro"} landed <em>after</em> {@code "Sony WH-1000XM6"} — last in a list
     * labelled A–Z. The collation is a property of the database, so the same code would sort
     * differently elsewhere, which is worse than sorting wrongly everywhere.
     *
     * <p>{@link JpaSort#unsafe} is the only way to express a function in a Spring Data sort;
     * {@code Sort.by} takes property names and would emit {@code lower(name)} as a column reference.
     * "Unsafe" means the string is passed into the query untouched, so it must never come from user
     * input — here it is a compile-time constant in an enum whose values are the only ones the API
     * accepts, and {@link #from} rejects everything else before this is reached.
     *
     * <p>The trade-off is that no plain index can serve this ordering, for the same reason the
     * category filter cannot use one. At catalogue scale an ordering that reads correctly is worth
     * more than one that indexes well.
     */
    NAME_ASC("name-asc", JpaSort.unsafe(Sort.Direction.ASC, "lower(name)"));

    private final String value;
    private final Sort sort;

    ProductSort(String value, Sort sort) {
        this.value = value;
        // Every ordering is tie-broken by id. Without it, two products at the same price have no
        // defined order between them, and PostgreSQL is free to return them differently on
        // consecutive requests — which at page boundaries means an item can appear on both page 0
        // and page 1, or on neither. A pagination bug that only shows up on ties is exactly the
        // kind that survives testing and reaches production.
        this.sort = sort.and(Sort.by(Sort.Direction.ASC, "id"));
    }

    /** The value as it appears in the query string. */
    public String value() {
        return value;
    }

    /** The Spring Data ordering, tie-broken by id. */
    public Sort sort() {
        return sort;
    }

    /**
     * Parses a query-string value.
     *
     * @throws IllegalArgumentException naming every valid value, so the 400 tells the caller what to
     *                                  send instead of only what was wrong (→ 400)
     */
    public static ProductSort from(String raw) {
        return Arrays.stream(values())
                .filter(candidate -> candidate.value.equalsIgnoreCase(raw))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "sort must be one of: " + validValues() + " (received '" + raw + "')"));
    }

    /** The valid values, comma-separated, for error messages and documentation. */
    public static String validValues() {
        return Arrays.stream(values()).map(ProductSort::value).collect(Collectors.joining(", "));
    }
}
