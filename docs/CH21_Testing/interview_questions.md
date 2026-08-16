# 🎯 CH21 — Interview Questions

> **Project:** CartWise  
> **Chapter:** Testing

---

# 📚 Beginner Level

## Q1. What is a unit test, and why would you write one instead of an integration test?

### Answer

A unit test exercises a single class or method in isolation, with all external dependencies mocked or stubbed. No database, no network, no other services — just the code you're testing and its immediate collaborators.

You write unit tests when you want to test logic *fast* and *repeatedly* without external resources. They run in milliseconds. An integration test that hits a real database takes seconds and can be flaky if the database is down.

**CartWise example:** `PasswordHasherTest.matches_returnsFalse_forWrongPassword()` — no database, no Spring context, just logic. Runs in 1ms. If you made it hit a real Postgres instance, it would take 100x longer for no benefit.

---

## Q2. What does `@ActiveProfiles("test")` do, and why is it important?

### Answer

`@ActiveProfiles("test")` tells Spring to load the `application-test.yml` configuration file instead of the default `application-dev.yml`. Without it, a test might accidentally connect to your real development database.

**Why it's important:** If a test forgets this annotation and Spring loads the dev profile, a `@SpringBootTest` with `ddl-auto: create-drop` will issue `DROP TABLE ... CASCADE` against your real `cartwise_dev` database — losing your actual data. This happened in CH21's baseline run and is exactly why the annotation is non-optional.

---

## Q3. What is a mock, and how does it differ from a stub?

### Answer

A **mock** records what methods were called on it. You can assert `verify(mock).someMethod(args)` after the test. A **stub** just returns a fixed value — no recording.

- Mock: "Did this method get called with these arguments?" (behavior verification)
- Stub: "When you call this, return that." (state verification)

**CartWise example:**
```java
// Mock: verify the service was called
@Mock ProductService service;
productController.getProducts();
verify(service).findAll(); // assertion on behavior
```

```java
// Stub: just return a value
ProductService service = mock(ProductService.class);
when(service.findAll()).thenReturn(List.of(...));
List result = productController.getProducts();
assertThat(result).isNotEmpty(); // assertion on state
```

---

## Q4. Why does CartWise use a real PostgreSQL container for repository tests instead of H2?

### Answer

H2 is an in-memory database that mimics PostgreSQL but has subtle differences in SQL dialect, collation, and function support. A test that passes against H2 proves that H2 behaves — not that your real Postgres does.

CartWise uses `Testcontainers` to spin up a real `postgres:17.6` container before each test run. Same database as production, so the tests prove the actual queries work.

**CartWise example:** The `ProductRepositoryTest.pagesDoNotDropOrDuplicateRows` test discovered that a missing sort tie-breaker caused product id 161 to appear on two pages. That's a Postgres-specific behavior (how `OFFSET` handles tied values) — H2 might have silently passed.

---

## Q5. What is `@WebMvcTest`, and when should you use it?

### Answer

`@WebMvcTest` is a Spring slice that loads only the web layer — MockMvc is wired, but services are mocked and no database is set up. It's for testing controllers in isolation.

Use it when you want to verify HTTP layer behavior (status codes, routing, request/response shapes) without the overhead of booting the entire application.

**CartWise example:** `ProductControllerTest` uses `@WebMvcTest(ProductController.class)` — verifies the controller routes `/api/products` to `GET` and returns 200, but the `ProductService` is mocked so the test doesn't care what the service actually does.

---

## Q6. Why is `@SpringBootTest` slower than `@WebMvcTest`?

### Answer

`@SpringBootTest` boots the *entire* Spring application context — all beans, all auto-configurations, the works. `@WebMvcTest` is a slice that loads only the web layer.

`@SpringBootTest` takes seconds; `@WebMvcTest` takes milliseconds. Use the slice when possible.

