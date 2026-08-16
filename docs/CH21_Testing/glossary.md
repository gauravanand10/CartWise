# 📖 CH21 — Glossary

> **Project:** CartWise  
> **Chapter:** Testing

---

## Unit Test

A test that exercises a single class or method in isolation, with all dependencies mocked or stubbed. No Spring context, no database, no network — just logic and assertions.

### CartWise Context

`ProductServiceTest`, `PasswordHasherTest`, `JwtTokenProviderTest` are unit tests. They run in milliseconds because they touch nothing external.

---

## Integration Test

A test that exercises multiple components together against a real external resource — usually a database. Spring context loads; transactions roll back after each test to keep state isolated.

### CartWise Context

Repository tests like `ProductRepositoryTest` are integration tests. They run against a real PostgreSQL container, asserting that queries produce correct results and constraints are enforced at the DB level.

---

## Component Test

A frontend test that renders a React component and verifies its behavior through user interaction — clicking, typing, navigating. No backend; the network layer is mocked at the fetch boundary.

### CartWise Context

`ProductCard.test.tsx` renders the component, simulates a click on the heart button, and asserts that `aria-pressed` toggles and the label changes. The API call is mocked; only the component code runs.

---

## Test Double

A fake object standing in for a real one — could be a mock, a stub, or a spy. It lets you isolate the code under test.

---

## Mock

A test double that records what methods were called on it. You can then assert `verify(mock).someMethod(args)` to confirm the call happened with exactly those arguments.

### CartWise Context

In `ProductControllerTest`, the `ProductService` is mocked so the test can verify "when the controller calls findAll(), it passes the right arguments" without caring what the service actually does.

---

## Stub

A test double that returns a fixed value. No recording, no verification — just "when you call this, return that."

### CartWise Context

In `AuthServiceTest`, `PasswordHasher` is stubbed to return `true` on every call, so the test can focus on the login logic without worrying about real password verification.

---

## Spy

A test double that wraps the real object — calls go through to the real code, but the spy records what happened. Hybrid of mock and stub.

### CartWise Context

Not heavily used in CartWise's suite; `@Spy` appears in a few service tests to verify that a dependency was called while still executing its real logic.

---

## Fake

A working but simplified implementation. Not a mock, not a stub — it has real logic, just cut down for testing.

### CartWise Context

`mockApi.ts` in the frontend test suite is a fake — it has real logic (returns different responses for different queries), not just stubbed returns.

---

## Fixture

Reusable test data — objects, database records, or configuration set up once and used by many tests.

### CartWise Context

Each repository test builds its own fixture (rows it needs), not a shared file, so a failure clearly names the data it was testing.

---

## Assertion

A statement in a test that checks whether something is true. If it fails, the test fails.

### CartWise Context

`assertThat(hashedPassword).isNotEqualTo(password)` — the assertion that a BCrypt hash is not the plaintext password.

---

## Arrange-Act-Assert

The three-phase structure of most tests: arrange (set up), act (call the code), assert (check the result).

### CartWise Context

```java
// Arrange: create a product
Product product = new Product("slug", "name", ...);
// Act: convert to DTO
ProductDto dto = mapper.toDto(product);
// Assert: verify fields
assertThat(dto.slug()).isEqualTo("slug");
```

---

## Test Pyramid

A model of test distribution: many unit tests (base), fewer integration tests (middle), very few end-to-end tests (top). CartWise follows this — 187 unit, 79 controller, 47 integration, 113 frontend component.

---

## Flaky Test

A test that passes and fails randomly, unpredictably. A sign of isolation problems or real timing issues.

### CartWise Context

None deliberately in CartWise's suite; the Vitest thread pool cap (max 2 workers) was added to prevent flakiness from test-file isolation breaking down under load.

---

## Test Isolation

The principle that each test should be independent — passing or failing one test should not affect another. Transactions roll back, containers reset, mocks are fresh per test.

