# Glossary: Schema Migrations & Data Layer Hardening

**Audit trail** — A record of every change to the database schema, including who made it, when, and why. Flyway migrations provide this via the `flyway_schema_history` table.

**Baseline migration** — The first migration (V1) that creates the initial schema. It is typically exported from an existing database or generated from the application's entity model.

**Check constraint** — A constraint that enforces a condition on one or more columns. Example: `CHECK (role IN ('USER', 'ADMIN'))` ensures the role column only holds valid enum values. Hibernate generates these from enums; migrations must maintain them.

**Create-drop** — A Hibernate DDL strategy that drops and recreates the schema on every application context start. Safe for testing (each test gets a clean slate), dangerous for dev (masks schema drift), never for production.

**ddl-auto** — A Hibernate configuration property that controls how the ORM handles schema on startup. Values: `create-drop` (generate and drop per context), `create` (generate once), `update` (add columns/tables), `validate` (assert entities match schema, fail if not).

**Deployment** — Moving code and schema changes from development to production. The migration pipeline ensures the schema is applied before the application starts.

**Drift** — Unintended divergence between an entity definition and the database schema. Example: adding a `@Column` to an entity without a migration means dev (where Hibernate applies it) diverges from prod (where the schema is frozen).

**Enum** — A Java type with a fixed set of values. Example: `enum Role { USER, ADMIN }`. When persisted, Hibernate creates a check constraint to enforce only these values are inserted.

**Flyway** — An open-source schema versioning tool. It reads migration files from a configured directory, maintains a history table, and applies new migrations on startup. Flyway guarantees each migration runs exactly once (idempotent per version, not across versions).

**Functional index** — An index on an expression, not a column. Example: `CREATE INDEX idx_products_lower_category ON products (lower(category))` indexes the lowercased category for case-insensitive searching. JPA `@Index` cannot express this; migrations can.

**Idempotent** — A property of an operation: running it once or many times produces the same result. Flyway migrations are idempotent per version (once recorded in the history table, they are never re-run) but not across versions (V1 run twice recreates the baseline if the schema was dropped).

**Immutable** — Cannot be changed after creation. Applied migrations are immutable — once deployed, they must not be edited. New changes require new migrations. This preserves the audit trail.

**Index** — A database structure that speeds up queries by pre-sorting data. Example: `CREATE INDEX idx_products_category ON products (category)` makes category-based lookups faster at the cost of slower inserts. Functional indexes sort by an expression (e.g., `lower(category)`).

**Interlocking** — A problem where two components depend on each other in an incompatible way. Example: Flyway creates tables, then Hibernate drops and recreates them, leaving `flyway_schema_history` orphaned. Solved by using `ddl-auto: validate` (Hibernate reads only) with Flyway.

**Migration** — A versioned SQL file describing a schema change. Example: `V3__seed_products.sql` inserts 50 products. Migrations are named `V{number}__{description}.sql` and run in order by Flyway.

**Normalization** — Ensuring files use consistent line endings. Windows (CRLF) and Unix (LF) use different line endings; Git can auto-convert on checkout/commit. Controlled by `.gitattributes`.

**Pg_dump** — A PostgreSQL utility that exports a database to SQL. `pg_dump --schema-only` exports DDL only (no data), useful for creating a baseline migration.

**Profile** — A Spring configuration set. `spring.profiles.active` selects which profile loads. Example: `dev` loads `application-dev.yml`, `test` loads `application-test.yml`.

**Reversible** — A migration that can be undone. Flyway supports down migrations (e.g., `U3__undo_seed_products.sql`) but CartWise does not use them — all migrations are forward-only.

**Rollback** — Undoing a migration or transaction. Flyway can disable a migration but cannot undo it (requires a down migration). Transactions (in tests) roll back after each test, but schema changes cannot be rolled back within a transaction.

**Schema** — The structure of a database: tables, columns, types, constraints, and indexes. The schema is the contract between the application and the database.

**Schema drift** — When the schema and the application's entity model disagree. Example: entity defines a `String status` column, but the schema has no such column. Caught by `ddl-auto: validate` at boot.

**Seed data** — Initial data inserted into a database. V3 seeds 50 products; dev-seed/dev-users.sql seeds 2 users (dev only). Seed data is different from test fixtures (which belong to the test, not the database).

**Snapshot** — A backup of the database at a point in time. Not used in CartWise; the schema history in version control serves this purpose.

**SQL** — Structured Query Language, the standard for database operations. Migrations are written in SQL (specifically, PostgreSQL SQL).

**Transactional** — An operation that is all-or-nothing. If a transaction fails halfway through, the entire operation is rolled back. Spring's `@Transactional` makes a method a transaction; the test suite uses it to isolate tests by rolling back after each one.

**Validate** — A Hibernate DDL strategy that asserts entities match the schema without modifying it. If an entity has a column the schema lacks, boot fails. This is the correct choice for dev and prod.

**Versioning** — Assigning sequential numbers to migrations (V1, V2, V3, ...) to ensure they run in order. Flyway enforces this; you cannot apply V3 before V2.

**Volatility** — How often a value changes. In the context of migrations, a stable schema is one that changes rarely; a volatile schema changes often, requiring many new migrations. CartWise's schema is stable (few new columns per chapter).
