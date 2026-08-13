package com.cartwise.controller;

import com.cartwise.common.dto.ProductDto;
import com.cartwise.service.ProductService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The catalogue over HTTP.
 *
 * <p>Two endpoints, and no logic in either — the class exists to map URLs to service calls and
 * service results to status codes. Anything more here would be business logic that only runs when
 * the request happens to arrive over the web.
 *
 * <p>Products are addressed by slug, never by the numeric id the DTO also carries. The React router
 * already uses {@code /product/:slug}, so an id-based path would force the frontend to resolve a
 * slug into an id before it could ask for anything.
 *
 * <p>Read-only. Create, update and delete are administrative operations that need authentication
 * and an audit trail before they need routes; they are not in this chapter.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * {@code GET /api/products} — the whole catalogue.
     *
     * <p>Always 200, with {@code []} when the catalogue is empty. An empty collection is a
     * successful answer to "what do you have", not a 404: the resource is the list, and the list
     * exists.
     */
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    /**
     * {@code GET /api/products/{slug}} — one product, or 404.
     *
     * <p>The empty {@code Optional} becomes a 404 here rather than an exception thrown in the
     * service, because "does not exist" is a fact about the answer and 404 is how HTTP states it.
     * The 404 body is empty by design: there is nothing to say beyond the status, and the frontend
     * already renders its own not-found screen for this exact case.
     */
    @GetMapping("/{slug}")
    public ResponseEntity<ProductDto> getProductBySlug(@PathVariable String slug) {
        return productService.getProductBySlug(slug)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