**CartWise example:** `CartwiseBackendApplicationTests.contextLoads()` uses `@SpringBootTest` because the whole point is "does the entire app boot?" Repository tests also use `@SpringBootTest` (trade-off, noted in the report) because the fixture required accessing both entities and repositories.

---

## Q7. What does `@Transactional` do in a test?

### Answer

`@Transactional` wraps each test method in a transaction that rolls back after the test finishes. No data persists — the next test starts with a clean slate.

Use it on database tests to avoid one test's inserts polluting the next test.

**CartWise example:** `ProductRepositoryTest.findBySlug_returnsProduct()` inserts a product, queries it, asserts the result, then the transaction rolls back. The next test doesn't see that product.

---

## Q8. What is Testcontainers, and why does CartWise use it?

### Answer

Testcontainers is a library that spins up Docker containers (PostgreSQL, Redis, etc.) on demand for tests, destroying them afterward. Real external resources, but ephemeral and isolated per test run.

CartWise uses it because:
1. Real PostgreSQL (not H2), so tests prove actual behavior
2. Containers are destroyed after tests, so they don't interfere with dev/prod databases
3. Multiple test runs can run in parallel without conflicts

**CartWise example:** Before `ProductRepositoryTest` runs, a `postgres:17.6` container starts automatically. All 47 repository tests use it (Spring caches the context). After all tests finish, the container is torn down.

---

## Q9. What does `@RequiresDocker` do?

### Answer

It's a CartWise meta-annotation combining two things:
1. `@Tag("integration")` — labels the test so you can exclude it (`-DexcludedGroups=integration`)
2. `@EnabledIf(DockerAvailability.isDockerAvailable)` — skips the test if Docker is not running

So: if Docker is down, tests skip (no error, no failure); if Docker is up, tests run.

---

## Q10. Why does CartWise's test suite produce different numbers with Docker vs. without it?

### Answer

With Docker: 313 tests run (187 unit + 79 controller + 47 repository).
Without Docker: 287 tests run (skipped 21), but that under-counts — the actual 47 container-backed tests are skipped across multiple classes, so Surefire doesn't report each one individually.

The `-DexcludedGroups=integration` run confirms the count: 266 tests (313 − 47), which equals "287 − 21" because Spring skips entire test classes when their container isn't available, not individual methods.

---

# 📚 Intermediate Level

## Q11. What's the difference between `@DataJpaTest` and `@SpringBootTest` for repository tests?

### Answer

`@DataJpaTest` is a slice that loads only JPA/Hibernate components — repositories, entities, but no controllers, services, or security. Lighter weight, faster startup.

`@SpringBootTest` loads the entire context — everything. Heavier, slower.

CartWise uses `@SpringBootTest` for repository tests (not `@DataJpaTest`) — a trade-off documented in the report. The reason: `@DataJpaTest` doesn't auto-wire a `DataSource` in the same way, so the Testcontainers wiring would need extra manual setup. Full context buys simplicity.

---

## Q12. Why can't you use `@WebMvcTest` to test authorization logic?

### Answer

In Spring Boot 4.1, `@WebMvcTest` doesn't load Spring Security autoconfiguration at all — there's no security filter chain by default. So a naive authorization test would pass even if the real endpoint is open to the world.

To test real authorization in `@WebMvcTest`, you must explicitly `@Import(SecurityConfig.class)` plus the filters (`JwtAuthenticationFilter`, etc.). Then the real chain applies and the test is meaningful.

**CartWise example:** `ProductControllerTest` imports `SecurityConfig` explicitly. Without it, tests for "401 when no token" would silently pass against Boot's default open-to-everyone chain, not CartWise's real chain.

---

## Q13. What is a "test fixture," and how should CartWise use it?

### Answer

A fixture is reusable test data — objects, database records, configuration. You can set it up once and use it across many tests, saving repetition.

