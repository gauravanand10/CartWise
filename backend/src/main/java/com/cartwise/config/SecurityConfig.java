package com.cartwise.config;

import com.cartwise.security.ApiErrorSecurityHandler;
import com.cartwise.security.JwtAuthenticationFilter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Which requests need a token, which do not, and what happens when one is missing.
 *
 * <p>The whole access policy of CartWise is the one method below. Keeping it in a single place is
 * the point: a rule spread across annotations on individual controllers is a rule nobody can read in
 * full, and the endpoint someone forgets to annotate is the one that ends up public by accident.
 * Here the last line makes the default "deny", so a new controller is protected before anyone
 * remembers to think about it.
 *
 * <p>Written entirely in the lambda DSL. Spring Security 7 — which Boot 4.1.0 pins — removed the
 * older chained style, so {@code .csrf().disable()} does not compile against this version.
 */
@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ApiErrorSecurityHandler securityErrorHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            ApiErrorSecurityHandler securityErrorHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.securityErrorHandler = securityErrorHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Defining this chain replaces Spring Boot's default one, which is what removes the
                // login form, the generated password logged at startup, and HTTP Basic. None of the
                // three is disabled explicitly below because none of them is switched on here.

                // CORS must be enabled inside the security chain, not only in WebConfig. A browser's
                // preflight OPTIONS carries no Authorization header, so with authorization rules in
                // front of it, the preflight would be answered 401 and the real request would never
                // be sent. Enabling it here puts Spring Security's CORS handling ahead of the
                // authorization checks, where it answers the preflight and stops. With no
                // CorsConfigurationSource bean defined, it reads the mappings WebConfig already
                // registers, so the allowed origins stay configured in exactly one place.
                .cors(Customizer.withDefaults())

                // CSRF protection defends against a browser attaching *ambient* credentials — a
                // cookie it sends automatically — to a request forged by another site. This API has
                // none: the token travels in an Authorization header that only the frontend's own
                // JavaScript sets, and no other origin's script can set it. There is nothing for a
                // forged request to ride on, so the protection would add a token exchange that
                // guards nothing. It becomes necessary the moment authentication moves to a cookie.
                .csrf(csrf -> csrf.disable())

                // Never create an HttpSession. The token carries everything a request needs to be
                // understood, so server-side session state would be a second, redundant source of
                // truth — one that also has to be replicated for the application to run as more
                // than one instance.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // How a caller obtains a token. Necessarily reachable without one.
                        .requestMatchers("/api/auth/**").permitAll()

                        // Liveness. A health check that requires a credential is one that cannot be
                        // used by the thing that needs it most — an uptime monitor.
                        .requestMatchers("/api/health").permitAll()

                        // The catalogue stays public, exactly as in Chapter 17. Shoppers browse
                        // before they have accounts, and every product page is meant to be linkable
                        // and indexable. Read methods only, and enumerated rather than a broad
                        // /api/products/** — a future POST or DELETE under this path must not
                        // inherit public access from a wildcard written today.
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/*")
                        .permitAll()

                        // Chapter 20's category list, public for the same reason and needing its
                        // own line for a specific one: the rule above names /api/products
                        // explicitly rather than using a wildcard, so nothing about a new top-level
                        // route is inherited. Without this line /api/categories falls through to
                        // anyRequest().authenticated() and the home page's category tiles get 401.
                        .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()

                        // CORS preflight. Belt and braces alongside .cors() above: the browser sends
                        // it without credentials, and it reveals nothing.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Administration, added in Chapter 19. A wildcard here where the catalogue
                        // above got enumerated paths, and the asymmetry is deliberate: a wildcard
                        // that grants public access is dangerous because a route added later
                        // inherits it silently, while a wildcard that *requires* a role fails in the
                        // safe direction — a new admin route is protected the moment it is mapped,
                        // before anyone remembers it needs to be.
                        //
                        // hasRole("ADMIN") matches the authority "ROLE_ADMIN" in the
                        // Authentication's authority collection. It does not read the JWT. The
                        // claim only reaches this rule because JwtAuthenticationFilter turns it
                        // into a SimpleGrantedAuthority via Role.authority() — without that step
                        // this line would refuse every admin, valid token or not.
                        //
                        // Placement matters: rules are evaluated in order and the first match wins,
                        // so this must precede anyRequest() below. Written after it, every admin
                        // request would already have been matched by "authenticated" and any
                        // signed-in user would reach the admin endpoints.
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Everything else — including all three wishlist routes and anything added
                        // later — needs a valid token. Ownership is a separate question, answered by
                        // WishlistController once identity is established.
                        .anyRequest().authenticated())

                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint(securityErrorHandler)   // 401, no usable token
                        .accessDeniedHandler(securityErrorHandler))       // 403, not your resource

                // Before the username/password filter, which is where Spring Security expects
                // authentication to be established. By the time the authorization rules run, the
                // security context is either populated or deliberately empty.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
