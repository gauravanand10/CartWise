package com.cartwise.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cartwise.common.dto.AuthResponse;
import com.cartwise.common.exception.EmailAlreadyRegisteredException;
import com.cartwise.common.exception.InvalidCredentialsException;
import com.cartwise.service.AuthService;
import com.cartwise.testsupport.ControllerTestBase;
import com.cartwise.testsupport.WithCartwiseSecurity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * The two endpoints that hand out tokens.
 *
 * <p>Both are public by necessity — they are how a caller gets the credential every other protected
 * endpoint demands — which makes this the one controller whose input arrives entirely
 * unauthenticated, and the one whose behaviour on bad input matters most.
 */
@WebMvcTest(AuthController.class)
@WithCartwiseSecurity
class AuthControllerTest extends ControllerTestBase {

    @MockitoBean
    private AuthService authService;

    private static final String TOKEN = "signed.jwt.value";

    private static String body(String email, String password) {
        return """
                {"email": %s, "password": %s}
                """.formatted(quote(email), quote(password));
    }

    private static String quote(String value) {
        return value == null ? "null" : "\"" + value + "\"";
    }

    @Nested
    @DisplayName("POST /api/auth/signup")
    class Signup {

        @Test
        @DisplayName("returns 201 with the new account and its token")
        void createsAccount() throws Exception {
            when(authService.signup("ada@example.com", "a-good-password"))
                    .thenReturn(new AuthResponse(1L, "ada@example.com", TOKEN));

            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("ada@example.com", "a-good-password")))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.userId").value(1))
                    .andExpect(jsonPath("$.email").value("ada@example.com"))
                    .andExpect(jsonPath("$.token").value(TOKEN));
        }

        /**
         * The role is not in the response body, and that omission is deliberate. The client already
         * receives it inside the token; putting it in the body as well creates two sources for one
         * fact, and the tempting next step — a frontend branching on the body field — is a permission
         * check running somewhere the user controls.
         */
        @Test
        @DisplayName("does not put the role in the response body")
        void responseCarriesNoRole() throws Exception {
            when(authService.signup(anyString(), anyString()))
                    .thenReturn(new AuthResponse(1L, "ada@example.com", TOKEN));

            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("ada@example.com", "a-good-password")))
                    .andExpect(jsonPath("$.role").doesNotExist());
        }

        @Test
        @DisplayName("needs no token of its own")
        void isPublic() throws Exception {
            when(authService.signup(anyString(), anyString()))
                    .thenReturn(new AuthResponse(1L, "ada@example.com", TOKEN));

            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("ada@example.com", "a-good-password")))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("returns 409 when the address already has an account")
        void duplicateEmailIsConflict() throws Exception {
            when(authService.signup(anyString(), anyString()))
                    .thenThrow(new EmailAlreadyRegisteredException(
                            "An account with that email already exists."));

            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("ada@example.com", "a-good-password")))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
        }

        @Test
        @DisplayName("returns 400 for a validation failure raised by the service")
        void serviceValidationBecomesBadRequest() throws Exception {
            when(authService.signup(anyString(), anyString()))
                    .thenThrow(new IllegalArgumentException("password must be at least 8 characters"));

            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("ada@example.com", "short")))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("BAD_REQUEST"))
                    .andExpect(jsonPath("$.message").value(
                            org.hamcrest.Matchers.containsString("8 characters")));
        }

        /**
         * The controller's own presence check runs before the service is consulted, so a body missing
         * a field never reaches the business rules. Asserted on the response and on the service not
         * being called, because "rejected early" is the actual claim.
         */
        @ParameterizedTest
        @ValueSource(strings = {
                "{}",
                "{\"email\": \"ada@example.com\"}",
                "{\"password\": \"a-good-password\"}",
                "{\"email\": \"\", \"password\": \"a-good-password\"}",
                "{\"email\": null, \"password\": \"a-good-password\"}"
        })
        @DisplayName("returns 400 for a body missing a field, without calling the service")
        void missingFieldsAreRejectedEarly(String json) throws Exception {
            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).signup(anyString(), anyString());
        }

        @Test
        @DisplayName("returns 400 for unparseable JSON in the standard error shape")
        void malformedJson() throws Exception {
            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{not json"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("BAD_REQUEST"))
                    .andExpect(jsonPath("$.timestamp").exists());
        }

        /**
         * A password of spaces is unusual but legitimate, and the controller checks {@code isEmpty}
         * rather than {@code isBlank} for exactly that reason — rejecting it would mean a password
         * that can be set and then never used.
         */
        @Test
        @DisplayName("accepts a password of spaces, which isBlank would have refused")
        void whitespacePasswordIsNotRejectedByTheController() throws Exception {
            when(authService.signup(anyString(), anyString()))
                    .thenReturn(new AuthResponse(1L, "ada@example.com", TOKEN));

            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("ada@example.com", "        ")))
                    .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class Login {

        @Test
        @DisplayName("returns 200 with a token, not 201 — nothing was created")
        void successIsOkNotCreated() throws Exception {
            when(authService.login("ada@example.com", "a-good-password"))
                    .thenReturn(new AuthResponse(1L, "ada@example.com", TOKEN));

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("ada@example.com", "a-good-password")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").value(TOKEN));
        }

        @Test
        @DisplayName("needs no token of its own")
        void isPublic() throws Exception {
            when(authService.login(anyString(), anyString()))
                    .thenThrow(new InvalidCredentialsException());

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("ada@example.com", "wrong")))
                    .andExpect(status().isUnauthorized());
        }

        /**
         * 401, not 403: the caller failed to establish who they are, which is what 401 means. A 403
         * would imply CartWise knew who they were and had decided against them.
         */
        @Test
        @DisplayName("a credential failure is 401 with the fixed message")
        void badCredentialsIsUnauthorized() throws Exception {
            when(authService.login(anyString(), anyString()))
                    .thenThrow(new InvalidCredentialsException());

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("ada@example.com", "wrong-password")))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                    .andExpect(jsonPath("$.message").value("Invalid email or password."));
        }

        /**
         * <strong>Not 404 for an unknown address.</strong> The status and the body must be identical
         * whether the email exists or the password was wrong — a 404 here would be a user-enumeration
         * oracle answerable one request at a time. This asserts the property at the HTTP boundary,
         * where an attacker would actually observe it; {@code AuthServiceTest} asserts it at the
         * service boundary where the decision is made.
         */
        @Test
        @DisplayName("an unknown address is answered identically to a wrong password")
        void unknownEmailIsIndistinguishableFromWrongPassword() throws Exception {
            when(authService.login(anyString(), anyString()))
                    .thenThrow(new InvalidCredentialsException());

            var unknown = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("nobody@example.com", "any-password")))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                    .andReturn();

            var wrongPassword = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("ada@example.com", "wrong-password")))
                    .andExpect(status().isUnauthorized())
                    .andReturn();

            org.assertj.core.api.Assertions
                    .assertThat(unknown.getResponse().getStatus())
                    .isEqualTo(wrongPassword.getResponse().getStatus());

            // Same body too, modulo the timestamp, which is the only field that legitimately differs.
            org.assertj.core.api.Assertions
                    .assertThat(stripTimestamp(unknown.getResponse().getContentAsString()))
                    .isEqualTo(stripTimestamp(wrongPassword.getResponse().getContentAsString()));
        }

        private String stripTimestamp(String json) {
            return json.replaceAll("\"timestamp\"\\s*:\\s*\"[^\"]*\"", "\"timestamp\":\"?\"");
        }

        @Test
        @DisplayName("a missing field is 400, which is about the request rather than any account")
        void missingFieldsAreBadRequest() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(anyString(), anyString());
        }

        /**
         * A GET would put the password in the URL, where it is logged by every proxy in the path,
         * kept in browser history and sent in {@code Referer} headers. There is no GET mapping, so
         * this is 405 — asserted so that adding one would be a visible change.
         */
        @Test
        @DisplayName("cannot be reached with GET")
        void getIsNotAllowed() throws Exception {
            mockMvc.perform(get("/api/auth/login"))
                    .andExpect(status().isMethodNotAllowed())
                    .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"));
        }
    }
}
