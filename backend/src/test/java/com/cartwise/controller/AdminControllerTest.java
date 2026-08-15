package com.cartwise.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cartwise.common.dto.UserDto;
import com.cartwise.entity.Role;
import com.cartwise.service.UserAdminService;
import com.cartwise.testsupport.ControllerTestBase;
import com.cartwise.testsupport.WithCartwiseSecurity;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * Administration, and the single {@code SecurityConfig} line that guards all of it.
 *
 * <p>The rule under test is {@code .requestMatchers("/api/admin/**").hasRole("ADMIN")}, and it has
 * two properties that only an HTTP test can check. First, that a valid {@code USER} token is refused
 * — the case a service-layer test cannot see, because {@code UserAdminService} deliberately contains
 * no authorization at all. Second, that {@code hasRole("ADMIN")} actually matches, which depends on
 * {@code JwtAuthenticationFilter} converting the role claim into the authority string
 * {@code ROLE_ADMIN}: if that conversion were dropped, a perfectly valid admin token would be refused
 * 403 on every route with nothing in any log to explain why.
 */
@WebMvcTest(AdminController.class)
@WithCartwiseSecurity
class AdminControllerTest extends ControllerTestBase {

    @MockitoBean
    private UserAdminService userAdminService;

    private static UserDto user(long id, String email, Role role) {
        return new UserDto(id, email, role, Instant.parse("2026-08-15T09:00:00Z"));
    }

    @Nested
    @DisplayName("the authorization matrix")
    class Authorization {

        @Test
        @DisplayName("no token is 401, not 403")
        void anonymousIsUnauthorized() throws Exception {
            mockMvc.perform(get("/api/admin/users"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

            verifyNoInteractions(userAdminService);
        }

        /**
         * The distinction {@code ApiErrorSecurityHandler} exists to keep straight: 401 means the
         * request did not say who it was from and re-authenticating will help; 403 means it did and
         * that user is not allowed this, so re-authenticating changes nothing. Answering 401 here
         * would send a signed-in user into a pointless re-login loop.
         */
        @Test
        @DisplayName("a valid USER token is 403, not 401")
        void ordinaryUserIsForbidden() throws Exception {
            mockMvc.perform(get("/api/admin/users")
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(2L)))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                    .andExpect(jsonPath("$.message")
                            .value("You do not have permission to access this resource."));

            verifyNoInteractions(userAdminService);
        }

        @Test
        @DisplayName("an ADMIN token is admitted")
        void adminIsAdmitted() throws Exception {
            when(userAdminService.listUsers()).thenReturn(List.of());

            mockMvc.perform(get("/api/admin/users")
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(1L)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("the role rule covers the write route too")
        void writeRouteIsAlsoGuarded() throws Exception {
            mockMvc.perform(put("/api/admin/users/{id}/role", 2L)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(3L))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"role\":\"ADMIN\"}"))
                    .andExpect(status().isForbidden());

            verify(userAdminService, org.mockito.Mockito.never())
                    .changeRole(anyLong(), any(Role.class));
        }

        /**
         * <strong>The wildcard is doing real work.</strong> {@code /api/admin/**} means a route added
         * to this controller tomorrow is protected before anyone remembers it needs to be. This
         * request hits a path with no handler at all, and it is still refused by the authorization
         * rules before routing — 403 for a non-admin, never 404. If it answered 404 instead, the
         * endpoint would be telling an unauthorized caller which admin routes exist.
         */
        @Test
        @DisplayName("an unmapped path under /api/admin is refused before routing, not 404")
        void unmappedAdminPathIsStillGuarded() throws Exception {
            mockMvc.perform(get("/api/admin/some/future/route")
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(2L)))
                    .andExpect(status().isForbidden());

            mockMvc.perform(get("/api/admin/some/future/route"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/admin/users")
    class ListUsers {

        /**
         * This endpoint returns every registered address — precisely the enumeration
         * {@code POST /api/auth/login} goes to trouble to prevent. The difference is who is asking,
         * and {@code hasRole("ADMIN")} has already answered that. Asserted so the contrast is a
         * recorded decision rather than something that looks like an inconsistency.
         */
        @Test
        @DisplayName("discloses every account to an admin")
        void listsAccounts() throws Exception {
            when(userAdminService.listUsers()).thenReturn(List.of(
                    user(1L, "ada@example.com", Role.ADMIN),
                    user(2L, "grace@example.com", Role.USER)));

            mockMvc.perform(get("/api/admin/users")
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(1L)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].email").value("ada@example.com"))
                    .andExpect(jsonPath("$[0].role").value("ADMIN"))
                    .andExpect(jsonPath("$[1].email").value("grace@example.com"))
                    .andExpect(jsonPath("$[1].role").value("USER"));
        }

        /** No password hash may appear in the response, whatever the DTO grows into later. */
        @Test
        @DisplayName("never serialises a password hash")
        void noPasswordHashInTheBody() throws Exception {
            when(userAdminService.listUsers())
                    .thenReturn(List.of(user(1L, "ada@example.com", Role.ADMIN)));

            mockMvc.perform(get("/api/admin/users")
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(1L)))
                    .andExpect(jsonPath("$[0].passwordHash").doesNotExist())
                    .andExpect(jsonPath("$[0].password").doesNotExist());
        }

        @Test
        @DisplayName("returns an empty array rather than 404 when there are no accounts")
        void emptyIsOk() throws Exception {
            when(userAdminService.listUsers()).thenReturn(List.of());

            mockMvc.perform(get("/api/admin/users")
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(1L)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isEmpty());
        }
    }

    @Nested
    @DisplayName("PUT /api/admin/users/{id}/role")
    class ChangeRole {

        @Test
        @DisplayName("returns 200 with the updated account")
        void changesRole() throws Exception {
            when(userAdminService.changeRole(2L, Role.ADMIN))
                    .thenReturn(user(2L, "grace@example.com", Role.ADMIN));

            mockMvc.perform(put("/api/admin/users/{id}/role", 2L)
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(1L))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"role\":\"ADMIN\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(2))
                    .andExpect(jsonPath("$.role").value("ADMIN"));
        }

        /**
         * A missing role deserialises to a record with a null component, which Jackson is content
         * with. Without the explicit null check in the controller it would reach a NOT NULL column
         * and surface as a 500 — a server error for what is plainly a malformed request.
         */
        @Test
        @DisplayName("returns 400 for a body with no role")
        void missingRoleIsBadRequest() throws Exception {
            mockMvc.perform(put("/api/admin/users/{id}/role", 2L)
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(1L))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("BAD_REQUEST"))
                    .andExpect(jsonPath("$.message").value(
                            org.hamcrest.Matchers.containsString("USER, ADMIN")));
        }

        @Test
        @DisplayName("returns 400 for an explicit null role")
        void nullRoleIsBadRequest() throws Exception {
            mockMvc.perform(put("/api/admin/users/{id}/role", 2L)
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(1L))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"role\": null}"))
                    .andExpect(status().isBadRequest());
        }

