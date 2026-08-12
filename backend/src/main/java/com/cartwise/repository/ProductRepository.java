package com.cartwise.repository;

import com.cartwise.entity.Product;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Catalogue data access.
 *
 * <p>An interface with no implementation is the point: Spring Data derives the query from the
 * method name and generates the proxy at startup. Writing an {@code @Override} body here would
 * replace working generated SQL with hand-rolled SQL that has to be maintained.
 *
 * <p>{@code findBySlug} is the only custom method because it is the only lookup the application
 * actually performs — every product URL, wishlist entry and comparison column addresses a product
 * by slug, never by numeric id. Search, filtering and pagination are Chapter 17's problem and are
 * not speculatively added here.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Looks a product up by its URL identity.
     *
     * <p>{@code Optional} rather than a nullable return, because "no product with that slug" is an
     * ordinary outcome — the frontend already has a not-found state for exactly this.
     */
    Optional<Product> findBySlug(String slug);
}
