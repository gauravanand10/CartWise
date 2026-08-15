package com.cartwise.testsupport;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

/**
 * Turns Spring Security's machinery on inside a {@code @WebMvcTest} slice.
 *
 * <p>Production never writes {@code @EnableWebSecurity} anywhere, because Boot's
 * {@code SecurityAutoConfiguration} applies it. The slice does not: the Boot 4.1
 * {@code @WebMvcTest} autoconfiguration list contains {@code WebMvcAutoConfiguration},
 * {@code ErrorMvcAutoConfiguration}, message conversion and validation — and no security
 * autoconfiguration of any kind. Verified by reading
 * {@code AutoConfigureWebMvc.imports} out of {@code spring-boot-webmvc-test-4.1.0.jar} rather than
 * inferred from a stack trace.
 *
 * <p>Two consequences follow, and the second is the dangerous one:
 *
 * <ul>
 *   <li>There is no {@code HttpSecurity} bean, so importing {@code SecurityConfig} alone fails the
 *       context outright with "No qualifying bean of type ... HttpSecurity". That failure is loud
 *       and self-correcting.
 *   <li>Without any of it, there is no filter chain either — <strong>not even Boot's default
 *       one</strong>. A {@code @WebMvcTest} that simply forgets security does not answer 401 to an
 *       anonymous request; it answers 200 to everything, and an authorization test suite written
 *       against it passes completely while asserting nothing at all.
 * </ul>
 *
 * <p>{@code @EnableWebSecurity} imports {@code HttpSecurityConfiguration}, which defines the
 * prototype {@code HttpSecurity} bean that {@code SecurityConfig.filterChain} takes as an argument,
 * and {@code WebSecurityConfiguration}, which assembles the resulting chains into the
 * {@code springSecurityFilterChain} filter. That filter still has to be attached to MockMvc — see
 * {@link ControllerTestBase}.
 */
@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
public class WebSecurityTestConfig {
}
