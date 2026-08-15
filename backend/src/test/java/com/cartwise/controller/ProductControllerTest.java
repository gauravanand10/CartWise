package com.cartwise.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cartwise.common.dto.PageResponse;
import com.cartwise.common.dto.ProductDto;
import com.cartwise.common.dto.ProductQuery;
import com.cartwise.service.ProductService;
import com.cartwise.testsupport.ControllerTestBase;
import com.cartwise.testsupport.WithCartwiseSecurity;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * {@code GET /api/products} and {@code GET /api/products/{slug}} over HTTP.
 *
 * <p>The service is mocked, so nothing here asserts what the database does. What it does assert is
 * the half the service cannot: status codes, the JSON shape, how a bad query string is answered, and
 * — with {@link WithCartwiseSecurity} — which of these routes the real
 * {@code SecurityConfig} lets through without a token.
 */
@WebMvcTest(ProductController.class)
@WithCartwiseSecurity
class ProductControllerTest extends ControllerTestBase {

    @MockitoBean
    private ProductService productService;

    private static ProductDto product(String slug, String name) {
        return new ProductDto(1L, slug, name, "Apple", "Smartphone",
                new BigDecimal("119900.00"), new BigDecimal("134900.00"),
                new BigDecimal("4.8"), 1200, true, "https://example.test/p.png");
    }

    @Nested
    @DisplayName("the catalogue is public")
    class PublicAccess {

        /**
         * The rule this asserts is {@code .requestMatchers(GET, "/api/products", "/api/products/*")
         * .permitAll()}. Shoppers browse before they have accounts, and a catalogue behind a login is
         * not a catalogue.
         */
        @Test
        @DisplayName("GET /api/products needs no token")
        void listIsPublic() throws Exception {
            when(productService.getProducts(any())).thenReturn(
                    new PageResponse<>(List.of(), 0, 20, 0, 0));

            mockMvc.perform(get("/api/products")).andExpect(status().isOk());
        }

        @Test
        @DisplayName("GET /api/products/{slug} needs no token")
        void detailIsPublic() throws Exception {
            when(productService.getProductBySlug("iphone-16-pro"))
                    .thenReturn(Optional.of(product("iphone-16-pro", "iPhone 16 Pro")));

            mockMvc.perform(get("/api/products/iphone-16-pro")).andExpect(status().isOk());
        }

        @Test
        @DisplayName("the CORS preflight is permitted")
        void preflightIsPermitted() throws Exception {
            mockMvc.perform(options("/api/products")
                            .header("Origin", "http://localhost:5173")
                            .header("Access-Control-Request-Method", "GET"))
                    .andExpect(status().isOk());
        }

