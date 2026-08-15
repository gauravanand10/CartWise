package com.cartwise.testsupport;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * A test that talks to a real PostgreSQL, in a container, and undoes itself afterwards.
 *
 * <p><strong>Why {@code @SpringBootTest} rather than the {@code @DataJpaTest} slice.</strong> Boot 4
 * moved {@code @DataJpaTest} into its own {@code spring-boot-data-jpa-test} module, which no longer
 * ships {@code AutoConfigureTestDatabase} or {@code TestEntityManager} — so the usual recipe
 * ({@code @DataJpaTest} plus {@code @AutoConfigureTestDatabase(replace = NONE)} to stop Boot
 * swapping in an embedded database) does not apply here, and what the slice does about the
 * {@code DataSource} in this version would have to be established by experiment before any test could
 * be trusted. A full context has no such question: nothing replaces the {@code DataSource}, so the
 * container supplied by {@link PostgresTestContainerConfig} is unambiguously what the repositories
 * talk to.
 *
 * <p>The cost is stated rather than hidden: this loads the whole application context, including the
 * web layer that a repository test does not need. It is slower than a slice would be, and a broken
 * bean anywhere in the application can fail a test that is nominally about a query. What it buys back
 * is that these classes share a context with {@code CartwiseBackendApplicationTests} — same
 * annotations, same cache key — so Spring reuses one context and Testcontainers starts <em>one</em>
 * container for the entire run rather than one per class.
 *
 * <p>{@code @Transactional} on a test class means Spring rolls the transaction back when the method
 * ends. Each test therefore starts from the schema as created and leaves nothing behind, without any
 * cleanup code and without recreating the schema per class. Note the consequence: a test asserting
 * something about a <em>committed</em> row cannot use this annotation, and a constraint violation has
 * to be provoked with an explicit flush, because nothing else forces the INSERT to reach the database
 * before the rollback.
 *
 * <p>{@link RequiresDocker} rides along, so every class carrying this annotation skips rather than
 * fails where no daemon exists — and {@code @ActiveProfiles("test")} is here rather than per class
 * precisely because forgetting it is the one mistake that destroys a developer's dev database. See
 * {@link PostgresTestContainerConfig}.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@SpringBootTest
@Import(PostgresTestContainerConfig.class)
@ActiveProfiles("test")
@Transactional
@RequiresDocker
public @interface DatabaseTest {
}
