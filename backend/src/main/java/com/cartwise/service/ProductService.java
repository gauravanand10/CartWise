package com.cartwise.service;

import com.cartwise.common.dto.CategoryDto;
import com.cartwise.common.dto.PageResponse;
import com.cartwise.common.dto.ProductDto;
import com.cartwise.common.dto.ProductQuery;
import com.cartwise.repository.ProductRepository;
import com.cartwise.repository.ProductSpecifications;
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
 * <p>Chapter 20 makes good on the limit Chapter 17 stated. Filtering, sorting and pagination now
 * exist, and every one of them happens in the database — see {@link ProductSpecifications}. Search
 * by free text is still absent and is a later chapter: it is a different problem from filtering, and
 * doing it properly means a text index and a relevance ordering rather than a {@code LIKE '%…%'}
 * that cannot use an index and finds "pro" inside "Professional".
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * One page of the catalogue, filtered and ordered as the query asks.
     *
     * <p>Replaces Chapter 17's {@code getAllProducts()}. The old method is gone rather than kept
     * alongside this one: two ways to read the catalogue means two code paths that can disagree
     * about filtering, and the unpaged one is precisely the one that becomes a problem as the table
     * grows. The query object arrives already validated — see {@link ProductQuery#of} — so nothing
     * here re-checks bounds.
     *
     * <p>{@code page.map(...)} rather than mapping the content list: {@code Page.map} preserves the
     * paging metadata, where mapping {@code getContent()} would produce a plain list and lose the
     * totals this endpoint has to report.
     *
     * <p>Two SQL statements are issued per call — one for the rows, one {@code COUNT} for
     * {@code totalElements}. That is inherent to offset pagination that reports a total, and it is
     * the cost {@link PageResponse} documents.
     *
     * <p>{@code readOnly} marks the transaction as non-writing, which lets Hibernate skip dirty
     * checking on flush and tells the driver this connection will not need write locks.
     */
    @Transactional(readOnly = true)
    public PageResponse<ProductDto> getProducts(ProductQuery query) {
        return PageResponse.from(
                productRepository
                        .findAll(ProductSpecifications.from(query), query.toPageable())
                        .map(ProductMapper::toDto));
    }

    /**
     * Every category that has at least one product, with its count.
     *
     * <p>Aggregated by the database rather than by loading the catalogue and grouping in Java. The
     * in-memory version reads more simply and is wrong in the way that matters: it transfers every
     * product row to compute a handful of integers, and it gets slower in proportion to a catalogue
     * that this result does not even grow with.
     *
     * <p>No caching. The counts change whenever the catalogue does, and a cache would need
     * invalidation on every product write — machinery worth adding when there is a measurement
     * saying it is needed, not before.
     */
    @Transactional(readOnly = true)
    public List<CategoryDto> getCategories() {
        return productRepository.findCategoryCounts();
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
