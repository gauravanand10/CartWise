# Chapter 22: Schema Migrations & Data Layer Hardening

## Overview

Chapter 22 introduces Flyway for schema versioning and freezes the database contract. Until now, Hibernate's `ddl-auto: create-drop` regenerated the schema on every boot from the JPA entities — convenient for development, but incompatible with real deployments where schema evolution must be audited and reversible.

This chapter moves schema ownership from code (entities) to migrations (SQL), introduces seed data as versioned migrations rather than fixtures, and hardens the layer against schema drift by validating rather than auto-generating on boot.

**What changes:**
- Flyway 12.4.0 wired into `pom.xml` and enabled in dev/prod profiles
- `V1__baseline.sql` — schema extracted from entities
- `V2__add_functional_index_lower_category.sql` — the functional index ProductSpecifications.java deferred
- `V3__seed_products.sql` — 50 products (mirrored from frontend catalogue, plus 27 invented)
- `application-dev.yml` and `application-prod.yml` — `ddl-auto: validate` (fails on mismatch)
- `db/dev-seed/dev-users.sql` — demo@cartwise.dev (USER) and admin@example.com (ADMIN), loaded dev-only
- Test profile keeps `create-drop` and disables Flyway (schema built by Hibernate per-context, not migrated)

## Why This Matters

### The Problem with `create-drop`

In development, `ddl-auto: create-drop` feels safe — every boot is a clean slate. But it masks three classes of bugs:

1. **Schema drift.** An entity change without a migration means the deployed schema never sees it. Queries work on dev (where Hibernate applied the change) but fail in prod (where the schema is frozen). The mismatch is invisible until production.

2. **Data loss on deployment.** Schema migrations can be destructive — renaming a column means old data is lost. `create-drop` hides this cost; real migrations force you to think about it.

3. **Deployment ordering.** When the application starts, which happens first: Hibernate or Flyway? If Flyway runs first and creates tables, then Hibernate tries to regenerate them, you have a conflict. The test profile demonstrates the correct resolution.

### The Solution

