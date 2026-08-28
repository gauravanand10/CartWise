package com.cartwise.common.dto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.Pageable;

/**
 * Validation of the catalogue query, and specifically the line between clamping and rejecting.
 *
 * <p>{@link ProductQuery} documents that rule as deliberate — clamp what is merely immoderate, reject
 * what is incoherent — which makes it exactly the kind of decision that decays silently. A later
 * change that clamps a negative page instead of rejecting it would break no compilation and no other
 * test; these assertions are what makes that change visible.
 */
class ProductQueryTest {

    /** The eight-argument factory is verbose; these keep each test to the one input it is about. */
    private static ProductQuery query() {
        return ProductQuery.of(null, null, null, null, null, null, null, null, null);
    }

    private static ProductQuery withPaging(Integer page, Integer size) {
        return ProductQuery.of(null, null, null, null, null, null, null, page, size);
    }

    private static ProductQuery withPrices(BigDecimal min, BigDecimal max) {
        return ProductQuery.of(null, null, null, min, max, null, null, null, null);
    }

    @Nested
    @DisplayName("defaults, when nothing is asked for")
    class Defaults {

        @Test
        @DisplayName("page 0, the default size, and the default sort")
        void unspecifiedQueryUsesDefaults() {
            ProductQuery result = query();

            assertThat(result.page()).isZero();
            assertThat(result.size()).isEqualTo(ProductQuery.DEFAULT_PAGE_SIZE);
            assertThat(result.sort()).isEqualTo(ProductQuery.DEFAULT_SORT);
        }

        @Test
        @DisplayName("no filters at all")
        void unspecifiedQueryHasNoFilters() {
            ProductQuery result = query();

            assertThat(result.categorySlug()).isNull();
            assertThat(result.brand()).isNull();
            assertThat(result.minPrice()).isNull();
            assertThat(result.maxPrice()).isNull();
            assertThat(result.inStockOnly()).isNull();
        }

        /**
         * The default sort is alphabetical rather than "whatever the database returns". Pinned as its
         * own assertion because pagination is only meaningful over a total order — an unsorted
         * default would make page boundaries undefined, which is the failure this constant prevents.
         */
        @Test
        @DisplayName("the default ordering is name-asc, not database order")
        void defaultSortIsDeterministic() {
            assertThat(ProductQuery.DEFAULT_SORT).isEqualTo(ProductSort.NAME_ASC);
        }
    }

    @Nested
    @DisplayName("size is clamped, never rejected")
    class SizeClamping {

        @ParameterizedTest
        @CsvSource({
                "1,   1",
                "20,  20",
                "100, 100",
                "101, 100",
                "5000, 100",
                "2147483647, 100",
                "0,   1",
                "-1,  1",
                "-2147483648, 1"
        })
        @DisplayName("any requested size lands inside the permitted range")
        void sizeIsClampedToRange(int requested, int expected) {
            assertThat(withPaging(null, requested).size()).isEqualTo(expected);
        }

        /**
         * The distinction that matters: an immoderate size is answered, not refused. A browse API
         * that 400s a caller for asking for too many items is hostile to the casual client poking at
         * it, and the response echoes the size actually applied so nothing is concealed.
         */
        @ParameterizedTest
        @ValueSource(ints = {0, -1, 5000})
        @DisplayName("an out-of-range size does not throw")
        void outOfRangeSizeIsNotAnError(int requested) {
            assertThatCode(() -> withPaging(null, requested)).doesNotThrowAnyException();
        }
    }

    @Nested
    @DisplayName("incoherent input is rejected")
    class Rejection {