The temptation is to create a shared SQL file of seed data, so multiple tests use the same rows. **Don't do this in CartWise.** If Test A fails and you look at the database afterward, you won't know which rows belong to Test A and which are just shared fixture. Build fixture inside each test so failure messages are clear.

**CartWise example:** `ProductRepositoryTest` doesn't load a shared `fixture.sql`. Each test method creates the rows it needs inside the test, so a failure clearly names the data it failed on.

---

## Q14. Why does CartWise pin the test JVM to UTC with `-Duser.timezone=UTC`?

### Answer

PostgreSQL 17.6 doesn't recognize the timezone alias `Asia/Calcutta` (only the modern `Asia/Kolkata`). When the JVM reports its default timezone as `Asia/Calcutta` (common on older Windows installs), Testcontainers fails at "Unable to determine Dialect" with an unhelpful error.

Pinning to UTC avoids the mismatch — it's not ideal (tests run in a different timezone than dev), but it's honest. The alternative is a misleading error.

**CartWise example:** Run the container with JVM timezone UTC, and every repository test connects cleanly.

---

## Q15. How does JaCoCo measure coverage, and why does CartWise exclude DTOs?

### Answer

JaCoCo instruments bytecode and tracks which lines and branches are executed during tests. It produces a report with percentages per class.

CartWise excludes DTOs and config classes from coverage because testing `ProductDto.getSlug()` — the generated getter — produces high coverage numbers without proving anything about behavior. Coverage should measure *logic*, not *boilerplate*.

**CartWise example:** `ProductService` is 97.5% covered (high logic content); `common.exception` is 89.8% (real validation logic); `entity` is 77% (mostly generated accessors, less valuable to test).

---

## Q16. What does it mean that the frontend test suite uses "mock API" instead of hitting the real backend?

### Answer

`mockApi.ts` intercepts `fetch()` calls and returns stubbed responses. The frontend tests call the real client code but get fake responses, so only the client logic is tested.

**What this buys:** The real client code (query building, error handling, request headers) runs and is tested.

**What this costs:** The client-server contract is unverified in the frontend tests. Only the backend's `ProductControllerTest` verifies the actual API shape. If the backend and frontend mock disagree, the frontend tests stay green and the app breaks at runtime.

---

## Q17. Why does `HeroBanner.test.tsx` hand-compute card offsets instead of testing scroll-snap CSS?

### Answer

jsdom (the DOM implementation used in tests) doesn't compute real CSS layout — no measurements, no scroll positions, no scroll-snap behavior. The test can verify the component's *logic* (which card index is nearest), but not that CSS scroll-snap actually works.

**CartWise example:** The test simulates calling `scrollTo(index)` with hand-calculated offsets and asserts the component updates the visible card index. It doesn't assert that the browser actually scrolled.

---

## Q18. What's the difference between `userEvent` and `fireEvent` in React Testing Library?

### Answer

`fireEvent` fires DOM events directly — low-level, quick, but unrealistic. `userEvent` simulates real user input — respects disabled states, fires events in the right order, handles complex interactions.

Use `userEvent` for most tests; use `fireEvent` only when you need fine-grained event control.

**CartWise example:** ProductCard tests use `userEvent.click(heartButton)` — a realistic click that fires all the events a real click would.

---

## Q19. Why does CartWise's frontend test suite cap Vitest workers at 2?

### Answer

By default, Vitest runs tests in parallel with many worker threads (matching CPU count). With 16+ cores, that can overwhelm the test setup code (especially jsdom initialization), causing timeouts and flakiness.

Capping at 2 workers is slower (tests run more sequentially) but more stable — a trade-off accepted in the report.

---

## Q20. What is a "characterization test," and does CartWise use them?

### Answer

A characterization test documents the *current* behavior of code without judgment — "this is what it does, right or wrong." Useful for behavior that's undocumented or counterintuitive.

