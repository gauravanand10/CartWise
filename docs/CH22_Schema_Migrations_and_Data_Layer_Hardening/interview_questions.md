# Interview Questions: Schema Migrations & Data Layer Hardening

## Beginner

**1. What is Flyway and why do we need it?**
Flyway is a schema versioning tool that applies SQL migrations in order. We need it because `ddl-auto: create-drop` works only in development — it regenerates the schema from entities every boot, which is incompatible with production where schema must be auditable, immutable, and evolve via version control.

**2. What does `ddl-auto: validate` do?**
It asserts that every entity's columns, types, and constraints match the schema. If they don't, the application fails to start. This prevents schema drift: if someone adds a column to an entity without a migration, dev (where Hibernate auto-generates) diverges from prod (where the schema is frozen).

**3. Why can't Hibernate generate the functional index `idx_products_lower_category`?**
JPA's `@Index` annotation takes a `columnList` (plain columns). It cannot express expressions like `lower(category)`. Functional indexes must be written in SQL migrations (V2).

**4. What is in V1, V2, and V3?**
V1 is the baseline schema (all tables, primary keys, standard indexes). V2 adds the functional index on lower(category). V3 inserts 50 seed products.

**5. Why does the test profile disable Flyway?**
Because Hibernate also generates schema from entities (via `@DataJpaTest`). Running both would mean V1 creates tables, then Hibernate drops and recreates them, leaving the history orphaned. Tests instead run against a Hibernate-generated schema with `create-drop`, which is fast and isolated per context.

**6. Where do dev users (demo@cartwise.dev, admin@example.com) live?**
In `db/dev-seed/dev-users.sql`, loaded via `spring.sql.init.data-locations` in dev only. They are not in V3 because passwords should never be in production migrations and dev users are development artifacts, not production data.

**7. What happens if you forget `@ActiveProfiles("test")` on a test?**
It loads the `dev` profile by default (from `spring.profiles.default`). If your machine has cartwise_dev running, the test passes — against your real data. Then `ddl-auto: create-drop` drops it on startup. The test contract is broken and data is lost.

**8. Why is `ddl-auto` set to `validate` in dev, not `update`?**
`update` modifies the schema to match entities, which hides drift and makes migrations optional. `validate` fails if they don't match, forcing a migration. This makes schema changes explicit and auditable.

**9. Can you edit a migration after it's deployed?**
No. Once a migration is applied (recorded in `flyway_schema_history`), it is immutable. Editing it breaks the audit trail. Fix mistakes by writing a new migration (V4, V5, ...).

**10. Why does dev data persist across restarts?**
Because Flyway migrations are idempotent — once applied, they are never re-run. Before Chapter 22, `create-drop` reset the database on every boot. Now you must manually drop and recreate the database to get a clean slate.

## Intermediate

**11. Explain the interlocking problem between Flyway and Hibernate, and how it's solved.**
Flyway creates tables via V1, then Hibernate's `create` or `update` tries to regenerate them. This creates a `flyway_schema_history` that Flyway no longer controls. Solved by using `ddl-auto: validate` (Hibernate reads only, never modifies) in dev and prod.

**12. Why is the Flyway Maven plugin configuration needed, and what does it need?**
The plugin allows CLI commands like `mvn flyway:info` and `mvn flyway:validate`. It needs explicit JDBC credentials because it is not a Spring component and never reads `application-dev.yml`. For dev this is acceptable; for prod, use environment variables or Secrets Manager.

**13. V3 inserts 50 products. How are they organized, and why?**
Rows 1–23 mirror `frontend/src/features/product/data/catalogue.ts` (canonical seed); rows 24–50 are invented and separated so nobody has to guess which data is authoritative. Organizing this way makes the test data intentional.

**14. Why does the functional index improve performance at scale?**
A plain B-tree index on `category` cannot satisfy `WHERE lower(category) = ?` because the database would have to lowercase every row in the table then compare. The functional index `idx_products_lower_category` pre-computes `lower(category)` for every row, making the query fast.

**15. What is the relationship between `ddl-auto: validate` and the test suite?**
Test profile uses `ddl-auto: create-drop` with Flyway disabled (Hibernate generates schema per context). Dev and prod use `ddl-auto: validate` with Flyway enabled (migrations define schema). This means tests cannot verify the functional index (Hibernate cannot express it), but `ddl-auto: validate` in dev catches schema drift immediately.

**16. If you add a new role to the `Role` enum, what else must change?**
The check constraint `users_role_check CHECK (role IN ('USER', 'ADMIN'))` must be updated via a migration. Without it, inserts of the new role fail with a constraint violation. This is the cost of freezing the schema.

