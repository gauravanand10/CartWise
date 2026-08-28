package com.cartwise.controller;

import com.cartwise.common.dto.PageResponse;
import com.cartwise.common.dto.ProductDto;
import com.cartwise.common.dto.ProductQuery;
import com.cartwise.common.dto.ProductSort;
import com.cartwise.service.ProductService;
import java.math.BigDecimal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
 *
 * <p>Both routes are public, and remain so after Chapter 19 added role-based authorization —
 * {@code SecurityConfig} still permits {@code GET /api/products} and {@code /api/products/*} by
 * name. Shoppers browse before they have accounts, and a catalogue behind a login is not a
 * catalogue. The query parameters added in Chapter 20 do not change that: filtering discloses
 * nothing that listing everything did not already.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * {@code GET /api/products} — a filtered, sorted, paged slice of the catalogue.
     *
     * <p><strong>The response shape changed in Chapter 20 and this is a breaking change.</strong>
     * Chapter 17 returned a bare JSON array; this returns a {@link PageResponse} envelope. Any
     * client calling {@code .map()} on the response body breaks. There is deliberately no second
     * endpoint serving the old shape — see {@link PageResponse} for why a compatibility route would
     * have been the worse choice.
     *
     * <p>Every parameter is optional and every one of them ends up in the SQL rather than in a Java
     * filter. Unset parameters contribute no predicate at all.
     *
     * <p>Always 200 for a well-formed request, including when nothing matches — {@code content} is
     * then {@code []}. <strong>An unknown category is emphatically not a 404.</strong> The resource
     * being addressed is the catalogue, and the catalogue exists; a filter that selects nothing from
     * it has succeeded at selecting nothing. Answering 404 would also make this endpoint a probe for
     * which category names exist.
     *
     * <p>400 for a request that cannot be interpreted: a negative page, a negative price, an
     * inverted price range, or an unrecognised {@code sort}. The rules and the reasoning behind
     * clamping {@code size} instead of rejecting it are in {@link ProductQuery#of}.
     *
     * <p>{@code BigDecimal} for the price bounds, matching the column. Binding these as
     * {@code double} would reintroduce, at the API boundary, exactly the precision problem the
     * {@code numeric(12,2)} column exists to avoid. A price that is not a number fails to bind and
     * Spring MVC's own handling answers 400.
     *
     * @param q        free-text search across name, brand and category. Multiple words are ANDed
     *                 and each may match a different field, so {@code sony headphones} finds the
     *                 WH-1000XM6. Blank is treated as absent. Chapter 30 — before it, {@code /search}
     *                 ran on a 20-product mock file because this endpoint could not answer a text
     *                 query at all
     * @param category one category slug, e.g. {@code smartphone}; matched case-insensitively
     * @param brand    one brand name, matched case-insensitively
     * @param minPrice inclusive lower bound
     * @param maxPrice inclusive upper bound
     * @param inStock  {@code true} to exclude out-of-stock products; {@code false} and absent are
     *                 both "no filter"
     * @param sort     one of {@code price-asc}, {@code price-desc}, {@code rating-desc},
     *                 {@code name-asc}; defaults to {@code name-asc}
     * @param page     zero-indexed, defaults to 0
     * @param size     defaults to 20, clamped to 100
     */
    @GetMapping
    public ResponseEntity<PageResponse<ProductDto>> getProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        ProductQuery query = ProductQuery.of(
                q, category, brand, minPrice, maxPrice, inStock, sort, page, size);

        return ResponseEntity.ok(productService.getProducts(query));
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
