package com.cartwise.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cartwise.common.dto.AffiliateClickResponse;
import com.cartwise.common.dto.AffiliateRetailerDto;
import com.cartwise.common.dto.AffiliateStatus;
import com.cartwise.service.AffiliateLinkService;
import com.cartwise.testsupport.ControllerTestBase;
import com.cartwise.testsupport.WithCartwiseSecurity;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * The outbound click path over HTTP.
 *
 * <p>Two properties here are only checkable at this layer, and both are the sort that would fail
 * silently everywhere else.
 *
 * <p><strong>The redirect must be public.</strong> {@code SecurityConfig} denies by default, so a
 * missing {@code permitAll} would make every "Visit store" button answer 401 to the anonymous
 * visitors who are most of a comparison site's traffic — and a service test would never see it,
 * because the service has no idea a filter chain exists.
 *
 * <p><strong>The redirect must not be cacheable.</strong> A 301, or a 302 without
 * {@code no-store}, lets the browser reuse the destination and skip the endpoint entirely on the
 * second click. The link keeps working perfectly and the clicks simply stop being counted, which is
 * the failure this feature exists to prevent.
 */
@WebMvcTest(AffiliateController.class)
@WithCartwiseSecurity
class AffiliateControllerTest extends ControllerTestBase {

    @MockitoBean
    private AffiliateLinkService affiliateLinkService;

    private static final String AMAZON_URL =
            "https://www.amazon.in/s?k=iPhone+16+Pro&tag=cartwise-test-00";

    private void serviceReturnsAmazonUrl() {
        when(affiliateLinkService.click(eq("amazon"), eq("iphone-16-pro"), org.mockito.ArgumentMatchers.any()))
                .thenReturn(new AffiliateClickResponse(AMAZON_URL, "amazon", AffiliateStatus.PLACEHOLDER));
    }

    @Nested
    @DisplayName("GET /api/affiliate/click/{retailer}/{slug}")
    class Redirect {

        @Test
        @DisplayName("answers 302 to the constructed retailer URL for an anonymous visitor")
        void redirectsAnonymously() throws Exception {
            serviceReturnsAmazonUrl();

            mockMvc.perform(get("/api/affiliate/click/{retailer}/{slug}", "amazon", "iphone-16-pro"))
                    .andExpect(status().isFound())
                    .andExpect(header().string(HttpHeaders.LOCATION, AMAZON_URL));

            // Null user, explicitly. The whole point of the endpoint being public is that a click
            // with nobody signed in is a first-class case rather than a degraded one.
            verify(affiliateLinkService).click("amazon", "iphone-16-pro", null);
        }

        @Test
        @DisplayName("forbids caching, so the second click is counted too")
        void redirectIsNotCacheable() throws Exception {
            serviceReturnsAmazonUrl();

            mockMvc.perform(get("/api/affiliate/click/{retailer}/{slug}", "amazon", "iphone-16-pro"))
                    .andExpect(header().string(HttpHeaders.CACHE_CONTROL,
                            Matchers.containsString("no-store")));
        }

        /**
         * A top-level navigation carries no {@code Authorization} header, so this case is reachable
         * from curl and from the frontend's {@code fetch}, not from following a link. It is asserted
         * anyway because the endpoint must attribute whenever it <em>can</em>.
         */
        @Test
        @DisplayName("attributes the click when a token is present")
        void attributesWhenAuthenticated() throws Exception {
            serviceReturnsAmazonUrl();

            mockMvc.perform(get("/api/affiliate/click/{retailer}/{slug}", "amazon", "iphone-16-pro")
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(42L)))
                    .andExpect(status().isFound());

            verify(affiliateLinkService).click("amazon", "iphone-16-pro", 42L);
        }

        @Test
        @DisplayName("an unknown retailer is 404, not a redirect to somewhere plausible")
        void unknownRetailerIsNotFound() throws Exception {
            when(affiliateLinkService.click(eq("ebay"), eq("iphone-16-pro"), isNull()))
                    .thenThrow(new EntityNotFoundException("No retailer with id ebay"));

            mockMvc.perform(get("/api/affiliate/click/{retailer}/{slug}", "ebay", "iphone-16-pro"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                    .andExpect(header().doesNotExist(HttpHeaders.LOCATION));
        }

        @Test
        @DisplayName("an unknown product slug is 404")
        void unknownProductIsNotFound() throws Exception {
            when(affiliateLinkService.click(eq("amazon"), eq("nope"), isNull()))
                    .thenThrow(new EntityNotFoundException("No product with slug nope"));

            mockMvc.perform(get("/api/affiliate/click/{retailer}/{slug}", "amazon", "nope"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/affiliate/clicks")
    class RecordClick {

        @Test
        @DisplayName("returns the URL and attributes the click to the signed-in caller")
        void recordsAndReturnsUrl() throws Exception {
            serviceReturnsAmazonUrl();

            mockMvc.perform(post("/api/affiliate/clicks")
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(42L))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"retailer\":\"amazon\",\"productSlug\":\"iphone-16-pro\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.url").value(AMAZON_URL))
                    .andExpect(jsonPath("$.retailer").value("amazon"))
                    .andExpect(jsonPath("$.status").value("PLACEHOLDER"));

            verify(affiliateLinkService).click("amazon", "iphone-16-pro", 42L);
        }

        @Test
        @DisplayName("works without a token, recording an anonymous click")
        void worksAnonymously() throws Exception {
            serviceReturnsAmazonUrl();

            mockMvc.perform(post("/api/affiliate/clicks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"retailer\":\"amazon\",\"productSlug\":\"iphone-16-pro\"}"))
                    .andExpect(status().isOk());

            verify(affiliateLinkService).click("amazon", "iphone-16-pro", null);
        }

        @Test
        @DisplayName("a body missing productSlug is 400, and records nothing")
        void missingSlugIsBadRequest() throws Exception {
            mockMvc.perform(post("/api/affiliate/clicks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"retailer\":\"amazon\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("BAD_REQUEST"));

            verify(affiliateLinkService, never())
                    .click(org.mockito.ArgumentMatchers.anyString(),
                            org.mockito.ArgumentMatchers.anyString(),
                            org.mockito.ArgumentMatchers.any());
        }

        @Test
        @DisplayName("a body missing retailer is 400")
        void missingRetailerIsBadRequest() throws Exception {
            mockMvc.perform(post("/api/affiliate/clicks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"iphone-16-pro\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/affiliate/retailers")
    class Retailers {

        /**
         * The response is what the disclosure page renders from, so it is public — and the assertion
         * that matters is the negative one. A credential serialised here would be visible in any
         * browser's network tab, which is the same as publishing it.
         */
        @Test
        @DisplayName("is public and carries no affiliate credential")
        void listsRetailersWithoutCredentials() throws Exception {
            when(affiliateLinkService.retailers()).thenReturn(List.of(
                    new AffiliateRetailerDto("amazon", "Amazon", AffiliateStatus.PLACEHOLDER),
                    new AffiliateRetailerDto("croma", "Croma", AffiliateStatus.NONE)));

            mockMvc.perform(get("/api/affiliate/retailers"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("amazon"))
                    .andExpect(jsonPath("$[0].status").value("PLACEHOLDER"))
                    .andExpect(jsonPath("$[1].status").value("NONE"))
                    .andExpect(jsonPath("$[0].tag").doesNotExist())
                    .andExpect(content().string(Matchers.not(Matchers.containsString("cartwise-test-00"))));
        }
    }
}
