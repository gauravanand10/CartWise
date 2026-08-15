package com.cartwise.testsupport;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.condition.EnabledIf;

/**
 * Marks a test that cannot run without a Docker daemon.
 *
 * <p>It carries two independent mechanisms, and they are not redundant:
 *
 * <ul>
 *   <li>{@code @EnabledIf} is <em>automatic</em>. The test runs wherever a daemon exists and skips
 *       where one does not, with no flag to remember. This is the mechanism that keeps
 *       {@code ./mvnw test} green on a machine without Docker.
 *   <li>{@code @Tag("integration")} is <em>manual</em>. It gives the build a name to select on —
 *       {@code -Dgroups=integration} to run only these, {@code -DexcludedGroups=integration} to
 *       skip them even where Docker exists. That matters for the fast inner loop: the container
 *       tests dominate the suite's wall-clock time, and being able to exclude them by name is the
 *       difference between running tests on every save and not running them.
 * </ul>
 *
 * <p>Why a meta-annotation rather than repeating both lines per class: the {@code @EnabledIf} value
 * is a string resolved reflectively, so a typo in it does not fail to compile — it fails at run
 * time, per class, with a condition-evaluation error. Writing it once means there is exactly one
 * place for that string to be wrong, and it is a place that is exercised by every container test.
 *
 * <p>{@code @Inherited} so an abstract base class can carry it. {@code ElementType.METHOD} is
 * included because a single method occasionally needs the database when its class does not.
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@Tag("integration")
@EnabledIf("com.cartwise.testsupport.DockerAvailability#isDockerAvailable")
public @interface RequiresDocker {
}