        /**
         * <strong>The reason the permit rule enumerates methods instead of using a wildcard.</strong>
         * {@code /api/products/**} would have made every future verb on this path public too. There
         * is no {@code POST} handler, so this request is refused by the authorization rules before
         * routing — 401, not 405 — which is the safe direction: a write endpoint added here tomorrow
         * is protected before anyone remembers it needs to be.
         */
        @Test
        @DisplayName("POST /api/products is NOT public, though GET is")
        void writeMethodsAreNotCoveredByTheReadPermit() throws Exception {
            mockMvc.perform(post("/api/products").contentType("application/json").content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        /**
         * {@code /api/products/*} matches exactly one path segment. A deeper path — a reviews
         * sub-resource, say — falls through to {@code anyRequest().authenticated()}. Asserted so the
         * single-segment scope of that pattern is a recorded fact rather than an assumption.
         */
        @Test
        @DisplayName("a deeper path under /api/products is not covered by the single-segment permit")
        void nestedPathsAreNotPublic() throws Exception {
            mockMvc.perform(get("/api/products/iphone-16-pro/reviews"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("the response shape")
    class ResponseShape {

        /**
         * The envelope Chapter 20 introduced, asserted field by field. A client's pager is built from
         * exactly these five names, and this is the test that makes renaming one a visible break.
         */
        @Test
        @DisplayName("is the PageResponse envelope, not a bare array")
        void envelopeShape() throws Exception {
            when(productService.getProducts(any())).thenReturn(new PageResponse<>(
                    List.of(product("iphone-16-pro", "iPhone 16 Pro")), 2, 5, 42, 9));

            mockMvc.perform(get("/api/products"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].slug").value("iphone-16-pro"))
                    .andExpect(jsonPath("$.content[0].name").value("iPhone 16 Pro"))
                    .andExpect(jsonPath("$.page").value(2))
                    .andExpect(jsonPath("$.size").value(5))
                    .andExpect(jsonPath("$.totalElements").value(42))
                    .andExpect(jsonPath("$.totalPages").value(9));
        }

        @Test
        @DisplayName("carries price as a JSON number with its scale intact")
        void priceKeepsScale() throws Exception {
            when(productService.getProducts(any())).thenReturn(new PageResponse<>(
                    List.of(product("p", "P")), 0, 20, 1, 1));

            mockMvc.perform(get("/api/products"))
                    .andExpect(jsonPath("$.content[0].price").value(119900.00));
        }

        @Test
        @DisplayName("an empty catalogue is 200 with an empty array, not 404")
        void emptyIsOk() throws Exception {
            when(productService.getProducts(any()))
                    .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0));

            mockMvc.perform(get("/api/products"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isEmpty())
                    .andExpect(jsonPath("$.totalElements").value(0));
        }

        /**
         * A filter that matches nothing has succeeded at matching nothing. A 404 here would also make
         * the endpoint a probe for which category names exist.
         */
        @Test
        @DisplayName("an unknown category is 200 with no results, not 404")
        void unknownCategoryIsNotFound404() throws Exception {
            when(productService.getProducts(any()))
                    .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0));

            mockMvc.perform(get("/api/products").param("category", "no-such-category"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("query-string validation reaches the client as 400")
    class BadRequests {

        @Test
        @DisplayName("a negative page is refused")
        void negativePage() throws Exception {
            mockMvc.perform(get("/api/products").param("page", "-1"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("BAD_REQUEST"))
                    .andExpect(jsonPath("$.message").value(
                            org.hamcrest.Matchers.containsString("page")));
        }

        @Test
        @DisplayName("an inverted price range is refused")
        void invertedRange() throws Exception {
            mockMvc.perform(get("/api/products")
                            .param("minPrice", "999999")
                            .param("maxPrice", "1"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
        }

        @Test
        @DisplayName("an unknown sort is refused, and the message names the valid values")
        void unknownSort() throws Exception {
            mockMvc.perform(get("/api/products").param("sort", "newest"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(
                            org.hamcrest.Matchers.containsString("price-asc")));
        }

        @ParameterizedTest
        @ValueSource(strings = {"-1", "-0.01"})
        @DisplayName("a negative price bound is refused")
        void negativePrice(String value) throws Exception {
            mockMvc.perform(get("/api/products").param("minPrice", value))
                    .andExpect(status().isBadRequest());
        }

        /**
         * A price that is not a number fails to bind, which happens before any application code runs.
         * Spring MVC produces the 400 and {@code GlobalExceptionHandler.handleExceptionInternal}
         * re-bodies it — so the code is the status name and the message is its reason phrase, not the
         * parser's internals.
         */
        @Test
        @DisplayName("an unparseable price is 400 in the standard error shape")
        void unparseablePrice() throws Exception {
            mockMvc.perform(get("/api/products").param("minPrice", "not-a-number"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("BAD_REQUEST"))
                    .andExpect(jsonPath("$.message").value("Bad Request"))
                    .andExpect(jsonPath("$.timestamp").exists());
        }

        /**
         * An immoderate size is answered, not refused — the counterpart to every rejection above, and
         * the reason {@link ProductQuery} documents the two behaviours as a deliberate pair.
         */
        @Test
        @DisplayName("an oversized page size is accepted and clamped, not refused")
        void oversizedSizeIsClamped() throws Exception {
            when(productService.getProducts(any())).thenReturn(
                    new PageResponse<>(List.of(), 0, ProductQuery.MAX_PAGE_SIZE, 0, 0));

            mockMvc.perform(get("/api/products").param("size", "5000"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.size").value(ProductQuery.MAX_PAGE_SIZE));
        }
    }

    @Nested
    @DisplayName("GET /api/products/{slug}")
    class BySlug {

        @Test
        @DisplayName("returns the product when it exists")
        void found() throws Exception {
            when(productService.getProductBySlug("iphone-16-pro"))
                    .thenReturn(Optional.of(product("iphone-16-pro", "iPhone 16 Pro")));

            mockMvc.perform(get("/api/products/iphone-16-pro"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.slug").value("iphone-16-pro"))
                    .andExpect(jsonPath("$.name").value("iPhone 16 Pro"));
        }

        /**
         * The 404 body is empty by design — {@code ResponseEntity.notFound().build()} — and does
         * <em>not</em> carry the {@code ApiError} shape every other error does. That inconsistency is
         * real and is asserted rather than glossed over, so a later decision either way is a
         * deliberate one. See the deviations note in the chapter README.
         */
        @Test
        @DisplayName("returns an empty-bodied 404 for an unknown slug, not an ApiError")
        void notFoundHasNoBody() throws Exception {
            when(productService.getProductBySlug("no-such-product")).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/products/no-such-product"))
                    .andExpect(status().isNotFound())
                    .andExpect(content -> org.assertj.core.api.Assertions
                            .assertThat(content.getResponse().getContentAsString()).isEmpty());
        }

        @Test
        @DisplayName("does not require a token")
        void isPublic() throws Exception {
            when(productService.getProductBySlug("anything")).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/products/anything"))
                    .andExpect(status().isNotFound())
                    .andExpect(header().doesNotExist("WWW-Authenticate"));
        }
    }
}