**CartWise example:** Tests for `PasswordHasher.matches("", validHash) == false` and the 72-byte truncation are characterization tests. They assert the real behavior (not ideal behavior) so future changes are intentional, not accidental.

---

# ⚛️ Spring/Testing-Specific Questions

## Q21. How does Spring's context caching work, and why does CartWise benefit from it?

### Answer

Spring caches loaded contexts by their configuration signature (active profiles, imported configs, bean definitions, etc.). If two tests have identical configuration, they share the *same* context instance.

CartWise's 47 repository tests + `CartwiseBackendApplicationTests` all use `@ActiveProfiles("test")` and `@Import(PostgresTestContainerConfig)` — identical config, so they share one context and therefore *one PostgreSQL container* for the whole run.

If a test adds `@MockitoBean`, it forks the cache key and gets a second context (and second container) — a silent performance penalty.

---

## Q22. Why is `@EnabledIf` better than `@Disabled` for skipping tests when Docker is unavailable?

### Answer

`@Disabled` skips a test unconditionally — you can't turn it back on without code changes. `@EnabledIf` evaluates a condition at runtime — when Docker returns, tests automatically run again.

CartWise uses `@EnabledIf(DockerAvailability.isDockerAvailable)` so container tests skip only when Docker is actually down, not permanently.

---

## Q23. What happens if a test forgets `@ActiveProfiles("test")` when using Testcontainers?

### Answer

Spring loads the default profile (dev), which points `spring.datasource.url` at `jdbc:postgresql://localhost:5432/cartwise_dev` — your *real* development database.

If the test has `ddl-auto: create-drop`, it will issue `DROP TABLE ... CASCADE` against your dev database, destroying your data.

This happened in CH21's baseline run and is why the annotation is flagged in the largest terms possible in the CH21 report.

---

## Q24. How does `@ServiceConnection` simplify Testcontainers setup?

### Answer

Without `@ServiceConnection`, you'd manually discover the container's host/port (ephemeral) and register it as properties using `@DynamicPropertySource`. Error-prone and repetitive.

`@ServiceConnection` on a bean automatically discovers the running container and registers its details as the datasource. One line of setup instead of three.

---

## Q25. Why does CartWise use `@SpringBootTest` instead of `@DataJpaTest` for repository tests, and what's the trade-off?

### Answer

`@DataJpaTest` is lighter-weight (only persistence components), but CartWise uses `@SpringBootTest` for simplicity — all the wiring is already in place.

Trade-off: slower startup (milliseconds per test, adds up across 47 tests), but no manual datasource setup required. For a project this size, acceptable.

A future optimization would switch to `@DataJpaTest` with manual `@DynamicPropertySource` datasource registration, but that's not in scope.

---

## Q26. How do you verify that a JWT token is actually validated, not just decoded?

### Answer

Write a test that provides a token with a tampered signature, then assert it's rejected. Decoding without validation would accept the tampered token.

**CartWise example:**
```java
String validToken = provider.generateToken(userId, email, role);
String tamperedToken = validToken.substring(0, validToken.length() - 10) + "xxxxxxxxxx";
Optional<AuthenticatedUser> result = provider.authenticate(tamperedToken);
assertThat(result).isEmpty(); // tampered token is rejected
```

---

## Q27. Why does `PasswordHasher.matches()` not enforce the 72-byte limit that `encode()` does?

### Answer

It's a design choice (or quirk) in BCrypt: `encode()` throws past 72 bytes, but `matches()` silently compares the first 72 bytes of the input to the hash.

So a 73-byte password can be stored (its first 72 bytes are hashed) and matched later only if you provide those exact 73 bytes. If you provide a different 73-byte password with the same first 72, it also matches — an entanglement, not a vulnerability here because CartWise enforces 8–72 bytes on signup.

CartWise tests this behavior as-is (characterization test) rather than trying to "fix" it.

---

## Q28. How does `GlobalExceptionHandler` integrate with controller tests, and why must you assert on the real JSON shape?

