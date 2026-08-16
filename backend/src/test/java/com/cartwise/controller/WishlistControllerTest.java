package com.cartwise.controller;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cartwise.common.dto.ProductDto;
import com.cartwise.common.dto.WishlistItemDto;
import com.cartwise.service.WishlistService;
import com.cartwise.testsupport.ControllerTestBase;
import com.cartwise.testsupport.WithCartwiseSecurity;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
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
 * A user's wishlist over HTTP, and the ownership rule that guards it.
 *
 * <p>This controller is where the authorization matrix has three answers rather than two, and the
 * distinction is the point of the class: <em>who are you?</em> is answered by {@code SecurityConfig}
 * with 401, and <em>is this yours?</em> is answered by {@code requireSelf} with 403. A test suite
 * that only checked "token required" would miss the second entirely — and the second is the one that
 * stops anyone reading anyone else's wishlist by editing a number in the URL.
 */
@WebMvcTest(WishlistController.class)
@WithCartwiseSecurity
class WishlistControllerTest extends ControllerTestBase {

    @MockitoBean
    private WishlistService wishlistService;

    private static final long OWNER = 1L;
    private static final long SOMEONE_ELSE = 2L;
    private static final String SLUG = "iphone-16-pro";

    private static WishlistItemDto item() {
        return new WishlistItemDto(
                5L,
                // No image, so no attribution and imagePlaceholder true. See the note in
                // ComparisonControllerTest — this is the Chapter 24 unilluminated-product shape.
                new ProductDto(10L, SLUG, "iPhone 16 Pro", "Apple", "Smartphone",
                        new BigDecimal("119900.00"), null, new BigDecimal("4.8"), 1200, true, null,
                        null, null, null, null, true),
                Instant.parse("2026-08-15T10:00:00Z"));
    }

    @Nested
    @DisplayName("without a usable token — 401")
    class Unauthenticated {

        @Test
        @DisplayName("GET is refused")
        void getRequiresToken() throws Exception {
            mockMvc.perform(get("/api/users/{id}/wishlist", OWNER))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                    .andExpect(jsonPath("$.message")
                            .value("Authentication is required to access this resource."));

            verifyNoInteractions(wishlistService);
        }

