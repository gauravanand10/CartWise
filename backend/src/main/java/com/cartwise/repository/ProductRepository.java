package com.cartwise.repository;

import com.cartwise.common.dto.CategoryDto;
import com.cartwise.entity.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Catalogue data access.
 *
 * <p>An interface with no implementation is the point: Spring Data derives the query from the
 * method name and generates the proxy at startup. Writing an {@code @Override} body here would
 * replace working generated SQL with hand-rolled SQL that has to be maintained.
 *
 * <p>Chapter 20 adds discovery. {@link JpaSpecificationExecutor} brings the paged, filtered
 * {@code findAll(Specification, Pageable)} used by the browse endpoint — see
 * {@link ProductSpecifications} for why the filters are built that way rather than as a JPQL query
 * with a dozen null checks — and one hand-written aggregate below, which is the single case a
 * derived method cannot express.
 */
@Repository
public interface ProductRepository
        extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    /**
     * Looks a product up by its URL identity.
     *
     * <p>{@code Optional} rather than a nullable return, because "no product with that slug" is an
     * ordinary outcome — the frontend already has a not-found state for exactly this.
     */
    Optional<Product> findBySlug(String slug);

    /**
     * Every distinct category with how many products carry it, alphabetically.
     *
     * <p><strong>The one query in CartWise that had to be written by hand.</strong> Spring Data
     * derives queries from method names, and there is no method name that expresses a {@code GROUP
     * BY} with a projection — the naming grammar covers filtering and ordering, not aggregation.
     *
     * <p>Constructor expression rather than {@code Object[]}: JPQL's {@code new
     * com.cartwise...CategoryDto(...)} makes Hibernate build the record directly, so the result is
     * typed at compile time. The alternative returns an array of Objects that the caller casts by
     * position, where reordering the {@code SELECT} list breaks the caller silently at runtime.
     *
     * <p>The slug is computed in SQL — {@code lower(replace(name, ' ', '-'))} — rather than in Java
     * after the fact, so the projection can be built in one pass. It must stay in agreement with
     * {@link com.cartwise.common.CategorySlug#toSlug}, which is the same transformation expressed
     * for a Java string; the two are a genuine duplication and the reason this comment names it.
     *
     * <p>{@code COUNT(p)} counts rows per group, and because {@code category} is {@code NOT NULL}
     * there is no null group to think about. Ordered by name so the API returns categories in a
     * stable order and the UI does not reshuffle its tiles between requests.
     */
    @Query("""
            SELECT new com.cartwise.common.dto.CategoryDto(
                       p.category,
                       LOWER(REPLACE(p.category, ' ', '-')),
                       COUNT(p))
            FROM Product p
            GROUP BY p.category
            ORDER BY p.category ASC
            """)
    List<CategoryDto> findCategoryCounts();
}
