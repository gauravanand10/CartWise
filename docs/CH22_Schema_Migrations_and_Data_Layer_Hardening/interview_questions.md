# 🎯 CH22 — Interview Questions

> **Project:** CartWise  
> **Chapter:** Schema Migrations & Data Layer Hardening
>
> This chapter covers Flyway, versioned SQL migrations, functional indexes, schema freezing, seed data strategy, and the test-vs-production schema tradeoff in the CartWise database layer.

---

# 📚 Beginner Level

## Q1. What is Flyway, and why did CartWise need it?

### Answer

Flyway is a schema versioning tool. It applies SQL migration files in order and records what has run in a `flyway_schema_history` table.

CartWise needed it because `ddl-auto: create-drop` regenerated the schema from entities on every boot — fine for development, unusable for production where the schema must persist and evolve predictably.

---

## Q2. What problem does `ddl-auto: create-drop` cause that Flyway solves?

### Answer

```text
create-drop: schema is regenerated from entities every boot
```

An entity change with no corresponding migration is invisible on a machine using `create-drop` — Hibernate just rebuilds. On a frozen production schema, that same change means a missing column and a crash. Flyway forces every schema change into a committed, reviewable file.

---

## Q3. What are the three migration files CartWise introduced, and what does each do?

### Answer

```text
V1__baseline.sql                              full initial schema
V2__add_functional_index_lower_category.sql   the index JPA cannot express
V3__seed_products.sql                         50 seed products
```

---

## Q4. How was V1's schema actually written?

### Answer

```text
App boots → pg_dump --schema-only → cleaned up → V1__baseline.sql
```

Not written by hand from the entities — exported directly from a running database, so it matches reality rather than someone's memory of the entities.

---

## Q5. Where do CartWise's migrations live in the project?

### Answer

```text
backend/src/main/resources/db/migration/
backend/src/main/resources/db/dev-seed/
```

`migration/` runs everywhere. `dev-seed/` runs only in the dev profile.

---

## Q6. What is the naming convention for a migration file?

### Answer

```text
V{number}__{description}.sql
```

Example: `V2__add_functional_index_lower_category.sql`. The number must be unique and sequential; Flyway runs files strictly in that order.

---

## Q7. What does `ddl-auto: validate` do, and where is it used?

### Answer

```text
Compares entities against the existing schema.
Matches   → boot succeeds
Mismatch  → boot fails
```

Used in both `application-dev.yml` and `application-prod.yml`. It never modifies the schema — only checks it.

---

## Q8. Why can't a plain `@Index` on `category` satisfy a query filtering on `lower(category)`?

### Answer

A standard B-tree index is built on the raw column value. A query filtering on `lower(category) = ?` needs an index built on that *expression*, not the column — which `@Index(columnList = "category")` cannot express.

```sql
CREATE INDEX idx_products_lower_category ON products (lower(category));
```

---

## Q9. Where do the two dev-only users live, and why aren't they in a migration?

### Answer

```text
backend/src/main/resources/db/dev-seed/dev-users.sql
```

Not a migration because Flyway migrations run in every environment, including production — a `V4__seed_users.sql` would publish an admin account with its password in the repo to every deployment.

---

## Q10. How many products does V3 seed, and where do they come from?

### Answer

```text
50 products across 7 categories
```

Rows 1–23 mirror `frontend/src/features/product/data/catalogue.ts` exactly (same slugs, prices, ratings, stock). Rows 24–50 are new, kept separate so nobody has to guess which rows are canonical.

---

# 📚 Intermediate Level

## Q11. Walk through what happens, step by step, when the application boots in the dev profile.

### Answer

```text
Boot
  ↓
Flyway connects to cartwise_dev
  ↓
Reads flyway_schema_history — finds nothing (first run)
  ↓
Applies V1 → V2 → V3 in order
  ↓
Records each as successful
  ↓
Hibernate starts, ddl-auto: validate
  ↓
Entities checked against the now-migrated schema
  ↓
Match → application starts
```

---

## Q12. Why does the test profile disable Flyway and keep `create-drop`, when dev and prod use validate?

### Answer

`@DataJpaTest` builds its schema from the entities directly — the same source V1 was transcribed from. Running Flyway on top would mean V1 creates the tables, then `create-drop` drops and rebuilds them underneath it, leaving `flyway_schema_history` claiming migrations were applied to a schema Flyway no longer built.

```text
Test schema      Hibernate-generated, from entities
Prod schema       Flyway-generated, from migrations
```

The accepted cost: the functional index from V2 doesn't exist in the test database, since `@Index` cannot express it either way.

---

## Q13. What guards against test schema and production schema silently disagreeing, if tests don't use Flyway?

### Answer

`ddl-auto: validate` in dev and prod. If an entity and V1's schema ever diverge, the application refuses to boot on a developer's laptop — a louder, earlier signal than a test failure, and one checked on every single dev boot rather than once per CI run.

