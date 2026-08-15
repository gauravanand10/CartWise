package com.cartwise.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cartwise.common.dto.CategoryDto;
import com.cartwise.service.ProductService;
import com.cartwise.testsupport.ControllerTestBase;
import com.cartwise.testsupport.WithCartwiseSecurity;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * The category list, and the {@code SecurityConfig} line it needs all to itself.
 *
 * <p>The catalogue permit rules name {@code /api/products} and {@code /api/products/*} explicitly
 * rather than using a wildcard, so a new top-level route inherits nothing. Without its own
 * {@code .requestMatchers(GET, "/api/categories").permitAll()} this endpoint falls through to
 * {@code anyRequest().authenticated()} and the home page's category tiles get 401 — a whole surface
 * broken by an omission that looks like nothing. That line is what the first test here pins.
 */
@WebMvcTest(CategoryController.class)
@WithCartwiseSecurity
class CategoryControllerTest extends ControllerTestBase {

    @MockitoBean
    private ProductService productService;

    @Test
    @DisplayName("GET /api/categories needs no token")
    void isPublic() throws Exception {
        when(productService.getCategories()).thenReturn(List.of());

        mockMvc.perform(get("/api/categories")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("returns each category with its slug and count")
    void returnsCategories() throws Exception {
        when(productService.getCategories()).thenReturn(List.of(
                new CategoryDto("Headphones", "headphones", 2),
                new CategoryDto("Home Appliances", "home-appliances", 1),
                new CategoryDto("Smartphone", "smartphone", 3)));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].name").value("Headphones"))
                .andExpect(jsonPath("$[0].slug").value("headphones"))
                .andExpect(jsonPath("$[0].productCount").value(2))
                .andExpect(jsonPath("$[1].slug").value("home-appliances"));
    }

    /**
     * An empty catalogue is 200 with {@code []}, not 404: the set of categories exists and happens to
     * have no members.
     */
    @Test
    @DisplayName("an empty catalogue is 200 with an empty array")
    void emptyIsOk() throws Exception {
        when(productService.getCategories()).thenReturn(List.of());

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    /**
     * The permit names the GET method specifically, so a write to the same path is not public. There
     * is no POST handler, and the authorization rules refuse the request before routing could say so.
     */
    @Test
    @DisplayName("POST /api/categories is not covered by the read permit")
    void writeIsNotPublic() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }
}
