package com.cartwise.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.cartwise.common.dto.AffiliateClickResponse;
import com.cartwise.common.dto.AffiliateStatus;
import com.cartwise.config.AffiliateProperties;
import com.cartwise.entity.AffiliateClick;
import com.cartwise.entity.Product;
import com.cartwise.entity.Role;
import com.cartwise.entity.User;
import com.cartwise.repository.AffiliateClickRepository;
import com.cartwise.repository.ProductRepository;
import com.cartwise.repository.UserRepository;
import com.cartwise.testsupport.ProductFixtures;
import jakarta.persistence.EntityNotFoundException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Outbound URL construction and click recording.
 *
 * <p>The assertions worth reading here are the ones about what does <em>not</em> appear in a URL. A
 * link that silently loses its affiliate parameter still works perfectly — the shopper reaches the
 * right page and nothing looks broken — and CartWise simply earns nothing, forever, with no error
 * anywhere. That is a failure mode no integration test would surface, which is why the exact query
 * string is asserted rather than merely "the URL contains the retailer's domain".
 */
@ExtendWith(MockitoExtension.class)
class AffiliateLinkServiceTest {

    @Mock
    private AffiliateClickRepository clickRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    private AffiliateLinkService service;

    /**
     * A configuration shaped like the real one: one retailer with a tag, one with a query suffix and
     * no tag. The placeholder value is the same obviously-fake string the application ships with —
     * no real affiliate credential exists anywhere in this project, including in its tests.
     */
    @BeforeEach
    void buildService() {
        Map<String, AffiliateProperties.Retailer> retailers = new LinkedHashMap<>();

        retailers.put("amazon", new AffiliateProperties.Retailer(
                "Amazon", "https://www.amazon.in/s", "k", "", "", "tag", "cartwise-test-00"));

        // Croma stands in for the awkward shape: a facet suffix on the primary parameter, a second
        // parameter carrying the plain term, and no affiliate credential at all.
        retailers.put("croma", new AffiliateProperties.Retailer(
                "Croma", "https://www.croma.com/searchB", "q", ":relevance", "text", "", ""));

        service = new AffiliateLinkService(
                new AffiliateProperties(retailers, "cartwise-test-00"),
                clickRepository,
                productRepository,
                userRepository);
    }

    private Product product(String slug, String name) {
        Product product = ProductFixtures.product().slug(slug).name(name).build();
        when(productRepository.findBySlug(slug)).thenReturn(Optional.of(product));
        return product;
    }

    @Nested
    @DisplayName("URL construction")
    class UrlConstruction {

        @Test
        @DisplayName("appends the configured affiliate parameter")
        void appliesTheTag() {
            product("iphone-16-pro", "iPhone 16 Pro");

            AffiliateClickResponse response = service.click("amazon", "iphone-16-pro", null);

            assertThat(response.url())
                    .isEqualTo("https://www.amazon.in/s?k=iPhone+16+Pro&tag=cartwise-test-00");

            // PLACEHOLDER, not PAID. The parameter is genuinely on the URL, and it identifies no
            // approved account, so nobody is paying anybody — see AffiliateStatus for why saying
            // "yes, paid" here was a false disclosure rather than a rounding error.
            assertThat(response.status()).isEqualTo(AffiliateStatus.PLACEHOLDER);
        }

        /**
         * The three Indian electronics chains have no documented first-party affiliate parameter, so
         * theirs is configured empty. The link must still be built and still work — and must not
         * acquire an invented parameter, which would make the UI describe a plain link as a paid one.
         *
         * <p>
         * Also covers the second query parameter. Both matter for the same reason: Croma answers
         * HTTP 200 either way, and the version without {@code text} renders a page titled "Search
         * null" containing no results — a link that looks like it works and sends the shopper
         * nowhere useful.
         */
        @Test
        @DisplayName("omits the tag parameter entirely when no tag is configured, and carries the secondary term")
        void noTagMeansNoParameter() {
            product("lg-oled-c5", "LG OLED C5");

            AffiliateClickResponse response = service.click("croma", "lg-oled-c5", null);

            assertThat(response.url()).isEqualTo(
                    "https://www.croma.com/searchB?q=LG+OLED+C5%3Arelevance&text=LG+OLED+C5");

            // The suffix belongs to the facet parameter only; repeating it in `text` would search
            // for a product literally named "LG OLED C5:relevance".
            assertThat(response.url()).doesNotContain("text=LG+OLED+C5%3Arelevance");
            assertThat(response.url()).doesNotContain("&=");
            assertThat(response.status()).isEqualTo(AffiliateStatus.NONE);
        }

        /**
         * The state that must become reachable the moment a human is approved, with no code change:
         * the same configuration shape, a real value in the tag, and the status flipping to PAID.
         * This is the test that proves the "zero code changes to go live" claim rather than asserting
         * it in a comment.
         */
        @Test
        @DisplayName("reports PAID once a tag that is not the placeholder is configured")
        void aRealTagIsPaid() {
            Map<String, AffiliateProperties.Retailer> retailers = Map.of(
                    "amazon", new AffiliateProperties.Retailer(
                            "Amazon", "https://www.amazon.in/s", "k", "", "", "tag", "example-21"));

            AffiliateLinkService live = new AffiliateLinkService(
                    new AffiliateProperties(retailers, "cartwise-test-00"),
                    clickRepository,
                    productRepository,
                    userRepository);

            product("iphone-16-pro", "iPhone 16 Pro");

            AffiliateClickResponse response = live.click("amazon", "iphone-16-pro", null);

            assertThat(response.url())
                    .isEqualTo("https://www.amazon.in/s?k=iPhone+16+Pro&tag=example-21");
            assertThat(response.status()).isEqualTo(AffiliateStatus.PAID);
        }