### Answer

`GlobalExceptionHandler` catches exceptions and returns structured JSON (status, message, timestamp). Controller tests must assert on the real shape so they verify not just "status 400" but "the error message is helpful."

**CartWise example:**
```java
mockMvc.perform(get("/api/products?minPrice=999999&maxPrice=1"))
  .andExpect(status().isBadRequest())
  .andExpect(jsonPath("$.message").value(containsString("minPrice > maxPrice")));
```

---

## Q29. What is the purpose of the "break-then-revert" demonstration in CH21's final report?

### Answer

To prove that a test actually fails when the code is wrong — not a false positive that passes no matter what. You break a line of production code, show the test goes red, then revert and show it goes green.

**CartWise example:** Removed the sort tie-breaker, 9 tests failed (pagination walk caught duplicate product ids), reverted, all 313 passed. Proves the suite catches real bugs.

---

## Q30. Why does CartWise's controller test base class explicitly import `SecurityConfig`, `JwtAuthenticationFilter`, etc., instead of relying on Spring's auto-configuration?

### Answer

Spring Boot 4.1's `@WebMvcTest` doesn't auto-wire security components — there's no filter chain by default. So importing them explicitly ensures the *real* authorization checks apply, not a permissive default.

Without the import, tests for "401 when no token" would pass against an open-to-everyone chain, not CartWise's actual JWT chain.

---

# 🏗️ Architecture Questions

## Q31. How does CartWise's three-tier test organization (unit / integration / controller) align with the test pyramid?

### Answer

The test pyramid has a wide base (many unit tests, fast), a narrower middle (integration tests, slower), and a point at the top (E2E tests, slowest).

CartWise mirrors this:
- **Base (unit):** 187 tests, no Spring context, milliseconds
- **Middle (integration):** 47 repository tests, real Postgres, seconds
- **Middle (controller):** 79 sliced `@WebMvcTest`, no database, hundreds of milliseconds
- **Frontend:** 113 component/hook tests, mocked API, milliseconds
- **E2E:** 0 (out of scope)

The pyramid is inverted if you have tons of slow tests and few fast ones — CartWise avoids this.

---

## Q32. Why should you not commit the 158-file CRLF line-ending churn before CH21?

### Answer

The repo has LF committed, Windows checkout wrote CRLF, and there's no `.gitattributes`. So a plain `git add` stages 158 files as "changed" (line-ending only) even though the content is identical.

Committing CH21 on top of that means the diff on GitHub shows hundreds of files "changed" (pure noise), burying the actual test code. A separate normalization commit first (`git add --renormalize .`) clears this noise so CH21's diff is readable.

---

## Q33. How does the `@DatabaseTest` meta-annotation reduce boilerplate while maintaining clarity?

### Answer

`@DatabaseTest` composes `@SpringBootTest + @Import(PostgresTestContainerConfig) + @ActiveProfiles("test") + @Transactional + @RequiresDocker` into one line.

Without it, every repository test repeats those five annotations. With it, clarity is preserved (one annotation that names its purpose) and boilerplate is gone.

---

## Q34. Why is it important that all repository tests share one PostgreSQL container instead of each spinning up its own?

### Answer

Startup cost. A PostgreSQL container takes seconds to start. If each test created its own, 47 tests would add minutes to the suite.

