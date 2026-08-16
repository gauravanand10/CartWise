# 📖 CH22 — Glossary

> **Project:** CartWise  
> **Chapter:** Schema Migrations & Data Layer Hardening

This glossary explains the important terms and concepts introduced while freezing the CartWise database schema.

---

# 🗄️ Schema

Schema is the structure of a database: tables, columns, types, constraints and indexes.

It is the contract between the application and the database.

```text
Entity (code)  ←→  Schema (database)
```

When the contract breaks, the application crashes at boot or at query time.

---

# 🌊 Schema Drift

Schema Drift is when the entity model and the database schema disagree.

```text
Entity expects:     discount_percentage column
Database has:       no such column

Dev (Hibernate)     ✅ works, auto-generates it
Prod (frozen)       ❌ crashes, column missing
```

Caught immediately by `ddl-auto: validate` at boot.

---

# 🛫 Flyway

Flyway is a schema versioning tool that applies SQL migrations in order.

```text
Boot
 ↓
Read db/migration/*.sql
 ↓
Compare against flyway_schema_history
 ↓
Run anything new, in order
```

It guarantees each migration runs exactly once.

---

# 📜 Migration

A Migration is a versioned SQL file describing one schema change.

```text
V1__baseline.sql
V2__add_functional_index_lower_category.sql
V3__seed_products.sql
```

Named `V{number}__{description}.sql`, run strictly in order.

---

# 🧱 Baseline Migration

The Baseline Migration (V1) is the first migration — it creates the entire initial schema.

CartWise's baseline was exported, not hand-written:

```text
App boots → pg_dump --schema-only → cleaned → V1__baseline.sql
```

---

# 📇 flyway_schema_history

`flyway_schema_history` is the table Flyway creates to record which migrations have run.

```text
version | description | success | installed_on
--------|--------------|---------|-------------
1       | baseline     | true    | 2026-08-16
2       | functional…  | true    | 2026-08-16
3       | seed products| true    | 2026-08-16
```

Flyway reads this table on every boot to decide what's new.

---

# 🔢 Idempotent

Idempotent means running an operation once or many times produces the same result.

```text
Migration applied once   → recorded in history
Migration file unchanged → never re-run
```

Idempotent per version, not across versions — dropping the schema and re-running V1 recreates it from scratch.

---

# 🧊 Immutable Migration

An Immutable Migration cannot be edited once it has been deployed.

```text
Wrong                        Right
Edit V2 after deploy    →    Write V4 to fix V2's mistake
```

Editing a deployed migration breaks the audit trail.

---

# 🧮 Functional Index

A Functional Index is built on an expression, not a plain column.

```sql
CREATE INDEX idx_products_lower_category ON products (lower(category));
```

JPA's `@Index` cannot express this — it only takes a `columnList`. The index exists only in the SQL migration.

---

# 🎯 ddl-auto: validate

`ddl-auto: validate` is a Hibernate setting that checks entities against the schema without modifying it.

```text
Entity matches schema     → boot succeeds
Entity does not match     → boot fails, loudly
```

Used in dev and prod after Chapter 22. Never modifies the database — only reads and compares.

---

# 🗑️ ddl-auto: create-drop

`ddl-auto: create-drop` regenerates the schema from entities on every context start, then drops it on shutdown.

```text
Boot → build schema from entities → run → shut down → drop everything
```

Kept in the test profile only. Never used in dev or prod after Chapter 22.

---

# ⚔️ Flyway vs Hibernate Conflict

The Flyway vs Hibernate Conflict happens when both try to own the schema at once.

```text
Flyway creates tables (V1, V2, V3)
       ↓
Hibernate's create-drop drops and recreates them
       ↓
flyway_schema_history now describes a schema
Flyway no longer built
```

Solved by pairing Flyway with `ddl-auto: validate` — Hibernate reads only, never writes.

---

# 🌱 Seed Data

Seed Data is the initial rows a database needs to be useful.

```text
V3__seed_products.sql  →  50 products
```

Versioned like schema, because the application expects this minimum dataset to exist.

