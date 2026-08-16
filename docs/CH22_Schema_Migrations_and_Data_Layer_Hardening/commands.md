# 💻 CH22 — Commands

> **Project:** CartWise  
> **Chapter:** Schema Migrations & Data Layer Hardening

This file contains the commands used to develop, verify, and commit the schema migration system.

---

# 🚀 Development Commands

## Start Backend (Dev Profile)

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Boots the app, runs Flyway migrations, then starts Hibernate in `validate` mode.

---

## Build Backend

```bash
./mvnw clean package
```

Compiles and packages the application, running the full test suite unless skipped.

---

# 🛫 Flyway Commands

## Check Migration Status

```bash
./mvnw flyway:info
```

### Expected

```text
Schema version: 3

| Category  | Version | Description                         | State   |
| Versioned | 1       | baseline                            | Success |
| Versioned | 2       | add functional index lower category | Success |
| Versioned | 3       | seed products                       | Success |
```

---

## Validate Migrations

```bash
./mvnw flyway:validate
```

### Expected

```text
Successfully validated 3 migrations.
```

---

## Manually Run Migrations (outside app boot)

```bash
./mvnw flyway:migrate
```

Applies any pending migrations directly, without starting the Spring context.

---

# 🗄️ Database Reset

## Fresh Database Test

```bash
psql -U postgres -c "DROP DATABASE cartwise_dev;"
psql -U postgres -c "CREATE DATABASE cartwise_dev OWNER cartwise;"
```

Then boot the app and confirm Flyway runs V1 → V2 → V3 against a completely empty schema.

---

## Connect via psql

```bash
psql -U cartwise -d cartwise_dev -h localhost
```

---

## Inspect the Products Table

```sql
\d products
```

### Expected

```text
13 columns
"idx_products_lower_category" btree (lower(category::text))
```

---

## Verify Seed Count

```sql
SELECT COUNT(*) FROM products;
```

### Expected

```text
count
-------
   50
```

---

# 📊 Index Usage Verification

## Load Synthetic Data

```sql
-- Insert 50,000 synthetic rows across 50 categories
-- (generated via script, not hand-written)
ANALYZE products;
```

---

## Prove the Index Is Used

```sql
EXPLAIN ANALYZE
SELECT * FROM products
WHERE lower(category) = 'smartphone'
ORDER BY price;
```

### Expected

```text
Bitmap Index Scan on idx_products_lower_category
Execution Time: 2.270 ms
```

---

## Prove the Index Matters (force it off)

```sql
SET enable_bitmapscan = off;
SET enable_indexscan = off;

EXPLAIN ANALYZE
SELECT * FROM products
WHERE lower(category) = 'smartphone'
ORDER BY price;
```

### Expected

```text
Seq Scan on products
Execution Time: 18.104 ms
```

~8× slower without the index.

---

## Clean Up Synthetic Data

```sql
DELETE FROM products WHERE id > 50;
```

Restores the table to the 50 canonical seed rows.

---

# 🔬 Schema Diff Verification

## Dump Flyway-Built Schema

```bash
pg_dump --schema-only -U cartwise -d cartwise_dev > flyway_schema.sql
```

---

## Dump Hibernate-Built Schema (test context)

```bash
pg_dump --schema-only -U cartwise -d cartwise_test > hibernate_schema.sql
```

---

## Diff Them

```bash
diff flyway_schema.sql hibernate_schema.sql
```

### Expected

```text
Only difference: idx_products_lower_category
(the functional index Hibernate cannot generate)
```

---

# 🌱 Seed Verification

## Confirm Dev Users Loaded

```sql
SELECT email, role FROM users;
```

### Expected

```text
email                | role
demo@cartwise.dev    | USER
admin@example.com    | ADMIN
```

---

# 🧪 Test Suite

## Run Full Test Suite

```bash
./mvnw test
```

### Expected

```text
Tests run: 313, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

`Skipped: 0` confirms Testcontainers repository tests genuinely ran — Docker was available.

---

## Run Only Unit Tests (No Docker)

```bash
./mvnw test -DexcludedGroups=integration
```

### Expected

```text
Tests run: 266, Failures: 0, Errors: 0, Skipped: 0
```

---

# 🧯 Troubleshooting

## App Fails to Start with "Schema validation: missing table"

Check whether Flyway actually ran before Hibernate:

```text
Look for Flyway log lines (DbMigrate, DbValidate) in the boot output.
Zero Flyway lines + validation failure → check
spring.jpa.defer-datasource-initialization is false.
```

---

## "Unknown configuration property: flyway.plugin.version"

Fix the Maven property name:

```xml
<!-- Wrong -->
<flyway.plugin.version>12.4.0</flyway.plugin.version>

<!-- Right -->
<flyway-plugin.version>12.4.0</flyway-plugin.version>
```

---

## Plugin Can't Connect

Confirm the plugin's own JDBC block is present — it does not read `application-dev.yml`:

```xml
<configuration>
    <url>jdbc:postgresql://localhost:5432/cartwise_dev</url>
    <user>cartwise</user>
    <password>cartwise</password>
</configuration>
```

---

# 🌿 Git Commands

## Check Status

```bash
git status
```

---

## Stage Changes

```bash
git add -A
```

---

## Commit

```bash
git commit -m "feat: implement Chapter 22 schema migrations - Flyway with V1 baseline, V2 functional index, V3 seed data (50 products)"
```

---

## Push

```bash
git push origin main
```

---

## Verify History

```bash
git log --oneline -5
```

---

# 📄 Documentation Commands

## Create Chapter Folder

```bash
mkdir -p docs/CH22_Schema_Migrations_and_Data_Layer_Hardening
```

---

## Commit Documentation

```bash
git add docs/CH22_Schema_Migrations_and_Data_Layer_Hardening
git commit -m "docs: add Chapter 22 schema migrations documentation"
git push origin main
```

---

# 📌 Command Summary

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
./mvnw flyway:info
./mvnw flyway:validate
./mvnw test
git add -A
git commit -m "feat: implement Chapter 22 schema migrations - Flyway with V1 baseline, V2 functional index, V3 seed data (50 products)"
git push origin main
```