### CartWise Context

Repository tests use `@Transactional` and each gets its own transaction rolled back after the test, so Test A's insert doesn't leak data into Test B.

---

## Testcontainers

A library that spins up Docker containers (databases, message brokers, etc.) on demand for tests, destroying them after. Real external resources, but ephemeral.

### CartWise Context

PostgreSQL container spins up before the first repository test, shared by all of them (Spring caches the context), torn down after all tests finish.

---

## @ServiceConnection

A Spring annotation that discovers a running container and registers its connection details (host, port, credentials) as the test datasource, without hardcoding anything.

### CartWise Context

`@ServiceConnection` on `PostgresTestContainerConfig` tells Spring "use this container's postgres:5432 for tests" — the exact host/port discovered at runtime, not assumed.

---

## @DataJpaTest

A Spring slice that loads only JPA components — repositories, entities, no controllers, no services. Lighter context than `@SpringBootTest`, faster.

### CartWise Context

CartWise uses `@SpringBootTest` instead (loaded full context for repository tests) — a trade-off accepted for simplicity, verified as a choice in the report.

---

## @WebMvcTest

A Spring slice for testing controllers — MockMvc is wired, services are mocked, but no database is set up. Only the HTTP layer.

### CartWise Context

`ProductControllerTest` uses `@WebMvcTest(ProductController.class)` — verifies the controller's routing and status codes, with the service stubbed out.

---

## @SpringBootTest

Loads the entire Spring context — everything. Slowest to start, closest to production. Used when you need realistic wiring.

### CartWise Context

`CartwiseBackendApplicationTests` uses it (plus `@Import(PostgresTestContainerConfig)` and `@ActiveProfiles("test")`) — the smoke test that confirms the whole app boots.

---

## Test Slice

A Spring test configuration that loads only a subset of the application — `@WebMvcTest` loads the web layer, `@DataJpaTest` loads persistence, etc. Faster than full context.

---

## Application Context Cache

Spring caches loaded contexts by their configuration (active profiles, imported configs, etc.) and reuses the same context across tests with matching config. If you add `@MockitoBean`, you fork the cache key.

### CartWise Context

All 47 repository tests + `CartwiseBackendApplicationTests` share one context and therefore one PostgreSQL container because they have identical `@ActiveProfiles("test")` and imports. No `@MockitoBean` in any of them.

---

## MockMvc

A Spring Testing utility that simulates HTTP requests without starting a server. You can assert on status codes, response bodies, headers, etc.

### CartWise Context

`ProductControllerTest` uses `mockMvc.perform(get("/api/products")).andExpect(status().isOk())` — no real HTTP, no real server, just assertion.

---

## @MockitoBean

A Spring annotation that registers a Mockito mock as a Spring bean, so services can be injected with mocks rather than real implementations.

### CartWise Context

`ProductControllerTest` declares `@MockitoBean ProductService productService;` — when the controller is instantiated, it gets a mock, not the real service.

---

## @WithMockUser

A Spring Security Testing annotation that simulates an authenticated request. You can specify username, roles, authorities.

### CartWise Context

`@WithMockUser(username = "user1", roles = "USER")` simulates a logged-in request in a controller test, so authorization checks pass.

---

## JaCoCo

A code coverage tool that instruments bytecode and tracks which lines and branches were executed during tests. Produces an HTML report.

### CartWise Context

`mvn clean test` fires JaCoCo's `prepare-agent` and `report` goals, generating `target/site/jacoco/index.html` with percentages per package (service: 97.5%, controller: 100%, etc.).

---

## Line Coverage

Percentage of executable lines that were actually executed during testing. `ProductService` is 99.1% line-covered — almost every line ran.

---

## Branch Coverage

Percentage of if/else branches that were taken. If a method has `if (x) doA() else doB()`, branch coverage checks both paths ran.

### CartWise Context