        /** A retailer with no secondary parameter must not gain an empty one. */
        @Test
        @DisplayName("adds no second parameter when none is configured")
        void noSecondaryParameterWhenUnconfigured() {
            product("iphone-16-pro", "iPhone 16 Pro");

            assertThat(service.click("amazon", "iphone-16-pro", null).url())
                    .isEqualTo("https://www.amazon.in/s?k=iPhone+16+Pro&tag=cartwise-test-00");
        }

        /**
         * The bug this prevents is invisible rather than loud: an unencoded ampersand terminates the
         * search term, so "Sony WH-1000XM6 & Case" would search Amazon for "Sony WH-1000XM6 " and the
         * shopper would land on results for something else, with the affiliate parameter now parsed
         * as part of a different key. Nothing errors.
         */
        @Test
        @DisplayName("percent-encodes a product name that would otherwise break the query string")
        void encodesTheSearchTerm() {
            product("odd-name", "Sony WH-1000XM6 & Case #2 =50%");

            String url = service.click("amazon", "odd-name", null).url();

            assertThat(url).isEqualTo(
                    "https://www.amazon.in/s?k=Sony+WH-1000XM6+%26+Case+%232+%3D50%25"
                            + "&tag=cartwise-test-00");
        }
    }

    @Nested
    @DisplayName("click recording")
    class ClickRecording {

        @Test
        @DisplayName("records an anonymous click without touching the user repository")
        void anonymousClickStoresNoUser() {
            Product phone = product("iphone-16-pro", "iPhone 16 Pro");

            service.click("amazon", "iphone-16-pro", null);

            ArgumentCaptor<AffiliateClick> saved = ArgumentCaptor.forClass(AffiliateClick.class);
            verify(clickRepository).save(saved.capture());

            assertThat(saved.getValue().getProduct()).isSameAs(phone);
            assertThat(saved.getValue().getUser()).isNull();
            assertThat(saved.getValue().getRetailer()).isEqualTo("amazon");

            // Not merely "the user is null" — nothing was looked up at all. A click by a signed-out
            // visitor must not become a database read, and must not be attributable after the fact.
            verifyNoInteractions(userRepository);
        }

        @Test
        @DisplayName("attributes a click to the signed-in user")
        void authenticatedClickStoresTheUser() {
            product("iphone-16-pro", "iPhone 16 Pro");

            User ada = new User("ada@example.com", "$2a$10$x", Role.USER);
            when(userRepository.getReferenceById(7L)).thenReturn(ada);

            service.click("amazon", "iphone-16-pro", 7L);

            ArgumentCaptor<AffiliateClick> saved = ArgumentCaptor.forClass(AffiliateClick.class);
            verify(clickRepository).save(saved.capture());

            assertThat(saved.getValue().getUser()).isSameAs(ada);
        }

        @Test
        @DisplayName("an unknown retailer is not found, and records nothing")
        void unknownRetailerIsRejected() {
            assertThatThrownBy(() -> service.click("ebay", "iphone-16-pro", null))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("ebay");

            // Checked before the product is even loaded: a click that cannot produce a destination
            // must not leave a row claiming somebody went somewhere.
            verifyNoInteractions(productRepository);
            verify(clickRepository, never()).save(any());
        }

        @Test
        @DisplayName("an unknown product is not found, and records nothing")
        void unknownProductIsRejected() {
            when(productRepository.findBySlug("no-such-thing")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.click("amazon", "no-such-thing", null))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("no-such-thing");

            verify(clickRepository, never()).save(any());
            verify(userRepository, never()).getReferenceById(anyLong());
        }
    }

    @Nested
    @DisplayName("the public retailer listing")
    class RetailerListing {

        /**
         * The listing is what the disclosure page reads. It must say <em>whether</em> a link is paid
         * and must never carry the credential — a tag in a JSON response is a tag in the browser's
         * network tab, which is a tag published.
         */
        @Test
        @DisplayName("reports what each retailer's links are worth, and never the tag itself")
        void listsRetailersWithoutTheCredential() {
            assertThat(service.retailers())
                    .extracting("id", "name", "status")
                    .containsExactly(
                            org.assertj.core.groups.Tuple.tuple(
                                    "amazon", "Amazon", AffiliateStatus.PLACEHOLDER),
                            org.assertj.core.groups.Tuple.tuple(
                                    "croma", "Croma", AffiliateStatus.NONE));

            assertThat(service.retailers().toString()).doesNotContain("cartwise-test-00");
        }

        /** Configuration order, not hash order — the UI renders this list as given. */
        @Test
        @DisplayName("preserves the configured order")
        void keepsConfiguredOrder() {
            assertThat(service.retailers()).extracting("id").containsExactly("amazon", "croma");
        }
    }
}
