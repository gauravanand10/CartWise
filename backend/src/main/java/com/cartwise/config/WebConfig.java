package com.cartwise.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web-layer configuration. Currently that means CORS, and only CORS.
 *
 * <p>CartWise runs the React app and the API on different origins in development — Vite serves
 * the UI on its own port while Spring Boot serves the API on another — so the browser applies
 * the same-origin policy to every call the frontend makes. Without an explicit allowance the
 * preflight fails and the frontend cannot reach the backend at all, which would make this
 * chapter's "the skeleton actually works" claim unverifiable.
 */
@Configuration
@EnableConfigurationProperties(CorsProperties.class)
public class WebConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

    private final CorsProperties corsProperties;

    public WebConfig(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (corsProperties.allowedOrigins().isEmpty()) {
            log.info("No cartwise.cors.allowed-origins configured; CORS mapping not registered.");
            return;
        }

        log.info("Registering CORS mapping for /api/** with allowed origins {}",
                corsProperties.allowedOrigins());

        registry.addMapping("/api/**")
                .allowedOrigins(corsProperties.allowedOrigins().toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                // Left off deliberately: nothing is authenticated yet, so there are no cookies
                // or Authorization headers to carry. Revisit in Chapter 18 alongside the
                // authentication scheme, since credentialed CORS forbids wildcard origins.
                .allowCredentials(false);
    }
}
