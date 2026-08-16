# 🗄️ CH22 — Schema Migrations & Data Layer Hardening

> **Project:** CartWise  
> **Chapter:** Schema Migrations  
> **Feature:** Flyway, Versioned Database Schema

---

# 👋 Welcome

Chapter 21 proved the test suite works — every test passes, the Docker guard is verified, and 95.4% of the backend is covered.

But there is a contract the test suite alone cannot enforce:

> **"Does the deployed schema match what the code expects?"**

A developer adds a field to the `Product` entity on their laptop. Hibernate's `ddl-auto: create-drop` regenerates the schema on every boot, so it just works — silently, automatically, invisibly. They commit and push. On a server where the schema is frozen, that same field has nowhere to live. The application starts, a query runs, and it fails on a column that was never created.

That is the problem this chapter solves.

The journey becomes:

```text
🧬 Entity Change
   ↓
📜 Write a Migration
   ↓
✅ Commit Both Together
   ↓
🚀 Deploy
   ↓
🗄️ Schema Applies
   ↓
🟢 Code Works
```

The database stops being something Hibernate infers on the fly, and becomes something the team builds deliberately.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- Why `ddl-auto: create-drop` cannot survive contact with a real deployment.
- What Flyway actually does, and how it tracks what has already run.
- Why the baseline migration was exported from a live database, not written by hand.
- Why a functional index cannot be expressed by JPA's `@Index` annotation.
- Why seed data for products lives in a migration, but seed data for users does not.
- Why the test profile deliberately disables Flyway and keeps `create-drop`.
- Why migrations, once deployed, must never be edited.
- How `ddl-auto: validate` turns a silent schema mismatch into a loud boot failure.
- What broke — and why — when `defer-datasource-initialization` was left `true`.
- Why enum changes now require a migration, not just a Java edit.
- How to prove, with real numbers, that an index is actually being used.

---

# 🧭 The Schema Lifecycle

The complete migration journey after Chapter 22:

```text
Local Entity Change
       │
       ▼
Write V{n}__description.sql
       │
       ▼
Run Locally (mvn flyway:info / validate)
       │
       ▼
Commit Migration + Entity Together
       │
       ▼
Push
       │
       ▼
Deploy → Flyway Applies → Hibernate Validates
       │
       ▼
🟢 Boot Succeeds, or 🔴 Boot Fails Loudly
```

A failed boot is now the safety net. Before this chapter, a mismatch failed silently — the app just ran with whatever schema Hibernate happened to build.

---

# 🤔 create-drop vs Flyway

CartWise now has two schema strategies, used in different places on purpose.

**`create-drop`** answers:

> What schema do these entities imply, right now, from scratch?

```text
Boot → build schema from entities → run → shut down → drop everything
```

**Flyway + `validate`** answers:

> Does this frozen, versioned schema still match what the code expects?

```text
Boot → read migration history → apply anything new → Hibernate checks, never builds
```

The differences that matter in practice:

```text
                  create-drop         Flyway + validate
Schema source     Entities (live)     SQL files (frozen)
Used in           test profile only   dev, prod
Data survives     No — wiped          Yes — persists
Drift caught      Never               At boot, immediately
Editable history  N/A                 Never, once deployed
```

They are not competing strategies — they are two tools used deliberately in two different places, and mixing them in the same profile is the single most common way to break this chapter.

---

# 🗂️ Feature Structure

Schema migrations live entirely inside:

```text
backend/src/main/resources/db/
```

The structure is:

```text
db/
│
├── migration/
│   ├── V1__baseline.sql
│   ├── V2__add_functional_index_lower_category.sql
│   └── V3__seed_products.sql
│
└── dev-seed/
    └── dev-users.sql
```

`migration/` is read in every environment. `dev-seed/` is read only when the `dev` profile is active, via `spring.sql.init.data-locations` — never bundled into the versioned schema history.

---

# 🧩 Migration Architecture

This is the most important section of the chapter, because Flyway and Hibernate are **two systems that can both try to own the schema**, and letting them collide is the easiest way to misunderstand this chapter.

### Layer 1 — Flyway (Schema Definition)

*What does the schema actually look like?* Versioned, ordered, immutable once applied.

```text
db/migration/*.sql
        ↓
flyway_schema_history (tracks what ran)
        ↓
PostgreSQL schema (tables, indexes, constraints)
```

