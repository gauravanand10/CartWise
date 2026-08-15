package com.cartwise.testsupport;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Supplies the PostgreSQL instance that every database-backed test runs against.
 *
 * <p>Imported rather than extended, so the container is configuration a test opts into:
 *
 * <pre>{@code
 * @DataJpaTest
 * @Import(PostgresTestContainerConfig.class)
 * @ActiveProfiles("test")
 * @RequiresDocker
 * class ProductRepositoryTest { ... }
 * }</pre>
 *
 * <p><strong>@ActiveProfiles("test") is not optional.</strong> {@code application.yml} sets
 * {@code spring.profiles.default: dev}, so a test that forgets it loads dev — which points at
 * {@code jdbc:postgresql://localhost:5432/cartwise_dev}. On a developer's machine that database is
 * usually running, so the test does not fail. It passes, against the developer's real data, and
 * {@code create-drop} then drops it. The failure mode of forgetting this annotation is data loss on
 * a laptop, not a red build, which is why it is stated here in the largest available terms.
 *
 * <p><strong>On container lifecycle.</strong> There is no {@code start()} call and no
 * {@code @Container}: declaring the container as a bean hands its lifecycle to Spring, which starts
 * it before the context refreshes and stops it when the context is evicted. Because Spring caches
 * contexts by configuration, every test class importing this class shares one context and therefore
 * one container — the image is pulled once and the daemon starts one postgres for the whole run,
 * not one per class. Adding a {@code @MockitoBean} or a different {@code @ActiveProfiles} to a test
 * forks the cache key and pays for a second container; that is the main way a suite like this
 * silently gets slow.
 */
@TestConfiguration(proxyBeanMethods = false)
public class PostgresTestContainerConfig {

    /**
     * Pinned to the deployed version, and pinned exactly.
     *
     * <p>Not {@code postgres:17}, because a floating tag means the database under test changes
     * underneath the suite whenever the image is re-pulled, and "it passed last week" stops being a
     * statement about the code.
     *
     * <p>Not {@code -alpine}, which is the more interesting choice. The Alpine images link against
     * musl libc instead of glibc, and libc is what PostgreSQL delegates non-{@code C} collation to.
     * String ordering therefore differs between the two for exactly the cases this project sorts
     * on: case, accents, and punctuation in product names and category labels. A suite running on
     * Alpine while the deployment runs a glibc image would agree on every test except the ordering
     * ones, which is the worst possible place to disagree — {@code ORDER BY name} is a documented
     * feature here. The larger image is the price of the sort tests meaning something.
     *
     * <p>Unverified: this tag was pinned without a daemon available to pull it. If the first
     * container run reports {@code manifest unknown}, the tag does not exist and the fix is to move
     * to the nearest published 17.x — not to fall back to a floating tag.
     */
    private static final DockerImageName POSTGRES_IMAGE = DockerImageName.parse("postgres:17.6");

    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgresContainer() {
        return new PostgreSQLContainer<>(POSTGRES_IMAGE)
                // Named to match dev so a stack trace or a psql session reads the same in both.
                // The credentials are not a secret in any sense: the container listens on an
                // ephemeral loopback port and is destroyed with the context.
                .withDatabaseName("cartwise_test")
                .withUsername("cartwise")
                .withPassword("cartwise")
                // fsync off. The container's storage does not outlive the test run, so durability
                // buys nothing and costs a flush per commit — which, in a suite that commits
                // constantly, is most of the runtime. This is safe here for precisely the reason
                // it would be indefensible in production.
                .withCommand("postgres", "-c", "fsync=off", "-c", "full_page_writes=off");
    }
}
