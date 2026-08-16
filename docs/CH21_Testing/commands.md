# 💻 CH21 — Commands

> **Project:** CartWise  
> **Chapter:** Testing

This file contains the commands used to develop, test, and verify the CartWise test suite.

---

# 🚀 Backend Development

## Start the Backend

cd backend
./mvnw spring-boot:run

The backend starts on `localhost:8080`. Logs show all endpoints are registered and tests are not running.

---

## Build and Compile

cd backend
./mvnw clean compile

Compiles all Java source. If there are any syntax errors, they appear here before tests run.

---

## Run All Tests

cd backend
./mvnw clean test

Expected output:

[INFO] Tests run: 313, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS

Exit code 0.

---

## Run Unit Tests Only (Exclude Integration)

cd backend
./mvnw test -DexcludedGroups=integration

Expected output:

[INFO] Tests run: 266, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS

266 tests (313 − 47 container-backed tests). No Docker required.

---

## Run Integration Tests Only (Requires Docker)

cd backend
./mvnw test -Dgroups=integration

Expected output (with Docker running):

[INFO] Tests run: 47, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS

47 tests (repository tests + contextLoads). Docker must be running.

---

## Run a Single Test Class

cd backend
./mvnw test -Dtest=ProductServiceTest

Runs only ProductServiceTest and its methods.

---

## Run a Single Test Method

cd backend
./mvnw test -Dtest=ProductServiceTest#findAll_filtersCorrectly

Runs only that one method.

---

## View JaCoCo Coverage Report

After `mvn clean test`, the report is generated:

cd backend
./mvnw jacoco:report

Or simply after `mvn clean test` (report goal is bound to test phase):

open target/site/jacoco/index.html

(On Windows, replace `open` with `start`; on Linux, use `firefox` or your browser.)

The report shows line/branch coverage per package (service, controller, repository, etc.). Target percentages:
- service: 95%+ line
- controller: 100% line, 90%+ branch
- security: 100% line and branch
- repository: 100% line and branch

---

# 🌐 Frontend Development

## Install Dependencies

cd frontend
npm install

Installs Vitest, @testing-library/react, jsdom, coverage, and all other test tooling.

---

## Run All Frontend Tests

cd frontend
npm test -- --run

Expected output:

✓ ProductCard.test.tsx (19)
✓ FilterBar.test.tsx (23)
✓ HeroBanner.test.tsx (15)
✓ useCatalogueParams.test.ts (24)
✓ toCardModel.test.ts (9)
✓ ... (integration tests)

Test Files  6 passed (6)
Tests      113 passed (113)

Exit code 0.

---

## Run Frontend Tests in Watch Mode

cd frontend
npm test

Tests re-run automatically when you save a file. Press `q` to quit.

---

## Generate Frontend Coverage Report

cd frontend
npm test -- --coverage

Expected output:

% Stmts   % Branch % Funcs % Lines Uncovered Lines
ProductCard.tsx       100    97.29   100    100
FilterBar.tsx         100    100     100    100
useCatalogueParams.ts 100    98.07   100    100
HeroBanner.tsx        100    63.63   100    100
...

Overall               19.63  16.69   ...    ...

Report is generated in `coverage/` (or `v8/` if using v8 coverage backend). Open `coverage/index.html` to browse.

---

## Run a Single Frontend Test File

cd frontend
npm test ProductCard.test.tsx

Runs only that file and its tests.

---

# 🧪 Testing Patterns

## Test a Service Without Mocking

cd backend
./mvnw test -Dtest=ProductServiceTest#findAll_returnsAllProducts

Unit test, no Spring context, no database. Runs in <10ms.

---

## Test a Repository Against Real Postgres

cd backend
./mvnw test -Dtest=ProductRepositoryTest#findBySlug_returnsProduct

Integration test, requires Docker, real PostgreSQL 17.6 container. Runs in ~100–500ms depending on machine.

---

## Test a Controller's Authorization

cd backend
./mvnw test -Dtest=WishlistControllerTest#addToWishlist_returns401_withoutToken

Controller test, MockMvc, real SecurityConfig imported. Verifies 401 when no JWT is provided.

---

## Test a Frontend Component's Interaction

cd frontend
npm test ProductCard.test.tsx -- --reporter=verbose

