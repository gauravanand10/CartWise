package com.cartwise.common.dto;

import java.util.List;

/**
 * The whole affiliate click report, as {@code GET /api/admin/affiliate/clicks} returns it.
 * Chapter 26.
 *
 * <p>Three aggregates and three totals in one response rather than three endpoints, because they
 * are one screen: an admin looking at "clicks per retailer" without "clicks per product" beside it
 * has half a picture, and three round trips to assemble one table is three chances for the numbers
 * to be from different moments.
 *
 * <p><strong>Deliberately not a dashboard.</strong> No time series beyond a flat per-day count, no
 * conversion rate, no attribution model, no cohorts. CartWise cannot compute a conversion rate: the
 * purchase happens on the retailer's site and the only signal that it happened is the retailer's own
 * commission report, which requires an approved affiliate account this project does not have. A
 * "conversion" figure here would be a number invented to fill a column.
 *
 * @param totalClicks      every click ever recorded
 * @param attributedClicks how many were made by a signed-in user
 * @param anonymousClicks  the remainder. Derived rather than queried — one fewer aggregate over the
 *                         same table, and it cannot disagree with the two figures it is drawn from
 * @param byProduct        clicks per product, busiest first
 * @param byRetailer       clicks per retailer, busiest first
 * @param byDay            clicks per UTC day, most recent first, at most 30 days
 */
public record AffiliateClickStats(
        long totalClicks,
        long attributedClicks,
        long anonymousClicks,
        List<ProductClickCount> byProduct,
        List<RetailerClickCount> byRetailer,
        List<DayClickCount> byDay) {

    /** Builds the report, deriving the anonymous count so it cannot contradict the other two. */
    public static AffiliateClickStats of(
            long totalClicks,
            long attributedClicks,
            List<ProductClickCount> byProduct,
            List<RetailerClickCount> byRetailer,
            List<DayClickCount> byDay) {

        return new AffiliateClickStats(
                totalClicks,
                attributedClicks,
                totalClicks - attributedClicks,
                byProduct,
                byRetailer,
                byDay);
    }
}
