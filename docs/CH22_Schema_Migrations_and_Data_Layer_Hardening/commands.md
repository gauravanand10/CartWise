# Commands: Schema Migrations & Data Layer Hardening

## Flyway Diagnostics

**Check current schema version and applied migrations**

```bash
cd backend
./mvnw flyway:info
```

Expected output (after Chapter 22):

```
[INFO] Database: jdbc:postgresql://localhost:5432/cartwise_dev (PostgreSQL 17.11)
[INFO] Schema version: 3
+-----------+---------+-------------------------------------+------+---------------------+---------+
| Category  | Version | Description                         | Type | Installed On        | State   |
+-----------+---------+-------------------------------------+------+---------------------+---------+
| Versioned | 1       | baseline                            | SQL  | 2026-08-16 04:33:13 | Success |
| Versioned | 2       | add functional index lower category | SQL  | 2026-08-16 04:33:13 | Success |
| Versioned | 3       | seed products                       | SQL  | 2026-08-16 04:33:13 | Success |
+-----------+---------+-------------------------------------+------+---------------------+---------+
[INFO] BUILD SUCCESS
```

**Validate that migrations can be applied**

```bash
cd backend
./mvnw flyway:validate
```

Expected output:

```
[INFO] Successfully validated 3 migrations
[INFO] BUILD SUCCESS
```

This command checks that all migration files are present and valid SQL (syntax-wise). It does not apply them. Run this before a deployment to catch syntax errors early.

## Database Reset

**Reset cartwise_dev to a clean state (destructive)**

```bash
psql -U postgres -h localhost -c "DROP DATABASE cartwise_dev;"
psql -U postgres -h localhost -c "CREATE DATABASE cartwise_dev OWNER cartwise;"
```

Then boot the application to re-run all migrations:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Watch for Flyway logs:

```
o.f.core.internal.command.DbValidate : Successfully validated 3 migrations
o.f.core.internal.command.DbMigrate  : Migrating schema "public" to version "1 - baseline"
o.f.core.internal.command.DbMigrate  : Migrating schema "public" to version "2 - add functional index lower category"
o.f.core.internal.command.DbMigrate  : Migrating schema "public" to version "3 - seed products"
o.f.core.internal.command.DbMigrate  : Successfully applied 3 migrations to schema "public", now at version v3
```

If any migration fails, stop and fix it before continuing.

**Alternative: Reset via SQL directly (if you have high confidence)**

```bash
psql -U cartwise -d cartwise_dev -h localhost << EOF
DROP TABLE IF EXISTS flyway_schema_history CASCADE;
DROP TABLE IF EXISTS comparisons CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS products CASCADE;
EOF
```

Then boot to re-apply migrations. This skips the `psql` privilege check and drops only CartWise tables (safer if the database has other content).

## Test Suite

**Run all 313 tests (unit, integration, Testcontainers)**

```bash
cd backend
./mvnw test
```

Expected output (last lines):

```
[INFO] Tests run: 313, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
[INFO] Total time: ~60s
```

**Run only unit/service tests (no Docker required)**

```bash
cd backend
./mvnw test -DexcludedGroups=integration
```

Expected output:

```
[INFO] Tests run: 266, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
[INFO] Total time: ~25s
```

This excludes all tests marked with `@RequiresDocker` (repository and integration tests).

**Run a specific test class**

```bash
cd backend
./mvnw test -Dtest=ProductRepositoryTest
```

**Run tests with coverage report**

```bash
cd backend
./mvnw test jacoco:report
```

Open `target/site/jacoco/index.html` in a browser to view the coverage report. Current state (after Chapter 21): 95.4% instruction coverage on the backend.

## Application Startup

**Boot in dev profile (with Flyway migrations)**

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Watch logs for Flyway output. The database must exist and have the `cartwise` user. If missing, see "Database Reset" above.

Expected logs:

```
o.f.core.internal.command.DbMigrate  : Successfully applied 3 migrations to schema "public", now at version v3
org.hibernate.orm.jpa               : HHH008540: Processing PersistenceUnitInfo [name: default]
c.cartwise.CartwiseBackendApplication : Started CartwiseBackendApplication in 5.263 seconds
```

**Boot in test profile (in-memory PostgreSQL container)**

