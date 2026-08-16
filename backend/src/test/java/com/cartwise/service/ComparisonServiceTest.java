package com.cartwise.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cartwise.common.dto.ComparisonItemDto;
import com.cartwise.common.exception.ComparisonFullException;
import com.cartwise.entity.Comparison;
import com.cartwise.entity.Product;
import com.cartwise.entity.Role;
import com.cartwise.entity.User;
import com.cartwise.repository.ComparisonRepository;
import com.cartwise.repository.ProductRepository;
import com.cartwise.repository.UserRepository;
import com.cartwise.testsupport.ProductFixtures;
import jakarta.persistence.EntityNotFoundException;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/**
 * The comparison's rules: the four-product cap, which column a new product takes, and what a
 * duplicate means.
 *
 * <p>All three repositories are mocked, so what is under test is the decision-making in Java. Two
 * claims this class deliberately does <em>not</em> make, because they belong to the database and are
 * asserted against the real schema elsewhere: that {@code (user_id, product_id)} is unique, and that
 * {@code position} is constrained to 0..3. This suite proves the service reaches the right answer;
 * the constraints prove nothing else can reach a wrong one.
 */
class ComparisonServiceTest {

    private final ComparisonRepository comparisonRepository = mock(ComparisonRepository.class);
    private final ProductRepository productRepository = mock(ProductRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);

    private final ComparisonService comparisonService =
            new ComparisonService(comparisonRepository, productRepository, userRepository);

    private static final Long USER_ID = 1L;
    private static final String SLUG = "iphone-16-pro";

    private static User user(Long id) {
        User user = new User("ada@example.com", "$2a$10$irrelevant", Role.USER);
        setField(User.class, user, "id", id);
        return user;
    }

    /** A persisted comparison row: has an id and a created-at, as one loaded from the database would. */
    private static Comparison entry(Long id, Product product, int position, Instant addedAt) {
        Comparison comparison = new Comparison(user(USER_ID), product, position);
        setField(Comparison.class, comparison, "id", id);
        setField(Comparison.class, comparison, "createdAt", addedAt);
        return comparison;
    }

    private static Product productAt(long id, String slug) {
        return ProductFixtures.product().slug(slug).name("Product " + id).buildWithId(id);
    }

    private static void setField(Class<?> type, Object target, String name, Object value) {
        try {
            Field field = type.getDeclaredField(name);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(type.getSimpleName() + "." + name + " has moved", e);
        }
    }