### Layer 2 — Hibernate (Schema Verification)

*Does the code agree with what Flyway built?* Read-only, checked on every boot.

```text
@Entity classes
     ↓
ddl-auto: validate
     ↓
Compared against the live schema
     ↓
Match → boot continues
Mismatch → boot fails
```

The split matters. Layer 1 is the single source of truth for structure. Layer 2 never writes to the schema in dev or prod — it only ever reads and compares. A common mistake is letting Hibernate use `create` or `update` alongside Flyway, which puts both layers in control of the same tables at once.

---

# 🔑 Why the Baseline Was Exported, Not Hand-Written

`V1__baseline.sql` was not typed out from the entity definitions. It was produced this way:

```text
App boots with the old create-drop schema
       ↓
pg_dump --schema-only
       ↓
Cleaned up
       ↓
V1__baseline.sql
```

Hand-transcribing DDL from Java annotations invites small, easy-to-miss mistakes — a wrong column order, a forgotten constraint, a type that doesn't quite match what Hibernate actually emits. Exporting from a database Hibernate itself built guarantees V1 matches reality on day one, which is what a later schema diff (covered below) is able to prove.

Column order in V1 matches Hibernate's own output — grouped by type width — specifically so that future `pg_dump` comparisons stay clean rather than showing a diff on ordering alone.

---

# 💾 What Is Actually in V1

```sql
products        50 rows, seeded by V3
users            2 rows, seeded by db/dev-seed/dev-users.sql
wishlists        empty
comparisons      empty

idx_products_category
idx_products_price
```

Three properties fall out of this baseline:

- It is the exact schema Hibernate was already building, captured once and frozen.
- It carries no seed data of its own — V1 is structure only.
- It is the file every future migration is written against, so getting it right on day one matters more than any migration that follows.

---

# 🧮 V2: The Functional Index

`ProductSpecifications.java` had already documented a limitation before this chapter arrived:

> "A plain B-tree index on category cannot satisfy `lower(category) = ?`… needs a functional index — which JPA's `@Index` cannot express. This is recorded as a known limitation."

```sql
CREATE INDEX idx_products_lower_category ON products (lower(category));
```

Named `idx_products_lower_category` — matching the sibling indexes `idx_products_category` and `idx_products_price`, not `idx_product_lower_category`, because the table is `products`, plural, and the naming has to agree with what already exists.

`@Index` takes a `columnList` — plain column names only. `lower(category)` is an expression, not a column, and JPA has no annotation for that. V1 gave this index somewhere to finally live: SQL, not Java.

---

# 🌱 V3: Seed Products

```text
50 products, 7 categories, 30 brands
Price range: ₹5,999 – ₹229,999
7 out of stock, 12 undiscounted
```

```text
Accessories   8 products    ₹8,999  – ₹21,999
Earbuds       6 products    ₹5,999  – ₹26,999
Headphones    5 products    ₹5,999  – ₹32,999
Laptop        8 products    ₹74,999 – ₹199,999
Smartphone   11 products    ₹24,999 – ₹129,999
Smartwatch    6 products    ₹14,999 – ₹99,990
Television    6 products    ₹54,999 – ₹229,999
```

Rows 1–23 mirror `frontend/src/features/product/data/catalogue.ts` — same slugs, same prices, same ratings, and `stockCount: 0` mapped to `in_stock = false`. Rows 24–50 are new, and deliberately grouped separately in the file so nobody looking at it later has to guess which rows are the "real" original seed and which were invented to round the catalogue out to 50.

---

# 🚫 Why the Two Seed Users Did Not Become a Migration

This is the design decision worth flagging hardest in the whole chapter.

`data.sql` was safe in production for exactly one reason: `spring.sql.init.mode: never` meant it simply never ran there. Flyway has no equivalent switch.

```text
data.sql          respects spring.sql.init.mode: never
V4__seed_users.sql   would run in EVERY environment, including prod
```

A `V4__seed_users.sql` would have published an ADMIN account — with its password sitting in the repository — to every environment the migrations ever touched, prod included. Instead, the two users live here:

```text
db/dev-seed/dev-users.sql
    demo@cartwise.dev   → USER
    admin@example.com   → ADMIN
```

Loaded only when `spring.sql.init.data-locations` points at it, which is only true under the dev profile. Verified present after boot by querying the `users` table directly — not assumed from the file existing.

