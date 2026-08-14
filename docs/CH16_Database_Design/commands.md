# 💻 CH16 — Commands

> **Project:** CartWise  
> **Chapter:** Database Design

This file contains the commands used to set up PostgreSQL, verify the database connection, inspect the schema, and seed sample data.

---

# 🐘 PostgreSQL Setup

## Install PostgreSQL (One-Time)

### macOS (Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows

Download and install from https://www.postgresql.org/download/windows/

---

## Verify PostgreSQL Is Running

```bash
psql --version
```

### Expected

```text
psql (PostgreSQL) 15.x
```

---

## Create the Development Database

```bash
createdb cartwise_dev
```

Or via psql:

```bash
psql -U postgres
```

Then in the psql prompt:

```sql
CREATE DATABASE cartwise_dev;
\q
```

---

## Verify the Database Exists

```bash
psql -U postgres -d postgres -c "SELECT datname FROM pg_database WHERE datname='cartwise_dev';"
```

### Expected

```text
 datname
---------
 cartwise_dev
(1 row)
```

---

# 🔧 Backend Database Configuration

## Update application-dev.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/cartwise_dev
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
    show-sql: true
```

Confirm these settings are in `backend/src/main/resources/application-dev.yml` before starting the backend.

---

## Verify pom.xml Has PostgreSQL Driver

```bash
grep -A2 "postgresql" backend/pom.xml
```

### Expected

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

If missing, add it:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
    <scope>runtime</scope>
</dependency>
```

---

# 🚀 Running the Backend with Database

## Start the Backend

```bash
cd backend
mvn spring-boot:run
```

### Expected Log Output

Watch for these lines indicating successful connection and schema creation:

```text
...
org.hibernate.engine.transaction.internal.TransactionImpl : HHH000393: Could not obtain connection to query metadata
(This warning is normal on first run if the database doesn't exist yet)

Hibernate: drop table if exists comparison
Hibernate: drop table if exists products
Hibernate: drop table if exists users
Hibernate: drop table if exists wishlist

Hibernate: create table comparison (...)
Hibernate: create table products (...)
Hibernate: create table users (...)
Hibernate: create table wishlist (...)

INSERT statements from data.sql executing...

Tomcat started on port(s): 8080 (http)
```

The backend is ready when you see:

```text
Started CartWiseApplication in X.XXs
```

---

# 🔍 Inspecting the PostgreSQL Schema

## Connect to the Development Database

```bash
psql -U postgres -d cartwise_dev
```

You should see the prompt:

```text
cartwise_dev=#
```

---

## List All Tables

```sql
\dt
```

### Expected

```text
        List of relations
 Schema | Name | Type  | Owner
--------+------+-------+-------
 public | comparison | table | postgres
 public | products   | table | postgres
 public | users      | table | postgres
 public | wishlist   | table | postgres
(4 rows)
```

---

## Describe a Table (View Schema)

```sql
\d products
```

### Expected

```text
               Table "public.products"
     Column      |          Type          | Collation | Nullable | Default
-----------------+------------------------+-----------+----------+----------
 id              | bigint                 |           | not null | nextval('products_id_seq'::regclass)
 slug            | character varying(255) |           | not null |
 name            | character varying(255) |           | not null |
 brand           | character varying(255) |           | not null |
 category        | character varying(255) |           | not null |
 price           | integer                |           | not null |
 original_price  | integer                |           | not null |
 rating          | double precision       |           | not null |
 review_count    | integer                |           | not null |
 in_stock        | boolean                |           | not null |
 image_url       | character varying(255) |           | not null |
 created_at      | timestamp without time zone |       | not null |
 updated_at      | timestamp without time zone |       | not null |
Indexes:
    "products_pkey" PRIMARY KEY, btree (id)
    "uk_products_slug" UNIQUE, btree (slug)
```

---

## View Indexes

```sql
\d products
```

The `Indexes` section shows the UNIQUE constraint on slug:

