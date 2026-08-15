package com.cartwise.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cartwise.common.dto.HealthResponse;
import com.cartwise.service.HealthService;
import com.cartwise.testsupport.ControllerTestBase;
import com.cartwise.testsupport.WithCartwiseSecurity;
import java.time.Instant;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * Liveness.
 *
 * <p>Small, and the one assertion that carries weight is that it is reachable without a credential.
 * A health check behind authentication cannot be used by the thing that needs it most — an uptime
 * monitor — and the failure is the confusing kind: the service is up, and the monitor reports it
 * down.
 */
@WebMvcTest(HealthController.class)
@WithCartwiseSecurity
class HealthControllerTest extends ControllerTestBase {

    @MockitoBean
    private HealthService healthService;

    @Test
    @DisplayName("GET /api/health needs no token")
    void isPublic() throws Exception {
        when(healthService.checkHealth()).thenReturn(
                new HealthResponse("UP", "cartwise-backend", Instant.parse("2026-08-15T12:00:00Z")));

        mockMvc.perform(get("/api/health")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("reports status, service name and a timestamp as JSON")
    void reportsStatus() throws Exception {
        when(healthService.checkHealth()).thenReturn(
                new HealthResponse("UP", "cartwise-backend", Instant.parse("2026-08-15T12:00:00Z")));

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("cartwise-backend"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    /**
     * The permit rule names {@code /api/health} exactly, with no wildcard, so nothing else under that
     * prefix inherits public access. Asserted because a future {@code /api/health/details} exposing
     * internals is precisely the route that must not be public by accident.
     */
    @Test
    @DisplayName("the permit is for that exact path, not a prefix")
    void deeperHealthPathsAreNotPublic() throws Exception {
        mockMvc.perform(get("/api/health/details"))
                .andExpect(status().isUnauthorized());
    }
}