This is not a manual command — tests do this automatically. But for reference:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=test"
```

This starts a Testcontainers PostgreSQL container, then boots Spring. Flyway is disabled in test profile (schema comes from Hibernate entities). The test profile is not meant for manual use — it's for integration tests.

## Schema Inspection

**List all tables in cartwise_dev**

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "\dt"
```

Expected output:

```
             List of relations
 Schema |      Name      | Type  |  Owner   
--------+----------------+-------+----------
 public | comparisons    | table | cartwise
 public | flyway_schema_history | table | cartwise
 public | products       | table | cartwise
 public | users          | table | cartwise
 public | wishlists      | table | cartwise
(5 rows)
```

**Inspect the products table structure**

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "\d products"
```

Output includes column names, types, constraints, and indexes:

```
                    Table "public.products"
    Column    |          Type           | Collation | Nullable | Default
--------------+-------------------------+-----------+----------+---------
 id           | bigint                  |           | not null | generated by default as identity
 brand        | character varying(255)  |           | not null | 
 category     | character varying(100)  |           | not null | 
 description  | text                    |           | not null | 
 in_stock     | boolean                 |           | not null | 
 ...
Indexes:
    "products_pkey" PRIMARY KEY, btree (id)
    "products_slug_key" UNIQUE CONSTRAINT, btree (slug)
    "idx_products_category" btree (category)
    "idx_products_lower_category" btree (lower(category::text))
    "idx_products_price" btree (price)
```

Note the functional index `idx_products_lower_category`.

**Check the flyway_schema_history table**

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "SELECT version, description, type, success, installed_on FROM flyway_schema_history ORDER BY version;"
```

Output:

```
 version |                description                 | type | success |        installed_on        
---------+--------------------------------------------+------+---------+----------------------------
       1 | baseline                                   | SQL  | t       | 2026-08-16 04:33:13.158+05
       2 | add functional index lower category        | SQL  | t       | 2026-08-16 04:33:13.254+05
       3 | seed products                              | SQL  | t       | 2026-08-16 04:33:13.482+05
(3 rows)
```

This is your audit trail. Every deployment is recorded here.

**Count seeded products**

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "SELECT COUNT(*) FROM products;"
```

Expected output:

```
 count
-------
    50
(1 row)
```

**Verify the functional index is being used**

```bash
psql -U cartwise -d cartwise_dev -h localhost << EOF
EXPLAIN ANALYZE
SELECT * FROM products WHERE lower(category) = 'smartphone' ORDER BY price;
EOF
```

With 50 products (small dataset):

```
 Seq Scan on products  (cost=0.00..2.75 rows=11) (actual time=0.015..0.041 rows=11)
   Filter: (lower((category)::text) = 'smartphone'::text)
 Execution Time: 0.087 ms
```

With 50,000 products (after load test):

```
 Sort  (cost=1030.49..1033.02 rows=1014) (actual time=2.159..2.183 rows=1011)
   ->  Bitmap Heap Scan on products  (cost=16.15..979.86 rows=1014) (actual time=0.176..1.961 rows=1011)
         ->  Bitmap Index Scan on idx_products_lower_category  (cost=0.00..15.89 rows=1014)
               Index Cond: (lower((category)::text) = 'smartphone'::text)
 Execution Time: 2.270 ms
```

The index is being used in the Bitmap Index Scan step.

**Check enum constraint on users.role**

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "\d users"
```

Look for the constraint:

```
Constraints:
    "users_pkey" PRIMARY KEY, btree (id)
    "users_email_key" UNIQUE CONSTRAINT, btree (email)
    "users_role_check" CHECK (role IN ('USER'::text, 'ADMIN'::text))
```

This constraint is defined in V1 and must be updated via a migration if new roles are added.

## Frontend Test Suite

**Run all 113 frontend tests**

```bash
cd frontend
npm test
```

Expected output (last lines):

```
✓ src/test/... (113 tests)
Tests:  113 passed (113)
Snapshots: 0 total
```

**Run tests in watch mode (re-run on file changes)**

```bash
cd frontend
npm test -- --watch
```

Press `q` to quit.

**Generate coverage report**

```bash
cd frontend
npm test -- --coverage
```

Output appears in `frontend/coverage/`. Open `coverage/index.html` in a browser.