By sharing (Spring's context cache), the container starts once and serves all 47 repository tests. Cost: one container start per test run, not 47.

Trade-off: if tests accidentally modify shared data (violate isolation), failures are harder to debug. CartWise mitigates this with `@Transactional` — each test rolls back its changes.

---

## Q35. What is the purpose of `DockerAvailability.isDockerAvailable()`, and why is it cached?

### Answer

It checks whether Docker is running — probes the daemon socket and returns true/false. Cached because JUnit evaluates `@EnabledIf` conditions once per test class, and checking the socket multiple times is wasteful.

The cache persists for the life of the JVM, so a machine that starts without Docker but then launches it won't be detected — acceptable, because test runs are short and you restart for Docker anyway.

---

# 🧪 Scenario-Based Questions

## Q36. You're writing a test for `ProductService.findBySlug()`. How do you test the happy path, the unhappy path, and an edge case, and why should each be a separate test?

### Answer

**Happy path:** slug exists, returns the product
```java
@Test void findBySlug_returnsProduct_whenExists() {
  Product product = repository.save(new Product("iphone", ...));
  Optional<Product> result = service.findBySlug("iphone");
  assertThat(result).contains(product);
}
```

**Unhappy path:** slug doesn't exist, returns empty
```java
@Test void findBySlug_returnsEmpty_whenNotExists() {
  Optional<Product> result = service.findBySlug("nonexistent");
  assertThat(result).isEmpty();
}
```

**Edge case:** slug with special characters
```java
@Test void findBySlug_returnsProduct_withSpecialChars() {
  Product product = repository.save(new Product("iphone-16-pro", ...));
  Optional<Product> result = service.findBySlug("iphone-16-pro");
  assertThat(result).contains(product);
}
```

**Why separate tests?** Each test has one reason to fail. If you combine them, a single assertion failure makes it unclear which path broke.

---

## Q37. You've written a test that mocks `ProductService` in a controller test. How do you verify that the controller actually called the service?

### Answer

Use `verify()`:
```java
@Mock ProductService service;

mockMvc.perform(get("/api/products"))
  .andExpect(status().isOk());

verify(service).findAll(); // asserts service.findAll() was called
```

But be careful: verifying a method was called asserts *implementation*, not behavior. Better to assert on the response:
```java
when(service.findAll()).thenReturn(List.of(productDto));
mockMvc.perform(get("/api/products"))
  .andExpect(status().isOk())
  .andExpect(jsonPath("$[0].slug").value("iphone"));
// proves the service result made it to the response
```

CartWise prefers the second approach — behavior, not implementation.

---

## Q38. A frontend component test is flaky — it passes sometimes, fails randomly. What could cause this?

### Answer

Common causes:
1. **Race condition:** test doesn't wait for state update before asserting. Use `waitFor()` or `userEvent` (which waits automatically).
2. **Isolation breakdown:** test setup isn't cleaned up between runs, so state leaks. Check `beforeEach` setup / cleanup.
3. **Fake timers not advanced:** test uses `setTimeout` but doesn't advance fake timers. Use `vi.advanceTimersByTime()`.
4. **Test order dependency:** one test leaves data that affects the next. Each test should be independent.

**CartWise example:** `useDebounce` tests use fake timers and explicitly advance them, so they're reliable.

---

## Q39. You need to test that a user cannot access another user's wishlist. How do you write this test?

### Answer

Use `@WithMockUser` to simulate a logged-in request, then assert 403:
```java
@Test
@WithMockUser(username = "user1")
void getUserWishlist_returns403_forAnotherUser() {
  mockMvc.perform(get("/api/users/2/wishlist"))
    .andExpect(status().isForbidden());
}
```

CartWise's controller tests verify this for every user-scoped endpoint. The authorization check (comparing the token's user id to the URL's userId) is at the filter level, not the controller, so the test is a boundary check, not a deep logic check.

---

## Q40. A test passes locally but fails in CI because the timezone is different. How do you make it timezone-agnostic?

### Answer

If the test depends on timezone-sensitive operations (converting `java.util.Date` or database timestamps), either:
1. **Pin the JVM timezone** in test configuration (`-Duser.timezone=UTC`), or
2. **Use `java.time` classes** (`Instant`, `ZonedDateTime`) and assert on the instant, not the local time.

CartWise does #1 (pins UTC) because Testcontainers had timezone mismatches. A production-grade approach would use #2 — no timezone dependency at all.

---