        /**
         * The counterpart to the clamping tests above, and the reason both exist. Clamping page −1 to
         * 0 would answer a different question than the one asked, and a caller looping over pages
         * would never learn its arithmetic was wrong.
         */
        @ParameterizedTest
        @ValueSource(ints = {-1, -20, Integer.MIN_VALUE})
        @DisplayName("a negative page is refused, not clamped")
        void negativePageIsRejected(int page) {
            assertThatThrownBy(() -> withPaging(page, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("page");
        }

        @Test
        @DisplayName("a negative minPrice is refused")
        void negativeMinPriceIsRejected() {
            assertThatThrownBy(() -> withPrices(new BigDecimal("-1"), null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("minPrice");
        }

        @Test
        @DisplayName("a negative maxPrice is refused")
        void negativeMaxPriceIsRejected() {
            assertThatThrownBy(() -> withPrices(null, new BigDecimal("-0.01")))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("maxPrice");
        }

        /**
         * An inverted range is refused rather than answered with an empty page, so a caller who has
         * swapped their bounds cannot conclude the catalogue is empty.
         */
        @Test
        @DisplayName("an inverted price range is refused rather than matching nothing")
        void invertedPriceRangeIsRejected() {
            assertThatThrownBy(() -> withPrices(new BigDecimal("999999"), new BigDecimal("1")))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("999999")
                    .hasMessageContaining("1");
        }

        @Test
        @DisplayName("an unknown sort is refused")
        void unknownSortIsRejected() {
            assertThatThrownBy(
                    () -> ProductQuery.of(null, null, null, null, null, null, "newest", null, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("sort");
        }
    }

    @Nested
    @DisplayName("price-range edges")
    class PriceEdges {

        @Test
        @DisplayName("zero is a permitted bound")
        void zeroIsAllowed() {
            ProductQuery result = withPrices(BigDecimal.ZERO, BigDecimal.ZERO);

            assertThat(result.minPrice()).isEqualByComparingTo("0");
            assertThat(result.maxPrice()).isEqualByComparingTo("0");
        }

        @Test
        @DisplayName("an equal min and max is a valid one-point range")
        void equalBoundsAreAllowed() {
            assertThatCode(() -> withPrices(new BigDecimal("100"), new BigDecimal("100")))
                    .doesNotThrowAnyException();
        }

        /**
         * The scale trap. {@code BigDecimal.equals} compares scale, so {@code 10.0} and {@code 10.00}
         * are unequal by it; {@code compareTo} is what the production code uses. If that ever
         * regresses to {@code equals}, this case is where it surfaces — a range of 10.0 to 10.00
         * would start being rejected as inverted.
         */
        @Test
        @DisplayName("bounds differing only in scale are not treated as inverted")
        void differingScalesCompareByValue() {
            assertThatCode(() -> withPrices(new BigDecimal("10.0"), new BigDecimal("10.00")))
                    .doesNotThrowAnyException();
        }
    }

    @Nested
    @DisplayName("blank strings mean absent")
    class BlankHandling {

        /**
         * A form that submits every field sends empty values for the ones nobody filled in. Without
         * this, such a request filters for a category that is literally the empty string and returns
         * nothing — a bug that looks like a broken catalogue rather than a broken filter.
         */
        @ParameterizedTest
        @ValueSource(strings = {"", " ", "   ", "\t"})
        @DisplayName("a blank category is no filter at all")
        void blankCategoryBecomesNull(String blank) {
            assertThat(ProductQuery.of(null, blank, null, null, null, null, null, null, null)
                    .categorySlug()).isNull();
        }

        @ParameterizedTest
        @ValueSource(strings = {"", " ", "   "})
        @DisplayName("a blank brand is no filter at all")
        void blankBrandBecomesNull(String blank) {
            assertThat(ProductQuery.of(null, null, blank, null, null, null, null, null, null)
                    .brand()).isNull();
        }

        @Test
        @DisplayName("a blank sort falls back to the default rather than failing")
        void blankSortUsesDefault() {
            assertThat(ProductQuery.of(null, null, null, null, null, null, "  ", null, null).sort())
                    .isEqualTo(ProductQuery.DEFAULT_SORT);
        }

        @Test
        @DisplayName("surrounding whitespace is trimmed off a real value")
        void valuesAreTrimmed() {
            ProductQuery result =
                    ProductQuery.of(null, "  smartphone  ", "  Apple  ", null, null, null, null, null, null);

            assertThat(result.categorySlug()).isEqualTo("smartphone");
            assertThat(result.brand()).isEqualTo("Apple");
        }
    }

    @Nested
    @DisplayName("toPageable")
    class ToPageable {

        @Test
        @DisplayName("carries the validated page, size and ordering")
        void carriesPageSizeAndSort() {
            Pageable pageable = ProductQuery
                    .of(null, null, null, null, null, null, "price-desc", 3, 25)
                    .toPageable();

            assertThat(pageable.getPageNumber()).isEqualTo(3);
            assertThat(pageable.getPageSize()).isEqualTo(25);
            assertThat(pageable.getSort()).isEqualTo(ProductSort.PRICE_DESC.sort());
        }

        /**
         * The clamped size, not the requested one, is what reaches Spring Data — otherwise the clamp
         * would be a value the response reports while the query ignores it.
         */
        @Test
        @DisplayName("uses the clamped size, not the requested one")
        void usesClampedSize() {
            assertThat(withPaging(0, 5000).toPageable().getPageSize())
                    .isEqualTo(ProductQuery.MAX_PAGE_SIZE);
        }
    }

    /**
     * {@code ?inStock=false} means "do not apply this filter", not "show me out-of-stock items". The
     * value is carried through as-is and {@code ProductSpecifications} decides; this asserts the
     * carrying, and {@code ProductRepositoryTest} asserts the deciding.
     */
    @Test
    @DisplayName("inStock is passed through unchanged, including false")
    void inStockIsPassedThrough() {
        assertThat(ProductQuery.of(null, null, null, null, null, true, null, null, null).inStockOnly())
                .isTrue();
        assertThat(ProductQuery.of(null, null, null, null, null, false, null, null, null).inStockOnly())
                .isFalse();
        assertThat(ProductQuery.of(null, null, null, null, null, null, null, null, null).inStockOnly())
                .isNull();
    }
}
