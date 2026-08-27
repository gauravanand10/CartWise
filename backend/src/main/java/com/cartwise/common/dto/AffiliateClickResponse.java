package com.cartwise.common.dto;

/**
 * What {@code POST /api/affiliate/clicks} answers with: where to send the browser. Chapter 26.
 *
 * <p>The redirect endpoint ({@code GET /api/affiliate/click/…}) is the primary route and this is the
 * one the frontend actually uses, for a reason that is a browser fact rather than a preference: a
 * top-level navigation carries no {@code Authorization} header, and CartWise's token lives in
 * {@code localStorage}. A signed-in user clicking a plain link would therefore be recorded as
 * anonymous. Asking for the URL over {@code fetch} — which does carry the header — and then
 * navigating is what makes "attributed to a user when signed in" true from a browser rather than
 * only from curl.
 *
 * <p>The click is recorded before this is returned, exactly as it is before the 302, so the two
 * routes cannot record different things.
 *
 * @param url      the fully constructed outbound URL, affiliate parameter already applied
 * @param retailer the retailer id, echoed so a caller can log or label without re-deriving it
 * @param status   what this particular link is worth. The frontend does not currently branch on it;
 *                 it is here so a UI that wants to distinguish a paid link from a placeholder or an
 *                 untagged one can, without ever seeing the credential itself
 */
public record AffiliateClickResponse(String url, String retailer, AffiliateStatus status) {
}
