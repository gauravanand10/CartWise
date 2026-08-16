package com.cartwise.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cartwise.common.dto.AuthResponse;
import com.cartwise.service.AuthService;
import com.cartwise.testsupport.ControllerTestBase;
import com.cartwise.testsupport.WithCartwiseSecurity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * The Chapter 25 rate limiter, tested where it is switched on.
 *
 * <p><strong>Why this class exists separately from {@link AuthControllerTest}.</strong> The suite
 * runs with rate limiting disabled — {@code cartwise.rate-limit.*-capacity: 0} in
 * application-test.yml — because MockMvc reports the same client address for every request, so one
 * shared bucket per test class made unrelated authentication assertions fail with 429 once a class
 * exceeded the limit. Rather than teach every test in the project to stay under a threshold it does
 * not care about, exactly one class opts back in.
 *
 * <p>{@code @TestPropertySource} re-enables it here with a capacity of two, which keeps the test
 * short and its intent obvious: two requests succeed, the third does not.
 *
 * <p>Signup is the endpoint under test purely because it is limited and cheap to mock. What is
 * being asserted is the interceptor, not authentication.
 */
@WebMvcTest(AuthController.class)
@WithCartwiseSecurity
@TestPropertySource(properties = {
        "cartwise.rate-limit.auth-capacity=2",
        // A long window so refill cannot rescue the third request mid-test. At capacity 2 over an
        // hour a token accrues every thirty minutes — far longer than the test takes, which is what
        // makes the assertion deterministic rather than a race against the clock.
        "cartwise.rate-limit.auth-refill-seconds=3600"
})
class RateLimitInterceptorTest extends ControllerTestBase {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    private static final String BODY = """
            {"email":"limit@example.com","password":"a-good-long-password"}
            """;

    @Test
    @DisplayName("allows requests up to the configured capacity, then answers 429")
    void limitsAfterCapacity() throws Exception {
        when(authService.signup(anyString(), anyString()))
                .thenReturn(new AuthResponse(1L, "limit@example.com", "token"));

        // Capacity is two, so these two must pass. Asserting them rather than only the failure
        // matters: a limiter that rejected everything would satisfy the 429 assertion below while
        // being catastrophically wrong.
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(BODY))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY))
                .andExpect(status().isTooManyRequests())

                // The body is the project's standard ApiError, not a bare status. This is the
                // assertion that keeps the limiter consistent with every other failure in the API —
                // a client parsing `code` must not need a special case for throttling.
                .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.timestamp").exists())

                // Retry-After is the half a machine reads. Without it every client has to invent
                // its own backoff.
                .andExpect(header().exists("Retry-After"));
    }

    @Test
    @DisplayName("does not limit endpoints outside the configured patterns")
    void unlimitedEndpointsAreUntouched() throws Exception {
        // /api/health is not one of the three limited groups, so hammering it well past the auth
        // capacity of two must change nothing. This is the guard against the interceptor's path
        // matching quietly widening — a limiter applied to the health endpoint would take the
        // application out of its own load balancer under load.
        for (int i = 0; i < 6; i++) {
            mockMvc.perform(post("/api/health"))
                    .andExpect(status().is(org.hamcrest.Matchers.not(429)));
        }
    }
}