        /**
         * An unrecognised value never reaches the controller: {@code ChangeRoleRequest} types the
         * field as {@link Role}, so Jackson refuses it during message conversion and Spring MVC's own
         * handling produces the 400. That is why only the null case needed code.
         */
        @Test
        @DisplayName("returns 400 for a role the enum does not name")
        void unknownRoleIsBadRequest() throws Exception {
            mockMvc.perform(put("/api/admin/users/{id}/role", 2L)
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(1L))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"role\":\"SUPERUSER\"}"))
                    .andExpect(status().isBadRequest());

            verify(userAdminService, org.mockito.Mockito.never())
                    .changeRole(anyLong(), any(Role.class));
        }

        /**
         * 404 for an unknown id, where the wishlist endpoints answer 403 for the same case so nobody
         * can map which ids are real. An admin is entitled to know user 999 does not exist, and
         * telling them 403 would be a false statement about permission.
         */
        @Test
        @DisplayName("returns 404 for an id that does not exist")
        void unknownUserIsNotFound() throws Exception {
            when(userAdminService.changeRole(999L, Role.ADMIN))
                    .thenThrow(new EntityNotFoundException("No user with id 999"));

            mockMvc.perform(put("/api/admin/users/{id}/role", 999L)
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(1L))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"role\":\"ADMIN\"}"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                    .andExpect(jsonPath("$.message").value(
                            org.hamcrest.Matchers.containsString("999")));
        }

        @Test
        @DisplayName("a non-numeric id is 400, not 500")
        void nonNumericIdIsBadRequest() throws Exception {
            mockMvc.perform(put("/api/admin/users/{id}/role", "not-a-number")
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(1L))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"role\":\"ADMIN\"}"))
                    .andExpect(status().isBadRequest());
        }
    }
}
