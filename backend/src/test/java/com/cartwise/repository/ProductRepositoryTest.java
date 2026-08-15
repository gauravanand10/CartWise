package com.cartwise.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cartwise.common.dto.CategoryDto;
import com.cartwise.common.dto.ProductQuery;
import com.cartwise.common.dto.ProductSort;
import com.cartwise.entity.Product;
import com.cartwise.testsupport.DatabaseTest;
import com.cartwise.testsupport.ProductFixtures;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;

/**
 * The catalogue queries, against a real PostgreSQL.
 *
 * <p>This is the layer where a mock would prove nothing. Every claim here — that {@code lower()}
 * comparisons match, that the ordering is what it says it is, that a page boundary does not drop a
 * row — is a claim about what PostgreSQL does with the SQL Hibernate generates, and the only way to
 * check it is to ask PostgreSQL. Running it against an in-memory substitute would assert that the
 * substitute behaves, which is precisely the claim nobody wanted.
 */
@DatabaseTest
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void clearCatalogue() {
        // The schema is created once per context and shared across classes. Each test rolls back, so
        // this only matters for rows the *seed* would have left — there are none, since the test
        // profile sets sql.init.mode: never — but starting from a known-empty table makes the counts
        // in these assertions mean what they say.
        productRepository.deleteAll();
        productRepository.flush();
    }

    private Product save(Product product) {
        return productRepository.saveAndFlush(product);
    }

    private Page<Product> find(ProductQuery query) {
        return productRepository.findAll(ProductSpecifications.from(query), query.toPageable());
    }

    private static ProductQuery query(
            String category, String brand, String min, String max, Boolean inStock, String sort,
            Integer page, Integer size) {
        return ProductQuery.of(
                category,
                brand,
                min == null ? null : new BigDecimal(min),
                max == null ? null : new BigDecimal(max),
                inStock,
                sort,
                page,
                size);
    }

    @Nested
    @DisplayName("findBySlug")
    class FindBySlug {

        @Test
        @DisplayName("finds the product with that slug")
        void findsBySlug() {
            save(ProductFixtures.product().slug("iphone-16-pro").name("iPhone 16 Pro").build());

            assertThat(productRepository.findBySlug("iphone-16-pro"))
                    .get()
                    .extracting(Product::getName)
                    .isEqualTo("iPhone 16 Pro");
        }

        @Test
        @DisplayName("returns empty for an unknown slug")
        void emptyForUnknownSlug() {
            assertThat(productRepository.findBySlug("no-such-product")).isEmpty();
        }

        /**
         * The slug column is compared byte-for-byte by PostgreSQL, so lookup is case-sensitive.
         * Asserted because it is the reason slugs are generated lower-cased everywhere rather than
         * being normalised at query time.
         */
        @Test
        @DisplayName("is case-sensitive, as the column is")
        void slugLookupIsCaseSensitive() {
            save(ProductFixtures.product().slug("iphone-16-pro").build());

            assertThat(productRepository.findBySlug("iPhone-16-Pro")).isEmpty();
        }
    }

    /**
     * The unique constraint is the real guarantee behind {@code /product/:slug} being unambiguous.
     * The service-layer checks elsewhere make the ordinary case give a clearer error; this is what
     * makes the duplicate impossible rather than merely unlikely.
     */
    @Test
    @DisplayName("the database refuses two products with the same slug")
    void slugIsUniqueAtTheDatabaseLevel() {
        save(ProductFixtures.product().slug("duplicate-me").name("First").build());

        assertThatThrownBy(() ->
                save(ProductFixtures.product().slug("duplicate-me").name("Second").build()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Nested
    @DisplayName("filters reach the database and compose")
    class Filtering {

        @BeforeEach
        void seed() {
            save(ProductFixtures.product().slug("a").name("Apple Phone").brand("Apple")
                    .category("Smartphone").price("100.00").inStock(true).build());
            save(ProductFixtures.product().slug("b").name("Apple Laptop").brand("Apple")
                    .category("Laptop").price("200.00").inStock(true).build());
            save(ProductFixtures.product().slug("c").name("Sony Headphones").brand("Sony")
                    .category("Headphones").price("300.00").inStock(false).build());
            save(ProductFixtures.product().slug("d").name("Sony Fridge").brand("Sony")
                    .category("Home Appliances").price("400.00").inStock(true).build());
        }

        @Test
        @DisplayName("no filters returns everything")
        void noFiltersReturnsAll() {
            assertThat(find(query(null, null, null, null, null, null, null, null)).getTotalElements())
                    .isEqualTo(4);
        }

        @Test
        @DisplayName("category filter matches by slug, case-insensitively")
        void categoryFilter() {
            assertThat(find(query("smartphone", null, null, null, null, null, null, null)))
                    .extracting(Product::getSlug)
                    .containsExactly("a");
        }

        /**
         * The slug-to-name conversion, checked against a real comparison rather than in Java. A
         * two-word category is where {@code CategorySlug.toComparableName} earns its place: the URL
         * carries {@code home-appliances} and the column holds {@code Home Appliances}.
         */
        @Test
        @DisplayName("a multi-word category matches through its hyphenated slug")
        void multiWordCategoryFilter() {
            assertThat(find(query("home-appliances", null, null, null, null, null, null, null)))
                    .extracting(Product::getSlug)
                    .containsExactly("d");
        }

        @Test
        @DisplayName("brand filter is case-insensitive")
        void brandFilterIsCaseInsensitive() {
            assertThat(find(query(null, "apple", null, null, null, null, null, null)))
                    .extracting(Product::getSlug)
                    .containsExactlyInAnyOrder("a", "b");

            assertThat(find(query(null, "APPLE", null, null, null, null, null, null)))
                    .hasSize(2);
        }

        /**
         * Both bounds are inclusive, as the parameter names say. Asserted at the exact boundary
         * values, which is the only place an off-by-one in the comparison operator would show.
         */
        @Test
        @DisplayName("the price range is inclusive at both ends")
        void priceRangeIsInclusive() {
            assertThat(find(query(null, null, "200.00", "300.00", null, null, null, null)))
                    .extracting(Product::getSlug)
                    .containsExactlyInAnyOrder("b", "c");
        }

        @Test
        @DisplayName("minPrice alone is an open-ended range")
        void minPriceOnly() {
            assertThat(find(query(null, null, "300.00", null, null, null, null, null)))
                    .extracting(Product::getSlug)
                    .containsExactlyInAnyOrder("c", "d");
        }

        @Test
        @DisplayName("inStock=true excludes out-of-stock products")
        void inStockTrueFilters() {
            assertThat(find(query(null, null, null, null, true, null, null, null)))
                    .extracting(Product::getSlug)
                    .containsExactlyInAnyOrder("a", "b", "d");
        }

        /**
         * {@code ?inStock=false} means "do not apply this filter", not "show me out-of-stock items" —
         * there is deliberately no way to ask for only unavailable products. The unit test asserts the
         * value is carried through; this asserts what the database is actually asked.
         */
        @Test
        @DisplayName("inStock=false applies no filter at all")
        void inStockFalseIsNoFilter() {
            assertThat(find(query(null, null, null, null, false, null, null, null)))
                    .hasSize(4);
        }

        @Test
        @DisplayName("several filters compose as AND")
        void filtersCompose() {
            assertThat(find(query(null, "sony", "350.00", null, true, null, null, null)))
                    .extracting(Product::getSlug)
                    .containsExactly("d");
        }

        @Test
        @DisplayName("filters that match nothing return an empty page, not an error")
        void noMatchesIsEmpty() {
            Page<Product> page = find(query("smartphone", "sony", null, null, null, null, null, null));

            assertThat(page).isEmpty();
            assertThat(page.getTotalElements()).isZero();
        }
    }

    @Nested
    @DisplayName("ordering")
    class Ordering {

        /**
         * <strong>The bug this ordering was written to fix, reproduced as a test.</strong> A plain
         * {@code ORDER BY name} under this database's collation sorts by byte value, so every capital
         * letter precedes every lowercase one and {@code "iPhone 16 Pro"} lands <em>after</em>
         * {@code "Sony WH-1000XM6"} — last in a list labelled A–Z. Ordering by {@code lower(name)}
         * is what puts it where a reader expects.
         *
         * <p>These three names are chosen so the two orderings disagree: byte order gives Apple,
         * Sony, iPhone; case-insensitive order gives Apple, iPhone, Sony.
         */
        @Test
        @DisplayName("name-asc is case-insensitive, so a lowercase initial is not sorted last")
        void nameAscIgnoresCase() {
            save(ProductFixtures.product().slug("s").name("Sony WH-1000XM6").build());
            save(ProductFixtures.product().slug("i").name("iPhone 16 Pro").build());
            save(ProductFixtures.product().slug("a").name("AirPods Pro 3").build());

            assertThat(find(query(null, null, null, null, null, "name-asc", null, null)))
                    .extracting(Product::getName)
                    .containsExactly("AirPods Pro 3", "iPhone 16 Pro", "Sony WH-1000XM6");
        }

        @Test
        @DisplayName("price-asc orders cheapest first")
        void priceAsc() {
            save(ProductFixtures.product().slug("c").price("300.00").build());
            save(ProductFixtures.product().slug("a").price("100.00").build());
            save(ProductFixtures.product().slug("b").price("200.00").build());

            assertThat(find(query(null, null, null, null, null, "price-asc", null, null)))
                    .extracting(Product::getSlug)
                    .containsExactly("a", "b", "c");
        }

        @Test
        @DisplayName("price-desc orders most expensive first")
        void priceDesc() {
            save(ProductFixtures.product().slug("a").price("100.00").build());
            save(ProductFixtures.product().slug("c").price("300.00").build());

            assertThat(find(query(null, null, null, null, null, "price-desc", null, null)))
                    .extracting(Product::getSlug)
                    .containsExactly("c", "a");
        }

        @Test
        @DisplayName("rating-desc orders best rated first")
        void ratingDesc() {
            save(ProductFixtures.product().slug("low").rating("3.1").build());
            save(ProductFixtures.product().slug("high").rating("4.9").build());

            assertThat(find(query(null, null, null, null, null, "rating-desc", null, null)))
                    .extracting(Product::getSlug)
                    .containsExactly("high", "low");
        }
    }

    /**
     * The pagination guarantees, and the tie-breaker that makes them possible.
     *
     * <p>Every product here carries the <em>same price</em>, so the primary ordering can distinguish
     * none of them. That is the whole point: with nothing to break the tie, PostgreSQL is free to
     * return equal rows in any order it likes, and it does not have to pick the same order twice.
     * Thirty rows is enough that the sort genuinely reorders them rather than incidentally preserving
     * insertion order.
     */
    @Nested
    @DisplayName("pagination over tied rows")
    class TiedPagination {

        private static final int ROWS = 30;
        private static final int PAGE_SIZE = 4;

        @BeforeEach
        void seedTiedProducts() {
            for (int i = 0; i < ROWS; i++) {
                save(ProductFixtures.product()
                        .slug("tied-" + i)
                        .name("Tied Product " + i)
                        .price("499.00")          // identical for every row
                        .rating("4.0")            // identical too, so rating-desc ties as well
                        .build());
            }
        }

        /**
         * The direct assertion: among rows the primary sort cannot separate, the order is by id
         * ascending. Remove {@code sort.and(Sort.by(ASC, "id"))} from {@link ProductSort} and this is
         * the test that goes red.
         */
        @Test
        @DisplayName("ties are broken by id, ascending")
        void tiesAreOrderedById() {
            List<Product> all = find(query(null, null, null, null, null, "price-asc", 0, 100))
                    .getContent();

            assertThat(all).hasSize(ROWS);
            assertThat(all).extracting(Product::getId).isSorted();
        }

        @Test
        @DisplayName("the same is true for rating-desc")
        void tiesAreOrderedByIdForRatingSort() {
            List<Product> all = find(query(null, null, null, null, null, "rating-desc", 0, 100))
                    .getContent();

            assertThat(all).extracting(Product::getId).isSorted();
        }

        /**
         * The consequence a user would actually notice. Walking every page must visit each product
         * exactly once — no row on two pages, none missing from all of them. Without a total order
         * this is exactly what breaks, and it breaks intermittently, which is how the bug survives
         * testing and reaches production.
         */
        @Test
        @DisplayName("walking every page visits each product exactly once")
        void pagesDoNotDropOrDuplicateRows() {
            List<Long> seen = new ArrayList<>();
            int pages = (ROWS + PAGE_SIZE - 1) / PAGE_SIZE;

            for (int page = 0; page < pages; page++) {
                find(query(null, null, null, null, null, "price-asc", page, PAGE_SIZE))
                        .forEach(product -> seen.add(product.getId()));
            }

            Set<Long> unique = new HashSet<>(seen);

            assertThat(seen).as("no row appeared on two pages").hasSameSizeAs(unique);
            assertThat(seen).as("every row appeared on some page").hasSize(ROWS);
        }

        /**
         * Re-requesting the same page must give the same rows. A repeat request is what a user
         * generates by pressing back, or by two components on one screen asking for the same page.
         */
        @Test
        @DisplayName("the same page requested twice returns the same rows in the same order")
        void pagesAreRepeatable() {
            var first = find(query(null, null, null, null, null, "price-asc", 3, PAGE_SIZE))
                    .getContent().stream().map(Product::getId).toList();
            var again = find(query(null, null, null, null, null, "price-asc", 3, PAGE_SIZE))
                    .getContent().stream().map(Product::getId).toList();

            assertThat(again).containsExactlyElementsOf(first);
        }

        @Test
        @DisplayName("reports the total across every page, not the size of one")
        void totalsDescribeTheWholeResult() {
            Page<Product> page = find(query(null, null, null, null, null, "price-asc", 0, PAGE_SIZE));

            assertThat(page.getContent()).hasSize(PAGE_SIZE);
            assertThat(page.getTotalElements()).isEqualTo(ROWS);
            assertThat(page.getTotalPages()).isEqualTo(8);   // ceil(30 / 4)
            assertThat(page.getNumber()).isZero();
        }

        @Test
        @DisplayName("a page past the end is empty but still reports the true total")
        void pagePastTheEndIsEmpty() {
            Page<Product> page = find(query(null, null, null, null, null, "price-asc", 99, PAGE_SIZE));

            assertThat(page.getContent()).isEmpty();
            assertThat(page.getTotalElements()).isEqualTo(ROWS);
        }
    }

    @Nested
    @DisplayName("findCategoryCounts")
    class CategoryCounts {

        @BeforeEach
        void seed() {
            save(ProductFixtures.product().slug("p1").category("Smartphone").build());
            save(ProductFixtures.product().slug("p2").category("Smartphone").build());
            save(ProductFixtures.product().slug("p3").category("Laptop").build());
            save(ProductFixtures.product().slug("p4").category("Home Appliances").build());
        }

        @Test
        @DisplayName("groups by category with a count each, alphabetically")
        void groupsAndCounts() {
            List<CategoryDto> categories = productRepository.findCategoryCounts();

            assertThat(categories)
                    .extracting(CategoryDto::name, CategoryDto::productCount)
                    .containsExactly(
                            org.assertj.core.api.Assertions.tuple("Home Appliances", 1L),
                            org.assertj.core.api.Assertions.tuple("Laptop", 1L),
                            org.assertj.core.api.Assertions.tuple("Smartphone", 2L));
        }

        /**
         * The slug is computed in SQL — {@code lower(replace(name, ' ', '-'))} — and must agree with
         * {@code CategorySlug.toSlug}, which is the same transformation written in Java. They are a
         * genuine duplication; a multi-word category is where they would first disagree.
         */
        @Test
        @DisplayName("computes the slug in SQL, matching CategorySlug.toSlug")
        void slugMatchesTheJavaTransformation() {
            List<CategoryDto> categories = productRepository.findCategoryCounts();

            assertThat(categories)
                    .extracting(CategoryDto::slug)
                    .containsExactly("home-appliances", "laptop", "smartphone");

            categories.forEach(category -> assertThat(category.slug())
                    .isEqualTo(com.cartwise.common.CategorySlug.toSlug(category.name())));
        }

        /**
         * Every product has exactly one non-null category, so the counts sum to the catalogue size.
         * That identity is what makes this endpoint checkable against {@code totalElements} from
         * {@code GET /api/products}.
         */
        @Test
        @DisplayName("the counts sum to the number of products")
        void countsSumToTheCatalogue() {
            long summed = productRepository.findCategoryCounts().stream()
                    .mapToLong(CategoryDto::productCount)
                    .sum();

            assertThat(summed).isEqualTo(productRepository.count());
        }

        @Test
        @DisplayName("an empty catalogue produces no categories")
        void emptyCatalogueHasNoCategories() {
            productRepository.deleteAll();
            productRepository.flush();

            assertThat(productRepository.findCategoryCounts()).isEmpty();
        }
    }
}