---

## Q14. Why is the Flyway Maven plugin pinned to version 12.4.0 instead of the version originally specified?

### Answer

Spring Boot 4.1.0 manages Flyway 12.4.0 internally. Pinning the plugin to a different major version would mean two different Flyway engines — the one Boot uses at runtime and the one the plugin uses from the command line — writing to the same `flyway_schema_history` table, which is not a supported configuration.

---

## Q15. What is the correct artifact name for the Flyway Maven plugin, and what's the common mistake?

### Answer

```text
Correct    flyway-maven-plugin
Wrong      maven-flyway-plugin
```

Maven's own official plugins follow `maven-*-plugin`; third-party plugins (including Flyway's) follow `*-maven-plugin`. Getting this backwards is an easy, common mistake.

---

## Q16. Why does the Flyway Maven plugin need its own `url`/`user`/`password` configuration when the app itself has that in `application-dev.yml`?

### Answer

The plugin is a Maven command-line tool, not a Spring bean — it never reads `application-dev.yml`. It needs its own explicit JDBC configuration to know where to connect when you run `mvn flyway:info` from the terminal.

---

## Q17. What real error does misnaming the plugin's Maven property (`flyway.plugin.version` instead of `flyway-plugin.version`) cause?

### Answer

```text
Unknown configuration property: flyway.plugin.version
```

The plugin treats every Maven property prefixed `flyway.` as one of its own configuration keys. `flyway.plugin.version` gets parsed as an attempted config setting named `plugin.version`, which doesn't exist, and the build fails.

---

## Q18. Why does `spring.jpa.defer-datasource-initialization` have to be `false` after this chapter, when it used to matter for `data.sql` ordering?

### Answer

With it `true`, Spring registers the `EntityManagerFactory` itself as a database initializer, and makes every other initializer — including Flyway — depend on it finishing first. Hibernate then runs before Flyway, meaning `validate` checks an unmigrated, empty database and fails with something like "missing table \[comparisons\]" — a symptom that names nothing about the real cause.

```text
defer-datasource-initialization: true
   ↓
EntityManagerFactory registered as initializer
   ↓
Flyway forced to depend on it
   ↓
Hibernate runs first, validates against empty schema
   ↓
Boot fails, misleading error
```

Since `data.sql` no longer exists, the flag's only remaining job is gone, so it's set to `false`.

---

## Q19. Why is `users_role_check` now something a developer has to maintain by hand?

### Answer

Hibernate used to regenerate the enum's check constraint on every boot. With the schema frozen, that constraint is static SQL written once in V1:

```sql
CHECK (role IN ('USER', 'ADMIN'))
```

Adding a new role to the `Role` enum in Java now does nothing to the database on its own — a migration must update the constraint, or every insert of the new role fails.

---

## Q20. Why does dev data now persist across restarts, and is that a problem?

### Answer

Flyway migrations are idempotent — once V1, V2, V3 are recorded as applied, they never run again on restart, so the data they created (and anything added since) stays. This is correct behavior and matches production, but it's a workflow change: a developer used to relying on a clean slate every restart must now explicitly drop and recreate the database to get one.

---

# 📚 Advanced Level

## Q21. Explain the exact interlocking failure if `flyway.enabled: true` is paired with `ddl-auto: create` instead of `validate`.

### Answer

```text
Flyway runs first, creates tables from V1/V2/V3
       ↓
Hibernate's ddl-auto: create then tries to build the schema
from entities on top of what already exists
       ↓
Conflict: tables already exist, or Hibernate silently
alters what Flyway just built
       ↓
flyway_schema_history now describes a schema state
Flyway itself no longer controls
```

`validate` is the only safe pairing — it makes Hibernate read-only with respect to schema.

---

## Q22. A schema difference appeared once between the app-booted schema and Hibernate's expected schema, involving the `role` check constraint. What was it, and how was it resolved?

### Answer

Hibernate emits the constraint as:

```sql
CHECK ((role IN ('USER','ADMIN')))
```

`pg_dump` deparses that back as an `= ANY (ARRAY[...])` form. Pasting that deparsed form directly into V1 produced a stored constraint expression with the cast moved inside the array — logically equivalent, but a permanent textual diff from what Hibernate itself would emit. The fix was writing Hibernate's *original* input form into V1 rather than the round-tripped, deparsed one, making the two schemas byte-identical on comparison.

The general lesson: round-tripping a deparsed SQL expression through a parser is not guaranteed to reproduce the same tree it started from.

---

## Q23. Why does V3's seed data live in a migration at all, instead of staying as `data.sql`?

### Answer

