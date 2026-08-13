package com.cartwise.service;

import com.cartwise.common.dto.ProductDto;
import com.cartwise.repository.ProductRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Catalogue reads.
 *
 * <p>Thin, and honestly so: Chapter 17 exposes the catalogue, it does not yet make decisions about
 * it. The class still earns its place by owning the entity → DTO boundary, which is the rule the
 * controller must not be allowed to break — the moment a controller returns a {@code Product},
 * Hibernate's proxies and the database's column names become the public API.
 *
 * <p>Filtering, search, sorting and pagination are deliberately absent. The frontend does all four
 * today against its mock catalogue, and each one is a query-design decision (which index, which
 * default order, cursor or offset) that Chapter 19 makes with a real screen to measure it against.
 * Returning the whole catalogue is defensible at eight rows and would not be at eight thousand;
 * that is a limit this chapter states rather than one it hides.
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Every product in the catalogue, in whatever order the database returns them.
     *
     * <p>Unordered on purpose rather than by oversight: there is no natural ordering the frontend
     * asks for yet, and inventing one here ("newest first", "highest rated") would be a product
     * decision made in a service method. Chapter 19 adds sorting as an explicit parameter.
     *
     * <p>{@code readOnly} marks the transaction as non-writing, which lets Hibernate skip dirty
     * checking on flush and tells the driver this connection will not need write locks.
     */
    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream().map(ProductMapper::toDto).toList();
    }

    /**
     * One product by its URL identity.
     *
     * <p>{@code Optional} rather than a thrown exception, because an unknown slug is an ordinary
     * outcome of someone editing a URL, not a failure. The controller turns the empty case into a
     * 404; deciding that here would mean the service knew about HTTP.
     */
    @Transactional(readOnly = true)
    public Optional<ProductDto> getProductBySlug(String slug) {
        return productRepository.findBySlug(slug).map(ProductMapper::toDto);
    }
}
