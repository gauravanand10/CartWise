package com.cartwise.common.dto;

/**
 * One retailer, as the public {@code GET /api/affiliate/retailers} describes it. Chapter 26.
 *
 * <p><strong>There is no tag field, and that omission is the point of this record existing at all
 * instead of serialising the configuration.</strong> The affiliate credential is the one secret this
 * feature has; a client has no use for it, and anything sent to a browser is published. The
 * frontend needs to know only what a link is worth, so that the disclosure it renders is true —
 * hence a status rather than a value.
 *
 * @param id     the retailer id used in click URLs and stored on click rows
 * @param name   display name
 * @param status what an outbound link to this retailer is honestly worth. Read by the disclosure
 *               page, which therefore states this deployment's real position rather than a list
 *               someone typed into the copy. See {@link AffiliateStatus} for why this is three
 *               states and not a boolean — the middle one exists because a placeholder credential
 *               makes a link structurally affiliate and commercially worthless at the same time
 */
public record AffiliateRetailerDto(String id, String name, AffiliateStatus status) {
}
