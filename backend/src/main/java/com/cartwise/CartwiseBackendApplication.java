package com.cartwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

/**
 * Application entry point.
 *
 * <p>{@code UserDetailsServiceAutoConfiguration} is excluded, added in Chapter 18. Spring Boot
 * creates a single in-memory user named {@code user} whenever the security starter is present and
 * no {@code UserDetailsService} bean is defined, and logs its generated password at startup:
 *
 * <pre>Using generated security password: 6f410cd8-…</pre>
 *
 * <p>CartWise authenticates against its own {@code users} table via a JWT filter and never consults
 * a {@code UserDetailsService}, so that account cannot log in through any route this application
 * exposes. Excluding it anyway is worth the one line for two reasons: a credential printed to the
 * console at every boot is a bad habit for a codebase to teach, and the account stops being merely
 * unused and becomes non-existent — so it cannot quietly become reachable if some later chapter
 * enables HTTP Basic or a form login.
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class CartwiseBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CartwiseBackendApplication.class, args);
	}

}
