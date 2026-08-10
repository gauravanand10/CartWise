package com.cartwise.common.dto;

import java.time.Instant;

/**
 * Payload returned by {@code GET /api/health}.
 *
 * <p>Lives in {@code common.dto} rather than next to the controller because DTOs are the
 * shared vocabulary between layers: the service builds one, the controller returns it, and
 * neither owns it. Domain-specific DTOs (products, wishlists) arrive with their features in
 * later chapters.
 *
 * @param status    coarse liveness marker; {@code "UP"} while the application context is serving
 * @param service   the Spring application name, so a response is attributable when several
 *                  services are running locally
 * @param timestamp server-side instant the response was produced, serialised as ISO-8601
 */
public record HealthResponse(String status, String service, Instant timestamp) {
}
