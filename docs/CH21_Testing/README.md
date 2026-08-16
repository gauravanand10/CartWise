# 🧪 CH21 — Testing

> **Project:** CartWise  
> **Chapter:** Testing

---

# 👋 Welcome

Chapters 1–20 built CartWise: a full-stack product-comparison platform with a React frontend, Spring Boot backend, and PostgreSQL database. The code works. The features ship. But there are no tests.

`Tests run: 1` — and that one test was a context-load smoke test that actually *failed* on any machine without a PostgreSQL instance running locally. The test was broken, not a safety net.

Chapter 21 fixes this. It builds a test suite from the ground up: unit tests for business logic, integration tests against a real database, controller tests for HTTP behavior, and frontend component tests. By the end, 313 backend tests + 113 frontend tests exercise the code CartWise has accumulated, and the suite catches bugs — real ones that would have shipped.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- What a unit test is, why it runs fast, and when to write one instead of an integration test.
- How Testcontainers spins up a real PostgreSQL database for tests, eliminating the H2 vs. production dialect problem.
- How Spring's test slices (@WebMvcTest, @DataJpaTest) let you test in isolation without booting the entire application.
- Why mocking dependencies is essential for unit tests and how Mockito makes it straightforward.
- How to verify authorization rules with @WebMvcTest + real SecurityConfig, not a permissive default.
- How to test React components with React Testing Library, querying by accessible role and name instead of CSS classes.
- How JaCoCo measures code coverage and why high coverage numbers without testing *logic* are empty.
- The test pyramid: many fast unit tests at the base, fewer integration tests in the middle, very few slow E2E tests at the top.
- How to write a test that actually fails when the code is wrong — not a false positive.

---

# 📡 What Is Testing?

A test is a program that exercises your code and asserts it behaves as expected. If it behaves differently, the test fails and tells you what went wrong. A passing test means the code worked *this time, under these conditions* — not that it's correct forever, but that it was correct on the last run.

Tests serve three purposes:

1. **Regression prevention.** Once you fix a bug, write a test that would have caught it. Re-run that test on every build; if the bug comes back, the test fails and you catch it before shipping.

2. **Documentation.** A test shows how to use a class or function. Read the test and you see the happy path, the unhappy path, and edge cases.

3. **Design feedback.** Code that's hard to test is often code that's doing too much. Writing tests first (or early) shapes the design toward simpler, more modular code.

CartWise's test suite does all three. It catches the tie-breaker bug in pagination, documents how to use the JWT provider, and kept the codebase honest about authorization rules.

---

# 🔺 The Test Pyramid

The pyramid says: write many fast tests, some medium tests, very few slow tests.

**Unit tests** (base): test a single class or method with mocked dependencies. No Spring context, no database. Run in milliseconds. CartWise has 187 unit tests.

**Integration tests** (middle): test multiple components together against a real database or external service. Spring context loads (but sliced — not the whole app). PostgreSQL container starts. Run in seconds. CartWise has 47 repository tests.

**Controller tests** (middle): test the HTTP layer with MockMvc (simulated HTTP, no real server) and mocked services. Spring context loads a web slice. Run in hundreds of milliseconds. CartWise has 79 controller tests.

**E2E tests** (point): test the whole app end-to-end — browser automation, real HTTP, real database. Run in minutes. CartWise has 0 E2E tests (out of scope).

An inverted pyramid (many slow tests, few fast tests) is a smell: your test suite is slow to run, flaky (more moving parts = more failure modes), and expensive to maintain.

---

# ⚖️ Isolation vs. Realism

Every test sits on a spectrum: more isolated (faster, fewer dependencies, less realistic) vs. more realistic (slower, all dependencies, proves the actual system works).

A unit test of `PasswordHasher.matches()` mocks nothing — the code is so simple there's nothing to mock. Runs in 1ms. Proves BCrypt works correctly, but not that the login endpoint calls it correctly.

