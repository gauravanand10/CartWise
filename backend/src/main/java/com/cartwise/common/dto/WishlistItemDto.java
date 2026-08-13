package com.cartwise.common.dto;

import java.time.Instant;

/**
 * One saved product, as {@code GET /api/users/{userId}/wishlist} returns it.
 *
 * <p>The product is embedded rather than referenced by slug alone. The frontend's wishlist grid
 * renders full product cards, so a list of slugs would force it into N follow-up requests to draw
 * one page — the exact round-trip fan-out the mock {@code wishlistService} performs today against
 * in-memory data and could not afford over HTTP.
 *
 * <p>Nothing is copied into this record permanently: it is assembled per request from the current
 * product row, so a saved product always shows today's price rather than the price it had when it
 * was saved.
 *
 * @param id      the wishlist entry's own id — the saving, not the product
 * @param product the saved product, in full
 * @param savedAt when it was saved. {@code Instant}, matching the entity's {@code created_at} and
 *                every other timestamp in this API; serialised as ISO-8601 UTC. A
 *                {@code LocalDateTime} would mean choosing a timezone to render it in, which is a
 *                display decision the client should make, not the server.
 */
public record WishlistItemDto(Long id, ProductDto product, Instant savedAt) {
}