---

# ⚙️ application-dev.yml

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

`ddl-auto` changed from `create-drop` to `validate`. The reasoning is stated directly in the file: entities are no longer the schema; an entity change without a matching migration is now a laptop startup failure instead of a deploy failure. Catching the mistake on a developer's machine, immediately, beats catching it three environments later.

---

# 🛫 application-prod.yml

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

Already correct before this chapter — `ddl-auto: validate` was set in prod from the start. What changed is that Flyway is now the thing actually building the schema `validate` checks against, rather than nothing.

---

# 🧪 application-test.yml

```yaml
spring:
  flyway:
    enabled: false
  jpa:
    hibernate:
      ddl-auto: create-drop
```

This is the file's own header, and it says the quiet part out loud:

> "Chapter 22 arrived and did NOT make the swap this header used to promise. That is a decision, and reversing a written prediction deserves the reasoning rather than a quiet edit."

The suite keeps `create-drop` and turns Flyway **off**, explicitly:

```text
spring.flyway.enabled: false
```

Not a default being restated — Boot's actual default is `true`, and `flyway-core` sits on the test classpath at `runtime` scope. Leaving this line out would mean Flyway silently auto-configures itself in every test context: V1 creates the tables, then `create-drop` drops and rebuilds them underneath it, leaving `flyway_schema_history` claiming migrations are applied to a schema Flyway no longer actually built.

**The limitation this creates, stated plainly:** repository tests run against a schema Hibernate generated from the entities — not the schema a real deployment gets from `db/migration`. Concretely, `idx_products_lower_category` does not exist in the test database, because `@Index` cannot express it and Hibernate is what builds this particular schema. Any test asserting on that index would be asserting about something that exists nowhere in this profile.

**What guards the gap instead:** `ddl-auto: validate` in dev and prod. If V1 and the entities ever disagree, the application fails to start on a developer's laptop — a louder signal than a test would give, and one checked on every single dev boot rather than once per CI run.

---

# 🧯 What I Believe Is Now Worse

Two things, stated deliberately, because a chapter that only lists wins is not trustworthy.

### a) The `defer-datasource-initialization` Footgun

This one is real, and it was hit for real, not theorized.

```text
spring.jpa.defer-datasource-initialization: true
       ↓
EntityManagerFactory registers itself as a database initializer
       ↓
configureOtherInitializersToDependOnJpaInitializers()
makes every other initializer — Flyway included — depend on it
       ↓
Hibernate runs FIRST
       ↓
validate checks an unmigrated, empty database
       ↓
Boot dies: "Schema validation: missing table [comparisons]"
```

The symptom names nothing relevant. Flyway's auto-configuration matches, its beans get created, `spring.flyway.*` binds correctly — and yet zero Flyway log lines appear, because it never got the chance to run before Hibernate already failed. Reading `JpaDatabaseInitializerDetector` directly (from bytecode) is what actually explained this — not the stack trace, which just points at a missing table with no context about why it's missing.

Accepted, and set to `false`, because the flag's only remaining job was ordering `data.sql`, which no longer exists in this codebase.

### b) `users_role_check` Is Now Hand-Maintained

Hibernate used to regenerate the enum's check constraint on every boot automatically. Adding a value to `Role` now requires a migration, or every insert of the new role fails at the database level, silently, until someone tries it.

```text
Before   enum change in Java  →  Hibernate updates the constraint automatically
After    enum change in Java  →  constraint unchanged  →  new value rejected
                               →  must also write a migration
```

That is the honest cost of freezing the schema. It buys auditability and predictability, and it spends automatic convenience to pay for it.

**Also worth stating plainly:** dev data now persists across restarts. Stopping the backend no longer resets the database. That is the entire point of the chapter, but it changes the day-to-day workflow, and any stored setup notes that said "re-seed after every restart" are now wrong and need updating.

---

# 📋 Verification Performed

### `mvn flyway:info`

```text
Schema version: 3

Category    Version  Description                           State
Versioned   1        baseline                               Success
Versioned   2        add functional index lower category    Success
Versioned   3        seed products                          Success
```

### `mvn flyway:validate`

```text
Successfully validated 3 migrations.
```

### Fresh Database Test

```bash
DROP DATABASE cartwise_dev;
CREATE DATABASE cartwise_dev OWNER cartwise;
```

Then boot, and read the logs in order:

