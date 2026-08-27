package com.cartwise.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cartwise.common.dto.AffiliateClickResponse;
import com.cartwise.common.dto.AffiliateRetailerDto;
import com.cartwise.common.dto.AffiliateStatus;
import com.cartwise.service.AffiliateLinkService;
import com.cartwise.testsupport.ControllerTestBase;
import com.cartwise.testsupport.WithCartwiseSecurity;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * The Chapter 26 click bucket, tested the way {@link RateLimitInterceptorTest} tests the auth one:
 * in its own class, with the limit opted back in via {@code @TestPropertySource}, because the suite
 * as a whole runs with every bucket disabled.
 *
 * <p><strong>Why the click endpoint needs its own limit at all.</strong> It is public, it needs no
 * account, and its output is a number a commercial arrangement is settled on. Fabricated clicks
 * would not take money from a retailer — no commission is paid without a real purchase — but they
 * would corrupt CartWise's own picture of which products and which retailers people actually use,
 * which is the only thing this table is for.
 *
 * <p>The second test is the one that would catch the likelier mistake. The path rule is a
 * {@code startsWith("/api/affiliate/click")}, and a rule written slightly wider would swallow
 * {@code /api/affiliate/retailers} — a read of five configuration entries that the disclosure page
 * loads on every visit, and which being throttled would break the legally-required disclosure rather
 * than anything commercial.
 */
@WebMvcTest(AffiliateController.class)
@WithCartwiseSecurity
@TestPropertySource(properties = {
        "cartwise.rate-limit.click-capacity=2",
        // A long window, so refill cannot rescue the third request mid-test.
        "cartwise.rate-limit.click-refill-seconds=3600"
})
class AffiliateRateLimitTest extends ControllerTestBase {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AffiliateLinkService affiliateLinkService;

    @Test
    @DisplayName("allows clicks up to capacity, then answers 429 with Retry-After")
    void limitsClicksAfterCapacity() throws Exception {
        when(affiliateLinkService.click(anyString(), anyString(), any()))
                .thenReturn(new AffiliateClickResponse(
                        "https://www.amazon.in/s?k=iPhone+16+Pro&tag=cartwise-test-00",
                        "amazon",
                        AffiliateStatus.PLACEHOLDER));

        // Asserted rather than only the failure: a limiter that rejected everything would satisfy
        // the 429 below while taking every outbound link on the site offline.
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(get("/api/affiliate/click/{r}/{s}", "amazon", "iphone-16-pro"))
                    .andExpect(status().isFound());
        }

        mockMvc.perform(get("/api/affiliate/click/{r}/{s}", "amazon", "iphone-16-pro"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"))
                .andExpect(header().exists("Retry-After"));
    }

    @Test
    @DisplayName("does not limit the public retailer listing the disclosure page reads")
    void retailerListingIsNotLimited() throws Exception {
        when(affiliateLinkService.retailers())
                .thenReturn(List.of(new AffiliateRetailerDto("amazon", "Amazon", AffiliateStatus.PLACEHOLDER)));

        for (int i = 0; i < 6; i++) {
            mockMvc.perform(get("/api/affiliate/retailers"))
                    .andExpect(status().isOk());
        }
    }
}
