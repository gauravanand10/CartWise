package com.cartwise.common.dto;

/**
 * Body of {@code POST /api/users/{userId}/comparison}.
 *
 * <p>Deliberately identical in shape to {@link AddToWishlistRequest}, and for the same two reasons:
 * a one-field record can grow a second field without breaking clients that send only this one,
 * where a raw {@code "iphone-16-pro"} string body could not; and the slug is the identity the
 * frontend actually has, since the compare provider stores slugs and every product URL is one.
 *
 * <p>No {@code position} field. Which column a product lands in is the server's decision — it holds
 * the current state and the uniqueness constraint that makes the answer well-defined — and letting
 * a client name a position would mean handling "that slot is taken" as a distinct outcome for no
 * gain. The frontend has never wanted to choose one; it appends.
 *
 * @param productSlug slug of the product to compare; rejected when null or blank
 */
public record AddToComparisonRequest(String productSlug) {
}
