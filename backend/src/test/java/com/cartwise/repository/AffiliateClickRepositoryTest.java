package com.cartwise.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.cartwise.common.dto.DayClickCount;
import com.cartwise.entity.AffiliateClick;
import com.cartwise.entity.Product;
import com.cartwise.entity.Role;
import com.cartwise.entity.User;
import com.cartwise.service.AffiliateAnalyticsService;
import com.cartwise.testsupport.DatabaseTest;
import com.cartwise.testsupport.ProductFixtures;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * The three aggregates the admin click report is made of, against a real PostgreSQL.
 *
 * <p>These need a real database rather than mocks for a specific reason: two of the three queries
 * are things a mock cannot be wrong about. The per-day aggregate is native SQL using
 * {@code CAST(clicked_at AS date)}, which only PostgreSQL can confirm, and both constructor
 * expressions bind a JPQL {@code COUNT} — a {@code Long} — into a record component declared
 * {@code long}. That unboxing either works in Hibernate or fails at runtime with a message about
 * constructor resolution, and there is no way to find out except by running it.
 */
@DatabaseTest
class AffiliateClickRepositoryTest {

    @Autowired
    private AffiliateClickRepository clickRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * The real service, not a mock. It is in the context anyway ({@code @DatabaseTest} loads the
     * whole application) and it is what turns the native query's {@code Object[]} into the report's
     * shape — see {@link #countsByDay()} for why that mapping is asserted here rather than trusted.
     */
    @Autowired
    private AffiliateAnalyticsService analyticsService;

    private Product phone;
    private Product laptop;
    private User ada;

    @BeforeEach
    void seed() {
        clickRepository.deleteAll();
        userRepository.deleteAll();
        productRepository.deleteAll();
        clickRepository.flush();

        ada = userRepository.saveAndFlush(new User("ada@example.com", "$2a$10$x", Role.USER));
        phone = productRepository.saveAndFlush(
                ProductFixtures.product().slug("iphone-16-pro").name("iPhone 16 Pro").build());
        laptop = productRepository.saveAndFlush(
                ProductFixtures.product().slug("macbook-air-m4").name("MacBook Air M4").build());
    }

    private void click(Product product, User user, String retailer) {
        clickRepository.saveAndFlush(new AffiliateClick(product, user, retailer));
    }

    @Test
    @DisplayName("counts clicks per product, busiest first, with the product's own name")
    void countsByProduct() {
        click(phone, ada, "amazon");
        click(phone, null, "flipkart");
        click(laptop, null, "amazon");

        assertThat(clickRepository.countByProduct())
                .extracting("slug", "name", "clicks")
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("iphone-16-pro", "iPhone 16 Pro", 2L),
                        org.assertj.core.groups.Tuple.tuple("macbook-air-m4", "MacBook Air M4", 1L));
    }

    @Test
    @DisplayName("counts clicks per retailer, busiest first")
    void countsByRetailer() {
        click(phone, null, "amazon");
        click(laptop, null, "amazon");
        click(phone, null, "croma");

        assertThat(clickRepository.countByRetailer())
                .extracting("retailer", "clicks")
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("amazon", 2L),
                        org.assertj.core.groups.Tuple.tuple("croma", 1L));
    }

    /**
     * The split that makes the report meaningful: how much referral traffic is attributable at all.
     * An anonymous click stores NULL rather than a sentinel, which is what lets this be one
     * predicate instead of a comparison against a magic id.
     */
    @Test
    @DisplayName("counts only the clicks made by a signed-in user as attributed")
    void countsAttributedClicks() {
        click(phone, ada, "amazon");
        click(phone, null, "amazon");
        click(laptop, null, "flipkart");

        assertThat(clickRepository.count()).isEqualTo(3);
        assertThat(clickRepository.countAttributed()).isEqualTo(1);
    }

    /**
     * The native per-day query and the hand-written mapping that reads it, asserted together through
     * {@link AffiliateAnalyticsService} rather than against the raw rows.
     *
     * <p>That is deliberate rather than convenient. The raw query returns {@code Object[]}, and what
     * the driver actually puts in slot zero is not something a reader can know by looking — this test
     * was first written casting to {@link java.sql.Date} and failed with a
     * {@code ClassCastException}, because Hibernate 7 with this PostgreSQL driver returns a
     * {@link LocalDate} already. Asserting through the service means the conversion is covered by the
     * same test as the query, so the next driver or Hibernate upgrade that changes the answer fails
     * here instead of in an admin's browser.
     *
     * <p>Rows are inserted "now", so the assertion is against today's UTC date rather than a fixed
     * one: {@code clickedAt} is set by {@code @PrePersist} from the system clock and is deliberately
     * not settable.
     */
    @Test
    @DisplayName("groups clicks by UTC calendar day, through the mapping the report uses")
    void countsByDay() {
        click(phone, null, "amazon");
        click(laptop, ada, "flipkart");

        List<DayClickCount> byDay = analyticsService.stats().byDay();

        assertThat(byDay).containsExactly(
                new DayClickCount(LocalDate.now(ZoneOffset.UTC), 2L));
    }

    @Test
    @DisplayName("returns empty aggregates rather than failing when nothing has been clicked")
    void emptyTableIsNotAnError() {
        assertThat(clickRepository.countByProduct()).isEmpty();
        assertThat(clickRepository.countByRetailer()).isEmpty();
        assertThat(clickRepository.countByDayRaw()).isEmpty();
        assertThat(clickRepository.countAttributed()).isZero();
    }
}
