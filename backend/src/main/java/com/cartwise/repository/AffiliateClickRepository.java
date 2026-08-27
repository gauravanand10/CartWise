package com.cartwise.repository;

import com.cartwise.common.dto.ProductClickCount;
import com.cartwise.common.dto.RetailerClickCount;
import com.cartwise.entity.AffiliateClick;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Outbound click storage, and the three aggregates the admin report is made of. Chapter 26.
 *
 * <p>Every read here is an aggregate. There is deliberately no {@code findByUserId} and no method
 * that returns raw click rows: the questions this chapter set out to answer are counts, and a
 * repository method that hands back one person's click history is the first step toward a feature
 * nobody asked for on top of data collected for something else.
 */
@Repository
public interface AffiliateClickRepository extends JpaRepository<AffiliateClick, Long> {

    /**
     * Clicks per product, busiest first.
     *
     * <p>Constructor expression rather than {@code Object[]}, for the reason {@link
     * ProductRepository#findCategoryCounts()} gives: the result is typed at compile time, so
     * reordering the {@code SELECT} list is a compilation failure rather than a caller silently
     * reading the name out of the count's position.
     *
     * <p>Joined to the product rather than grouping by the raw foreign key, because a report listing
     * {@code product_id 37} is useless to the person reading it.
     */
    @Query("""
            SELECT new com.cartwise.common.dto.ProductClickCount(
                       c.product.slug,
                       c.product.name,
                       COUNT(c))
            FROM AffiliateClick c
            GROUP BY c.product.slug, c.product.name
            ORDER BY COUNT(c) DESC, c.product.name ASC
            """)
    List<ProductClickCount> countByProduct();

    /**
     * Clicks per retailer, busiest first.
     *
     * <p>No join: the retailer is a string on the click itself, because retailers live in
     * configuration rather than in a table. See {@link com.cartwise.entity.AffiliateClick#getRetailer()}.
     */
    @Query("""
            SELECT new com.cartwise.common.dto.RetailerClickCount(
                       c.retailer,
                       COUNT(c))
            FROM AffiliateClick c
            GROUP BY c.retailer
            ORDER BY COUNT(c) DESC, c.retailer ASC
            """)
    List<RetailerClickCount> countByRetailer();

    /**
     * Clicks per calendar day, most recent first, capped at 30 days.
     *
     * <p><strong>The one native query in this repository, and the reason is a real limitation
     * rather than a preference.</strong> JPQL has no portable way to truncate a timestamp to a day
     * — there is no {@code date_trunc} in the query language and {@code FUNCTION('date_trunc', …)}
     * only moves the database-specific string somewhere less visible while still being
     * database-specific. Writing it as SQL says plainly that this depends on PostgreSQL, which
     * every environment this runs in already is.
     *
     * <p>{@code CAST(... AS date)} rather than PostgreSQL's {@code ::date} shorthand: the colon is
     * how Hibernate marks a named parameter, and a native query containing {@code ::} is a
     * parameter-parsing hazard for no gain.
     *
     * <p>Grouped and ordered by ordinal, which keeps the truncation expression written once. The
     * limit is in the SQL rather than applied in Java so the database returns thirty rows instead
     * of every day since launch.
     *
     * <p>Returns {@code Object[]} — a day and a count — rather than a constructor expression,
     * because a native query has no entity to construct against. {@code AffiliateAnalyticsService}
     * maps it, and that mapping is the only place the column order is depended on.
     */
    @Query(value = """
            SELECT CAST(clicked_at AS date) AS day, COUNT(*) AS clicks
            FROM affiliate_clicks
            GROUP BY 1
            ORDER BY 1 DESC
            LIMIT 30
            """, nativeQuery = true)
    List<Object[]> countByDayRaw();

    /**
     * How many clicks came from a signed-in user.
     *
     * <p>A count, not a list. The interesting figure is what proportion of referral traffic is
     * attributable at all — the rest of the analytics never needs to know which accounts they were.
     */
    @Query("SELECT COUNT(c) FROM AffiliateClick c WHERE c.user IS NOT NULL")
    long countAttributed();
}
