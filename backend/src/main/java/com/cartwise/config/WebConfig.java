package com.cartwise.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.cartwise.security.RateLimitInterceptor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
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
// OpenverseProperties is registered here rather than in a config class of its own: it is bound the
// same way, from the same file, and one @EnableConfigurationProperties listing both is easier to
// read than a second @Configuration that exists only to hold one annotation.
@EnableConfigurationProperties({
        CorsProperties.class,
        OpenverseProperties.class,
        RateLimitProperties.class})
// Chapter 25. Enables the hourly bucket eviction on RateLimitInterceptor. Without this the
// @Scheduled method is inert and the bucket maps grow without bound — the annotation compiles and
// does nothing, which is the quiet way this goes wrong.
@EnableScheduling
public class WebConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

    private final CorsProperties corsProperties;
    private final RateLimitInterceptor rateLimitInterceptor;

    public WebConfig(CorsProperties corsProperties, RateLimitInterceptor rateLimitInterceptor) {
        this.corsProperties = corsProperties;
        this.rateLimitInterceptor = rateLimitInterceptor;
    }

    /**
     * Registers the rate limiter across the whole API. Chapter 25.
     *
     * <p>Mapped to {@code /api/**} rather than to the three specific patterns it cares about. The
     * interceptor already decides which bucket — if any — a request belongs to, and keeping that
     * decision in one method means the path rules are readable in one place instead of split
     * between a registration list here and a set of conditions there. A request that matches no
     * bucket returns immediately.
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/api/**");
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
