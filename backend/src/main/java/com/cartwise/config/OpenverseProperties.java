package com.cartwise.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings for the Openverse image search, bound from {@code cartwise.openverse}.
 *
 * <p>Openverse is the WordPress-run search index over openly-licensed media. It is used here rather
 * than Unsplash or Pexels for one decisive reason: <strong>it answers without an API key</strong>.
 * Both of the others return 401 to an unauthenticated request and issue keys only through a web
 * signup form a person has to complete, which would have made this integration unbuildable without
 * a human in the loop. Openverse serves anonymous traffic and, separately, hands out OAuth2
 * credentials through a plain HTTP POST.
 *
 * <p><strong>Authentication is optional and off by default, and that is a deliberate design
 * choice rather than an omission.</strong> The backfill this configures issues one request per
 * catalogue category — seven, for the seven categories the catalogue has — not one per product.
 * Seven requests fit inside the anonymous allowance several times over, so the common path needs no
 * credential at all and this repository holds no secret. Setting {@code client-id} and
 * {@code client-secret} (from the environment, never from a committed file) raises the ceiling for
 * anyone who wants to re-run the backfill repeatedly while developing.
 *
 * <p>The allowances, read from the {@code X-RateLimit-*} response headers rather than from
 * documentation:
 * <pre>
 *   anonymous, unverified registration   100/day    5/min
 *   anonymous, verified registration     200/day   20/min
 *   oauth2 client_credentials         10,000/day  100/min
 * </pre>
 *
 * @param baseUrl      root of the API. Configurable so a test can point it at a stub rather than
 *                     the live service — an integration test that depends on a third party's
 *                     uptime is a test that fails for reasons unrelated to this code.
 * @param clientId     OAuth2 client id, or null to call anonymously
 * @param clientSecret OAuth2 client secret, or null to call anonymously
 * @param timeout      per-request timeout. Short: this runs inside an admin request, and a hung
 *                     upstream must not hold a connection open indefinitely.
 * @param pageSize     results requested per category. Larger than the number of products in any one
 *                     category, so every product in a category can be given a *different*
 *                     photograph rather than fifty rows sharing one image.
 */
@ConfigurationProperties(prefix = "cartwise.openverse")
public record OpenverseProperties(
        String baseUrl,
        String clientId,
        String clientSecret,
        Duration timeout,
        Integer pageSize) {

    public OpenverseProperties {
        baseUrl = baseUrl == null || baseUrl.isBlank()
                ? "https://api.openverse.org"
                : baseUrl;
        timeout = timeout == null ? Duration.ofSeconds(20) : timeout;
        pageSize = pageSize == null || pageSize < 1 ? 20 : pageSize;
    }

    /** True when both halves of an OAuth2 credential are present. One without the other is useless. */
    public boolean hasCredentials() {
        return clientId != null && !clientId.isBlank()
                && clientSecret != null && !clientSecret.isBlank();
    }
}
