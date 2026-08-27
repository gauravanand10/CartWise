package com.cartwise.service;

import com.cartwise.common.dto.AffiliateClickStats;
import com.cartwise.common.dto.DayClickCount;
import com.cartwise.repository.AffiliateClickRepository;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The affiliate click report. Chapter 26.
 *
 * <p>Separate from {@link AffiliateLinkService} on purpose, and the split is along a line that
 * matters rather than by size. That service is on the hot path — it runs inside a redirect a user is
 * waiting on, and it writes. This one is admin-only, reads, and runs three aggregates over a table
 * that grows without bound. Keeping them apart means a slow report cannot be accidentally invoked
 * from the click path, and the admin surface has exactly one class to audit.
 *
 * <p><strong>No authorization here.</strong> That is enforced once, by
 * {@code .requestMatchers("/api/admin/**").hasRole("ADMIN")} in {@code SecurityConfig}, which is the
 * same arrangement {@link UserAdminService} has and for the same reason — a second check in the
 * service would be a second place for the rule to be right or wrong.
 */
@Service
public class AffiliateAnalyticsService {

    private final AffiliateClickRepository clickRepository;

    public AffiliateAnalyticsService(AffiliateClickRepository clickRepository) {
        this.clickRepository = clickRepository;
    }

    /**
     * Every aggregate the admin report shows, from one transaction.
     *
     * <p>{@code readOnly}, and the transaction is doing real work rather than decorating: four
     * separate queries run inside it, and without one they would each see their own snapshot. A
     * click landing between the total and the per-retailer breakdown would produce a report whose
     * parts do not add up — the kind of discrepancy that costs an hour to chase and was never a bug
     * in the data.
     */
    @Transactional(readOnly = true)
    public AffiliateClickStats stats() {
        long total = clickRepository.count();
        long attributed = clickRepository.countAttributed();

        return AffiliateClickStats.of(
                total,
                attributed,
                clickRepository.countByProduct(),
                clickRepository.countByRetailer(),
                toDailyCounts(clickRepository.countByDayRaw()));
    }

    /**
     * Maps the native per-day query's rows.
     *
     * <p>The only place in this feature that depends on a column's position, which is why it is one
     * short method next to the query it belongs to rather than inlined into {@link #stats()}.
     *
     * <p>What the day actually arrives as is <strong>not</strong> obvious and was established by
     * running it rather than assumed: on Hibernate 7 with the current PostgreSQL driver a
     * {@code date} column comes back as a {@link LocalDate} already, though the older
     * {@link java.sql.Date} is the shape most examples expect. Both are handled, because a driver or
     * Hibernate upgrade is allowed to change the answer and a {@code ClassCastException} in an admin
     * report is a poor way to find out. The count is read through {@link Number} for the same reason
     * — its exact class is the driver's business.
     */
    private static List<DayClickCount> toDailyCounts(List<Object[]> rows) {
        return rows.stream()
                .map(row -> new DayClickCount(
                        toLocalDate(row[0]),
                        ((Number) row[1]).longValue()))
                .toList();
    }

    private static LocalDate toLocalDate(Object value) {
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        return (LocalDate) value;
    }
}
