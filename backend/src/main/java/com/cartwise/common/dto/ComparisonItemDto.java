package com.cartwise.common.dto;

import java.time.Instant;

/**
 * One column of a comparison, as {@code GET /api/users/{userId}/comparison} returns it.
 *
 * <p>Shaped like {@link WishlistItemDto} on purpose — same embedded product, same "the id is the
 * entry, not the product" rule, same {@code Instant} timestamp — because the two are the same kind
 * of thing: a user's selection of a product, with a little metadata about the selecting. A client
 * that can read one can read the other without learning a second convention.
 *
 * <p>The one field the wishlist has no equivalent for is {@code position}, and it is the reason a
 * comparison is not just a wishlist with a smaller limit. The grid renders columns left to right,
 * and which column a product occupies is a stored fact that must survive a removal in the middle:
 * take the second of four away and the remaining three keep positions 0, 2 and 3 rather than
 * shuffling left. Returning it means the client renders the same order the server holds instead of
 * inferring one from array index.
 *
 * <p>Nothing is copied permanently. The record is assembled per request from the current product
 * row, so a compared product always shows today's price.
 *
 * @param id       the comparison entry's own id — the selection, not the product
 * @param product  the compared product, in full
 * @param position zero-based column, 0 to 3. Enforced by a check constraint in the baseline schema,
 *                 so a value outside that range is not representable rather than merely unexpected.
 * @param addedAt  when the product was added to the comparison, ISO-8601 UTC
 */
public record ComparisonItemDto(Long id, ProductDto product, int position, Instant addedAt) {
}
