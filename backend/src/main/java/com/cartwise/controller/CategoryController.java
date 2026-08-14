package com.cartwise.controller;

import com.cartwise.common.dto.CategoryDto;
import com.cartwise.service.ProductService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The catalogue's categories, for the browse surface to navigate by.
 *
 * <p>Its own controller at {@code /api/categories} rather than a {@code /api/products/categories}
 * sub-route, because the resource being addressed is the set of categories, not a property of the
 * products collection. A client fetching the home page's category tiles is not asking about
 * products.
 *
 * <p>It delegates to {@code ProductService} all the same, and that is the honest arrangement rather
 * than an inconsistency: categories are derived entirely from the products table, so a
 * {@code CategoryService} would be a class holding one method that forwards to the product
 * repository. The URL reflects the resource; the service layer reflects where the data lives.
 *
 * <p>Public, like the catalogue itself. It has to be permitted explicitly in {@code SecurityConfig}
 * — the existing rules name {@code /api/products} and {@code /api/products/*} rather than using a
 * wildcard, so a new top-level route inherits nothing and would otherwise fall through to
 * {@code anyRequest().authenticated()} and answer 401.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final ProductService productService;

    public CategoryController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * {@code GET /api/categories} — every category with at least one product, alphabetically.
     *
     * <p>Always 200. {@code []} when the catalogue is empty, which is a true answer rather than a
     * 404: the set of categories exists and happens to have no members.
     *
     * <p>The counts are computed per request and sum to the total number of products, because every
     * product has exactly one non-null category. That identity is worth knowing — it is what makes
     * this endpoint checkable against {@code GET /api/products}'s {@code totalElements}.
     *
     * <p>A category with no products cannot appear here, since it exists only as a value on a
     * product row. That limit is a consequence of having no categories table and is documented on
     * {@link CategoryDto}, where the decision was made.
     */
    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }
}
