package com.cartwise.controller;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cartwise.common.dto.ComparisonItemDto;
import com.cartwise.common.dto.ProductDto;
import com.cartwise.common.exception.ComparisonFullException;
import com.cartwise.service.ComparisonService;
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
 * A user's comparison over HTTP.
 *
 * <p>New in Chapter 23, and the endpoints are new too — the {@code comparisons} table has existed
 * since Chapter 16 with nothing exposing it.
 *
 * <p>The suite mirrors {@code WishlistControllerTest} because the two resources are deliberately
 * shaped alike, with one addition that has no wishlist equivalent: the four-product cap. That is
 * the rule this chapter moved out of the browser, so it is the rule most worth asserting from the
 * outside — a client that ignores the disabled toggle and posts a fifth product must be refused by
 * the server, with a status that says why.
 */
@WebMvcTest(ComparisonController.class)
@WithCartwiseSecurity
class ComparisonControllerTest extends ControllerTestBase {

    @MockitoBean
    private ComparisonService comparisonService;

    private static final long OWNER = 1L;
    private static final long SOMEONE_ELSE = 2L;
    private static final String SLUG = "iphone-16-pro";

    private static ComparisonItemDto item(int position) {
        return new ComparisonItemDto(
                5L,
                // Null image, and therefore null attribution and imagePlaceholder true — the
                // Chapter 24 shape for a product the image backfill could not illustrate. Kept
                // deliberately as the *un*populated case, complementing ProductControllerTest's
                // populated one, so both halves of the image contract are covered somewhere.
                new ProductDto(10L, SLUG, "iPhone 16 Pro", "Apple", "Smartphone",
                        new BigDecimal("119900.00"), null, new BigDecimal("4.8"), 1200, true, null,
                        null, null, null, null, true),
                position,
                Instant.parse("2026-08-16T10:00:00Z"));
    }

    @Nested
    @DisplayName("without a usable token — 401")
    class Unauthenticated {

        @Test
        @DisplayName("GET is refused")
        void getRequiresToken() throws Exception {
            mockMvc.perform(get("/api/users/{id}/comparison", OWNER))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

            verifyNoInteractions(comparisonService);
        }

        @Test
        @DisplayName("POST is refused")
        void postRequiresToken() throws Exception {
            mockMvc.perform(post("/api/users/{id}/comparison", OWNER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isUnauthorized());

            verifyNoInteractions(comparisonService);
        }

        @Test
        @DisplayName("DELETE of one product is refused")
        void deleteRequiresToken() throws Exception {
            mockMvc.perform(delete("/api/users/{id}/comparison/{slug}", OWNER, SLUG))
                    .andExpect(status().isUnauthorized());

            verifyNoInteractions(comparisonService);
        }

        @Test
        @DisplayName("DELETE of the whole comparison is refused")
        void clearRequiresToken() throws Exception {
            mockMvc.perform(delete("/api/users/{id}/comparison", OWNER))
                    .andExpect(status().isUnauthorized());

            verifyNoInteractions(comparisonService);
        }
    }

    /**
     * The half a "token required" suite would miss. A perfectly valid token for user 2 must not open
     * user 1's comparison, and the service must never be reached — a 403 that still ran the query
     * would have leaked the answer through timing or a log line.
     */
    @Nested
    @DisplayName("with someone else's token — 403")
    class WrongUser {

        @Test
        @DisplayName("GET another user's comparison is refused")
        void getOtherUser() throws Exception {
            mockMvc.perform(get("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(SOMEONE_ELSE)))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.code").value("FORBIDDEN"));

            verifyNoInteractions(comparisonService);
        }

