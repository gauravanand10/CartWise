package com.cartwise.common.dto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.Sort;

/**
 * The closed set of orderings, and the tie-breaker every one of them carries.
 *
 * <p>A plain unit test — no Spring context, no database. {@link ProductSort} is an enum whose entire
 * behaviour is deciding what {@link Sort} to hand to Spring Data, so the thing worth asserting is the
 * {@code Sort} it returns. Whether that ordering then produces stable pages is a question about
 * PostgreSQL and is answered in {@code ProductRepositoryTest} against a real one; the two tests are
 * deliberately not the same test.
 */
class ProductSortTest {

    @Nested
    @DisplayName("the id tie-breaker")
    class TieBreaker {

        /**
         * The single most load-bearing assertion in this class.
         *
         * <p>Without the trailing {@code id ASC}, two products at the same price have no defined
         * order between them, and PostgreSQL may return them differently on consecutive requests —
         * which at a page boundary means one item on both page 0 and page 1, and another on neither.
         * The constructor in {@link ProductSort} appends it to every constant, so this is checked for
         * all four rather than for the one that happens to be easiest to break.
         */
        @ParameterizedTest
        @EnumSource(ProductSort.class)
        @DisplayName("is appended to every ordering, last")
        void everySortEndsWithIdAscending(ProductSort sort) {
            List<Sort.Order> orders = sort.sort().toList();

            Sort.Order last = orders.get(orders.size() - 1);
            assertThat(last.getProperty()).isEqualTo("id");
            assertThat(last.getDirection()).isEqualTo(Sort.Direction.ASC);
        }

        /**
         * The tie-breaker must be second, not first — an ordering that sorted by id and then by price
         * would carry an {@code id} order and still be wrong, so position is part of the claim.
         */
        @ParameterizedTest
        @EnumSource(ProductSort.class)
        @DisplayName("comes after the primary ordering, not before it")
        void tieBreakerIsSecondary(ProductSort sort) {
            assertThat(sort.sort().toList()).hasSize(2);
            assertThat(sort.sort().toList().get(0).getProperty()).isNotEqualTo("id");
        }
    }

    @Nested
    @DisplayName("the primary orderings")
    class Primary {

        @Test
        @DisplayName("price-asc orders by price ascending")
        void priceAsc() {
            Sort.Order first = ProductSort.PRICE_ASC.sort().toList().get(0);

            assertThat(first.getProperty()).isEqualTo("price");
            assertThat(first.getDirection()).isEqualTo(Sort.Direction.ASC);
        }

        @Test
        @DisplayName("price-desc orders by price descending")
        void priceDesc() {
            Sort.Order first = ProductSort.PRICE_DESC.sort().toList().get(0);

            assertThat(first.getProperty()).isEqualTo("price");
            assertThat(first.getDirection()).isEqualTo(Sort.Direction.DESC);
        }

        @Test
        @DisplayName("rating-desc orders by rating descending")
        void ratingDesc() {
            Sort.Order first = ProductSort.RATING_DESC.sort().toList().get(0);

            assertThat(first.getProperty()).isEqualTo("rating");
            assertThat(first.getDirection()).isEqualTo(Sort.Direction.DESC);
        }

        /**
         * {@code lower(name)} rather than {@code name}, which is the fix for a real bug: a plain
         * {@code ORDER BY name} sorts by byte value under this database's collation, so every capital
         * letter precedes every lowercase one and "iPhone 16 Pro" lands last in a list labelled A–Z.
         * Asserted on the property string because that is what {@code JpaSort.unsafe} carries through
         * to the generated SQL.
         */
        @Test
        @DisplayName("name-asc orders by lower(name), not by name")
        void nameAscIsCaseInsensitive() {
            Sort.Order first = ProductSort.NAME_ASC.sort().toList().get(0);

            assertThat(first.getProperty()).isEqualTo("lower(name)");
            assertThat(first.getDirection()).isEqualTo(Sort.Direction.ASC);
        }
    }

    @Nested
    @DisplayName("parsing a query-string value")
    class Parsing {

        @ParameterizedTest
        @EnumSource(ProductSort.class)
        @DisplayName("round-trips every constant through its wire value")
        void roundTrip(ProductSort sort) {
            assertThat(ProductSort.from(sort.value())).isEqualTo(sort);
        }

        @ParameterizedTest
        @ValueSource(strings = {"PRICE-ASC", "Price-Asc", "price-ASC"})
        @DisplayName("is case-insensitive")
        void caseInsensitive(String raw) {
            assertThat(ProductSort.from(raw)).isEqualTo(ProductSort.PRICE_ASC);
        }

        /**
         * The message is part of the contract, not incidental. It reaches the client as a 400 body,
         * and a rejection that does not say what would have been accepted leaves the caller guessing.
         */
        @Test
        @DisplayName("rejects an unknown value and names every valid one")
        void unknownValueIsRejectedWithHelpfulMessage() {
            assertThatThrownBy(() -> ProductSort.from("newest"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("newest")
                    .hasMessageContaining("price-asc")
                    .hasMessageContaining("price-desc")
                    .hasMessageContaining("rating-desc")
                    .hasMessageContaining("name-asc");
        }

        /**
         * The enum's own constant names are not accepted. {@code ?sort=PRICE_ASC} is a plausible
         * guess, and it must fail rather than work — the wire format is the hyphenated value, and
         * accepting both would publish the Java identifier as a second, undocumented contract.
         */
        @Test
        @DisplayName("does not accept the Java constant name")
        void javaConstantNameIsNotAWireValue() {
            assertThatThrownBy(() -> ProductSort.from("PRICE_ASC"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("rejects null rather than throwing NullPointerException")
        void nullIsRejectedAsAnArgument() {
            assertThatThrownBy(() -> ProductSort.from(null))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    @DisplayName("validValues lists every constant's wire value")
    void validValuesIsComplete() {
        String listed = ProductSort.validValues();

        for (ProductSort sort : ProductSort.values()) {
            assertThat(listed).contains(sort.value());
        }
    }
}
