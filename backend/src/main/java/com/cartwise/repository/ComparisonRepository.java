package com.cartwise.repository;

import com.cartwise.entity.Comparison;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Comparison data access.
 *
 * <p>One method, because a comparison is only ever read as a whole: the grid renders every selected
 * column at once, so there is no "one column of a comparison" use case to support.
 */
@Repository
public interface ComparisonRepository extends JpaRepository<Comparison, Long> {

    /**
     * A user's comparison, in column order.
     *
     * <p>Ordered by {@code position}, not by {@code created_at}: the columns the user sees are
     * positional, and a product added after a middle removal must land where it was put rather than
     * at the end.
     */
    List<Comparison> findByUserIdOrderByPosition(Long userId);
}