    /** Wires up the happy path: the user exists and the product exists. */
    private Product givenUserAndProduct() {
        Product product = productAt(10L, SLUG);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user(USER_ID)));
        when(productRepository.findBySlug(SLUG)).thenReturn(Optional.of(product));
        return product;
    }

    @Nested
    @DisplayName("reading a comparison")
    class Reading {

        @Test
        @DisplayName("maps each column with its product and position")
        void mapsColumns() {
            Instant addedAt = Instant.parse("2026-08-16T10:00:00Z");

            when(comparisonRepository.findByUserIdOrderByPosition(USER_ID))
                    .thenReturn(List.of(entry(5L, productAt(10L, SLUG), 2, addedAt)));

            List<ComparisonItemDto> items = comparisonService.getUserComparison(USER_ID);

            assertThat(items).hasSize(1);
            assertThat(items.getFirst().id()).isEqualTo(5L);
            assertThat(items.getFirst().position()).isEqualTo(2);
            assertThat(items.getFirst().product().slug()).isEqualTo(SLUG);
            assertThat(items.getFirst().addedAt()).isEqualTo(addedAt);
        }

        @Test
        @DisplayName("an unknown user gets an empty list, not an error")
        void unknownUserIsEmpty() {
            when(comparisonRepository.findByUserIdOrderByPosition(99L)).thenReturn(List.of());

            assertThat(comparisonService.getUserComparison(99L)).isEmpty();
        }
    }

    @Nested
    @DisplayName("adding a product")
    class Adding {

        @Test
        @DisplayName("creates a column and reports that it did")
        void createsColumn() {
            givenUserAndProduct();
            when(comparisonRepository.existsByUserIdAndProductId(anyLong(), anyLong()))
                    .thenReturn(false);
            when(comparisonRepository.countByUserId(USER_ID)).thenReturn(0L);
            when(comparisonRepository.findByUserIdOrderByPosition(USER_ID)).thenReturn(List.of());

            assertThat(comparisonService.addToComparison(USER_ID, SLUG)).isTrue();

            verify(comparisonRepository).save(any(Comparison.class));
        }

        @Test
        @DisplayName("an already-compared product is a no-op, not a duplicate")
        void duplicateIsNoOp() {
            givenUserAndProduct();
            when(comparisonRepository.existsByUserIdAndProductId(anyLong(), anyLong()))
                    .thenReturn(true);

            assertThat(comparisonService.addToComparison(USER_ID, SLUG)).isFalse();

            verify(comparisonRepository, never()).save(any(Comparison.class));
        }

        @Test
        @DisplayName("an unknown user is a 404-shaped failure")
        void unknownUser() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> comparisonService.addToComparison(USER_ID, SLUG))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("No user with id");
        }

        @Test
        @DisplayName("an unknown product is a 404-shaped failure")
        void unknownProduct() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user(USER_ID)));
            when(productRepository.findBySlug(SLUG)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> comparisonService.addToComparison(USER_ID, SLUG))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("No product with slug");
        }
    }

    /**
     * The cap, which is the rule Chapter 23 moved out of the browser. Before this, {@code
     * MAX_COMPARE} in React was the only thing preventing a fifth column, and it held exactly as
     * long as every client was this app.
     */
    @Nested
    @DisplayName("the four-product cap")
    class Cap {

        @Test
        @DisplayName("a fifth product is refused")
        void fifthIsRefused() {
            givenUserAndProduct();
            when(comparisonRepository.existsByUserIdAndProductId(anyLong(), anyLong()))
                    .thenReturn(false);
            when(comparisonRepository.countByUserId(USER_ID))
                    .thenReturn((long) ComparisonService.MAX_COMPARISON_PRODUCTS);

            assertThatThrownBy(() -> comparisonService.addToComparison(USER_ID, SLUG))
                    .isInstanceOf(ComparisonFullException.class)
                    .hasMessageContaining("at most 4");

            verify(comparisonRepository, never()).save(any(Comparison.class));
        }

        @Test
        @DisplayName("the fourth product is still accepted — the cap is 4, not 3")
        void fourthIsAccepted() {
            givenUserAndProduct();
            when(comparisonRepository.existsByUserIdAndProductId(anyLong(), anyLong()))
                    .thenReturn(false);
            when(comparisonRepository.countByUserId(USER_ID))
                    .thenReturn((long) ComparisonService.MAX_COMPARISON_PRODUCTS - 1);
            when(comparisonRepository.findByUserIdOrderByPosition(USER_ID))
                    .thenReturn(List.of(
                            entry(1L, productAt(1L, "a"), 0, Instant.EPOCH),
                            entry(2L, productAt(2L, "b"), 1, Instant.EPOCH),
                            entry(3L, productAt(3L, "c"), 2, Instant.EPOCH)));

            assertThat(comparisonService.addToComparison(USER_ID, SLUG)).isTrue();
        }

        /**
         * The order of the two checks, asserted rather than assumed.
         *
         * <p>Re-adding a product that is already in a <em>full</em> comparison must succeed as a
         * no-op. It asks for nothing to change, and an idempotent operation that refuses to leave
         * things as they are is not idempotent. Checking the cap before the duplicate would produce a
         * 409 here — and it is exactly what the frontend does when a user clicks an already-selected
         * toggle on a full comparison.
         */
        @Test
        @DisplayName("re-adding a product already in a FULL comparison is still a no-op")
        void duplicateBeatsCap() {
            givenUserAndProduct();
            when(comparisonRepository.existsByUserIdAndProductId(anyLong(), anyLong()))
                    .thenReturn(true);
            when(comparisonRepository.countByUserId(USER_ID))
                    .thenReturn((long) ComparisonService.MAX_COMPARISON_PRODUCTS);

            assertThat(comparisonService.addToComparison(USER_ID, SLUG)).isFalse();
        }
    }

    /**
     * Column assignment. This is the part a naive implementation gets wrong in a way the check
     * constraint would turn into a 500 rather than a bad column.
     */
    @Nested
    @DisplayName("choosing a column")
    class Positions {

        private int savedPosition() {
            ArgumentCaptor<Comparison> saved = ArgumentCaptor.forClass(Comparison.class);
            verify(comparisonRepository).save(saved.capture());
            return saved.getValue().getPosition();
        }

        private void givenOccupied(List<Comparison> existing) {
            givenUserAndProduct();
            when(comparisonRepository.existsByUserIdAndProductId(anyLong(), anyLong()))
                    .thenReturn(false);
            when(comparisonRepository.countByUserId(USER_ID)).thenReturn((long) existing.size());
            when(comparisonRepository.findByUserIdOrderByPosition(USER_ID)).thenReturn(existing);
        }

        @Test
        @DisplayName("the first product takes column 0")
        void firstTakesZero() {
            givenOccupied(List.of());

            comparisonService.addToComparison(USER_ID, SLUG);

            assertThat(savedPosition()).isZero();
        }

        @Test
        @DisplayName("the next product takes the next column")
        void nextTakesNext() {
            givenOccupied(List.of(entry(1L, productAt(1L, "a"), 0, Instant.EPOCH)));

            comparisonService.addToComparison(USER_ID, SLUG);

            assertThat(savedPosition()).isEqualTo(1);
        }

        /**
         * The case that makes "lowest free" the only correct rule rather than a preference.
         *
         * <p>Four columns, the middle one removed, then an add. Highest-plus-one would compute 4 —
         * outside the 0..3 the check constraint permits — and turn an ordinary add into a database
         * error. The freed slot is the only legal answer.
         */
        @Test
        @DisplayName("a product added after a middle removal takes the freed column, not column 4")
        void fillsTheHole() {
            givenOccupied(List.of(
                    entry(1L, productAt(1L, "a"), 0, Instant.EPOCH),
                    entry(3L, productAt(3L, "c"), 2, Instant.EPOCH),
                    entry(4L, productAt(4L, "d"), 3, Instant.EPOCH)));

            comparisonService.addToComparison(USER_ID, SLUG);

            assertThat(savedPosition()).isEqualTo(1);
        }

        @Test
        @DisplayName("the lowest free column wins when several are free")
        void lowestFreeWins() {
            givenOccupied(List.of(entry(4L, productAt(4L, "d"), 3, Instant.EPOCH)));

            comparisonService.addToComparison(USER_ID, SLUG);

            assertThat(savedPosition()).isZero();
        }
    }

    @Nested
    @DisplayName("removing")
    class Removing {

        @Test
        @DisplayName("deletes the row holding that product")
        void deletesRow() {
            Comparison existing = entry(5L, productAt(10L, SLUG), 1, Instant.EPOCH);
            when(comparisonRepository.findByUserIdAndProductSlug(USER_ID, SLUG))
                    .thenReturn(Optional.of(existing));

            comparisonService.removeFromComparison(USER_ID, SLUG);

            verify(comparisonRepository).delete(existing);
        }

        @Test
        @DisplayName("removing something never compared is a 404-shaped failure, not a silent success")
        void notComparedThrows() {
            when(comparisonRepository.findByUserIdAndProductSlug(USER_ID, SLUG))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> comparisonService.removeFromComparison(USER_ID, SLUG))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("is not comparing product");
        }
    }

    @Nested
    @DisplayName("clearing")
    class Clearing {

        @Test
        @DisplayName("deletes every column the user had")
        void deletesAll() {
            List<Comparison> existing = List.of(
                    entry(1L, productAt(1L, "a"), 0, Instant.EPOCH),
                    entry(2L, productAt(2L, "b"), 1, Instant.EPOCH));
            when(comparisonRepository.findByUserIdOrderByPosition(USER_ID)).thenReturn(existing);

            comparisonService.clearComparison(USER_ID);

            verify(comparisonRepository).deleteAll(existing);
        }

        @Test
        @DisplayName("clearing an empty comparison succeeds")
        void clearEmptyIsFine() {
            when(comparisonRepository.findByUserIdOrderByPosition(USER_ID)).thenReturn(List.of());

            comparisonService.clearComparison(USER_ID);

            verify(comparisonRepository).deleteAll(List.of());
        }
    }
}
