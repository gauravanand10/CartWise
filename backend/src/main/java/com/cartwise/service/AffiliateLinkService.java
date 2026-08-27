package com.cartwise.service;

import com.cartwise.common.dto.AffiliateClickResponse;
import com.cartwise.common.dto.AffiliateRetailerDto;
import com.cartwise.common.dto.AffiliateStatus;
import com.cartwise.config.AffiliateProperties;
import com.cartwise.entity.AffiliateClick;
import com.cartwise.entity.Product;
import com.cartwise.entity.User;
import com.cartwise.repository.AffiliateClickRepository;
import com.cartwise.repository.ProductRepository;
import com.cartwise.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Builds the outbound retailer URL and records that somebody took it. Chapter 26.
 *
 * <p>These two are one method rather than two because they must not be able to happen separately:
 * a URL handed out without a click row is revenue CartWise cannot see, and a click row written for
 * a URL that failed to build is a count of something that never happened. {@link #click} does both
 * inside one transaction or neither.
 *
 * <h2>The affiliate tag never leaves this class</h2>
 *
 * <p>Link construction is server-side for one specific reason, and it is not convenience: the tag is
 * a credential, and a frontend that assembled the URL would need it in the JavaScript bundle, where
 * "shipped to the browser" means "published". Every client-facing type in this feature carries a
 * <em>boolean</em> saying whether a link is tagged, never the tag. The one place the value appears
 * is {@link #buildUrl}, and the one place it is configured is the environment.
 *
 * <h2>Search links, not product links</h2>
 *
 * <p>Every URL built here points at the retailer's search results for the product's name. That is a
 * limitation with a cause: an affiliate deep link to a specific listing needs the retailer's own
 * identifier for it — an ASIN on Amazon, a PID on Flipkart — and CartWise has no mapping from its
 * catalogue to any retailer's SKUs. Guessing one would produce a "Visit Amazon" button that lands
 * on a different phone, which is worse than a search that lands on the right one. The chapter that
 * builds a real SKU mapping can change this without touching anything below, because the URL shape
 * is configuration.
 */
@Service
public class AffiliateLinkService {

    private static final Logger log = LoggerFactory.getLogger(AffiliateLinkService.class);

    private final AffiliateProperties properties;
    private final AffiliateClickRepository clickRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public AffiliateLinkService(
            AffiliateProperties properties,
            AffiliateClickRepository clickRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.properties = properties;
        this.clickRepository = clickRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /**
     * The retailers this deployment can link to, and whether each link is actually paid.
     *
     * <p>Public information by design: it is what the disclosure page reads so that the page states
     * the deployment's real position rather than a list someone typed into the copy and forgot to
     * update. Carries no credential — see {@link AffiliateRetailerDto}.
     */
    public List<AffiliateRetailerDto> retailers() {
        return properties.retailers().entrySet().stream()
                .map(entry -> new AffiliateRetailerDto(
                        entry.getKey(),
                        entry.getValue().displayName(),
                        properties.statusOf(entry.getValue())))
                .toList();
    }

    /**
     * Records an outbound click and returns where it should go.
     *
     * <p>Written before the caller redirects, never after. A row written afterwards would be a row
     * that is missing precisely when it matters most — the user has already gone, so there is no
     * second chance and no way to notice the loss.
     *
     * @param retailerId the configured retailer id
     * @param slug       the product's URL identity
     * @param userId     the signed-in user's id, or {@code null} for an anonymous click
     * @throws EntityNotFoundException if the retailer or the product is unknown. 404 rather than
     *                                 400: both are "the thing you named does not exist", and the
     *                                 same handler already answers that for {@code /api/products}
     */
    @Transactional
    public AffiliateClickResponse click(String retailerId, String slug, Long userId) {
        AffiliateProperties.Retailer retailer = properties.retailer(retailerId);

        if (retailer == null) {
            // Names the id the caller supplied and nothing else. It is their own input echoed back,
            // so it discloses nothing, and without it a typo is indistinguishable from a retailer
            // this deployment has switched off.
            throw new EntityNotFoundException("No retailer with id " + retailerId);
        }

        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("No product with slug " + slug));

        // getReferenceById rather than findById: this only ever becomes a foreign key value, so
        // loading the whole user row to write its id would be a wasted SELECT on every click. The
        // id came from a token the filter chain already validated, so the row is known to exist —
        // and if it somehow does not, the insert fails on the foreign key, which is the correct
        // outcome rather than a click silently attributed to nobody.
        User user = userId == null ? null : userRepository.getReferenceById(userId);

        clickRepository.save(new AffiliateClick(product, user, retailerId));

        String url = buildUrl(retailer, product);

        AffiliateStatus status = properties.statusOf(retailer);

        // The retailer and the status are logged, the user is not. A click log that carries user ids
        // becomes a per-person browsing history in whatever aggregates the logs, which is exactly
        // the thing the clicks table is careful not to be.
        log.debug("Affiliate click recorded: retailer={} slug={} status={}",
                retailerId, slug, status);

        return new AffiliateClickResponse(url, retailerId, status);
    }

    /**
     * Assembles one retailer's outbound URL.
     *
     * <p>Built by hand rather than with {@code UriComponentsBuilder}, which sounds like the wrong
     * call and is deliberate: that builder's {@code queryParam} does not percent-encode everything
     * a query value can contain, and its various encode/build orderings are a known source of
     * double- and under-encoding. {@link URLEncoder} with an explicit UTF-8 charset has exactly one
     * behaviour, and a product name containing an ampersand — "Sony WH-1000XM6 & case" — is the
     * failure this avoids: under-encoded, it would truncate the search term and silently send the
     * shopper to results for the wrong thing.
     *
     * <p>{@code URLEncoder} encodes a space as {@code +}, which is correct for a query string
     * (it is {@code application/x-www-form-urlencoded}, which is what a query string is) and is what
     * every retailer here accepts.
     */
    String buildUrl(AffiliateProperties.Retailer retailer, Product product) {
        String term = product.getName() + retailer.querySuffix();

        StringBuilder url = new StringBuilder(retailer.searchUrl())
                .append(retailer.searchUrl().contains("?") ? '&' : '?')
                .append(encode(retailer.queryParam()))
                .append('=')
                .append(encode(term));

        // The same term again, without the suffix, under a second name. Croma needs it — see
        // AffiliateProperties.Retailer#secondaryQueryParam — and everyone else configures it blank.
        if (!retailer.secondaryQueryParam().isBlank()) {
            url.append('&')
                    .append(encode(retailer.secondaryQueryParam()))
                    .append('=')
                    .append(encode(product.getName()));
        }

        // Only when both halves are present. A tag with no parameter name would otherwise produce
        // "&=cartwise-test-00", a malformed parameter the retailer ignores and which would make the
        // link look tagged to anyone reading it.
        if (retailer.hasAffiliateTag()) {
            url.append('&')
                    .append(encode(retailer.tagParam()))
                    .append('=')
                    .append(encode(retailer.tag()));
        }

        return url.toString();
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
