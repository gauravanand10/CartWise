package com.cartwise.config;

import com.cartwise.security.ApiErrorSecurityHandler;
import com.cartwise.security.JwtAuthenticationFilter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
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

                /*
                 * Chapter 25 — response security headers.
                 *
                 * Spring Security already sends most of what matters, and this block is written to
                 * say which are defaults being kept and which are additions, because "we configured
                 * headers" is otherwise unverifiable. Confirmed against the running app rather than
                 * from memory.
                 *
                 * Already on by default, left alone:
                 *   X-Content-Type-Options: nosniff     — stops MIME sniffing turning a JSON error
                 *                                         body into executable script.
                 *   X-Frame-Options: DENY               — clickjacking. Harmless for a JSON API and
                 *                                         correct for anything that ever renders.
                 *   Cache-Control: no-store             — keeps authenticated responses out of
                 *                                         shared caches.
                 *
                 * Added here:
                 */
                .headers(headers -> headers
                        /*
                         * HSTS. NOT a default — Spring Security omits it on plain HTTP, which is
                         * exactly what this container serves, so it has to be asked for.
                         *
                         * It tells a browser to refuse plain HTTP to this host for a year, which
                         * removes the first request of every future visit as a downgrade
                         * opportunity. Meaningful only once TLS terminates at the proxy in front of
                         * this app; harmless before then, because a browser ignores the header when
                         * it arrives over HTTP.
                         *
                         * `includeSubDomains` is on deliberately and is the part with teeth: it
                         * commits every subdomain of the deployed host to HTTPS for a year, and a
                         * subdomain still served over HTTP will break. That is a deployment fact
                         * worth knowing before the first release, not after.
                         */
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31_536_000L))

                        /*
                         * Referrer-Policy. Spring Security does not send one by default, so the
                         * browser default applies and full URLs leak to third-party hosts — every
                         * Openverse image request from Chapter 24 currently carries the CartWise
                         * page URL in its Referer.
                         *
                         * same-origin keeps the full path for our own requests and sends nothing
                         * cross-origin.
                         */
                        .referrerPolicy(referrer -> referrer.policy(
                                ReferrerPolicy.SAME_ORIGIN))

                        /*
                         * Content-Security-Policy, scoped to what this application actually serves.
                         *
                         * The backend returns JSON, not HTML, so a policy here protects error pages
                         * and anything Actuator renders rather than the React app — the frontend
                         * gets its own policy from nginx, where its real script and style sources
                         * are known. `default-src 'none'` is therefore correct here and would be
                         * far too strict one service over.
                         */
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'none'; frame-ancestors 'none'; base-uri 'none'")))

                .authorizeHttpRequests(auth -> auth
                        // How a caller obtains a token. Necessarily reachable without one.
                        .requestMatchers("/api/auth/**").permitAll()

                        // Liveness. A health check that requires a credential is one that cannot be
                        // used by the thing that needs it most — an uptime monitor.
                        .requestMatchers("/api/health").permitAll()

                        // Chapter 25's Actuator health endpoint, and its liveness/readiness
                        // subpaths, for the same reason: a container orchestrator's probe cannot
                        // present a JWT.
                        //
                        // Scoped to health alone rather than /actuator/**. Only health is exposed
                        // in application.yml today, so a wildcard would be permitting nothing extra
                        // right now — and would silently publish whatever a future config change or
                        // Boot upgrade adds to that surface. Two lines is a cheap price for a rule
                        // that cannot widen by accident.
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()

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

                        // Chapter 26 — the affiliate outbound path, public by necessity.
                        //
                        // A comparison site whose "Visit store" links required an account would have
                        // no outbound traffic and therefore no revenue, so these cannot sit behind
                        // authentication. They are still *recognised* when a token happens to be
                        // present: the filter chain runs first either way, so a signed-in caller's
                        // click is attributed and an anonymous one is not, without either needing a
                        // separate route.
                        //
                        // Enumerated by method and path rather than /api/affiliate/** for the same
                        // reason the catalogue above is: the admin click report lives at
                        // /api/admin/affiliate/clicks precisely so that it is covered by the ADMIN
                        // rule below and can never be reached through a widened public wildcard here.
                        .requestMatchers(HttpMethod.GET,
                                "/api/affiliate/retailers", "/api/affiliate/click/*/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/affiliate/clicks").permitAll()

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
