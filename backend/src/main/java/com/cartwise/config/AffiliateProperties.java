package com.cartwise.config;

import com.cartwise.common.dto.AffiliateStatus;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * The retailers CartWise refers people to, and the affiliate credential for each. Chapter 26.
 *
 * <h2>Why this is configuration and not code</h2>
 *
 * <p>An affiliate tag is issued by a retailer to an approved account. Getting one requires a human
 * to apply and be accepted — Amazon Associates evaluates an application and only confirms it after
 * three qualifying sales inside 180 days, and Flipkart has not accepted direct sign-ups since May
 * 2018 — which is a process that cannot happen inside a build. This chapter therefore ships with an
 * obvious placeholder and every field that would have to change on approval bound to an environment
 * variable, so going live is a deployment change and not a code change. That claim is the whole
 * point of this class, so it is worth being precise about what "every field" means:
 *
 * <ul>
 *   <li><strong>tag</strong> — the credential itself. The one that obviously has to move.
 *   <li><strong>tagParam</strong> — the query parameter the retailer expects it in. Amazon reads
 *       {@code tag}, Flipkart reads {@code affid}, and the three Indian electronics chains have no
 *       documented first-party parameter at all, so theirs is empty and configurable rather than
 *       invented.
 *   <li><strong>searchUrl</strong> — the destination. Less obvious and the reason it is here: a
 *       retailer reached through an affiliate <em>network</em> (Cuelinks, EarnKaro, a CJ or
 *       Rakuten campaign) is not linked at its own domain at all, it is linked through the
 *       network's redirector. Without this being configurable, signing up through a network — the
 *       only route currently open for Flipkart and for Croma, Reliance Digital and Vijay Sales —
 *       would still need a code change, and the "zero code changes" claim would be false in
 *       precisely the case most likely to happen.
 * </ul>
 *
 * <h2>What is deliberately absent</h2>
 *
 * <p>No retailer product identifiers — no ASIN, no Flipkart PID. CartWise does not have them: the
 * catalogue is its own, and nothing in it maps a product to a retailer's SKU. Constructing a deep
 * link to a specific listing without that mapping would mean guessing at a URL, and a "Visit
 * Amazon" button that lands on someone else's phone is worse than one that lands on a search for
 * the right phone. Links are therefore built against each retailer's search, which is a real page
 * that resolves, with the product name as the query.
 *
 * @param retailers      keyed by the retailer id used in URLs and stored in
 *                       {@code affiliate_clicks}, e.g. {@code amazon}, {@code reliance-digital}
 * @param placeholderTag the credential value that means "this is not a real account". Configuration
 *                       rather than a constant so a deployment can recognise its own stand-in, and
 *                       so this file states in one place what the shipped default is. A retailer
 *                       carrying it is reported {@link AffiliateStatus#PLACEHOLDER}, which is what
 *                       stops the disclosure page claiming a commercial relationship that does not
 *                       exist
 */
@ConfigurationProperties(prefix = "cartwise.affiliate")
public record AffiliateProperties(Map<String, Retailer> retailers, String placeholderTag) {

    public AffiliateProperties {
        placeholderTag = placeholderTag == null || placeholderTag.isBlank()
                ? "cartwise-test-00"
                : placeholderTag;

        // An unconfigured map means "no retailers", not a NullPointerException at the first click.
        // LinkedHashMap rather than Map.copyOf so the yaml's declaration order survives into the
        // public /api/affiliate/retailers listing — the order the frontend renders is then the
        // order a human chose, not a hash order that changes between JVMs.
        retailers = retailers == null
                ? Map.of()
                : Collections.unmodifiableMap(new LinkedHashMap<>(retailers));
    }

    /** The configuration for one retailer, or null when nothing is configured under that id. */
    public Retailer retailer(String id) {
        return id == null ? null : retailers.get(id);
    }

    /**
     * What a link to this retailer is honestly worth: paid, placeholder, or nothing.
     *
     * <p>Lives here rather than on {@link Retailer} because it needs the placeholder value, which
     * belongs to the deployment rather than to any one retailer.
     */
    public AffiliateStatus statusOf(Retailer retailer) {
        if (!retailer.hasAffiliateTag()) {
            return AffiliateStatus.NONE;
        }
        return retailer.tag().equals(placeholderTag)
                ? AffiliateStatus.PLACEHOLDER
                : AffiliateStatus.PAID;
    }

    /**
     * One retailer's outbound link recipe.
     *
     * @param displayName          what the UI calls it, e.g. {@code "Reliance Digital"}
     * @param searchUrl            the search endpoint, with no query string of its own
     * @param queryParam           the parameter the search term goes in — {@code k} for Amazon,
     *                             {@code q} for the rest
     * @param querySuffix          appended to the search term before encoding. Exists for Croma,
     *                             whose storefront expects {@code q=<term>:relevance}; empty for
     *                             everyone else
     * @param secondaryQueryParam  a second parameter carrying the search term <em>without</em> the
     *                             suffix, or blank when the retailer needs only one. Also exists for
     *                             Croma, and it is not redundant: sending {@code q} alone returns a
     *                             page titled "Search null" that renders no results — the storefront
     *                             reads the human search term from {@code text} and treats {@code q}
     *                             as the facet expression. Established by driving Croma's own search
     *                             box in a browser and reading the URL it produced, because
     *                             {@code curl} is refused by their WAF and the one-parameter version
     *                             returns HTTP 200 while showing nothing
     * @param tagParam             the parameter the affiliate credential goes in, or blank when this
     *                             retailer has no first-party affiliate parameter
     * @param tag                  the affiliate credential, or blank when none is configured
     */
    public record Retailer(
            String displayName,
            String searchUrl,
            String queryParam,
            String querySuffix,
            String secondaryQueryParam,
            String tagParam,
            String tag) {

        public Retailer {
            querySuffix = querySuffix == null ? "" : querySuffix;
            secondaryQueryParam = secondaryQueryParam == null ? "" : secondaryQueryParam;
            tagParam = tagParam == null ? "" : tagParam;
            tag = tag == null ? "" : tag;
        }

        /**
         * True when a link to this retailer will actually carry an affiliate parameter.
         *
         * <p>Both halves are required, and treating one without the other as "configured" would be
         * the quiet way this goes wrong: a tag with no parameter to put it in produces an ordinary
         * link that the UI would then describe as an affiliate link, which is a false disclosure
         * rather than a missing one.
         *
         * <p>This answers a question about the <em>URL</em>, not about money — a placeholder tag is
         * "has a tag" and earns nothing. {@link AffiliateProperties#statusOf} is the one to ask
         * about money, and it is what the public listing exposes. <strong>The tag value itself is
         * never sent to a client</strong>: the frontend has no reason to know it, and a credential
         * embedded in a JavaScript bundle is a credential published.
         */
        public boolean hasAffiliateTag() {
            return !tagParam.isBlank() && !tag.isBlank();
        }
    }
}
