package com.cartwise.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Cross-origin settings bound from the {@code cartwise.cors} prefix.
 *
 * <p>The allowed origins are configuration, not code. A {@code @CrossOrigin} annotation with a
 * hard-coded {@code http://localhost:5173} would compile fine and then be wrong in every
 * environment that is not a developer laptop. Binding the list per profile means the dev
 * profile names the Vite dev server and the prod profile names the deployed frontend, without
 * either one being baked into a class.
 *
 * @param allowedOrigins exact origins permitted to call {@code /api/**}; may be empty, in which
 *                       case {@link WebConfig} registers no CORS mapping at all
 */
@ConfigurationProperties(prefix = "cartwise.cors")
public record CorsProperties(List<String> allowedOrigins) {

    public CorsProperties {
        allowedOrigins = allowedOrigins == null ? List.of() : List.copyOf(allowedOrigins);
    }
}
