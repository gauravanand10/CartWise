package com.cartwise.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.cartwise.common.dto.CategoryDto;
import com.cartwise.common.dto.PageResponse;
import com.cartwise.common.dto.ProductDto;
import com.cartwise.common.dto.ProductQuery;
import com.cartwise.entity.Product;
import com.cartwise.repository.ProductRepository;
import com.cartwise.testsupport.ProductFixtures;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

/**
 * The catalogue read service.
 *
 * <p>The repository is mocked, which decides what this test can honestly claim. It can prove that a
 * {@link Page} of entities becomes a {@link PageResponse} of DTOs with its paging metadata intact,
 * and that an absent product becomes an empty {@link Optional}. It cannot prove that the filters
 * reach the database or that the ordering is what PostgreSQL applies — a mock returns whatever it was
 * told to regardless of the specification handed to it. Those are claims about SQL, and they are
 * asserted in {@code ProductRepositoryTest} against a real database.
 *
 * <p>Stating that split matters, because the tempting version of this test — capture the
 * {@code Specification} and assert something about it — would look like filter coverage and be
 * nothing of the kind.
 */
class ProductServiceTest {

    private final ProductRepository productRepository = mock(ProductRepository.class);
    private final ProductService productService = new ProductService(productRepository);

    private static final ProductQuery ANY_QUERY =
            ProductQuery.of(null, null, null, null, null, null, null, null, null);

    @Nested
    @DisplayName("getProducts")
    class GetProducts {

        @Test
        @DisplayName("maps entities to DTOs")
        void mapsEntitiesToDtos() {
            Product product = ProductFixtures.product()
                    .slug("iphone-16-pro")
                    .name("iPhone 16 Pro")
                    .brand("Apple")
                    .price("119900.00")
                    .buildWithId(1L);

            givenPage(new PageImpl<>(List.of(product), PageRequest.of(0, 20), 1));

            PageResponse<ProductDto> response = productService.getProducts(ANY_QUERY);

            assertThat(response.content()).singleElement().satisfies(dto -> {
                assertThat(dto.id()).isEqualTo(1L);
                assertThat(dto.slug()).isEqualTo("iphone-16-pro");
                assertThat(dto.name()).isEqualTo("iPhone 16 Pro");
                assertThat(dto.brand()).isEqualTo("Apple");
                assertThat(dto.price()).isEqualByComparingTo("119900.00");
            });
        }

        /**
         * {@code Page.map} rather than mapping {@code getContent()}: the latter produces a plain list
         * and loses exactly the totals this endpoint exists to report. A regression there would leave
         * the content correct and the pager broken.
         */
        @Test
        @DisplayName("preserves the paging metadata")
        void preservesPagingMetadata() {
            List<Product> content = List.of(
                    ProductFixtures.product().slug("a").buildWithId(1L),
                    ProductFixtures.product().slug("b").buildWithId(2L));

            givenPage(new PageImpl<>(content, PageRequest.of(2, 5), 42));

            PageResponse<ProductDto> response = productService.getProducts(ANY_QUERY);

            assertThat(response.page()).isEqualTo(2);
            assertThat(response.size()).isEqualTo(5);
            assertThat(response.totalElements()).isEqualTo(42);
            assertThat(response.totalPages()).isEqualTo(9);   // ceil(42 / 5)
            assertThat(response.content()).hasSize(2);
        }

        /**
         * Nothing matching is a successful answer, not an error and not a 404 — the catalogue exists,
         * and a filter that selects nothing has succeeded at selecting nothing.
         */
        @Test
        @DisplayName("returns an empty page rather than failing when nothing matches")
        void emptyResultIsAnEmptyPage() {
            givenPage(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

            PageResponse<ProductDto> response = productService.getProducts(ANY_QUERY);

            assertThat(response.content()).isEmpty();
            assertThat(response.totalElements()).isZero();
            assertThat(response.totalPages()).isZero();
        }

        @Test
        @DisplayName("keeps the order the repository returned")
        void orderIsPreserved() {
            List<Product> ordered = List.of(
                    ProductFixtures.product().slug("first").name("AAA").buildWithId(1L),
                    ProductFixtures.product().slug("second").name("BBB").buildWithId(2L),
                    ProductFixtures.product().slug("third").name("CCC").buildWithId(3L));

            givenPage(new PageImpl<>(ordered, PageRequest.of(0, 20), 3));

            assertThat(productService.getProducts(ANY_QUERY).content())
                    .extracting(ProductDto::slug)
                    .containsExactly("first", "second", "third");
        }

        /**
         * The specification matcher is the untyped {@code any()} rather than
         * {@code any(Specification.class)}, and the difference is not cosmetic.
         * {@code ProductSpecifications.from} returns <strong>null</strong> for a query with no
         * filters — that is how a bare {@code SELECT} with no {@code WHERE} clause is expressed — and
         * Mockito's typed {@code any(Class)} does not match null. Stubbing with the typed matcher
         * leaves every unfiltered call unstubbed and returning null, which surfaces as a
         * {@code NullPointerException} inside the service rather than as a stubbing mistake.
         */
        private void givenPage(Page<Product> page) {
            when(productRepository.findAll(
                    ArgumentMatchers.<Specification<Product>>any(), any(Pageable.class)))
                    .thenReturn(page);
        }
    }

    @Nested
    @DisplayName("getProductBySlug")
    class GetBySlug {

        @Test
        @DisplayName("returns the mapped product when it exists")
        void presentWhenFound() {
            when(productRepository.findBySlug("iphone-16-pro")).thenReturn(
                    Optional.of(ProductFixtures.product()
                            .slug("iphone-16-pro")
                            .name("iPhone 16 Pro")
                            .buildWithId(1L)));

            assertThat(productService.getProductBySlug("iphone-16-pro"))
                    .get()
                    .extracting(ProductDto::name)
                    .isEqualTo("iPhone 16 Pro");
        }

        /**
         * Empty rather than a thrown exception: an unknown slug is an ordinary outcome of someone
         * editing a URL. Turning it into a 404 is the controller's decision, and a service that threw
         * here would be a service that knew about HTTP.
         */
        @Test
        @DisplayName("returns empty for an unknown slug rather than throwing")
        void emptyWhenMissing() {
            when(productRepository.findBySlug("no-such-product")).thenReturn(Optional.empty());

            assertThat(productService.getProductBySlug("no-such-product")).isEmpty();
        }
    }

    @Nested
    @DisplayName("getCategories")
    class GetCategories {

        @Test
        @DisplayName("returns what the aggregate query produced")
        void returnsAggregatedCategories() {
            when(productRepository.findCategoryCounts()).thenReturn(List.of(
                    new CategoryDto("Headphones", "headphones", 2),
                    new CategoryDto("Smartphone", "smartphone", 3)));

            assertThat(productService.getCategories())
                    .extracting(CategoryDto::slug, CategoryDto::productCount)
                    .containsExactly(
                            org.assertj.core.api.Assertions.tuple("headphones", 2L),
                            org.assertj.core.api.Assertions.tuple("smartphone", 3L));
        }

        @Test
        @DisplayName("returns an empty list for an empty catalogue")
        void emptyCatalogueGivesEmptyList() {
            when(productRepository.findCategoryCounts()).thenReturn(List.of());

            assertThat(productService.getCategories()).isEmpty();
        }
    }
}
