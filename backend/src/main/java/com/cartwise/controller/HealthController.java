package com.cartwise.controller;

import com.cartwise.common.dto.HealthResponse;
import com.cartwise.service.HealthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The only real endpoint in Chapter 15.
 *
 * <p>It exists to prove three things at once: the server boots, controller → service wiring
 * works, and the browser can reach {@code /api/**} across origins. It is not the beginning of
 * the product API — resource controllers (products, wishlist, compare) are Chapter 17.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    /**
     * {@code GET /api/health} — always 200 with a small JSON body while the context is up.
     */
    @GetMapping("/health")
    public HealthResponse health() {
        return healthService.checkHealth();
    }
}
