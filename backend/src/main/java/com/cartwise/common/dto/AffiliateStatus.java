package com.cartwise.common.dto;

/**
 * Whether an outbound link to a retailer actually earns CartWise anything. Chapter 26.
 *
 * <p><strong>Three states rather than a boolean, and the middle one is the reason this type
 * exists.</strong> A boolean {@code affiliateTagConfigured} was the first shape of this, and it made
 * the disclosure page state something false: the shipped configuration carries the placeholder tag
 * {@code cartwise-test-00}, so links to Amazon and Flipkart <em>do</em> carry an affiliate parameter
 * and the page said "Yes — this is a paid affiliate link". No approved affiliate account exists.
 * Nobody is paying anybody. The page was describing a commercial relationship that does not exist,
 * on the one page a reader is entitled to a true answer.
 *
 * <p>Over-disclosing is the safe direction — the legal risk in an affiliate disclosure is always
 * under-disclosure, and the notice beside the links themselves stays conservative — but "safe
 * direction" is not the same as "accurate", and this page is where accuracy is the point.
 */
public enum AffiliateStatus {

    /**
     * A real, non-placeholder affiliate credential is configured. A purchase made through this link
     * may genuinely earn a commission.
     */
    PAID,

    /**
     * The link carries the obvious placeholder credential. It is structurally an affiliate link —
     * the parameter is there, the plumbing works — and it earns nothing, because the value
     * identifies no approved account.
     *
     * <p>This is the state the project ships in, and it stops being reachable for a given retailer
     * the moment a real tag is supplied through the environment. Nothing in code changes.
     */
    PLACEHOLDER,

    /**
     * No affiliate credential at all. The click is still tracked and the shopper still reaches the
     * retailer; CartWise simply has no arrangement with them.
     */
    NONE
}
