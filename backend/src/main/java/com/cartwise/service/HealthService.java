package com.cartwise.service;

import com.cartwise.common.dto.HealthResponse;
import java.time.Clock;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Business logic for the health check.
 *
 * <p>There is barely any logic here, and that is the point of the class in this chapter: it
 * establishes that controllers do not build responses themselves. The controller owns HTTP
 * concerns (routing, status codes, serialisation); the service owns what the answer actually
 * is. Every feature service added in Chapters 16+ plugs into this same seam.
 */
@Service
public class HealthService {

    private static final String STATUS_UP = "UP";

    private final String applicationName;
    private final Clock clock;

    public HealthService(@Value("${spring.application.name}") String applicationName, Clock clock) {
        this.applicationName = applicationName;
        this.clock = clock;
    }

    /**
     * Reports that the application context is up and serving requests.
     *
     * <p>This checks nothing beyond "Spring started and this bean was reachable". It is
     * deliberately not a dependency health check — there are no dependencies yet. Once a
     * datasource exists (Chapter 16), a real readiness probe belongs here or in Actuator.
     */
    public HealthResponse checkHealth() {
        return new HealthResponse(STATUS_UP, applicationName, Instant.now(clock));
    }
}