## Git Operations

**Commit Chapter 22 work**

```bash
cd CartWise
git add -A
git commit -m "feat: implement Chapter 22 schema migrations - Flyway with V1 baseline, V2 functional index, V3 seed data (50 products)"
git push origin main
```

**View commit history with migrations**

```bash
git log --oneline -- backend/src/main/resources/db/
```

**Diff migrations between branches**

```bash
git diff main..feature-branch -- backend/src/main/resources/db/migration/
```

## Troubleshooting

**Symptom: "Failed to load ApplicationContext" on boot**

Cause: Database doesn't exist, Flyway migration failed, or `ddl-auto: validate` found a mismatch.

Solution:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE cartwise_dev OWNER cartwise;"
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Check the logs for Flyway errors. If a migration failed, fix the SQL and re-run.

**Symptom: "Encoded password does not look like BCrypt" warnings in tests**

Cause: The `PasswordHasherTest` intentionally tests invalid hash formats. This is expected.

Solution: No action needed. The test verifies the app rejects bad hashes gracefully.

**Symptom: Tests run slower than expected (>90 seconds)**

Cause: Multiple PostgreSQL containers are being created (one per unique context configuration).

Solution: Check if you added `@MockitoBean` or different `@ActiveProfiles` to a test. Each unique config forks the context cache and starts a new container. Minimize these variations.

**Symptom: Migration V2 is listed in `mvn flyway:info` but the index doesn't exist**

Cause: Flyway recorded the migration as successful, but the SQL had an error that was silently ignored (unlikely but possible with older Flyway).

Solution: Connect to the database and manually check:

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "\d products"
```

If the index is truly missing, write V4 to recreate it and document why it was lost.

**Symptom: "Unknown configuration property: flyway.plugin.version"**

Cause: Maven property name is wrong. Should be `flyway-plugin.version`, not `flyway.plugin.version`.

Solution: Update `pom.xml` property definition:

```xml
<flyway-plugin.version>12.4.0</flyway-plugin.version>
```

And reference it:

```xml
<version>${flyway-plugin.version}</version>
```

## Performance Tuning (Advanced)

**Analyze query performance for product category filtering**

```bash
psql -U cartwise -d cartwise_dev -h localhost << EOF
-- Load test data: insert 50,000 rows
INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, description, created_at)
SELECT 
  'product-' || generate_series(1, 50000),
  'Product ' || generate_series(1, 50000),
  (ARRAY['Apple', 'Samsung', 'Sony', 'LG', 'Dell'])[((generate_series(1, 50000) - 1) % 5) + 1],
  (ARRAY['Smartphone', 'Laptop', 'Television', 'Earbuds', 'Headphones'])[((generate_series(1, 50000) - 1) % 5) + 1],
  (99999 * random())::numeric(12, 2),
  (199999 * random())::numeric(12, 2),
  (5 * random())::numeric(2, 1),
  (100 * random())::integer,
  random() > 0.3,
  'Test product ' || generate_series(1, 50000),
  NOW()
ON CONFLICT (slug) DO NOTHING;

ANALYZE products;

-- Compare queries with and without the index
EXPLAIN ANALYZE
SELECT * FROM products WHERE lower(category) = 'smartphone' ORDER BY price;

-- Disable index and re-run
SET enable_bitmapscan = OFF;
SET enable_indexscan = OFF;
EXPLAIN ANALYZE
SELECT * FROM products WHERE lower(category) = 'smartphone' ORDER BY price;

-- Clean up
DELETE FROM products WHERE slug LIKE 'product-%';
EOF
```

The second EXPLAIN should show ~8–10× slower performance (sequential scan instead of index).

## Maintenance

**Periodic tasks (weekly)**

Check that migrations are being applied on deployed environments:

```bash
# On production server
psql -U postgres_prod -d cartwise_prod -c "SELECT MAX(version) as latest_migration FROM flyway_schema_history;"
```

Compare against the latest version in `backend/src/main/resources/db/migration/`. If they don't match, an old version of the code is running.

**Archive old seed data (optional)**

If the seed data grows large, move it to a separate SQL file:

```bash
# Create V4__seed_products_part2.sql with rows 51-100
# Rename V3 to V3__seed_products_part1.sql
```

This keeps individual migration files small and readable.
