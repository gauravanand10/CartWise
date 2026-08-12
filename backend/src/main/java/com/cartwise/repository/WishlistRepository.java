package com.cartwise.repository;

import com.cartwise.entity.Wishlist;
import java.util.List;
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
     */
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
}