```text
"uk_products_slug" UNIQUE, btree (slug)
```

---

## View Sample Data

```sql
SELECT * FROM products;
```

### Expected

```text
 id |      slug       |           name            | brand  |  category   | price  | original_price | rating | review_count | in_stock | image_url | created_at | updated_at
----+-----------------+---------------------------+--------+-------------+--------+----------------+--------+--------------+----------+-----------+------------+------------
  1 | iphone-16-pro   | iPhone 16 Pro             | Apple  | Smartphones | 129999 | 139999         |    4.8 |        12500 | t        | https://via.placeholder.com/300x300?text=iPhone+16+Pro | 2025-08-10 14:32:18 | 2025-08-10 14:32:18
  2 | galaxy-s25-ultra| Galaxy S25 Ultra          | Samsung| Smartphones | 124999 | 134999         |    4.7 |         8300 | t        | https://via.placeholder.com/300x300?text=Galaxy+S25+Ultra | 2025-08-10 14:32:18 | 2025-08-10 14:32:18
  3 | pixel-9-pro     | Pixel 9 Pro               | Google | Smartphones | 119999 | 129999         |    4.9 |         5200 | t        | https://via.placeholder.com/300x300?text=Pixel+9+Pro | 2025-08-10 14:32:18 | 2025-08-10 14:32:18
(3 rows)
```

---

## Count Rows in Each Table

```sql
SELECT 'products' as table_name, COUNT(*) as row_count FROM products
UNION ALL
SELECT 'wishlist', COUNT(*) FROM wishlist
UNION ALL
SELECT 'comparison', COUNT(*) FROM comparison
UNION ALL
SELECT 'users', COUNT(*) FROM users;
```

### Expected (initially)

```text
 table_name | row_count
------------+-----------
 comparison |         0
 products   |         3
 users      |         0
 wishlist   |         0
(4 rows)
```

---

## Exit psql

```sql
\q
```

---

# 🧪 Verify Database Connection from Backend

## Test the Health Endpoint (No Database Dependency)

```bash
curl http://localhost:8080/api/health
```

### Expected

```json
{"status":"UP","timestamp":"2025-08-10T14:32:18.547Z","message":"CartWise backend is running"}
```

Status code: `200 OK`.

---

## Create a Temporary Test Endpoint (Optional)

Add this to `backend/src/main/java/com/cartwise/controller/TestController.java` to verify database queries work:

```java
@RestController
@RequestMapping("/api/test")
public class TestController {
    private final ProductRepository productRepository;

    public TestController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}
```

Then test it:

```bash
curl http://localhost:8080/api/test/products
```

### Expected

```json
[
  {"id":1,"slug":"iphone-16-pro","name":"iPhone 16 Pro",...},
  {"id":2,"slug":"galaxy-s25-ultra","name":"Galaxy S25 Ultra",...},
  {"id":3,"slug":"pixel-9-pro","name":"Pixel 9 Pro",...}
]
```

**Delete this test endpoint before finishing** — it is for verification only.

---

# 🔄 Reseeding the Database

If you want to reset the database to its initial state during development:

## Method 1: Restart the Backend (Simplest)

```bash
# Stop the backend with Ctrl+C
# Start it again:
mvn spring-boot:run
```

`ddl-auto: create-drop` will drop and recreate tables, and `data.sql` will reseed the data.

---

## Method 2: Manual SQL Reset

```bash
psql -U postgres -d cartwise_dev
```

Then:

```sql
DROP TABLE IF EXISTS comparison;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
\q
```

Then restart the backend (or manually run the CREATE TABLE statements).

---

# 🗑️ Cleanup Commands

## Delete the Development Database

```bash
dropdb cartwise_dev
```

Or via psql:

```bash
psql -U postgres
DROP DATABASE cartwise_dev;
\q
```

---

## Stop PostgreSQL

### macOS

