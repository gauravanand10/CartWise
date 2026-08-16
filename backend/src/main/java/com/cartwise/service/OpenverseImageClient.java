package com.cartwise.service;

import com.cartwise.config.OpenverseProperties;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * A thin read-only client for Openverse image search.
 *
 * <p>Knows two things: how to obtain a bearer token when credentials are configured, and how to run
 * one search. Everything about <em>which</em> searches to run and what to do with the results
 * belongs to {@link ProductImageService} — this class has no opinion about products.
 *
 * <p>Every failure mode here returns an empty list rather than throwing. That is not swallowing
 * errors: the caller is a bulk backfill over 50 products, and one category failing to return photos
 * must leave the other six to succeed rather than abandoning the run. The failure is logged with
 * the query that caused it, and the affected products simply keep their placeholder images — a
 * visible, recoverable outcome that the API then reports honestly to the frontend.
 */
@Service
public class OpenverseImageClient {

    private static final Logger log = LoggerFactory.getLogger(OpenverseImageClient.class);

    private final OpenverseProperties properties;
    private final RestClient restClient;

    /**
     * Cached bearer token.
     *
     * <p>Tokens last twelve hours and a backfill takes seconds, so this is only ever fetched once
     * per run in practice. Held rather than re-requested per search because the token endpoint has
     * its own rate limit, and spending one of those per image search would be the easiest way to
     * turn a seven-request job into a fourteen-request one for no benefit.
     */
    private String cachedToken;

    public OpenverseImageClient(OpenverseProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .build();
    }

    /**
     * One image result, with the fields needed to display it and to credit it.
     *
     * <p>{@code @JsonIgnoreProperties(ignoreUnknown = true)} is load-bearing rather than habitual:
     * the search response carries around twenty fields per result and this record names seven.
     * Without it, Openverse adding a field would break the backfill.
     *
     * @param id           Openverse's UUID for the work
     * @param title        the work's title, used only for logging
     * @param url          direct URL to the image bytes — this is what {@code products.image_url} gets
     * @param creator      attribution name
     * @param license      licence code, e.g. {@code by-sa}
     * @param licenseUrl   deed URL
     * @param attribution  the credit line Openverse composes; stored verbatim
     * @param foreignLandingUrl the provider's page for the original work
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OpenverseImage(
            String id,
            String title,
            String url,
            String creator,
            String license,
            @JsonProperty("license_url") String licenseUrl,
            String attribution,
            @JsonProperty("foreign_landing_url") String foreignLandingUrl) {

        /**
         * Whether this result carries everything needed to use it lawfully.
         *
         * <p>A result missing its URL cannot be displayed, and one missing its attribution cannot be
         * displayed <em>legally</em> — the CC licences Openverse indexes grant use on condition of
         * credit. Both are therefore disqualifying, and a result failing this check is skipped in
         * favour of the next one rather than stored with a gap.
         */
        boolean isUsable() {
            return url != null && !url.isBlank()
                    && attribution != null && !attribution.isBlank();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record SearchResponse(
            @JsonProperty("result_count") Integer resultCount,
            List<OpenverseImage> results) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record TokenResponse(@JsonProperty("access_token") String accessToken) {
    }

    /**
     * Runs one image search and returns the usable results, newest ranking first.
     *
     * <p>Two query parameters are not negotiable and are applied here rather than left to callers:
     *
     * <ul>
     *   <li>{@code license_type=commercial} — CartWise is a storefront. Filtering to licences that
     *       permit commercial use excludes the NonCommercial variants, which would be unlawful to
     *       display beside a price regardless of attribution.
     *   <li>{@code mature=false} — a catalogue page must not be able to surface flagged content
     *       because a search term happened to match.
     * </ul>
     *
     * @return usable results, or an empty list if the search failed or matched nothing
     */
    public List<OpenverseImage> search(String query) {
        try {
            SearchResponse response = restClient.get()
                    .uri(builder -> builder
                            .path("/v1/images/")
                            .queryParam("q", query)
                            .queryParam("page_size", properties.pageSize())
                            .queryParam("license_type", "commercial")
                            .queryParam("mature", "false")
                            .build())
                    .headers(headers -> {
                        String token = token();
                        if (token != null) {
                            headers.setBearerAuth(token);
                        }
                    })
                    .retrieve()
                    .body(SearchResponse.class);

            if (response == null || response.results() == null) {
                log.warn("Openverse returned no body for query '{}'", query);
                return List.of();
            }

            List<OpenverseImage> usable = response.results().stream()
                    .filter(OpenverseImage::isUsable)
                    .toList();

            log.debug("Openverse '{}': {} results, {} usable", query,
                    response.results().size(), usable.size());

            return usable;
        } catch (RestClientException e) {
            // Rate limiting arrives here as a 429. Deliberately not retried: the backfill is
            // resumable by design (it skips rows that already have image_fetched_at), so the
            // correct response to being throttled is to stop and be re-run later, not to sit in a
            // loop holding an admin request open.
            log.warn("Openverse search failed for query '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    /**
     * A bearer token, or null to call anonymously.
     *
     * <p>Returns null rather than throwing when no credentials are configured, because anonymous is
     * a fully supported mode here and not a degraded one — see {@link OpenverseProperties}. Also
     * returns null when a configured credential fails to exchange, so a bad secret degrades to the
     * anonymous allowance instead of failing the whole backfill.
     */
    private String token() {
        if (!properties.hasCredentials()) {
            return null;
        }
        if (cachedToken != null) {
            return cachedToken;
        }

        try {
            TokenResponse response = restClient.post()
                    .uri("/v1/auth_tokens/token/")
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .body("client_id=" + properties.clientId()
                            + "&client_secret=" + properties.clientSecret()
                            + "&grant_type=client_credentials")
                    .retrieve()
                    .body(TokenResponse.class);

            cachedToken = response == null ? null : response.accessToken();
            if (cachedToken != null) {
                log.info("Openverse: authenticated, using the client_credentials rate tier");
            }
            return cachedToken;
        } catch (RestClientException e) {
            log.warn("Openverse token exchange failed, falling back to anonymous: {}",
                    e.getMessage());
            return null;
        }
    }
}
