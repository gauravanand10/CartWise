package com.cartwise.common.dto;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 * A slice of a larger result set, plus enough context to navigate it.
 *
 * <p><strong>This replaces the bare JSON array that {@code GET /api/products} returned in Chapter
 * 17, and it is a breaking change.</strong> A client doing {@code products.map(...)} on the response
 * now gets nothing useful, because the response is an object. Chapter 20 migrates the one client
 * CartWise has rather than keeping a second endpoint for the old shape: two contracts means two sets
 * of behaviour to keep in step, and the "legacy" one is never retired because nothing forces the
 * issue.
 *
 * <p>Hand-written rather than serialising Spring Data's {@link Page} directly. Jackson can serialise
 * a {@code Page}, but what it emits is the internal shape of a Spring class — {@code pageable},
 * {@code sort.sorted}, {@code numberOfElements}, {@code first}, {@code last}, an embedded
 * {@code Pageable} object — which publishes a framework's internals as a public API contract. Spring
 * itself warns about this, and a version upgrade that reorganises those fields becomes a breaking
 * change to every consumer. Five named fields, chosen here, are a contract this project owns.
 *
 * <p>{@code totalElements} costs a second {@code COUNT} query on every request. That is the price of
 * telling a client how many pages there are; the alternative — a cursor, or a "has more" boolean —
 * is cheaper and cannot render a page-number control, which is what this chapter's UI needs.
 *
 * @param content       the items on this page, already mapped to their DTO form
 * @param page          zero-indexed page number, echoed back so a client can trust what it received
 *                      rather than what it asked for — the two differ when a value was clamped
 * @param size          the page size actually applied, again after clamping
 * @param totalElements how many items match the filters across every page
 * @param totalPages    how many pages that comes to at this size; {@code 0} when nothing matched
 */
public record PageResponse<T>(
        List<T> content, int page, int size, long totalElements, int totalPages) {

    /**
     * Projects a Spring Data {@link Page} onto the wire shape.
     *
     * <p>Takes an already-mapped page so this type never has to know about entities. The service
     * calls {@code page.map(ProductMapper::toDto)} first, which keeps the mapping in the one place
     * that already owns it.
     */
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}