**17. Explain the difference between idempotent and immutable in the context of migrations.**
Idempotent: a migration run once or many times produces the same result. Flyway treats each migration as idempotent per version — once in the history, it is never re-run. Immutable: the migration file itself cannot be edited after it's applied. Editing it breaks the trail. These are complementary: idempotency prevents re-running, immutability prevents editing.

**18. Why is `pg_dump --schema-only` used to create V1, and why is column order preserved?**
`pg_dump --schema-only` exports pure DDL from a running database. This ensures V1 matches reality without transcription errors. Column order is preserved so future diffs stay clean — if you re-dump the schema for comparison, the output will align with V1's column order.

**19. What is the role of `flyway_schema_history`?**
It is a table Flyway creates to record which migrations have been applied, when, and the result (success/failure). Flyway reads this table on startup to determine which migrations to run. It is the source of truth for deployment history.

**20. Describe the difference between `spring.sql.init.data-locations` and Flyway migrations.**
`data-locations` loads a SQL file into the database (like `data.sql`). It respects `spring.sql.init.mode: never` in prod. Flyway migrations are version-controlled SQL files that run in order and are never skipped. For prod data, use Flyway; for dev fixtures only, use `data-locations`.

## Intermediate-Advanced

**21. Why does Hibernate's `@Index` not work for functional indexes, and how does the test suite handle this limitation?**
`@Index` takes a `columnList` — plain column names. It cannot express expressions like `lower(category)`. The functional index exists only in V2 (SQL), not in the entity. Tests cannot verify it because `@DataJpaTest` uses Hibernate-generated schema (which lacks the functional index). The limitation is documented and guarded by `ddl-auto: validate` in dev/prod — if the index is needed for correctness and missing, queries would fail in prod (not in tests), which is an honest limitation.

**22. What would happen if `flyway.enabled: false` but `ddl-auto: validate` in dev?**
Flyway would not run, so `flyway_schema_history` would never be created and V1–V3 would never apply. Hibernate would then try to validate entities against a non-existent schema and fail at boot. This is a misconfiguration; enable Flyway in dev/prod.

**23. Explain the reasoning behind disabling Flyway in the test profile.**
Test profile uses `create-drop` (Hibernate generates schema from entities per context) with Flyway disabled. If Flyway ran, tests would apply V1–V3, then Hibernate would drop and recreate, leaving history orphaned. Additionally, the functional index V2 adds does not exist in Hibernate-generated schema, so test assertions on it would always be wrong. The tradeoff is accepted: tests use Hibernate schema, not production schema. `ddl-auto: validate` in dev catches drift.

**24. A developer adds a column to the Product entity but forgets the migration. What happens?**
In dev: boot fails with `Caused by: org.hibernate.tool.schema.schemamigration.SchemaManagementException: Schema validation: missing column [new_column_name] in table [products]`. This is correct — the error forces the developer to write a migration. In prod (without this dev failure), the query would fail because the column doesn't exist. Dev's early failure is better.

**25. You need to rename a column (e.g., `category` → `category_name`). Outline the migration.**
Write V4 with `ALTER TABLE products RENAME COLUMN category TO category_name;`. Also update the entity annotation from `@Column(name = "category")` to `@Column(name = "category_name")`. After deploy, both schema and entities are in sync. The old column name `category` no longer exists; queries using it fail immediately (good signal). Without a migration, the schema would never change and queries would fail inconsistently.

**26. Explain why test fixtures belong to the test, not to the database.**
A test that depends on seed data from V3 couples the test to the seed data, making it fragile. If V3 is changed, the test may fail for unrelated reasons. The correct approach: the test creates the rows it needs in the test method (or a `@BeforeEach` fixture). This makes the test self-contained and independent of the seed data.

**27. When would you use a down migration (e.g., `U3__undo_seed_products.sql`)?**
In production, if V3 inserted bad data or corrupted state, a down migration could undo it. CartWise does not use down migrations because the seed data is minimal and correct. Down migrations are complex (they must undo changes in reverse order), so they are avoided unless necessary.

**28. Why must the Flyway plugin be configured with explicit JDBC credentials in pom.xml?**
The plugin is invoked via Maven, not Spring. It does not read `application-dev.yml` or `application.yml`. It needs hardcoded JDBC URL, user, password to connect to the database for CLI commands. For dev this is fine; for prod, store credentials in environment variables or a CI/CD Secrets Manager and reference them in pom.xml: `<url>${env.FLYWAY_URL}</url>`.

**29. A test passes locally but fails in CI. The CI database has a different schema version. How would you debug this?**
Run `mvn flyway:info` in CI to see which migrations have been applied. Compare against local `mvn flyway:info`. If the versions differ, the CI database is out of sync — likely a missed migration commit or a stale CI cache. Pull the latest code, reapply migrations, re-run tests.

