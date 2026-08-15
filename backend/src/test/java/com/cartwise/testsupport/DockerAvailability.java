package com.cartwise.testsupport;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testcontainers.DockerClientFactory;

/**
 * Answers one question: can this machine start a container right now?
 *
 * <p>It exists because the honest answer is "not always". Testcontainers needs a Docker daemon,
 * and there are real environments without one — a CI runner that does not grant it, a locked-down
 * corporate laptop, a sandbox. The suite has to behave sensibly in those, and there are only three
 * options for what "sensibly" means:
 *
 * <ol>
 *   <li>Fail. Correct in the sense that the tests genuinely did not run, but it makes the build red
 *       for a reason that has nothing to do with the code, and a build that is red for
 *       environmental reasons stops being read.
 *   <li>Fall back to an in-memory database. Rejected for the reason stated in
 *       {@code application-dev.yml}: a test that passes against H2 has asserted that H2 behaves,
 *       which is not the claim anyone wanted.
 *   <li>Skip, loudly. The unit and controller tests — the large majority — still run and still
 *       gate the build. The database tests report as skipped, which is visible in the surefire
 *       output rather than silently absent.
 * </ol>
 *
 * <p>Option 3 is what this class implements, and its weakness should be named: a skipped test
 * proves nothing, so a run with no Docker is a weaker signal than a run with it. That is
 * acceptable only because the environments that matter — a developer's machine and the GitHub
 * Actions Ubuntu runner (Chapter 24) — both have a daemon, so the guard is a fallback rather than
 * the normal path. If it ever becomes the normal path, the coverage number is lying.
 */
public final class DockerAvailability {

    private static final Logger log = LoggerFactory.getLogger(DockerAvailability.class);

    /**
     * Cached because {@link DockerClientFactory#isDockerAvailable()} performs real I/O — it opens a
     * connection to the daemon socket — and JUnit evaluates the condition once per annotated class.
     * Without caching, a suite with a dozen container-backed classes pays that probe a dozen times,
     * and on a machine with no daemon each probe is a connection attempt that has to time out.
     */
    private static final boolean AVAILABLE = probe();

    private DockerAvailability() {
    }

    /**
     * Referenced by name from {@link RequiresDocker}. Must stay {@code public static boolean} with
     * no arguments: JUnit's {@code @EnabledIf} resolves it reflectively from a string, so renaming
     * or narrowing it breaks at run time with a condition-evaluation error rather than at compile
     * time. That is the cost of the annotation's string-based contract and the reason this method
     * is not inlined anywhere.
     */
    public static boolean isDockerAvailable() {
        return AVAILABLE;
    }

    private static boolean probe() {
        try {
            boolean available = DockerClientFactory.instance().isDockerAvailable();
            if (!available) {
                log.warn("Docker is not available - container-backed tests will be SKIPPED, not run. "
                        + "This run is a weaker signal than one with a daemon present.");
            }
            return available;
        } catch (Throwable t) {
            // Throwable, not Exception, and deliberately. A missing or incompatible docker-java
            // native transport surfaces as NoClassDefFoundError or UnsatisfiedLinkError, neither of
            // which is an Exception. Letting those escape would turn "no Docker here" into a suite
            // that errors during condition evaluation, which is the failure mode this class exists
            // to prevent.
            log.warn("Probing for Docker failed ({}) - container-backed tests will be SKIPPED.",
                    t.toString());
            return false;
        }
    }
}