        @Test
        @DisplayName("POST to another user's comparison is refused")
        void postOtherUser() throws Exception {
            mockMvc.perform(post("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(SOMEONE_ELSE))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isForbidden());

            verifyNoInteractions(comparisonService);
        }

        @Test
        @DisplayName("DELETE from another user's comparison is refused")
        void deleteOtherUser() throws Exception {
            mockMvc.perform(delete("/api/users/{id}/comparison/{slug}", OWNER, SLUG)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(SOMEONE_ELSE)))
                    .andExpect(status().isForbidden());

            verifyNoInteractions(comparisonService);
        }

        /**
         * An administrator is not an exception. Nothing in this controller consults the role — the
         * rule is "is this yours?", and an admin's comparison is no more the owner's than anyone
         * else's. If this ever starts passing, someone has added a role check to an ownership rule.
         */
        @Test
        @DisplayName("an admin token is refused too — this is ownership, not privilege")
        void adminIsNotExempt() throws Exception {
            mockMvc.perform(get("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerAdmin(SOMEONE_ELSE)))
                    .andExpect(status().isForbidden());

            verifyNoInteractions(comparisonService);
        }
    }

    @Nested
    @DisplayName("reading your own comparison")
    class Reading {

        @Test
        @DisplayName("returns the columns with their positions")
        void returnsColumns() throws Exception {
            when(comparisonService.getUserComparison(OWNER)).thenReturn(List.of(item(0)));

            mockMvc.perform(get("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(5))
                    .andExpect(jsonPath("$[0].position").value(0))
                    .andExpect(jsonPath("$[0].product.slug").value(SLUG))
                    .andExpect(jsonPath("$[0].addedAt").value("2026-08-16T10:00:00Z"));
        }

        /**
         * Empty is 200 and {@code []}, not 404. Having compared nothing is a state, not a missing
         * resource — and a 404 here would give the empty-state screen an error to render instead.
         */
        @Test
        @DisplayName("an empty comparison is 200 and an empty array")
        void emptyIsOk() throws Exception {
            when(comparisonService.getUserComparison(OWNER)).thenReturn(List.of());

            mockMvc.perform(get("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("adding a product")
    class Adding {

        @Test
        @DisplayName("201 when a column was created")
        void createdIs201() throws Exception {
            when(comparisonService.addToComparison(OWNER, SLUG)).thenReturn(true);

            mockMvc.perform(post("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isCreated());
        }

        /**
         * Idempotent: re-adding is a success, not a conflict. The frontend's toggle fires this on a
         * double-click and after a retried request, and neither is an error the user should see.
         */
        @Test
        @DisplayName("200 when the product was already being compared")
        void duplicateIs200() throws Exception {
            when(comparisonService.addToComparison(OWNER, SLUG)).thenReturn(false);

            mockMvc.perform(post("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("the slug is trimmed before it reaches the service")
        void slugIsTrimmed() throws Exception {
            when(comparisonService.addToComparison(anyLong(), anyString())).thenReturn(true);

            mockMvc.perform(post("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"  " + SLUG + "  \"}"))
                    .andExpect(status().isCreated());

            verify(comparisonService).addToComparison(OWNER, SLUG);
        }

        @Test
        @DisplayName("400 when productSlug is blank")
        void blankSlugIs400() throws Exception {
            mockMvc.perform(post("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"   \"}"))
                    .andExpect(status().isBadRequest());

            verify(comparisonService, never()).addToComparison(anyLong(), anyString());
        }

        @Test
        @DisplayName("400 when productSlug is missing entirely")
        void missingSlugIs400() throws Exception {
            mockMvc.perform(post("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());

            verify(comparisonService, never()).addToComparison(anyLong(), anyString());
        }

        @Test
        @DisplayName("404 when the product does not exist")
        void unknownProductIs404() throws Exception {
            when(comparisonService.addToComparison(OWNER, SLUG))
                    .thenThrow(new EntityNotFoundException("No product with slug " + SLUG));

            mockMvc.perform(post("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isNotFound());
        }

        /**
         * THE RULE THIS CHAPTER MOVED SERVER-SIDE.
         *
         * <p>Until now the only thing preventing a fifth column was a disabled button in React. This
         * asserts the server refuses on its own — and refuses with 409 rather than 400, because the
         * request was well-formed and would succeed after one removal. A 400 would tell the client
         * its message was wrong when its message was fine.
         */
        @Test
        @DisplayName("409 when the comparison is already full, with a code the client can branch on")
        void fullIs409() throws Exception {
            when(comparisonService.addToComparison(OWNER, SLUG))
                    .thenThrow(new ComparisonFullException(ComparisonService.MAX_COMPARISON_PRODUCTS));

            mockMvc.perform(post("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"productSlug\":\"" + SLUG + "\"}"))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("COMPARISON_FULL"))
                    .andExpect(jsonPath("$.message")
                            .value("A comparison holds at most 4 products."));
        }
    }

    @Nested
    @DisplayName("removing a product")
    class Removing {

        @Test
        @DisplayName("204 on success")
        void removedIs204() throws Exception {
            mockMvc.perform(delete("/api/users/{id}/comparison/{slug}", OWNER, SLUG)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isNoContent());

            verify(comparisonService).removeFromComparison(OWNER, SLUG);
        }

        /**
         * Not idempotent, unlike adding. Removing something that was never compared means the
         * client's view is stale, and it would rather be told than be given a misleading success.
         */
        @Test
        @DisplayName("404 when the product was not being compared")
        void notComparedIs404() throws Exception {
            doThrow(new EntityNotFoundException("not comparing"))
                    .when(comparisonService).removeFromComparison(eq(OWNER), eq(SLUG));

            mockMvc.perform(delete("/api/users/{id}/comparison/{slug}", OWNER, SLUG)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("clearing the comparison")
    class Clearing {

        @Test
        @DisplayName("204, and the service is asked to clear")
        void clearIs204() throws Exception {
            mockMvc.perform(delete("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isNoContent());

            verify(comparisonService).clearComparison(OWNER);
        }

        /**
         * Idempotent, unlike removing one product. "Start over" on an already-empty comparison is
         * not a stale view — the caller asked for none left, and none are left.
         */
        @Test
        @DisplayName("204 even when the comparison was already empty")
        void clearEmptyIs204() throws Exception {
            mockMvc.perform(delete("/api/users/{id}/comparison", OWNER)
                            .header(HttpHeaders.AUTHORIZATION, bearerUser(OWNER)))
                    .andExpect(status().isNoContent());
        }
    }
}