```text
DbValidate  : Successfully validated 3 migrations
JdbcTableSchemaHistory : Creating Schema History table
DbMigrate   : Migrating schema "public" to version "1 - baseline"
DbMigrate   : Migrating schema "public" to version "2 - add functional index lower category"
DbMigrate   : Migrating schema "public" to version "3 - seed products"
DbMigrate   : Successfully applied 3 migrations to schema "public", now at version v3
Started CartwiseBackendApplication in 5.263 seconds
```

Flyway completes fully before Hibernate ever initializes — proving the boot order this whole chapter depends on. `\d products` afterward confirms all 13 columns and the functional index are present.

### Test Suite

```text
Tests run: 313, Failures: 0, Errors: 0, Skipped: 0
```

`Skipped: 0` matters specifically — it confirms the Testcontainers repository tests genuinely ran against a real PostgreSQL container, not that Docker was unavailable and they were quietly skipped.

### Index Usage Proof

At 50 rows — the actual seed size — the planner correctly chooses a sequential scan:

```text
Seq Scan on products  (actual time=0.015..0.041 rows=11)
Execution Time: 0.087 ms
```

This is not a bug. At this scale a sequential scan genuinely is cheaper. To prove the index earns its place, 50,000 synthetic rows were loaded and analyzed:

```text
Bitmap Heap Scan on products
  ->  Bitmap Index Scan on idx_products_lower_category
Execution Time: 2.270 ms
```

Then the same query with the index forcibly disabled:

```text
Seq Scan on products
  Rows Removed by Filter: 49039
Execution Time: 18.104 ms
```

**2.27 ms vs 18.10 ms — roughly 8×.** The synthetic rows were deleted afterward; the table is back to 50.

### Schema Diff

`pg_dump` of both the Flyway-built schema and a Hibernate-built schema, normalized and diffed. The only difference:

```sql
CREATE INDEX idx_products_lower_category ON products USING btree (lower((category)::text));
```

Exactly what should differ, and nothing else — which is the actual proof that V1 is a faithful baseline.

---

# 🌟 Why This Chapter Matters

Every chapter before this one treated the database as something that just existed, generated fresh from whatever the entities happened to say. This is the first chapter where the database became something the team is responsible for *evolving*, deliberately, with a paper trail.

```text
Identity over inference      → this chapter's whole premise
Explicit over automatic      → validate instead of create-drop
Immutable history            → migrations, once deployed, never edited
Proof over assumption        → EXPLAIN ANALYZE, not "it should use the index"
Honest tradeoffs             → test schema gap, stated and guarded, not hidden
```

It is also the first chapter where a real, unplanned bug (`defer-datasource-initialization`) got hit, diagnosed from bytecode rather than a helpful error message, and fixed — which is closer to what schema work actually looks like in production than any of the chapters that came before it.

---

# 📌 Key Takeaways

After Chapter 22:

- `ddl-auto: create-drop` no longer runs in dev or prod — only in tests, where it's the correct and intentional choice.
- V1 is an exported baseline, not a hand-written guess at what the entities imply.
- V2 exists because JPA's `@Index` cannot express a functional index like `lower(category)`.
- V3 seeds 50 products; the first 23 are canonical, mirrored from the frontend catalogue.
- Seed users live outside any migration entirely, because Flyway has no production-safe switch to skip them.
- The test profile disables Flyway on purpose — running both would corrupt `flyway_schema_history`.
- `ddl-auto: validate` is what guards the gap between test schema and production schema.
- Migrations are immutable once deployed — mistakes are fixed with a new migration, never an edit.
- `defer-datasource-initialization` had to become `false`, for a subtle and specific reason involving initializer ordering.
- Enum changes now require a migration alongside the Java change, not instead of it.
- The functional index's value was proven with real numbers at real scale, not assumed from its presence in the schema.

---

# 🎯 Chapter Outcome

The CartWise database is now:

```text
🗄️ Frozen Schema
     ↓
📜 Versioned in Git
     ↓
🔍 Validated on Every Boot
     ↓
🧯 Fails Loudly, Not Silently
     ↓
🏆 Deployable With Confidence
```

The database stopped being inferred and started being built. Every future chapter that touches the schema now has a place to write that change down — and a way to prove, before deploying, that the change actually matches the code.

# 🔌 Chapter 23 — Finish Wiring & Consolidate