**30. Why is seed data (V3) separate from enum constraints (users_role_check)?**
Seed data is content (products to display). Enum constraints are schema (rules for what data is valid). A new role requires updating the constraint; inserting a new product does not. Separating them makes the intent clear: if you edit V3, you're adding products; if you edit V4, you're changing the schema contract.

## Advanced / Scenario-Based

**31. You deployed V1, V2, V3 to production. Then you realized V3 has a typo in a product name. How do you fix it?**
Write V4 with `UPDATE products SET name = 'corrected_name' WHERE id = ...;`. Do not edit V3. V3 is immutable in prod; all changes go forward via new migrations. V4 applies only to prod (it's already at V3), not to dev (which also applies V4). The audit trail stays clean.

**32. A junior developer edited V2 after it was deployed. What goes wrong, and how do you recover?**
The `flyway_schema_history` records V2 as successfully applied. Flyway won't re-run it. The developer's edits are ignored. Recovery: revert the edit to V2, then write V5 to apply the fix. If V2 was already live and the developer's edit critical, reset the prod database (destructive) or write V5 to reapply the fix. Lesson: migrations are immutable once deployed.

**33. Explain how the test suite isolation works when sharing a Docker container.**
Spring caches contexts by configuration (@ActiveProfiles, @MockitoBean, etc.). All tests with the same config share one context and therefore one PostgreSQL container. Each test is isolated via `@Transactional` (rollback after each test). This is faster than starting a container per test, but adding `@MockitoBean` to one test forks the cache and starts a second container — the suite gets slow silently.

**34. A production bug is traced to missing data in the compare table. The team suspects a migration was skipped. How would you verify?**
Connect to prod PostgreSQL and run `SELECT * FROM flyway_schema_history;`. Check that all expected versions (V1, V2, V3, ...) are present and marked as "Success". If a version is missing or marked "Failed", that's your culprit. Compare against your current repo's migrations to ensure you haven't since added new ones that skipped a number.

**35. Design a migration to add a new column `discount_percentage` to products with a default of 0.**
```sql
ALTER TABLE products ADD COLUMN discount_percentage numeric(3, 2) NOT NULL DEFAULT 0;
CREATE INDEX idx_products_discount ON products (discount_percentage);
```
Also update the Product entity with `@Column(name = "discount_percentage")`. After deploy, the column exists with sensible defaults; queries can use it immediately. If the default is wrong, V6 can fix it (insert V5 before deploy, test, then deploy V5+V6 together).

**36. A developer working on a feature branch added V4 locally but hasn't pushed. Meanwhile, the main branch merged a different V4. You now have two V4s. What happens?**
This is a conflict: both V4s exist, but only one can run first. Flyway will fail: `Discovered more than one migration with version 4`. Recovery: rename one migration to V5, reorder any dependent logic. Or: force-reset to a common ancestor, pull main, rebase the feature branch, and reapply migrations in order. Version numbers must be unique and ordered.

**37. Discuss the tradeoff between `create-drop` in tests and using production migrations in tests.**
`create-drop`: fast (schema generated per context), isolated (each test gets clean state), but doesn't validate the migration pipeline (V1–V3 never run in tests). Production migrations in tests: validates the pipeline, catches migration errors early, but slower (one container per suite, schema built via V1–V3). CartWise chooses `create-drop` for speed and accepts the tradeoff: the functional index `idx_products_lower_category` is not tested, but `ddl-auto: validate` in dev catches schema drift. This is the honest choice.

**38. A feature requires a schema change that is not backward-compatible (e.g., dropping a column). How would you handle it?**
Write V6 to drop the column (destructive). Before deploying V6, ensure no running version of the application reads that column — either because the code change deploys first (the app no longer queries the column), or the column is truly unused. In practice: deploy code change first, let it soak (app no longer touches the column), then deploy V6. This is called "expand-contract" — expand the schema to support both old and new, contract by dropping the old. Without expand-contract, the old code crashes when the column disappears.

**39. Your test fails with "Schema validation: missing column [x]". You didn't write this column, and it's not in V1. Where is it?**
Check other migrations (V2, V3, V4, ...). One of them adds the column. If the column is in an entity but not in any migration or the test profile's `create-drop` schema, Hibernate generated it but Flyway never will. The test is exercising code that depends on the column, and the test DB was built by Hibernate (which has the column). In prod, Flyway's schema would be missing it, and the code would fail. Solution: write a migration to add the column.

**40. How would you test that a Flyway migration is idempotent?**
Write a test that: (1) drops and recreates the database, (2) runs `mvn flyway:migrate`, (3) snapshots the schema, (4) runs `mvn flyway:migrate` again, (5) snapshots the schema again, (6) asserts both snapshots are identical. Flyway should skip the already-applied migration and make no changes. This is tedious and usually not done — Flyway guarantees idempotency by design (once in history, never re-run). But if you have a complex migration, this test adds confidence.