`data.sql` is controlled by `spring.sql.init.mode`, which CartWise sets to `never` in production — so it simply never ran there, by design. Flyway has no equivalent switch: every migration in `db/migration/` applies in every environment. That's precisely why the seed *users* (with real, repo-visible passwords) could not follow the same pattern as seed *products* and were moved to a dev-only fixture file instead.

---

## Q24. Design the migration you'd write to add a new `PENDING_REVIEW` value to the `Role` enum.

### Answer

```sql
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('USER', 'ADMIN', 'PENDING_REVIEW'));
```

Written as V4, never by editing V1. The Java enum change and this migration must land in the same commit — the entity and the constraint are two halves of one change, and `ddl-auto: validate` alone won't catch a constraint that's simply too permissive (it validates columns and types, not the contents of arbitrary CHECK expressions).

---

## Q25. What is the actual proof, in this chapter, that the functional index is being used rather than just present in the schema?

### Answer

`EXPLAIN ANALYZE` on a table loaded to realistic scale (50,000 synthetic rows):

```text
Bitmap Heap Scan on products
  Recheck Cond: (lower((category)::text) = 'smartphone'::text)
  ->  Bitmap Index Scan on idx_products_lower_category
Execution Time: 2.270 ms
```

Then the same query with `enable_bitmapscan`/`enable_indexscan` forced off, showing a sequential scan at 18.104 ms — roughly 8x slower. Presence of the index in `\d products` output alone proves nothing about whether the planner actually chooses it; the disabled-scan comparison does.

---

## Q26. At 50 rows (the seeded amount), the query planner chooses a sequential scan over the functional index. Is that a bug?

### Answer

No — it's the planner making the correct call. At 50 rows, a sequential scan is cheaper than the overhead of an index lookup; PostgreSQL's cost-based planner is doing its job. The index only pays for itself at realistic scale, which is why the proof in this chapter deliberately loads 50,000 synthetic rows before measuring — testing the index at seed-data scale would show nothing.

---

## Q27. Explain the schema-diff verification process used to confirm the migrations exactly match what Hibernate would generate.

### Answer

```text
pg_dump of the Flyway-built schema
pg_dump of a Hibernate-built schema (e.g. from a test context)
       ↓
Normalize both outputs
       ↓
Diff them
```

The only expected difference: V2's functional index, which Hibernate cannot generate. Any other diff signals V1 was transcribed incorrectly from the entities and needs correcting before it's treated as a safe baseline.

---

## Q28. Why is `cleanDisabled=true` mentioned as "one command away" rather than actually configured?

### Answer

Flyway's `clean` command drops every object in the schema — effectively an "undo everything" button. `cleanDisabled=true` is the safety switch that makes `flyway:clean` refuse to run, which matters most in production, where an accidental `clean` would be catastrophic. It's flagged as a known, easy addition rather than configured immediately because enabling it changes plugin behavior that should be a deliberate, reviewed decision rather than bundled silently into a chapter about something else.

---

## Q29. On a completely fresh database (dropped and recreated), what does the boot log sequence prove, in order?

### Answer

```text
DbValidate     : Successfully validated 3 migrations
JdbcTableSchemaHistory : Creating Schema History table
DbMigrate      : Migrating schema "public" to version "1 - baseline"
DbMigrate      : Migrating schema "public" to version "2 - ..."
DbMigrate      : Migrating schema "public" to version "3 - ..."
DbMigrate      : Successfully applied 3 migrations ... now at version v3
[Hibernate JPA processing begins after this]
```

This proves, in order: the migrations are syntactically valid, they apply cleanly to a truly empty schema (not just an already-migrated one), and Flyway completes fully *before* Hibernate's `validate` step ever runs — the correct boot ordering this whole chapter depends on.

---

## Q30. If a teammate edits `V2__add_functional_index_lower_category.sql` after it has already been deployed to production, what breaks, and what's the correct fix?

### Answer

Nothing breaks immediately — Flyway sees V2 already recorded in `flyway_schema_history` and simply never re-runs it, so the edited file has zero effect on any already-migrated database. The danger is silent: a fresh environment (a new developer's machine, a new CI runner) would apply the *edited* V2, while every existing deployment still has the *original* V2 — two environments now running from migrations that don't actually match. The correct fix is to leave V2 untouched and write V4 with whatever change was intended.

---

# 📌 Summary

These questions cover:

- Why Flyway replaced `ddl-auto: create-drop` in dev and prod
- What V1, V2, and V3 each contain and why they're separated
- The interlocking failure mode between Flyway and Hibernate, and how `validate` prevents it
- Why the test profile deliberately does not use Flyway, and what that costs
- The `flyway-maven-plugin` naming and version-pinning gotchas
- The `defer-datasource-initialization` footgun and its real failure symptom
- Why seed users live outside migrations entirely
- Proving the functional index is used, not just present, via `EXPLAIN ANALYZE`
- Migration immutability and the correct way to fix a deployed mistake