`ProductService` is 92.9% branch-covered — most decision branches are tested, but some edge cases (certain price/category combinations) are untested.

---

## Coverage Theatre

The false comfort of a high coverage number without depth. 100% line coverage of a DTO's getters proves nothing; 60% coverage of a service that asserts real behavior is more valuable.

### CartWise Context

CartWise excludes DTOs and config from coverage reporting — not because they're hard to test, but because testing a getter's getter is theatre.

---

## Surefire

Maven's test-execution plugin. `mvn test` runs Surefire, which discovers tests and reports results (Tests run: X, Failures: Y, etc.).

---

## JUnit Tag

A label you can attach to tests (`@Tag("integration")`) and later select or exclude on the command line (`-Dgroups=integration` or `-DexcludedGroups=integration`).

### CartWise Context

Repository tests are tagged `@Tag("integration")` (via `@RequiresDocker`). Running `mvn test -DexcludedGroups=integration` skips the 47 slow container tests and runs only unit + controller in seconds.

---

## @EnabledIf

A JUnit annotation that conditionally enables or disables a test based on a method that returns a boolean. If false, the test is skipped.

### CartWise Context

`@EnabledIf("com.cartwise.testsupport.DockerAvailability#isDockerAvailable")` on `@RequiresDocker` — tests skip if Docker is not running.

---

## Vitest

A fast unit test runner for JavaScript/TypeScript, built on Vite. Runs tests in parallel by default, supports coverage via v8.

### CartWise Context

Frontend tests run under Vitest (`npm test`). 113 tests across ProductCard, FilterBar, HeroBanner, useCatalogueParams, etc.

---

## jsdom

A JavaScript implementation of the DOM — lets you render React components in Node without a real browser. No layout, no CSS computation, just the DOM tree.

### CartWise Context

`ProductCard.test.tsx` renders in jsdom, so clicking is possible, but CSS scroll-snap behavior cannot be tested — it's verified by hand or in E2E tests.

---

## React Testing Library

A testing utility that provides helpers to render React components and query them by accessible role/name instead of class/id. Encourages testing user-visible behavior.

### CartWise Context

`screen.getByRole("button", { name: /add to wishlist/i })` finds the button by its accessible name, not its class, so refactoring CSS doesn't break the test.

---

## render

A React Testing Library function that renders a component into jsdom. Returns an object with queries like `getByRole`, `getByText`, etc.

### CartWise Context

```javascript
const { getByRole } = render(<ProductCard {...props} />);
const heartButton = getByRole("button", { name: /wishlist/i });
fireEvent.click(heartButton);
```

---

## userEvent

A React Testing Library helper that simulates user input (typing, clicking, etc.) realistically — fires events in the right order, respects disabled states.

### CartWise Context

`userEvent.click(button)` is preferred over `fireEvent.click(button)` — it simulates a real click sequence, not just a bare click event.

---

## fireEvent

A lower-level React Testing Library tool that fires DOM events directly. Less realistic than `userEvent`; use it only when you need fine-grained control.

---

## act

A React Testing Library utility that wraps state updates so React batches them correctly. Required when you update state outside a React event handler.

### CartWise Context

```javascript
act(() => {
  userEvent.click(button); // state updates inside
});
```

---

## Accessible Role

The semantic role a DOM element has — "button", "heading", "textbox", etc. React Testing Library queries by role first, because that's what assistive tech sees.

### CartWise Context

`getByRole("button", { name: /add/i })` finds an element with role="button" and accessible name containing "add" — works even if the visual design changes.

---

## Accessible Name

The text or label that assistive tech announces for an element — from the element's text content, aria-label, aria-labelledby, or associated label.

### CartWise Context

`ProductCard`'s heart button has `aria-label="Add to wishlist"` (when not wishlisted) and `aria-label="Remove from wishlist"` (when wishlisted) — the accessible name changes with state.

---

## Fake Timers