Freeze the schema in version control. Every change — adding a column, creating an index, seeding data — lives in a migration. The schema is now:
- Auditable (every change has a timestamp and description)
- Reversible (down migrations, if needed, undo changes)
- Deployable (prod starts with `ddl-auto: validate`, failing fast if an entity doesn't match the schema)
- Testable (dev boots with fresh migrations, proving they work)

## Architecture

### Flyway

Flyway is a schema versioning tool. It maintains a `flyway_schema_history` table that records which migrations have run. On startup, Flyway compares the history against the filesystem and runs anything new.

**Version naming:** `V{number}__{description}.sql`

- `V1` — baseline (the initial schema)
- `V2`, `V3`, ... — incremental changes
- Must be in order; Flyway will not run V3 if V2 failed
- Idempotent within a version (Flyway skips it if already applied) but not across versions (running V1 twice recreates the baseline if you dropped the schema)

**Locations:**
- Production migrations: `backend/src/main/resources/db/migration/`
- Dev-only seed data: `backend/src/main/resources/db/dev-seed/`

### V1: Baseline

The initial schema, created by exporting Hibernate's DDL via `pg_dump --schema-only` and cleaning it up. Includes:

- `products` (50 rows, seeded in V3)
- `users` (2 rows, seeded in dev-seed/dev-users.sql)
- `wishlists` (empty)
- `comparisons` (empty)
- Indexes: `idx_products_category`, `idx_products_price`

Column order matches Hibernate's output (grouped by type width) so future `pg_dump` diffs stay clean.

### V2: Functional Index

Creates `idx_products_lower_category`, the index that ProductSpecifications.java deferred:

```sql
CREATE INDEX idx_products_lower_category ON products (lower(category));
```

This index powers case-insensitive category filtering at scale. JPA's `@Index` annotation cannot express function-based indexes; SQL migrations can.

### V3: Seed Products

Inserts 50 products across 7 categories. Rows 1–23 mirror `frontend/src/features/product/data/catalogue.ts` (same slugs, prices, ratings, stock status); rows 24–50 are invented to avoid guessing which seed data is canonical.

**Why not data.sql?** Spring's `data.sql` is loaded by `spring.sql.init`, which respects the `mode: never` setting in prod. Flyway has no such switch — a `V4__seed_users.sql` would apply everywhere, including prod, with hardcoded passwords in the repo. Users now live in `db/dev-seed/dev-users.sql`, loaded via `spring.sql.init.data-locations` in dev only.

## Implementation Details

### Pom.xml Changes

Three dependencies added:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-flyway</artifactId>
</dependency>
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

And the Maven plugin for CLI commands (`mvn flyway:info`, `mvn flyway:validate`):

```xml
<plugin>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-maven-plugin</artifactId>
  <version>12.4.0</version>
  <configuration>
    <url>jdbc:postgresql://localhost:5432/cartwise_dev</url>
    <user>cartwise</user>
    <password>cartwise</password>
  </configuration>
</plugin>
```

Note: The plugin must be configured with explicit JDBC credentials; it does not read `application-dev.yml`.

### application-dev.yml

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration,classpath:db/dev-seed
  jpa:
    hibernate:
      ddl-auto: validate
  sql:
    init:
      data-locations: classpath:db/dev-seed/dev-users.sql
```

- `ddl-auto: validate` — fails at boot if any entity does not match the schema
- `flyway.enabled: true` — runs V1, V2, V3 on startup
- `data-locations` — loads dev user fixtures after migrations

### application-prod.yml

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
  jpa:
    hibernate:
      ddl-auto: validate
  sql:
    init:
      mode: never
```

Same as dev except:
- No `db/dev-seed` location (seed data is v3, not loaded separately)
- `sql.init.mode: never` (no additional fixture loading)

### application-test.yml

```yaml
spring:
  flyway:
    enabled: false
  jpa:
    hibernate:
      ddl-auto: create-drop
```

Tests keep `create-drop` and disable Flyway. Why?

Hibernate builds the schema from entities (`@DataJpaTest` does this automatically). Running both migrations and entity-based DDL would mean:
1. V1 creates the tables
2. Hibernate's `create-drop` drops and recreates them
3. `flyway_schema_history` claims migrations are applied to a schema Flyway no longer built

This breaks the test contract: a repository test failing because a seed migration inserted 50 products it didn't ask for is no longer testing the thing it asserts.

**The tradeoff:** Repository tests run against a schema Hibernate generated from the entities, not the schema production gets from migrations. The functional index `idx_products_lower_category` does not exist in the test database (because `@Index` cannot express it). This is documented in ProductSpecifications.java and guarded by `ddl-auto: validate` in dev and prod — if entities and migrations drift, the app fails to start, which is a louder signal than a test.

## Migration Safety

### Order Matters

Flyway applies migrations in version order. If V2 depends on V1 (e.g., adding a column to a table V1 created), they must be run in order. Flyway checks this automatically and refuses to run V3 if V2 failed.

### Idempotency Within a Version

Once a migration is applied (recorded in `flyway_schema_history`), Flyway will not run it again, even if the file changes. This is by design — migrations describe change, not state. If you need to modify applied data, write a new migration (V4, V5, ...).

### Immutability in Production

Never edit a migration that has been deployed. If V2 is live and you realize it has a typo, you cannot edit it. You must write V4 to fix the mistake. This keeps the audit trail intact.

## Data Seeding Strategy

### V3: Canonical Seed

The 50 products in V3 are the canonical seed for development and production. They are versioned with the schema because they are the minimum viable dataset the application expects to exist.

### db/dev-seed/dev-users.sql: Developer Fixture

The demo and admin users live in `db/dev-seed/dev-users.sql` and are loaded only in dev via `spring.sql.init.data-locations`. They are not in V3 because:

1. Passwords should never be in production migrations
2. Dev users (demo@cartwise.dev) are artifacts of local development, not production data
3. Production admins are created by ops, not embedded in code

### Test Fixtures: Belong to the Test

Repository tests create their own fixture data in the test method. If a test needs 5 specific products, it inserts them; if it needs none, it inserts none. This makes the test self-contained — reading the test tells you exactly what data it depends on.

## Known Limitations

### No Functional Indexes in JPA

JPA's `@Index` takes a `columnList` (e.g., `@Index(name = "idx_foo", columnList = "category")`). It cannot express expressions like `lower(category)`. The functional index lives only in V2, not in the entity:

```java
@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_products_category", columnList = "category"),
    @Index(name = "idx_products_price", columnList = "price")
    // idx_products_lower_category is NOT here; it lives in V2
})
public class Product { ... }
```

Any test asserting on this index must be marked as a known limitation. In practice, the index is proved by EXPLAIN ANALYZE on real data.

### Enum Constraints Must Be Hand-Maintained

Hibernate used to regenerate the check constraint on the `role` column when an enum value was added. With a frozen schema, the constraint is static:

```sql
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN'));
```

Adding a new role requires editing this constraint in a migration. Forgetting to do so means inserts of the new role fail with a constraint violation.

### Data Persists Across Restarts

Before Chapter 22, `ddl-auto: create-drop` reset the database on every boot. Dev data now persists. If you want a fresh database, you must:

```bash
psql -U cartwise -d cartwise_dev -c "DROP DATABASE cartwise_dev; CREATE DATABASE cartwise_dev OWNER cartwise;"
```

Then boot the app to re-run all migrations.

## Common Pitfalls

### Forgetting @ActiveProfiles("test")

A test that lacks `@ActiveProfiles("test")` loads the `dev` profile by default (from `spring.profiles.default`). If your machine has `cartwise_dev` running, the test passes — against your real data. Worse, `ddl-auto: create-drop` then drops it on startup.

Always include `@ActiveProfiles("test")` on any test using a database.

### Mixing Flyway and Hibernate DDL

If `flyway.enabled: true` and `ddl-auto: create` (not validate), Flyway runs first and creates tables, then Hibernate tries to regenerate them. This creates a `flyway_schema_history` that Flyway no longer owns. Always pair Flyway with `ddl-auto: validate` in dev/prod.

### Editing Applied Migrations

Once a migration is deployed, do not edit it. Write a new migration instead. Editing a deployed migration breaks the audit trail and can cause inconsistency between environments.

### Hardcoding Credentials in Plugin Config

The Flyway Maven plugin config has explicit JDBC credentials:

```xml
<configuration>
  <url>jdbc:postgresql://localhost:5432/cartwise_dev</url>
  <user>cartwise</user>
  <password>cartwise</password>
</configuration>
```

This is acceptable for dev and CI (where the database is local or ephemeral). For production migrations, use environment variables or Secrets Manager, never embed credentials in pom.xml.

## Testing Strategy

### Unit Tests (No Context)

Service and utility tests use mocks. They do not touch the database and are unaffected by schema changes.

### Repository Tests (@DatabaseTest)

These run against a real PostgreSQL container with a Hibernate-generated schema. They verify query behavior without testing the migration pipeline itself. Flyway is disabled; the schema comes from `@DataJpaTest` + entities.

### Integration Tests (Full Context)

`CartwiseBackendApplicationTests.contextLoads()` is the one test that exercises the full boot path, including Flyway. It runs with:

```java
@SpringBootTest
@Import(PostgresTestContainerConfig.class)
@ActiveProfiles("test")
@RequiresDocker
```

This context starts Flyway, which runs V1, V2, V3. If any migration fails, the test fails. If entities don't validate against the schema, the test fails. This is your canary for deployment readiness.

### Verification in Development

After pulling new migrations, boot the app:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Watch the logs for Flyway output:

```
o.f.core.internal.command.DbValidate : Successfully validated 3 migrations
o.f.c.i.s.JdbcTableSchemaHistory     : Creating Schema History table ...
o.f.core.internal.command.DbMigrate  : Migrating schema "public" to version "1 - baseline"
o.f.core.internal.command.DbMigrate  : Migrating schema "public" to version "2 - add functional index lower category"
o.f.core.internal.command.DbMigrate  : Migrating schema "public" to version "3 - seed products"
o.f.core.internal.command.DbMigrate  : Successfully applied 3 migrations to schema "public", now at version v3
```

If you see `ERROR`, stop and fix the migration before proceeding.

## What Improved

### Schema is Auditable

Every change to the database lives in version control with a timestamp and description. You can trace why a column exists or when an index was added. `git log db/migration/` is now the source of truth for schema history.

### Deployments Are Predictable

Prod boots with `ddl-auto: validate`. If an entity was changed without a matching migration, the app refuses to start. This catches mistakes before they reach production. A passing boot is proof that entities and schema are in sync.

### Development Is Safer

Dev boots with `ddl-auto: validate` too. Any entity change requires a migration. Forgetting the migration means your laptop fails to start the app, not silently diverges from prod.

### Testing Is Honest

The test suite no longer masks schema drift. Tests that pass are tests that would work in prod. Tests that fail due to missing migrations fail in dev first, where they're cheap to fix.

## What Got Worse

### Data Persists Across Restarts

Developers used to get a clean database on every boot. Now stopping and starting the app preserves data. To reset:

```bash
psql -U cartwise -d cartwise_dev -c "DROP DATABASE cartwise_dev; CREATE DATABASE cartwise_dev OWNER cartwise;"
mvn spring-boot:run
```

This is a feature in production (data durability) but a friction point in development. Accept it or automate it with a pre-boot script.

### Enum Changes Require Migrations

Adding a new role to the `Role` enum now requires a migration to update the check constraint. Forgetting it means inserts fail. The entity change is incomplete without the migration.

### Migrations Are Immutable

Once a migration is deployed, you cannot edit it. Writing migrations carefully becomes important. A typo in V2 means V3 to fix it, not editing V2 retroactively. This is correct behavior, but it demands more attention.

## Next Steps

The schema is now frozen and versioned. Chapter 23 will wire the frontend to real API endpoints (wishlist, compare) and unify duplicated components. Chapter 24 will harden production deployments with rate limiting, Docker image builds, and CI/CD. Chapter 25 will document the application and conduct a security audit.

The database is ready to evolve. Every change now has a trail.
