package com.cartwise.testsupport;

import com.cartwise.config.ApplicationConfig;
import com.cartwise.config.SecurityConfig;
import com.cartwise.security.ApiErrorSecurityHandler;
import com.cartwise.security.JwtAuthenticationFilter;
import com.cartwise.security.JwtTokenProvider;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * Puts CartWise's real security chain into a {@code @WebMvcTest} slice.
 *
 * <p><strong>Without this, controller authorization tests assert the wrong thing entirely.</strong>
 * {@code @WebMvcTest} loads controllers, converters and {@code @ControllerAdvice}, and it deliberately
 * does <em>not</em> load arbitrary {@code @Configuration} classes — so
 * {@link SecurityConfig} is absent and Spring Boot's default security chain applies instead. That
 * default also answers 401 for an anonymous request, which is the trap: a test asserting "no token →
 * 401" passes against the default chain whether or not CartWise's own rules are correct, or even
 * present. The rules that would actually be missed are the specific ones — that
 * {@code GET /api/products} is public, that {@code /api/admin/**} needs a role, that
 * {@code POST /api/products} is not covered by the read-only permit.
 *
 * <p>In Boot 4.1 it is worse than "the default chain applies instead": the slice loads <em>no</em>
 * security autoconfiguration, so there is no chain at all and every request succeeds. See
 * {@link WebSecurityTestConfig}, which is what turns the machinery on.
 *
 * <p>Five imports, and each is required for a different reason:
 *
 * <ul>
 *   <li>{@link WebSecurityTestConfig} — supplies {@code HttpSecurity} and assembles the chains, the
 *       job Boot's {@code SecurityAutoConfiguration} does outside a slice.
 *   <li>{@link SecurityConfig} — the authorization rules themselves, which is the point.
 *   <li>{@link JwtAuthenticationFilter} — {@code SecurityConfig} takes it as a constructor argument,
 *       and without it no {@code Authorization} header is ever read, so every token-bearing test
 *       would be indistinguishable from an anonymous one.
 *   <li>{@link JwtTokenProvider} — what the filter verifies with, and what the tests mint tokens
 *       from, so a test token and a production token are the same kind of object.
 *   <li>{@link ApiErrorSecurityHandler} — the other constructor argument, and what makes a 401 or 403
 *       carry CartWise's {@code ApiError} body instead of an empty response.
 * </ul>
 *
 * <p>{@link ApplicationConfig} comes along for the {@code Clock} that
 * {@code GlobalExceptionHandler} and {@code ApiErrorSecurityHandler} both need. {@link JwtProperties}
 * is not imported because {@code SecurityConfig} already declares
 * {@code @EnableConfigurationProperties} for it — it binds from {@code application-test.yml}, which is
 * why {@link ActiveProfiles} is part of this annotation rather than repeated per class.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@ActiveProfiles("test")
@Import({
        WebSecurityTestConfig.class,
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        JwtTokenProvider.class,
        ApiErrorSecurityHandler.class,
        ApplicationConfig.class
})
public @interface WithCartwiseSecurity {
}
