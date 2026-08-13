package com.cartwise.common.dto;

/**
 * Body of {@code POST /api/users/{userId}/wishlist}.
 *
 * <p>A record with one field rather than a bare string body: {@code {"productSlug": "..."}} can
 * grow a second field without breaking the clients that send only this one, whereas a raw
 * {@code "iphone-16-pro"} could not.
 *
 * <p>The product is identified by slug, not by numeric id, because that is the identity the
 * frontend has — the wishlist provider stores slugs, and every product URL is a slug. Requiring an
 * id would mean the client had to look one up first.
 *
 * @param productSlug slug of the product to save; rejected when null or blank
 */
public record AddToWishlistRequest(String productSlug) {
}
