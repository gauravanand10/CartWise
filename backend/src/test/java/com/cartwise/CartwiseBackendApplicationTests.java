package com.cartwise;

import com.cartwise.testsupport.PostgresTestContainerConfig;
import com.cartwise.testsupport.RequiresDocker;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * The one test that asserts the whole application can start.
 *
 * <p>Before Chapter 21 this class was three lines and it <em>failed</em>. A bare
 * {@code @SpringBootTest} resolves no profile, so {@code spring.profiles.default: dev} applied and
 * the context tried to open {@code jdbc:postgresql://localhost:5432/cartwise_dev}. On a machine
 * with that database running it passed; anywhere else — a fresh clone, a CI runner — it threw
 * {@code IllegalState: Failed to load ApplicationContext} and took the build down with it. So the
 * suite was red on any machine that had not first been set up by hand, which is another way of
 * saying the build was not a signal. Chapter 24 wants GitHub Actions running {@code mvnw test} on
 * every push, and that would have failed on the first push.
 *
 * <p>The fix is the container: the database is now created by the test rather than assumed by it.
 *
 * <p><strong>What this test is actually worth.</strong> {@code contextLoads} has no assertions and
 * that is not an oversight — the assertion is the absence of a thrown exception during refresh. It
 * catches the class of failure no unit test can: a bean that cannot be constructed, two beans of a
 * type where the injection point expects one, a {@code @ConfigurationProperties} binding that fails
 * validation, an entity whose mapping cannot be realised as DDL, a {@code SecurityFilterChain} that
 * does not compile into a chain. Those are wiring failures, and wiring is exactly what a suite of
 * mocked unit tests replaces rather than exercises.
 *
 * <p><strong>What it is not worth.</strong> It proves nothing about behaviour. A context that
 * starts is not an application that works, and the temptation with a slow full-context test is to
 * keep adding cases to it because the context is already paid for. That is how a suite ends up with
 * one 90-second class that fails for twenty unrelated reasons. Behaviour is asserted in the service
 * tests (mocked, fast), the repository tests ({@code @DatabaseTest} — a real PostgreSQL, rolled back
 * per method) and the controller tests ({@code @WebMvcTest}, sliced). This class stays at one method.
 *
 * <p>It carries the same four annotations {@code @DatabaseTest} composes, minus {@code @Transactional}
 * which a context-load check has no use for. That is deliberate rather than a missed refactor: Spring
 * caches contexts by configuration and {@code @Transactional} is not part of that key, so this class
 * and every repository test share one context — and therefore one container — for the whole run.
 */
@SpringBootTest
@Import(PostgresTestContainerConfig.class)
@ActiveProfiles("test")
@RequiresDocker
class CartwiseBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