---

# 🧑‍💻 Dev Fixture

A Dev Fixture is data that exists only to make local development convenient — never deployed to production.

```text
db/dev-seed/dev-users.sql
    demo@cartwise.dev  (USER)
    admin@example.com  (ADMIN)
```

Loaded only in the dev profile via `spring.sql.init.data-locations`.

---

# 🔒 Frozen Schema

A Frozen Schema is one that no longer changes automatically — every change requires an explicit migration.

```text
Before CH22   entities → schema (automatic, implicit)
After CH22    migration → schema (explicit, versioned)
```

---

# 📐 Enum Check Constraint

An Enum Check Constraint restricts a column to a fixed set of values.

```sql
CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN'))
```

Hibernate used to regenerate this automatically. With a frozen schema, adding a new role now requires a migration to update the constraint by hand.

---

# 🕰️ Data Persistence Across Restarts

Data Persistence Across Restarts means the database survives an application restart instead of resetting.

```text
Before CH22   restart → clean slate (create-drop)
After CH22    restart → data survives (Flyway, no drop)
```

A feature in production, friction in development.

---

# 🧾 Audit Trail

An Audit Trail is the recorded history of every change to the schema.

```text
git log db/migration/
```

Every column, index and constraint traces back to a commit with a timestamp and description.

---

# 🚧 Deployment Ordering

Deployment Ordering is the question of which system — Flyway or Hibernate — acts on the schema first at boot.

```text
Correct order:
Flyway migrates  →  Hibernate validates (read-only)
```

Getting this backwards is the root cause of the Flyway vs Hibernate Conflict.

---

# 🧪 Test Schema vs Production Schema

Test Schema vs Production Schema is the accepted gap between how tests build their database and how production builds its own.

```text
Test         Hibernate generates schema from entities (create-drop, Flyway off)
Production   Flyway migrations build schema (validate, Flyway on)
```

The tradeoff: the functional index from V2 does not exist in the test database, because Hibernate cannot express it. Guarded by `ddl-auto: validate` catching drift in dev before it ever reaches prod.

---

# 🩹 Test Fixture (belongs to the test)

A Test Fixture is data a test creates for itself, rather than depending on shared seed data.

```text
Wrong    test depends on V3's 50 seeded products
Right    test inserts exactly the 2 products it needs
```

Keeps a failing test's cause obvious — the data it depends on is visible in the test itself.

---

# 🔑 JDBC Credentials (plugin config)

JDBC Credentials are the URL, username and password the Flyway Maven plugin needs to connect directly.

```xml
<url>jdbc:postgresql://localhost:5432/cartwise_dev</url>
<user>cartwise</user>
<password>cartwise</password>
```

Required because the plugin runs outside Spring and never reads `application-dev.yml`.

---

# 🧨 Destructive Migration

A Destructive Migration is one that can lose data — renaming or dropping a column, for example.

```sql
ALTER TABLE products RENAME COLUMN category TO category_name;
```

`create-drop` hid this cost by rebuilding from scratch. Real migrations force the question of what happens to existing data.

---

# 📊 EXPLAIN ANALYZE

`EXPLAIN ANALYZE` is a PostgreSQL command that shows how a query actually executed, including whether an index was used.

```text
Bitmap Index Scan on idx_products_lower_category
Execution Time: 2.270 ms
```

Used to prove the functional index from V2 is genuinely helping, not just present.

---

# 🌀 Reset Database

Reset Database is the manual replacement for what `create-drop` used to do automatically.

```bash
DROP DATABASE cartwise_dev;
CREATE DATABASE cartwise_dev OWNER cartwise;
```

Then boot the app to re-run every migration from V1.

---

# 🔐 Production Credentials Hygiene

Production Credentials Hygiene means never hardcoding real database passwords in version-controlled files.

```text
Dev/CI    hardcoded credentials in pom.xml    (acceptable, ephemeral)
Prod      environment variables / Secrets Manager (required)
```

The same discipline that kept user passwords out of V3 and into a dev-only fixture file.