A testing utility that lets you control time — advance it, freeze it — without real `setTimeout` waits. Makes time-dependent tests run fast.

### CartWise Context

`useDebounce` test uses fake timers: set a value, advance 500ms, assert the debounced value updated — all in milliseconds, not actual waiting.

---

## MemoryRouter

A React Router component for testing that keeps navigation state in memory instead of hitting the real browser history API.

### CartWise Context

```javascript
render(
  <MemoryRouter initialEntries={["/browse?category=phones"]}>
    <FilterBar />
  </MemoryRouter>
);
```

---

## Snapshot Test

A test that saves the output of code and asserts it doesn't change. If it does, the snapshot must be approved before the test passes.

### CartWise Context

CartWise has none — they're excluded from scope because snapshots assert "output is identical to last time," not "output is correct." Refactoring breaks them even when behavior is unchanged.

---

## Regression Test

A test that verifies a previously fixed bug stays fixed — it reproduces the old bug conditions and asserts they no longer occur.

### CartWise Context

`ProductRepositoryTest.pagesDoNotDropOrDuplicateRows` is a regression test for the pagination tie-breaker bug — it was broken, is now fixed, and the test keeps it that way.

---

## Characterization Test

A test that documents the current behavior of code without judgment — "this is what it does, right or wrong." Useful when behavior is undocumented.

### CartWise Context

Tests for BCrypt's 72-byte truncation and PasswordHasher's `matches("", validHash) == false` are characterization tests — they assert the real behavior rather than ideal behavior.

---

## @RequiresDocker

A CartWise meta-annotation combining `@Tag("integration")` and `@EnabledIf(DockerAvailability.isDockerAvailable)` — marks a test as requiring Docker and auto-skips if it's not running.

### CartWise Context

Repository tests use `@RequiresDocker`; when Docker is down, they skip cleanly; when it's up, they run. Checked manually during development.

---

## @DatabaseTest

A CartWise meta-annotation for repository tests: `@SpringBootTest + @Import(PostgresTestContainerConfig) + @ActiveProfiles("test") + @Transactional + @RequiresDocker`.

### CartWise Context

Avoids repeating all four annotations on every repository test class.

---

## @WithCartwiseSecurity

A CartWise meta-annotation for controller tests: `@WithMockUser + @Import(SecurityConfig, JwtAuthenticationFilter, JwtTokenProvider, ApiErrorSecurityHandler, WebSecurityTestConfig)`.

### CartWise Context

Simulates a real, authenticated request to a controller — the real security config applies, so authorization checks are genuine.

---

## ControllerTestBase

A CartWise base class for controller tests, wiring MockMvc and common utilities. Extends `@WebMvcTest` configuration.

### CartWise Context

Every `*ControllerTest` extends it, so the MockMvc setup is consistent and the real SecurityConfig is reliably imported.

---

## PostgresTestContainerConfig

A CartWise `@TestConfiguration` that supplies a `PostgreSQLContainer<?>` bean with `@ServiceConnection`, pinned to `postgres:17.6`. Imported by all database-backed tests.

### CartWise Context

No direct usage — inherited via `@DatabaseTest` meta-annotation. Manages container lifecycle (Spring owns it), fsync-off settings, timezone handling.

---

## DockerAvailability

A CartWise utility class that probes whether Docker is running (`DockerClientFactory.isDockerAvailable()`) and caches the result. Referenced by `@EnabledIf` on `@RequiresDocker`.

### CartWise Context

If Docker is down, `isDockerAvailable()` returns false, `@EnabledIf` skips the test, and the suite logs "This run is a weaker signal than one with a daemon present."

---

## mockApi.ts

A CartWise test fake that intercepts `fetch()` calls and returns stubbed responses based on the URL. Used in all frontend tests to avoid hitting the real backend.

### CartWise Context

`mockApi.get("/api/products").returns([...])` — frontend tests call the real client code but get fake responses, so only the client logic is tested, not the API contract.

---
