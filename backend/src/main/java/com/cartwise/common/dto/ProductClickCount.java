package com.cartwise.common.dto;

/**
 * How many outbound clicks one product has had. Chapter 26.
 *
 * <p>Identified by slug rather than by numeric id: the slug is the identity the rest of CartWise
 * uses in URLs, so an admin reading this row can paste it straight into {@code /product/<slug>} and
 * see what was clicked. The name travels with it because a report of slugs alone is a report nobody
 * reads.
 *
 * @param slug    the product's URL identity
 * @param name    the product's display name at the time the report ran
 * @param clicks  how many clicks, {@code long} because that is what {@code COUNT} returns
 */
public record ProductClickCount(String slug, String name, long clicks) {
}
