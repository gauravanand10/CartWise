package com.cartwise.repository;

import com.cartwise.entity.Comparison;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Comparison data access.
 *
 * <p>Chapter 17 left this interface with a single read method and a note that a comparison is only
 * ever read as a whole. That is still true of reads. Chapter 23 gave the comparison an API that can
 * be written to, and writing needs three questions answered that reading never asked: is this
 * product already in the comparison, which row holds it, and how many columns are occupied.
 *
 * <p>Every method resolves associations rather than scalar id columns — Spring Data maps
 * {@code UserId} to {@code user.id} and {@code ProductSlug} to {@code product.slug}. Resolution
 * happens when the context starts, so a property name that does not exist fails the boot rather
 * than a request.
 */
@Repository
public interface ComparisonRepository extends JpaRepository<Comparison, Long> {

    /**
     * A user's comparison, in column order.
     *
     * <p>Ordered by {@code position}, not by {@code created_at}: the columns the user sees are
     * positional, and a product added after a middle removal must land where it was put rather than
     * at the end.
     *
     * <p>The entity graph is Chapter 23's addition, for the same reason the wishlist's read has one:
     * {@code Comparison.product} is {@code LAZY} and the endpoint builds a full product payload per
     * column, so without it a four-column comparison is one query plus four more.
     */
    @EntityGraph(attributePaths = "product")
    List<Comparison> findByUserIdOrderByPosition(Long userId);

    /**
     * Whether this product already occupies a column for this user.
     *
     * <p>An existence check rather than scanning the loaded list, so the duplicate case costs
     * {@code SELECT 1}-shaped SQL. The unique constraint on {@code (user_id, product_id)} remains
     * the real guarantee; this exists so the ordinary case does not learn about it from a violation.
     */
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    /**
     * The row holding this product for this user, if any.
     *
     * <p>Returns the entity rather than deleting by derived query: the endpoint has to distinguish
     * "removed" from "was never in the comparison", and a {@code deleteBy...} row count would make
     * that a number to interpret instead of a presence to check.
     */
    Optional<Comparison> findByUserIdAndProductSlug(Long userId, String productSlug);

    /**
     * How many columns this user currently has.
     *
     * <p>Used to enforce the four-product cap before attempting an insert. Counting in SQL rather
     * than loading the rows and calling {@code size()}: the cap check runs on every add, and it does
     * not need the products.
     */
    long countByUserId(Long userId);
}