        @Test
        @DisplayName("POST is refused")
        void postRequiresToken() throws Exception {
            mockMvc.perform(post("/api/users/{id}/wishlist", OWNER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE is refused")
        void deleteRequiresToken() throws Exception {
            mockMvc.perform(delete("/api/users/{id}/wishlist/{slug}", OWNER, SLUG))
                    .andExpect(status().isUnauthorized());
        }

        /**
         * A token that does not verify is the same as no token — the filter authenticates but never
         * rejects, so a bad token simply leaves the context empty and the authorization rules answer.
         */
        @Test
        @DisplayName("a token with a broken signature is treated as no token")
        void tamperedTokenIsRefused() throws Exception {
            String token = jwtTokenProvider.generateToken(OWNER, "ada@example.com",
                    com.cartwise.entity.Role.USER);
            String[] parts = token.split("\\.");
            String forged = parts[0] + "." + parts[1] + ".AAAA" + parts[2].substring(4);

            mockMvc.perform(get("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + forged))
                    .andExpect(status().isUnauthorized());
        }

        /**
         * The prefix comparison is case-sensitive, as every RFC 6750 client writes it. A lowercase
         * {@code bearer} is read as offering no token at all — a stated limitation rather than a
         * silent behaviour, so it is asserted rather than left to be discovered.
         */
        @Test
        @DisplayName("a lowercase 'bearer' scheme is not recognised")
        void lowercaseSchemeIsIgnored() throws Exception {
            String token = jwtTokenProvider.generateToken(OWNER, "ada@example.com",
                    com.cartwise.entity.Role.USER);

            mockMvc.perform(get("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, "bearer " + token))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("an empty Bearer header is treated as no token")
        void emptyBearerIsIgnored() throws Exception {
            mockMvc.perform(get("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, "Bearer "))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("with someone else's token — 403")
    class WrongUser {

        /**
         * The check that closes the hole Chapter 17 documented. The comparison is between the id
         * inside the verified token and the id in the URL, and the caller controls only one of them.
         */
        @Test
        @DisplayName("reading another user's wishlist is forbidden")
        void cannotReadAnotherUsersWishlist() throws Exception {
            mockMvc.perform(get("/api/users/{id}/wishlist", SOMEONE_ELSE)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                    .andExpect(jsonPath("$.message")
                            .value("You do not have permission to access this resource."));

            verifyNoInteractions(wishlistService);
        }

        @Test
        @DisplayName("writing to another user's wishlist is forbidden")
        void cannotWriteToAnotherUsersWishlist() throws Exception {
            mockMvc.perform(post("/api/users/{id}/wishlist", SOMEONE_ELSE)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isForbidden());

            verify(wishlistService, never()).addToWishlist(anyLong(), anyString());
        }

        @Test
        @DisplayName("deleting from another user's wishlist is forbidden")
        void cannotDeleteFromAnotherUsersWishlist() throws Exception {
            mockMvc.perform(delete("/api/users/{id}/wishlist/{slug}", SOMEONE_ELSE, SLUG)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isForbidden());

            verify(wishlistService, never()).removeFromWishlist(anyLong(), anyString());
        }

        /**
         * <strong>An admin token is not a master key here.</strong> {@code requireSelf} compares ids
         * and knows nothing about roles, so an administrator gets 403 on someone else's wishlist just
         * as an ordinary user does. Whether that is the desired policy is a product question; that it
         * is the current behaviour is worth pinning, because "admins can see everything" is exactly
         * the assumption someone would otherwise make.
         */
        @Test
        @DisplayName("an ADMIN token does not grant access to another user's wishlist")
        void adminIsNotExemptFromOwnership() throws Exception {
            mockMvc.perform(get("/api/users/{id}/wishlist", SOMEONE_ELSE)
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(OWNER)))
                    .andExpect(status().isForbidden());
        }

        /**
         * The ownership check runs before the lookup, so a 404 can only ever describe the caller's
         * own wishlist. Checking in the other order would let anyone probe whether a stranger had
         * saved a given product by comparing 404 against 403.
         */
        @Test
        @DisplayName("ownership is checked before existence, so 403 never leaks a 404")
        void ownershipIsCheckedBeforeLookup() throws Exception {
            mockMvc.perform(delete("/api/users/{id}/wishlist/{slug}", SOMEONE_ELSE, "does-not-exist")
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isForbidden());

            verifyNoInteractions(wishlistService);
        }
    }

    @Nested
    @DisplayName("with your own token")
    class OwnWishlist {

        @Test
        @DisplayName("GET returns the saved products")
        void getReturnsItems() throws Exception {
            when(wishlistService.getUserWishlist(OWNER)).thenReturn(List.of(item()));

            mockMvc.perform(get("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(5))
                    .andExpect(jsonPath("$[0].product.slug").value(SLUG))
                    .andExpect(jsonPath("$[0].savedAt").exists());
        }

        @Test
        @DisplayName("GET returns an empty array for an empty wishlist")
        void emptyWishlist() throws Exception {
            when(wishlistService.getUserWishlist(OWNER)).thenReturn(List.of());

            mockMvc.perform(get("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isEmpty());
        }

        /**
         * 201 and 200 are both successes, and the status is the only thing distinguishing a new save
         * from a repeat. A client that does not care can ignore the difference; one that does can
         * report it accurately.
         */
        @Test
        @DisplayName("POST returns 201 when a row was created")
        void postCreated() throws Exception {
            when(wishlistService.addToWishlist(OWNER, SLUG)).thenReturn(true);

            mockMvc.perform(post("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("POST returns 200 when it was already saved")
        void postAlreadySaved() throws Exception {
            when(wishlistService.addToWishlist(OWNER, SLUG)).thenReturn(false);

            mockMvc.perform(post("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("POST trims the slug before it reaches the service")
        void slugIsTrimmed() throws Exception {
            when(wishlistService.addToWishlist(eq(OWNER), eq(SLUG))).thenReturn(true);

            mockMvc.perform(post("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"  " + SLUG + "  \"}"))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("POST returns 400 for a missing or blank slug")
        void blankSlugIsBadRequest() throws Exception {
            mockMvc.perform(post("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"   \"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("BAD_REQUEST"));

            mockMvc.perform(post("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());

            verify(wishlistService, never()).addToWishlist(anyLong(), anyString());
        }

        @Test
        @DisplayName("POST returns 404 when the product does not exist")
        void unknownProductIsNotFound() throws Exception {
            when(wishlistService.addToWishlist(OWNER, "no-such-product"))
                    .thenThrow(new EntityNotFoundException("No product with slug no-such-product"));

            mockMvc.perform(post("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"no-such-product\"}"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                    .andExpect(jsonPath("$.message").value(
                            org.hamcrest.Matchers.containsString("no-such-product")));
        }

        @Test
        @DisplayName("POST returns 409 when a concurrent request won the race")
        void constraintViolationIsConflict() throws Exception {
            when(wishlistService.addToWishlist(OWNER, SLUG))
                    .thenThrow(new org.springframework.dao.DataIntegrityViolationException(
                            "uk_wishlist_user_product"));

            mockMvc.perform(post("/api/users/{id}/wishlist", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("CONFLICT"))
                    // The constraint name must not reach the client.
                    .andExpect(jsonPath("$.message").value(
                            org.hamcrest.Matchers.not(
                                    org.hamcrest.Matchers.containsString("uk_wishlist"))));
        }

        @Test
        @DisplayName("DELETE returns 204 with no body")
        void deleteNoContent() throws Exception {
            mockMvc.perform(delete("/api/users/{id}/wishlist/{slug}", OWNER, SLUG)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isNoContent());

            verify(wishlistService).removeFromWishlist(OWNER, SLUG);
        }

        /**
         * Removing is deliberately not idempotent, unlike adding: a remove that hits nothing usually
         * means the client is working from a stale list and would rather be told.
         */
        @Test
        @DisplayName("DELETE returns 404 for a product that was never saved")
        void deleteUnsavedIsNotFound() throws Exception {
            org.mockito.Mockito.doThrow(new EntityNotFoundException(
                            "User 1 has not saved product " + SLUG))
                    .when(wishlistService).removeFromWishlist(OWNER, SLUG);

            mockMvc.perform(delete("/api/users/{id}/wishlist/{slug}", OWNER, SLUG)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"));
        }
    }
}