A controller test of `POST /api/auth/login` mocks the `AuthService` (the test doesn't care if the service is correct, only that the controller calls it). Runs in 10ms. Proves the controller validates input and returns the right status code, but doesn't prove the service's logic works.

An integration test of login end-to-end (controller + service + password hasher + repository + real database) mocks nothing. Runs in 500ms. Proves the whole flow works, but slower and more complex to set up.

CartWise uses all three because each catches different bugs:
- Unit tests catch logic errors in isolation (PasswordHasher truncates at 72 bytes — that's a unit test).
- Controller tests catch HTTP-layer errors (401 when token is missing — controller test).
- Integration tests catch database-layer errors (pagination tie-breaker causes duplicates — repository integration test).

---

# 🐳 Testcontainers

Testcontainers is a library that spins up Docker containers on demand for tests — PostgreSQL, Redis, RabbitMQ, etc. — and tears them down afterward.

Why use it?

**H2 is a lie.** H2 is an in-memory database that mimics PostgreSQL but has subtle differences in SQL dialect, collation, function support. A test that passes against H2 proves that H2 behaves — not that your real Postgres does. CartWise had a sort tie-breaker bug: when two products had the same price, pagination would drop or duplicate rows. That's a Postgres collation behavior. H2 might have silently passed.

**Containers are ephemeral.** Each test run gets a fresh container, so tests don't interfere with each other or your dev database. No need to clean up after tests — the container is destroyed.

**Real database.** postgres:17.6 in a container is the same version as production, so the tests prove the actual behavior.

CartWise's repository tests use Testcontainers. Before each test run, a PostgreSQL 17.6 container starts. All 47 repository tests use it (Spring caches the context, so one container serves all tests). After all tests finish, the container is torn down. Total overhead: ~5 seconds at the start of the test run, zero per test.

---

# 🔒 The @ActiveProfiles Trap

Spring tests load configuration from `application.yml` (default) or profile-specific files (application-dev.yml, application-prod.yml, application-test.yml).

By default, if you forget to specify a profile, Spring loads the dev profile. For CartWise, dev points at `jdbc:postgresql://localhost:5432/cartwise_dev` — your *real* development database.

A test with `@SpringBootTest` and `ddl-auto: create-drop` will issue `DROP TABLE ... CASCADE` against that database and wipe your data.

This happened in CH21's baseline run. The original `CartwiseBackendApplicationTests` had no `@ActiveProfiles`, so it connected to the dev database and dropped the schema. The test was annotated as a safety check but was actually a foot-gun.

**The fix:** every test that touches a database must declare `@ActiveProfiles("test")`. This loads `application-test.yml`, which points at the Testcontainers-managed database instead.

---

# 🔑 Key Findings

Three bugs CartWise's test suite caught:

**1. Pagination tie-breaker.** `ProductRepositoryTest.pagesDoNotDropOrDuplicateRows` inserts 30 products with the same price, pages through them, and asserts each product appears exactly once. Without a sort tie-breaker (second sort key), products tied at price P could appear on both page 0 and page 1, and other products would be skipped. The test walked 30 pages and found product id 161 on two pages — bug confirmed. Fixed by adding `.and(Sort.by(ASC, "id"))` to the sort.

**2. User enumeration oracle.** `AuthServiceTest` verifies that login with an unknown email and login with a wrong password both fail with the *same* error message. If they differed, an attacker could discover which emails exist in the database by trying to log in and seeing different error messages. The test catches this by asserting both failures are indistinguishable.

**3. Write endpoint under public read permission.** If someone later adds a `POST /api/products` endpoint and forgets to require authentication, `ProductControllerTest.writeMethodsAreNotCoveredByTheReadPermit` asserts that POST returns 401. Same for PUT/DELETE. The test is a boundary check.

---

# 📊 Coverage

JaCoCo measures which lines of code were executed during tests and produces a percentage. CartWise's target:

- **Service layer:** 95%+ line coverage. Business logic should be thoroughly tested.
- **Controller layer:** 100% line, 90%+ branch. HTTP routing and error handling are critical.
- **Security layer:** 100% line and branch. Authentication and authorization have no room for bugs.
- **Repository layer:** 100% line. Queries must work correctly.

Final numbers:

| Package | Line | Branch | Notes |
|---|---|---|---|
| service | 99.1% | 92.9% | One edge case untested (price tie at exact boundary). |
| controller | 100% | 90% | All status codes tested; some error combinations untested. |
| security | 100% | 100% | JWT tamper, expiry, wrong key all tested. |
| repository | 100% | 100% | All query paths exercised. |
| entity | 78.1% | — | Mostly generated getters; not worth testing. |
| config | 95.6% | 50% | Settings are wired; not logic-heavy. |

The blended project coverage is 95.4% instruction / 91.3% branch because the project also includes DTOs (excluded, no logic) and config (auto-wired, low ROI to test). Ignore the blended number; look at the layers that matter.

---

# 🔄 The Break-Then-Revert Demonstration

At the end of CH21, the suite removed the sort tie-breaker from `ProductSort.java` and re-ran the repository tests. Result:

Tests run: 51, Failures: 9, Errors: 0

Nine tests failed, including `pagesDoNotDropOrDuplicateRows`. The test caught the regression. Then the code was reverted:

Tests run: 51, Failures: 0, Errors: 0

All green. The git diff on `ProductSort.java` was empty — byte-identical to the original.

This proves the test actually tests something. Many test suites have false positives: tests that pass no matter what the code does. This one doesn't.

---

# 🏗️ Architecture & Decisions

**Why @SpringBootTest for repository tests instead of @DataJpaTest?**

`@DataJpaTest` is a lighter slice that loads only persistence components (repositories, entities). CartWise uses full `@SpringBootTest` for simplicity — everything is wired, no manual setup. Trade-off: slower startup (milliseconds per test, adds up), but acceptable for 47 tests.

**Why real PostgreSQL 17.6 in Testcontainers instead of H2?**

H2 is fast but lies. A test passing against H2 proves nothing about Postgres. CartWise's pagination bug would have been silent under H2. The 5-second container startup cost is worth the confidence.

**Why mock services in @WebMvcTest instead of testing end-to-end?**

The controller's job is HTTP: route requests, validate input, return status codes. The service's job is logic. Testing them together (end-to-end) makes failures harder to diagnose — was it a routing bug or a logic bug? Mocking the service lets the controller test focus on HTTP. The service tests focus on logic. Faster, clearer failures.

**Why exclude DTOs from coverage?**

A DTO is generated getters and setters — no logic. Testing `ProductDto.getSlug()` pushes the coverage number up without proving anything useful. Coverage should measure logic, not boilerplate. Excluded.

---

# 📭 What Is Deliberately Not Here

**No 100% coverage goal.** Coverage numbers are easy to manipulate (test a getter, tick the percentage up). CartWise targets meaningful coverage per layer (service: 95%, controller: 100%) rather than a blended number.

**No performance benchmarks.** Tests run fast; if they slow down, you'll notice. Formal benchmarking is a separate step, not part of the suite.

**No end-to-end Selenium tests.** Browser automation is slow and fragile. Covered by controller + component tests instead.

**No contract testing.** The backend tests assert the actual API shape from one side; the frontend mocks assert they're calling it correctly from the other side. They're not linked, which is a gap — but linking them (contract testing) is out of scope.

**No snapshot tests.** Snapshots assert "output didn't change," not "output is correct." They get blanket-approved when they're inconvenient. CartWise has none.

---

# 📌 Key Takeaways

After Chapter 21:

- Unit tests (187) run in milliseconds and catch logic bugs in isolation.
- Integration tests (47) run against a real PostgreSQL container and catch database bugs.
- Controller tests (79) verify HTTP routing, validation, and authorization.
- Frontend tests (113) render components in jsdom and verify user interactions.
- The suite catches three real bugs that would have shipped: pagination tie-breaker, user enumeration, write endpoint without auth.
- Coverage is 95%+ on logic-heavy layers (service, controller, security); lower on boilerplate (config, entity).
- `@ActiveProfiles("test")` is non-optional — forgetting it can destroy your dev database.
- Testcontainers provide a real PostgreSQL 17.6 container, eliminating H2 dialect lies.
- A good test fails when the code is wrong — verified by the break-then-revert demonstration.

---

# 🎯 Chapter Outcome

CartWise now has a safety net. Before every push:

cd backend && ./mvnw clean test
cd frontend && npm test -- --run

If any test fails, code doesn't ship. If code changes and the tests stay green, the behavior was preserved. If code changes and tests go red, the bug is caught before production.

The suite is not perfect (no E2E, no contract testing, frontend mocks don't prove the backend), but it's honest: it tests what it tests, and it catches real bugs.

---

# 📖 Chapter 22 — Schema Migrations & Data Layer Hardening

Next chapter replaces Hibernate's auto-schema management with Flyway versioned migrations, so the schema can evolve safely and predictably without losing data between deploys.