```bash
brew services stop postgresql@15
```

### Linux

```bash
sudo systemctl stop postgresql
```

### Windows

Use Services (Ctrl+R → services.msc) and stop PostgreSQL.

---

# 🔍 Debugging Commands

## Check Database Connection String

The backend logs will show:

```text
org.hibernate.engine.transaction.internal.TransactionImpl : HHH000393: Could not obtain connection to query metadata
```

If this appears multiple times, the connection string is wrong or PostgreSQL is not running.

Verify:

```bash
psql -U postgres -d cartwise_dev -c "SELECT 1;"
```

### Expected

```text
 ?column?
----------
        1
(1 row)
```

---

## View Backend Logs for SQL Statements

If `spring.jpa.show-sql: true` is set in `application-dev.yml`, the backend will log all SQL:

```text
Hibernate: select p1_0.id,p1_0.brand,p1_0.category,p1_0.created_at,... from products p1_0
Hibernate: insert into products (brand,category,created_at,...) values (?,?,?,...)
```

This is useful for debugging queries but noisy — only enable during development.

---

## Check for Constraint Violations

If you manually insert data and get a constraint error:

```bash
psql -U postgres -d cartwise_dev -c "INSERT INTO products (slug, name, brand, ...) VALUES ('iphone-16-pro', ...);"
```

### Expected Error (Duplicate Slug)

```text
ERROR: duplicate key value violates unique constraint "uk_products_slug"
```

This is correct — the database is preventing duplicates.

---

# 📌 Verification Checklist

Run through this sequence to confirm Chapter 16 is complete:

## 1. PostgreSQL Is Running

```bash
psql --version
psql -U postgres -d cartwise_dev -c "SELECT COUNT(*) FROM products;"
```

**Verify:**
- psql command works
- Query returns 3 (three sample products)

## 2. Backend Connects Successfully

```bash
cd backend
mvn spring-boot:run
```

**Verify:**
- No connection errors in logs
- Sees "Hibernate: drop table...", "Hibernate: create table..."
- Backend starts on port 8080
- No exceptions related to database

## 3. Schema Is Correct

```bash
psql -U postgres -d cartwise_dev
\dt
\d products
\q
```

**Verify:**
- All four tables exist (products, wishlist, comparison, users)
- products table has columns: id, slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at
- slug has a UNIQUE constraint

## 4. Sample Data Is Seeded

```bash
psql -U postgres -d cartwise_dev -c "SELECT COUNT(*) FROM products;"
```

**Verify:**
- Output: 3

## 5. Health Endpoint Works (No Regression)

```bash
curl http://localhost:8080/api/health
```

**Verify:**
- Status code 200
- JSON response: `{"status":"UP",...}`

## 6. Repositories Can Query Data

If you added the temporary test endpoint:

```bash
curl http://localhost:8080/api/test/products
```

**Verify:**
- JSON array of 3 products
- Each product has all fields

## 7. No Errors in Logs

While the backend is running, scan the logs:

```text
✓ No "ERROR" messages
✓ No "SQLException"
✓ No "constraint violations"
✓ No "column not found"
```

---

# 📋 Command Summary

```bash
# PostgreSQL setup (one-time)
createdb cartwise_dev

# Backend development
cd backend
mvn spring-boot:run

# Verify schema
psql -U postgres -d cartwise_dev
\dt
SELECT * FROM products;
\q

# Test endpoints
curl http://localhost:8080/api/health
curl http://localhost:8080/api/test/products  # (temporary, delete after verification)

# Reseed database
# (Stop and restart backend)

# Cleanup
dropdb cartwise_dev
```

---

# 🎯 Next Steps

After Chapter 16:

- Chapter 17 adds REST endpoints: GET /api/products, POST /api/wishlist, etc.
- Chapter 18 adds authentication: User entity is completed, JWT is wired
- Chapters 19+ add full API, business logic, and production features

The database schema is ready for all of it.
