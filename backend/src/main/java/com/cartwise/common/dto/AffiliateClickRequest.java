package com.cartwise.common.dto;

/**
 * The body of {@code POST /api/affiliate/clicks}. Chapter 26.
 *
 * <p>Two fields, and nothing else. A click-tracking request is the obvious place for a client to
 * start volunteering context — the page it came from, a session id, a campaign label — and every
 * one of those would be stored or logged by something eventually. The endpoint accepts what it
 * needs to build a URL and identify a product, so there is nothing extra to leak.
 *
 * @param retailer    the retailer id, e.g. {@code "amazon"}
 * @param productSlug the product's URL identity, the same one {@code /api/products/{slug}} takes
 */
public record AffiliateClickRequest(String retailer, String productSlug) {
}
