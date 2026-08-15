package com.cartwise.testsupport;

import com.cartwise.entity.Role;
import com.cartwise.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * Shared setup for the controller tests: a MockMvc with CartWise's real filter chain attached, and a
 * way to mint the tokens those tests authenticate with.
 *
 * <p><strong>MockMvc is built here rather than autowired.</strong> An injected {@code MockMvc} is
 * assembled by {@code MockMvcAutoConfiguration}, and whether it attaches
 * {@code springSecurityFilterChain} depends on autoconfiguration that this slice does not load (see
 * {@link WebSecurityTestConfig}). Applying {@code springSecurity()} explicitly removes the question:
 * the chain is attached because this line attaches it. The failure mode of getting it wrong is the
 * one worth avoiding — not an error, but every authorization assertion quietly passing against a
 * request that was never filtered.
 *
 * <p>Tokens are minted through the application's own {@link JwtTokenProvider}, signed with the key in
 * {@code application-test.yml}. A hand-rolled token would test the test's idea of the format; this
 * way a request in a test and a request from the frontend carry the same kind of credential, and a
 * change to how tokens are issued shows up here immediately.
 */
public abstract class ControllerTestBase {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    protected JwtTokenProvider jwtTokenProvider;

    protected MockMvc mockMvc;

    @BeforeEach
    void buildMockMvcWithSecurity() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    /** An {@code Authorization} header value for an ordinary user. */
    protected String bearerUser(long userId) {
        return bearer(userId, "user" + userId + "@example.com", Role.USER);
    }

    /** An {@code Authorization} header value for an administrator. */
    protected String bearerAdmin(long userId) {
        return bearer(userId, "admin" + userId + "@example.com", Role.ADMIN);
    }

    protected String bearer(long userId, String email, Role role) {
        return "Bearer " + jwtTokenProvider.generateToken(userId, email, role);
    }
}
