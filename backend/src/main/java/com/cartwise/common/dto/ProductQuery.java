package com.cartwise.common.dto;

import java.math.BigDecimal;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * A validated catalogue query: what to filter on, how to order, which page.
 *
 * <p>Every field is optional except the paging ones, which have defaults. The type exists so that
 * validation happens once, in {@link #of}, rather than being scattered between a controller
 * signature and a service method — and so the service receives a value that is already known to be
 * coherent instead of one it has to re-check.
 *
 * <p>The validation rules are deliberately inconsistent between clamping and rejecting, and the
 * inconsistency is the design:
 *
 * <ul>
 *   <li><strong>Clamped</strong> — {@code size}. Asking for 5000 items is a request the server can
 *       partly honour, and a browse API that answers a too-large page with an error is hostile to
 *       the casual caller poking at it. The response echoes the size actually applied, so nothing is
 *       hidden.
 *   <li><strong>Rejected</strong> — a negative {@code page}, an inverted price range, an unknown
 *       sort. None of these has a defensible interpretation. "Page −1" clamped to 0 would silently
 *       answer a different question than the one asked, and a caller looping over pages would never
 *       learn its arithmetic was wrong.
 * </ul>
 *
 * <p>The general rule: clamp when the request is merely immoderate, reject when it is incoherent.
 *
 * @param text          free-text search across name, brand and category, or null for all.
 *                      Added in Chapter 30 — see {@link #of} for why it is a filter rather than a
 *                      separate endpoint
 * @param categorySlug  category to filter by, in URL form, or null for all
 * @param brand         brand to filter by, matched case-insensitively, or null for all
 * @param minPrice      inclusive lower bound, or null
 * @param maxPrice      inclusive upper bound, or null
 * @param inStockOnly   when true, exclude out-of-stock products. Null and false both mean "show
 *                      everything" — there is deliberately no way to ask for only out-of-stock items
 * @param sort          the ordering; never null, defaults to {@link ProductSort#NAME_ASC}
 * @param page          zero-indexed page number
 * @param size          page size, already clamped to {@link #MIN_PAGE_SIZE}..{@link #MAX_PAGE_SIZE}
 */
public record ProductQuery(
        String text,
        String categorySlug,
        String brand,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Boolean inStockOnly,
        ProductSort sort,
        int page,
        int size) {

    /** What a caller gets when it does not ask: one screenful. */
    public static final int DEFAULT_PAGE_SIZE = 20;

    /**
     * The ceiling on a single page.
     *
     * <p>Not arbitrary politeness — it is the only thing standing between a public endpoint and a
     * request that asks the database to materialise the entire table into one JSON document. At
     * eight seed rows that is harmless; the limit exists so the endpoint is still safe at eight
     * thousand, and adding it later means adding it after something already depends on its absence.
     */
    public static final int MAX_PAGE_SIZE = 100;

    /** A page of zero items is not a page; asking for one is rounded up rather than refused. */
    public static final int MIN_PAGE_SIZE = 1;

    /**
     * The default ordering when none is given.
     *
     * <p>Alphabetical, not "whatever the database returns". Chapter 17 returned rows in unspecified
     * order, which was defensible for an unpaged list and is not defensible now: without a total
     * order, the rows that land on page 1 are undefined, and an item can appear twice or vanish
     * entirely as the plan changes. Pagination requires a deterministic sort to mean anything.
     */
    public static final ProductSort DEFAULT_SORT = ProductSort.NAME_ASC;

    /**
     * Validates and normalises raw query-string values.
     *
     * <h2>Chapter 30 — why {@code q} is a filter here rather than a {@code /search} endpoint</h2>
     *
     * <p>Free text is one more optional predicate over the same table, ordered the same ways and
     * paged the same way. A second endpoint would duplicate every one of those concerns and then
     * have to answer "can I search within a category" with a third. Adding it here means
     * {@code ?q=pixel&category=smartphone&maxPrice=90000&sort=price-asc} composes for free, and the
     * frontend's search page and browse page can share one client function.
     *
     * <p><strong>A blank {@code q} is not a search for nothing.</strong> It is treated as absent, by
     * the same {@link #blankToNull} rule the other string filters use, so a search box that submits
     * an empty field returns the catalogue rather than zero results.
     *
     * @throws IllegalArgumentException for a negative page, a negative price, an inverted price
     *                                  range, or an unrecognised sort value (→ 400)
     */
    public static ProductQuery of(
            String q,
            String category,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStock,
            String sort,
            Integer page,
            Integer size) {

        int resolvedPage = page == null ? 0 : page;
        if (resolvedPage < 0) {
            throw new IllegalArgumentException(
                    "page must be zero or greater (received " + resolvedPage + ")");
        }

        // Clamped rather than rejected — see the class comment. Math.clamp is Java 21.
        int resolvedSize = size == null
                ? DEFAULT_PAGE_SIZE
                : Math.clamp(size, MIN_PAGE_SIZE, MAX_PAGE_SIZE);

        if (minPrice != null && minPrice.signum() < 0) {
            throw new IllegalArgumentException("minPrice cannot be negative");
        }
        if (maxPrice != null && maxPrice.signum() < 0) {
            throw new IllegalArgumentException("maxPrice cannot be negative");
        }

        // Inverted rather than empty: a caller asking for 999999..1 has made an error, and
        // answering "no products match" would let them conclude the catalogue is empty. compareTo,
        // not equals — BigDecimal.equals("10.0", "10.00") is false because it compares scale.
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException(
                    "minPrice (" + minPrice.toPlainString() + ") cannot be greater than maxPrice ("
                            + maxPrice.toPlainString() + ")");
        }

        ProductSort resolvedSort = sort == null || sort.isBlank()
                ? DEFAULT_SORT
                : ProductSort.from(sort);

        return new ProductQuery(
                blankToNull(q),
                blankToNull(category),
                blankToNull(brand),
                minPrice,
                maxPrice,
                inStock,
                resolvedSort,
                resolvedPage,
                resolvedSize);
    }

    /** The paging and ordering half, as Spring Data wants it. */
    public Pageable toPageable() {
        return PageRequest.of(page, size, sort.sort());
    }

    /**
     * Treats {@code ?category=} as absent rather than as a filter for the empty string.
     *
     * <p>A form that submits its fields unconditionally sends empty values for the ones nobody
     * filled in, and without this every such request would filter for products whose category is
     * literally {@code ""} and return nothing.
     */
    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