Component test, renders in jsdom, simulates user click on heart button, asserts aria-pressed toggles.

---

# 🔍 Debugging

## View Generated SQL from Repositories

cd backend
./mvnw test -Dspring.jpa.show-sql=true -Dtest=ProductRepositoryTest

Logs all SQL executed by the test (via Hibernate's show-sql). Useful to verify WHERE/ORDER BY clauses are applied in the database, not in Java.

---

## See Test Output in Real-Time

cd backend
./mvnw test -X 2>&1 | tee test-output.log

Captures full debug output to `test-output.log` while printing to the console.

---

## Check Which Tests Skipped and Why

cd backend
./mvnw test | grep -i skip

If Docker is down:

[INFO] com.cartwise.repository.ProductRepositoryTest: SKIPPED
[INFO] Docker is not available - container-backed tests will be SKIPPED

---

# 📋 Verification Checklist

## 1. Backend Compiles

cd backend
./mvnw clean compile

Output should show:

[INFO] BUILD SUCCESS

---

## 2. All Backend Tests Pass

cd backend
./mvnw clean test

Output should show:

[INFO] Tests run: 313, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS

Exit code: 0

---

## 3. Coverage Meets Target

cd backend
./mvnw clean test
cat target/site/jacoco/index.html | grep -i "line"

Verify:
- service: 95%+ line
- controller: 100% line
- security: 100% line
- repository: 100% line

---

## 4. Frontend Tests Pass

cd frontend
npm test -- --run

Output:

Test Files  6 passed (6)
Tests      113 passed (113)

Exit code: 0

---

## 5. Frontend Coverage Meets Target

cd frontend
npm test -- --coverage

Verify:
- ProductCard.tsx: 100% lines
- FilterBar.tsx: 100% lines
- useCatalogueParams.ts: 100% lines
- HeroBanner.tsx: 100% lines

---

## 6. Break-Then-Revert Demonstration

Remove the sort tie-breaker in ProductSort:

cd backend
# Edit src/main/java/com/cartwise/repository/ProductSort.java
# Change: sort.and(Sort.by(ASC, "id")) → sort
./mvnw test -Dtest=ProductRepositoryTest

Expected: Tests fail (9 failures including pagesDoNotDropOrDuplicateRows).

Revert the change:

git checkout src/main/java/com/cartwise/repository/ProductSort.java
./mvnw test -Dtest=ProductRepositoryTest

Expected: All tests pass (51 tests, 0 failures).

---

## 7. Docker Guard Verification

With Docker running:

cd backend
./mvnw test

Expected: 313 tests pass.

Stop Docker:

# On Windows: Docker Desktop -> quit or Shutdown
./mvnw test

Expected: 287 tests run, 21 skipped (container tests skip cleanly), 0 errors, BUILD SUCCESS.

Restart Docker and re-run:

# Docker Desktop -> launch
./mvnw test

Expected: 313 tests pass again.

---

# 🌿 Git Commands

## Check Status

git status

Shows modified and untracked files in the repo.

---

## Stage All Changes

git add .

Stages all files for commit.

---

## Commit

git commit -m "feat: implement Chapter 21 testing - unit, integration, component tests with JUnit 5, Testcontainers and Vitest"

Creates a commit with the message.

---

## Push

git push origin main

Pushes the commit to GitHub.

---

## View Commit History

git log --oneline -10

Shows the last 10 commits.

---

# 📌 Command Summary

Task                      | Command
Unit tests only          | cd backend && ./mvnw test -DexcludedGroups=integration
Integration tests        | cd backend && ./mvnw test -Dgroups=integration
JaCoCo report            | cd backend && open target/site/jacoco/index.html
Frontend tests           | cd frontend && npm test -- --run
Frontend watch           | cd frontend && npm test
Frontend coverage        | cd frontend && npm test -- --coverage
Full verification        | cd backend && ./mvnw clean test && cd ../frontend && npm test -- --run

---

# 🎯 Next Steps

After CH21 completes and all tests pass:

1. Commit the work: git add . && git commit -m "feat: implement Chapter 21 testing..." and git push
2. Normalize line endings (CRLF churn) if not done yet
3. Proceed to CH22 (Schema Migrations & Data Layer Hardening)
