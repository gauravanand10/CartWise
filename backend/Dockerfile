# CartWise backend — production image. Chapter 25.
#
# Multi-stage: the build stage carries Maven, the JDK, the source tree and ~200MB of downloaded
# dependencies; none of that reaches the runtime image, which gets a JRE and one jar. The
# difference is not only size — the shipped image has no compiler, no build tool and no source, so
# there is materially less in it for anything that gets a shell to use.

# ---------------------------------------------------------------------------------------------
# Stage 1 — build
# ---------------------------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /build

# Dependencies before source, deliberately. Docker caches per layer, and the pom changes far less
# often than the code does — so an ordinary source edit reuses the cached dependency layer instead
# of re-resolving every artifact. Copying the whole tree first would invalidate that on every edit.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src

# Tests are skipped HERE and run in CI instead (see .github/workflows/ci.yml), which is a real
# trade rather than a shortcut. The suite uses Testcontainers: it needs a Docker daemon, and this
# build is already running inside Docker — supplying one would mean docker-in-docker or mounting
# the host socket into a build, both of which are considerable complexity and, in the socket case,
# a genuine privilege problem. CI runs the same tests on a runner that has a daemon. The rule that
# follows is worth stating: a green image build is not evidence the tests pass, and only the CI
# workflow is.
RUN mvn -B clean package -DskipTests

# ---------------------------------------------------------------------------------------------
# Stage 2 — runtime
# ---------------------------------------------------------------------------------------------
# JRE, not JDK: nothing at runtime compiles anything.
FROM eclipse-temurin:21-jre-alpine AS runtime

# Non-root. The Java process needs to read its own jar and open one port, and root is required for
# neither — so a container escape starts as an unprivileged user with nothing to own.
RUN addgroup -S cartwise && adduser -S cartwise -G cartwise

WORKDIR /app

COPY --from=build --chown=cartwise:cartwise /build/target/*.jar app.jar

USER cartwise

EXPOSE 8080

# NO ENV / ARG FOR ANY SECRET IN THIS FILE, AND THAT IS THE POINT OF THIS COMMENT.
#
# Every `ENV` and every `ARG` is recorded in the image's own metadata and is readable with
# `docker history` or `docker inspect` by anyone who can pull the image — including from a layer
# that a later instruction "overwrote", because layers are additive and nothing is ever removed.
# A JWT_SECRET baked in here would be public the moment the image was pushed anywhere.
#
# Secrets are supplied at *run* time — docker-compose passes them as environment variables from
# .env — where they live in the container's process environment and not in any layer. Verified for
# this chapter by inspecting the built image's history rather than by trusting this comment.

# Container-aware defaults rather than a fixed -Xmx. The JVM reads the cgroup limit and takes a
# percentage of it, so the same image behaves sensibly under whatever memory the runtime grants.
# A hardcoded heap would either waste a large allocation or be OOM-killed by a small one.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

# The profile is a default, not a secret, and is overridden by compose. `dev` matches
# application.yml's own `spring.profiles.default`, so the image behaves the same way an unqualified
# local run does.
ENV SPRING_PROFILES_ACTIVE=dev

# Exec form via `sh -c` because $JAVA_OPTS has to be word-split by a shell to become separate
# arguments. Plain exec form would pass the whole string as one argument and the JVM would reject
# it. `exec` replaces the shell so the JVM is PID 1 and receives SIGTERM directly — without it the
# shell holds PID 1, swallows the signal, and every stop becomes a ten-second timeout and a kill.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
