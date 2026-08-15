package com.cartwise.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cartwise.entity.Product;
import com.cartwise.entity.Role;
import com.cartwise.entity.User;
import com.cartwise.entity.Wishlist;
import com.cartwise.testsupport.DatabaseTest;
import com.cartwise.testsupport.ProductFixtures;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import org.hibernate.Hibernate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Wishlist queries against a real PostgreSQL: ordering, the fetch plan, and the pair constraint.
 */
@DatabaseTest
class WishlistRepositoryTest {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private User ada;
    private User grace;
    private Product phone;
    private Product laptop;

    @BeforeEach
    void seed() {
        wishlistRepository.deleteAll();
        userRepository.deleteAll();
        productRepository.deleteAll();
        wishlistRepository.flush();

        ada = userRepository.saveAndFlush(new User("ada@example.com", "$2a$10$x", Role.USER));
        grace = userRepository.saveAndFlush(new User("grace@example.com", "$2a$10$y", Role.USER));
        phone = productRepository.saveAndFlush(
                ProductFixtures.product().slug("iphone-16-pro").name("iPhone 16 Pro").build());
        laptop = productRepository.saveAndFlush(
                ProductFixtures.product().slug("macbook-air").name("MacBook Air").build());
    }

    private Wishlist save(User user, Product product) {
        return wishlistRepository.saveAndFlush(new Wishlist(user, product));
    }

    @Test
    @DisplayName("returns only the requested user's entries")
    void isScopedToOneUser() {
        save(ada, phone);
        save(grace, laptop);

        assertThat(wishlistRepository.findByUserIdOrderByCreatedAtDesc(ada.getId()))
                .extracting(entry -> entry.getProduct().getSlug())
                .containsExactly("iphone-16-pro");
    }

    @Test
    @DisplayName("an unknown user has an empty wishlist rather than an error")
    void unknownUserGetsNothing() {
        assertThat(wishlistRepository.findByUserIdOrderByCreatedAtDesc(999_999L)).isEmpty();
    }

    /**
     * Newest first, which is the frontend's default "Recently added" ordering. {@code createdAt} is
     * set by {@code @PrePersist} at real clock resolution, so the two rows are saved in a known
     * sequence and the assertion is on that sequence rather than on a contrived timestamp.
     */
    @Test
    @DisplayName("orders entries newest first")
    void newestFirst() throws InterruptedException {
        save(ada, phone);
        Thread.sleep(5);          // distinct created_at values; Instant.now() is finer than 5ms
        save(ada, laptop);

        assertThat(wishlistRepository.findByUserIdOrderByCreatedAtDesc(ada.getId()))
                .extracting(entry -> entry.getProduct().getSlug())
                .containsExactly("macbook-air", "iphone-16-pro");
    }

    /**
     * <strong>The entity graph, asserted rather than assumed.</strong> {@code Wishlist.product} is
     * {@code LAZY}, so without {@code @EntityGraph(attributePaths = "product")} this query would
     * return proxies and a wishlist of ten items would cost eleven queries.
     *
     * <p>Proving that inside an open transaction is subtle: touching a lazy proxy here would simply
     * load it, and every assertion about the product's fields would pass either way.
     * {@link Hibernate#isInitialized} is what distinguishes them — it reports whether the association
     * is <em>already</em> loaded, which is true only if the graph fetch-joined it.
     */
    @Test
    @DisplayName("fetches the product in the same query, not as a lazy proxy")
    void productIsFetchedEagerlyByTheEntityGraph() {
        save(ada, phone);
        entityManager.clear();     // force a real load rather than a persistence-context hit

        List<Wishlist> entries = wishlistRepository.findByUserIdOrderByCreatedAtDesc(ada.getId());

        assertThat(entries).hasSize(1);
        assertThat(Hibernate.isInitialized(entries.get(0).getProduct()))
                .as("product should be fetch-joined by the entity graph")
                .isTrue();
    }

    /**
     * The counterpart to the assertion above, and what makes it meaningful: {@code user} is
     * deliberately left lazy, because the response never mentions the user beyond the id already in
     * the URL. If this ever starts reporting initialised, the graph has quietly grown.
     */
    @Test
    @DisplayName("leaves the user association lazy, as the response never needs it")
    void userIsNotFetched() {
        save(ada, phone);
        entityManager.clear();

        List<Wishlist> entries = wishlistRepository.findByUserIdOrderByCreatedAtDesc(ada.getId());

        assertThat(Hibernate.isInitialized(entries.get(0).getUser())).isFalse();
    }

    @Test
    @DisplayName("existsByUserIdAndProductId answers for the right pair only")
    void existsForThePair() {
        save(ada, phone);

        assertThat(wishlistRepository.existsByUserIdAndProductId(ada.getId(), phone.getId()))
                .isTrue();
        assertThat(wishlistRepository.existsByUserIdAndProductId(ada.getId(), laptop.getId()))
                .isFalse();
        assertThat(wishlistRepository.existsByUserIdAndProductId(grace.getId(), phone.getId()))
                .isFalse();
    }

    /**
     * The derived query traverses {@code product.slug}, so the delete endpoint needs one query rather
     * than translating a slug into an id first.
     */
    @Test
    @DisplayName("findByUserIdAndProductSlug resolves through the product association")
    void findsByProductSlug() {
        save(ada, phone);

        assertThat(wishlistRepository.findByUserIdAndProductSlug(ada.getId(), "iphone-16-pro"))
                .isPresent();
        assertThat(wishlistRepository.findByUserIdAndProductSlug(ada.getId(), "macbook-air"))
                .isEmpty();
        assertThat(wishlistRepository.findByUserIdAndProductSlug(grace.getId(), "iphone-16-pro"))
                .isEmpty();
    }

    /**
     * {@code uk_wishlist_user_product} is what makes "saved twice" impossible rather than merely
     * unlikely. The service's existence check makes the ordinary case cheap and quiet; this is what
     * catches two concurrent requests that both passed it.
     */
    @Test
    @DisplayName("the database refuses the same product saved twice by one user")
    void pairIsUniqueAtTheDatabaseLevel() {
        save(ada, phone);

        assertThatThrownBy(() -> save(ada, phone))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("two different users may save the same product")
    void differentUsersMaySaveTheSameProduct() {
        save(ada, phone);
        save(grace, phone);

        assertThat(wishlistRepository.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("one user may save two different products")
    void oneUserMaySaveSeveralProducts() {
        save(ada, phone);
        save(ada, laptop);

        assertThat(wishlistRepository.findByUserIdOrderByCreatedAtDesc(ada.getId())).hasSize(2);
    }
}
