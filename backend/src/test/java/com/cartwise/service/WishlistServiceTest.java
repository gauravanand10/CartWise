package com.cartwise.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cartwise.common.dto.WishlistItemDto;
import com.cartwise.entity.Product;
import com.cartwise.entity.Role;
import com.cartwise.entity.User;
import com.cartwise.entity.Wishlist;
import com.cartwise.repository.ProductRepository;
import com.cartwise.repository.UserRepository;
import com.cartwise.repository.WishlistRepository;
import com.cartwise.testsupport.ProductFixtures;
import jakarta.persistence.EntityNotFoundException;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * The wishlist's rules: what may be saved, what a duplicate means, what removing something does.
 *
 * <p>All three repositories are mocked. The asymmetry this class is really about — adding is
 * idempotent, removing is not — is a decision made in Java, so it is testable here; whether the
 * database also refuses a duplicate is a separate claim, asserted against the real unique constraint
 * in {@code WishlistRepositoryTest}.
 */
class WishlistServiceTest {

    private final WishlistRepository wishlistRepository = mock(WishlistRepository.class);
    private final ProductRepository productRepository = mock(ProductRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);

    private final WishlistService wishlistService =
            new WishlistService(wishlistRepository, productRepository, userRepository);

    private static final Long USER_ID = 1L;
    private static final String SLUG = "iphone-16-pro";

    private static User user(Long id) {
        User user = new User("ada@example.com", "$2a$10$irrelevant", Role.USER);
        setField(User.class, user, "id", id);
        return user;
    }

    /** A persisted wishlist row: has an id and a created-at, as one loaded from the database would. */
    private static Wishlist entry(Long id, User user, Product product, Instant savedAt) {
        Wishlist wishlist = new Wishlist(user, product);
        setField(Wishlist.class, wishlist, "id", id);
        setField(Wishlist.class, wishlist, "createdAt", savedAt);
        return wishlist;
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

    @Nested
    @DisplayName("reading a wishlist")
    class Reading {

        @Test
        @DisplayName("maps each entry with its product embedded")
        void mapsEntries() {
            Product product = ProductFixtures.product()
                    .slug(SLUG).name("iPhone 16 Pro").buildWithId(10L);
            Instant savedAt = Instant.parse("2026-08-15T10:00:00Z");

            when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(List.of(entry(5L, user(USER_ID), product, savedAt)));

            List<WishlistItemDto> items = wishlistService.getUserWishlist(USER_ID);

            assertThat(items).singleElement().satisfies(item -> {
                assertThat(item.id()).isEqualTo(5L);
                assertThat(item.savedAt()).isEqualTo(savedAt);
                assertThat(item.product().slug()).isEqualTo(SLUG);
                assertThat(item.product().name()).isEqualTo("iPhone 16 Pro");
            });
        }

        @Test
        @DisplayName("keeps the newest-first order the query established")
        void preservesOrder() {
            User owner = user(USER_ID);
            when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(USER_ID)).thenReturn(List.of(
                    entry(3L, owner, ProductFixtures.product().slug("newest").buildWithId(1L),
                            Instant.parse("2026-08-15T12:00:00Z")),
                    entry(2L, owner, ProductFixtures.product().slug("middle").buildWithId(2L),
                            Instant.parse("2026-08-14T12:00:00Z")),
                    entry(1L, owner, ProductFixtures.product().slug("oldest").buildWithId(3L),
                            Instant.parse("2026-08-13T12:00:00Z"))));

            assertThat(wishlistService.getUserWishlist(USER_ID))
                    .extracting(item -> item.product().slug())
                    .containsExactly("newest", "middle", "oldest");
        }

        /**
         * An unknown user gets an empty list rather than a 404. Without authentication in front of
         * it, a 404 here would let anyone enumerate which user ids exist by comparing responses.
         */
        @Test
        @DisplayName("an unknown user gets an empty list, not an error")
        void unknownUserGetsEmptyList() {
            when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(999L)).thenReturn(List.of());

            assertThat(wishlistService.getUserWishlist(999L)).isEmpty();
        }
    }

    @Nested
    @DisplayName("adding to a wishlist")
    class Adding {

        @Test
        @DisplayName("reports true when a row was created")
        void createsAndReportsTrue() {
            Product product = ProductFixtures.product().slug(SLUG).buildWithId(10L);
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user(USER_ID)));
            when(productRepository.findBySlug(SLUG)).thenReturn(Optional.of(product));
            when(wishlistRepository.existsByUserIdAndProductId(USER_ID, 10L)).thenReturn(false);

            assertThat(wishlistService.addToWishlist(USER_ID, SLUG)).isTrue();
        }

        /**
         * Idempotence, and it is a real requirement rather than tidiness: the frontend calls this
         * from a heart icon meaning "this is saved", so a double-click, a retry after a dropped
         * response, and two open tabs must all end in one row. The boolean is what lets the
         * controller answer 201 or 200 accurately without either being a failure.
         */
        @Test
        @DisplayName("reports false and writes nothing when it is already saved")
        void duplicateIsNotAnError() {
            Product product = ProductFixtures.product().slug(SLUG).buildWithId(10L);
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user(USER_ID)));
            when(productRepository.findBySlug(SLUG)).thenReturn(Optional.of(product));
            when(wishlistRepository.existsByUserIdAndProductId(USER_ID, 10L)).thenReturn(true);

            assertThat(wishlistService.addToWishlist(USER_ID, SLUG)).isFalse();
            verify(wishlistRepository, never()).save(any());
        }

        @Test
        @DisplayName("refuses an unknown user")
        void unknownUserIsRejected() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> wishlistService.addToWishlist(999L, SLUG))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("999");

            verify(wishlistRepository, never()).save(any());
        }

        @Test
        @DisplayName("refuses an unknown product")
        void unknownProductIsRejected() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user(USER_ID)));
            when(productRepository.findBySlug("no-such-product")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> wishlistService.addToWishlist(USER_ID, "no-such-product"))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("no-such-product");

            verify(wishlistRepository, never()).save(any());
        }

        /**
         * The user is checked before the product. It costs nothing to state, and it is what makes the
         * 404 for an unknown user reliable rather than dependent on which lookup happened to run
         * first when both are unknown.
         */
        @Test
        @DisplayName("reports the unknown user when both the user and the product are unknown")
        void userIsCheckedFirst() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> wishlistService.addToWishlist(999L, "no-such-product"))
                    .hasMessageContaining("user");
        }
    }

    @Nested
    @DisplayName("removing from a wishlist")
    class Removing {

        @Test
        @DisplayName("deletes the entry that was found")
        void deletesTheEntry() {
            Product product = ProductFixtures.product().slug(SLUG).buildWithId(10L);
            Wishlist saved = entry(5L, user(USER_ID), product, Instant.now());
            when(wishlistRepository.findByUserIdAndProductSlug(USER_ID, SLUG))
                    .thenReturn(Optional.of(saved));

            wishlistService.removeFromWishlist(USER_ID, SLUG);

            verify(wishlistRepository).delete(saved);
        }

        /**
         * The deliberate asymmetry with adding. Removing something never saved usually means the
         * client is working from a stale view, and telling it so is more useful than a silent success
         * that leaves the two disagreeing about what is on the list.
         */
        @Test
        @DisplayName("refuses to remove something that was never saved")
        void removingAnAbsentEntryIsAnError() {
            when(wishlistRepository.findByUserIdAndProductSlug(anyLong(), anyString()))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> wishlistService.removeFromWishlist(USER_ID, SLUG))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining(SLUG);

            verify(wishlistRepository, never()).delete(any());
        }
    }
}
