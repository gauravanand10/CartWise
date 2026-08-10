package com.cartwise.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Application-wide beans that are not tied to one layer.
 *
 * <p>The {@code config} package holds objects that exist to wire the application together
 * rather than to do its work, which is why the {@link Clock} lives here and not in a service.
 */
@Configuration
public class ApplicationConfig {

    /**
     * The clock every component should read "now" from.
     *
     * <p>Injecting a clock instead of calling {@code Instant.now()} inline keeps time an input
     * rather than an ambient effect, so time-sensitive behaviour stays testable as the codebase
     * grows.
     */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
