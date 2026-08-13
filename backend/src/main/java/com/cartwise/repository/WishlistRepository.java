package com.cartwise.repository;

import com.cartwise.entity.Wishlist;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Wishlist data access.
 *
 * <p>Both methods traverse the {@code user} / {@code product} associations rather than reading a
 * scalar id column: Spring Data resolves {@code UserId} to {@code user.id} and {@code ProductId} to
 * {@code product.id}, so the entities keep their real foreign keys and the query methods still read
 * as plain ids. Because resolution happens when the context starts, a property name that does not
 * exist fails the boot rather than failing a request later.
 */
@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    /**
     * A user's saved products, newest first.
     *
     * <p>Ordering lives in the query because recency is a stored fact ({@code created_at}), which is
     * the whole reason this is a table of rows. The frontend's other orderings — price, rating — are
     * properties of the product, not of the saving, and belong to Chapter 17's read model.
     *
     * <p>The entity graph is Chapter 17's addition. {@code Wishlist.product} is {@code LAZY}, and
     * the endpoint that calls this needs every product's fields to build its response — so without
     * the graph, a wishlist of ten items is one query for the entries plus ten more for the
     * products. Naming {@code product} here makes Hibernate fetch-join it in the same statement.
     * {@code user} is left lazy: the response never mentions the user beyond the id already in the
     * URL.
     */
    @EntityGraph(attributePaths = "product")
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Whether this user has already saved this product.
     *
     * <p>An existence check rather than fetching the row and testing for null: it answers the
     * duplicate question with {@code SELECT 1}-shaped SQL and no entity to hydrate. The unique
     * constraint on {@code (user_id, product_id)} is still the real guarantee; this exists so the
     * ordinary case does not have to learn about it from a constraint violation.
     */
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    /**
     * The row saving this product for this user, if there is one.
     *
     * <p>Added in Chapter 17 for {@code DELETE /api/users/{userId}/wishlist/{slug}}. It resolves
     * {@code ProductSlug} to {@code product.slug}, so the delete needs one query instead of two —
     * the caller never has to translate a slug into a product id just to find the entry to remove.
     *
     * <p>Returning the entity rather than deleting by derived query is deliberate: the endpoint has
     * to tell "removed" from "was never saved", and a {@code deleteBy...} returning a row count
     * would make that a number to interpret rather than a presence to check.
     */
    Optional<Wishlist> findByUserIdAndProductSlug(Long userId, String productSlug);
}
