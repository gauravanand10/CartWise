package com.cartwise.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.cartwise.common.dto.ProductQuery;
import com.cartwise.entity.Product;
import com.cartwise.testsupport.DatabaseTest;
import com.cartwise.testsupport.ProductFixtures;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

/**
 * Free-text catalogue search, against a real PostgreSQL. Chapter 30.
 *
 * <p><strong>Why this needs a real database rather than a mock.</strong> Every claim here is a claim
 * about what PostgreSQL does with an {@code ILIKE} that Hibernate generated from a
 * {@code CriteriaBuilder}: the case-insensitivity, the wildcard escaping, and the interaction
 * between a {@code WHERE} clause and {@code LIMIT}/{@code OFFSET} are all database behaviour. A
 * mocked repository would assert that the mock behaves.
 *
 * <p><strong>What this closes.</strong> Until Chapter 30 the product endpoint had no text search at
 * all. Chapter 29 measured the consequence: {@code /search} ran against a 20-product static file
 * while the catalogue held 100, so 80 real products were findable on {@code /browse} and invisible
 * to search. The migration was blocked precisely because there was nothing to migrate to.
 */
@DatabaseTest
class ProductSearchRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void seed() {
        // The schema is shared across classes and each test rolls back; starting from a known-empty
        // table is what makes the counts below mean what they say.
        productRepository.deleteAll();
        productRepository.flush();

        save("s1", "Sony WH-1000XM6", "Sony", "Headphones", "32999.00");
        save("s2", "Samsung Galaxy S25 Ultra", "Samsung", "Smartphone", "129999.00");
        save("s3", "Samsung Galaxy Watch 8", "Samsung", "Smartwatch", "36999.00");
        save("s4", "Apple MacBook Air M4", "Apple", "Laptop", "114999.00");
    }

    private void save(String slug, String name, String brand, String category, String price) {
        productRepository.saveAndFlush(ProductFixtures.product()
                .slug(slug).name(name).brand(brand).category(category)
                .price(price).inStock(true).build());
    }

    private static ProductQuery query(
            String q, String category, String maxPrice, String sort, Integer page, Integer size) {
        return ProductQuery.of(
                q, category, null, null,
                maxPrice == null ? null : new BigDecimal(maxPrice),
                null, sort, page, size);
    }

    private Page<Product> find(ProductQuery q) {
        return productRepository.findAll(ProductSpecifications.from(q), q.toPageable());
    }

    /** Slugs matching a bare term, sorted so assertions do not depend on row order. */
    private List<String> slugsFor(String q) {
        return find(query(q, null, null, null, null, 50))
                .getContent().stream().map(Product::getSlug).sorted().toList();
    }

    @Test
    @DisplayName("an empty query is treated as absent and returns the whole catalogue")
    void emptyQueryReturnsEverything() {
        // A search box that submits an unfilled field must not return zero results.
        assertThat(slugsFor(null)).hasSize(4);
        assertThat(slugsFor("")).hasSize(4);
        assertThat(slugsFor("   ")).hasSize(4);
    }

    @Test
    @DisplayName("a partial word matches mid-name — the reason this is ILIKE and not full-text")
    void partialMatch() {
        // "xm6" sits inside a model designation. PostgreSQL full-text search tokenises
        // "WH-1000XM6" and would never match this fragment; substring matching is the semantics a
        // product-name search box actually has.
        assertThat(slugsFor("xm6")).containsExactly("s1");
        assertThat(slugsFor("galaxy")).containsExactly("s2", "s3");
        assertThat(slugsFor("macbook")).containsExactly("s4");
    }

    @Test
    @DisplayName("matching is case-insensitive")
    void caseInsensitive() {
        assertThat(slugsFor("SONY")).containsExactly("s1");
        assertThat(slugsFor("sony")).containsExactly("s1");
        assertThat(slugsFor("sOnY")).containsExactly("s1");
    }

    @Test
    @DisplayName("no match returns an empty page rather than an error")
    void noMatch() {
        Page<Product> page = find(query("nothing-matches-this", null, null, null, null, 50));

        assertThat(page.getContent()).isEmpty();
        assertThat(page.getTotalElements()).isZero();
        assertThat(page.getTotalPages()).isZero();
    }

    @Test
    @DisplayName("multiple words are ANDed, and each may match a different field")
    void multipleWordsAcrossFields() {
        // "sony" matches the brand and "headphones" matches the category. Neither field on its own
        // contains both terms, so this only works because every term is tested against all three.
        assertThat(slugsFor("sony headphones")).containsExactly("s1");

        // Order-independent by construction.
        assertThat(slugsFor("headphones sony")).containsExactly("s1");

        // Every term has to appear somewhere: this product is a Samsung, but not a laptop.
        assertThat(slugsFor("samsung laptop")).isEmpty();
    }

    @Test
    @DisplayName("LIKE wildcards in user input are escaped rather than honoured")
    void wildcardsAreEscaped() {
        // Unescaped, "%" would match every row and "_" every row of length >= 1 — which reads as a
        // broken search rather than a literal one that found nothing.
        assertThat(slugsFor("%")).isEmpty();
        assertThat(slugsFor("_")).isEmpty();
        assertThat(slugsFor("100%")).isEmpty();
    }

    @Test
    @DisplayName("search composes with the other filters instead of replacing them")
    void composesWithOtherFilters() {
        assertThat(find(query("galaxy", "smartwatch", null, null, null, 50)).getContent())
                .extracting(Product::getSlug).containsExactly("s3");

        // Both Galaxies match the term; the price ceiling removes the S25 Ultra at 129,999 and
        // leaves the Watch at 36,999. The filters intersect rather than either one winning.
        assertThat(find(query("galaxy", null, "100000", null, null, 50)).getContent())
                .extracting(Product::getSlug).containsExactly("s3");
    }

    /**
     * The interaction the chapter brief calls out specifically.
     *
     * <p>The total must be the count of MATCHING rows, not of the whole table. If it were the
     * table's count the UI would paginate over a number with no relationship to what it is showing
     * — offering page 5 of a search with four results.
     */
    @Test
    @DisplayName("pagination applies to the matched set, not the whole catalogue")
    void paginationAppliesToTheMatchedSet() {
        Page<Product> first = find(query("samsung", null, null, "name-asc", 0, 1));
        Page<Product> second = find(query("samsung", null, null, "name-asc", 1, 1));

        assertThat(first.getTotalElements()).isEqualTo(2);
        assertThat(first.getTotalPages()).isEqualTo(2);
        assertThat(first.getContent()).extracting(Product::getSlug).containsExactly("s2");

        assertThat(second.getTotalElements()).isEqualTo(2);
        assertThat(second.getContent()).extracting(Product::getSlug).containsExactly("s3");

        // Two pages of a two-row result share no row and cover the whole matched set.
        assertThat(first.getContent()).doesNotContainAnyElementsOf(second.getContent());
    }

    @Test
    @DisplayName("a term matching nothing still pages coherently rather than reporting the table size")
    void emptyResultPagesCoherently() {
        Page<Product> page = find(query("zzzz", null, null, "name-asc", 0, 20));

        assertThat(page.getTotalElements()).isZero();
        assertThat(page.getNumber()).isZero();
        assertThat(page.hasNext()).isFalse();
    }
}
