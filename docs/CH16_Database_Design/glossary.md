# 📖 CH16 — Glossary

> **Project:** CartWise  
> **Chapter:** Database Design

This glossary explains the important terms and concepts introduced while designing CartWise's database schema.

---

# 🗄️ Database

A Database is a persistent store for structured data, typically organized into tables and rows.

CartWise uses PostgreSQL, a relational database where data outlives the backend process — it survives restarts and scales to multiple users.

---

# 🐘 PostgreSQL

PostgreSQL is a mature, open-source relational database known for reliability, standards compliance, and advanced features.

CartWise chose PostgreSQL because it is the target production database (Chapter 23), so using it in development prevents "works locally but breaks in production" surprises.

---

# 🔗 JDBC (Java Database Connectivity)

JDBC is a Java standard for connecting to databases. The backend uses the PostgreSQL JDBC driver to send SQL queries and retrieve results.

---

# 🏛️ Entity

An Entity is a Java class representing a real-world object that needs to be persisted — a Product, a User, a Wishlist item.

Each @Entity maps to a database table; each field maps to a column.

---

# 🗃️ Table

A Table is a database structure with rows and columns, like a spreadsheet.

```text
products table
├── id (column)
├── slug (column)
├── name (column)
└── price (column)
```

Each row is one product.

---

# 📝 Row

A Row is one record in a table — one product, one user, one wishlist entry.

```text
products table
└── Row 1: id=1, slug="iphone-16-pro", name="iPhone 16 Pro", price=129999
   Row 2: id=2, slug="galaxy-s25-ultra", name="Galaxy S25 Ultra", price=124999
```

---

# 📊 Column

A Column is a named attribute in a table, with a data type.

```text
products.price is a Column
  Type: INTEGER
  Value for Row 1: 129999
  Value for Row 2: 124999
```

---

# 🔑 Primary Key

A Primary Key is a column (or set of columns) that uniquely identifies each row.

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

Every row must have a unique id. The database enforces this; you cannot insert two rows with the same id.

---

# 🆔 Surrogate Key

A Surrogate Key is an artificially-generated primary key with no business meaning.

CartWise's `id` column is a surrogate key — the database auto-generates it, and users never see it. It exists purely for relational integrity.

---

# 🔍 Natural Key

A Natural Key is a column (or set of columns) that uniquely identifies a row through business meaning, not artificial generation.

CartWise's `slug` is a natural key — it has meaning to users and URLs (`/product/iphone-16-pro`).

---

# 🔗 Foreign Key

A Foreign Key is a column that references a primary key in another table, creating a relationship.

```java
@Column(nullable = false)
private Long productId;
```

This `productId` is a foreign key to `products.id`. It enforces that a wishlist item can only save a product that actually exists.

---

# 🔀 Relationship

A Relationship connects two tables via foreign keys.

```text
Wishlist → Product
  via foreign key: wishlist.product_id → products.id
  meaning: this wishlist item saved this product
```

---

# 💼 JPA (Java Persistence API)

JPA is a Java standard for mapping objects to databases. It is not a database; it is a standard that database tools implement.

Hibernate is CartWise's JPA implementation.

---

# 🍃 Hibernate

Hibernate is a framework that implements JPA, handling the mapping between Java objects (@Entity classes) and database tables.

You define @Entity classes; Hibernate generates the SQL and manages connections.

---

# 📦 @Entity

`@Entity` is a Java annotation marking a class as persistent — "this class maps to a database table."

```java
@Entity
@Table(name = "products")
public class Product { ... }
```

---

# @Id

`@Id` marks a field as the primary key of the entity.

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

---

# @Column

`@Column` defines properties of a database column.

```java
@Column(nullable = false, unique = true)
private String slug;
```

`nullable = false` → NOT NULL constraint, field required
`unique = true` → UNIQUE constraint, no duplicates

---

# @GeneratedValue

`@GeneratedValue` tells Hibernate to auto-generate the value (usually for the primary key).

```java
@GeneratedValue(strategy = GenerationType.IDENTITY)
```

`IDENTITY` means "let the database auto-increment it" (PostgreSQL's BIGSERIAL).

---

# @Table

`@Table` specifies the database table name for an entity.

```java
@Table(name = "products")
```

Without it, Hibernate uses the class name lowercased (`product`). Explicitly naming keeps the schema readable.

---

# @Repository

`@Repository` marks an interface as a data-access component. Spring Data JPA implements it automatically.

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> { }
```

---

# JpaRepository

`JpaRepository` is a Spring Data JPA interface providing basic CRUD (Create, Read, Update, Delete) methods for an entity.

```text
save(entity)         → INSERT or UPDATE
findById(id)         → SELECT WHERE id = ?
findAll()            → SELECT *
deleteById(id)       → DELETE WHERE id = ?
```

Custom queries are added as interface methods with names like `findBySlug`.

---

# CRUD

CRUD stands for Create, Read, Update, Delete — the four basic database operations.

```text
Create → save()
Read   → findById(), findAll()
Update → save() with an existing id
Delete → deleteById()
```

---

# Query (Repository Method)

A Query Method in Spring Data JPA is a repository method whose name describes what SQL to generate.

```java
Optional<Product> findBySlug(String slug);
```

Spring Data JPA reads "findBy" + "Slug" and generates:

```sql
SELECT * FROM products WHERE slug = ?
```

---

# DDL (Data Definition Language)

DDL is SQL for defining schemas: CREATE TABLE, ALTER TABLE, DROP TABLE.

Hibernate generates DDL from @Entity classes and runs it on startup.

---

# DML (Data Manipulation Language)

DML is SQL for manipulating data: INSERT, UPDATE, DELETE, SELECT.

Repositories run DML to create, read, update, and delete rows.

---

# Schema

A Schema is the structure of a database — the tables, columns, constraints, and relationships.

Hibernate generates the schema from @Entity definitions.

---

# 🔄 ddl-auto

`ddl-auto` is a Hibernate setting that controls what happens to the schema on startup.

```text
create-drop   drop and recreate every time (dev only)
validate      check schema matches entities but don't change it (prod)
update        modify schema to match entities (risky, not recommended)
```

CartWise uses `create-drop` for dev (always fresh), `validate` for prod (schema is pre-deployed).

---

# 🌱 data.sql

`data.sql` is a file Spring Boot runs automatically after Hibernate creates the schema, used to seed sample data.

CartWise's `data.sql` inserts 3 sample products on startup.

---

# Constraint

A Constraint is a database rule enforcing data integrity.

```text
PRIMARY KEY (id)                unique, not-null identifier
UNIQUE (slug)                   no two rows have the same slug
NOT NULL (price)                every row must have a price
FOREIGN KEY (productId)         productId must exist in products.id
CHECK (position >= 0 AND position <= 3)  cap compare to 4 items
```

---

# NOT NULL Constraint

`NOT NULL` requires a column to always have a value; rows cannot be inserted without it.

```java
@Column(nullable = false)
private String name;
```

---

# UNIQUE Constraint

`UNIQUE` requires all rows to have different values for that column.

```java
@Column(unique = true)
private String slug;
```

Two products cannot have the same slug.

---

# 🔗 FOREIGN KEY Constraint

`FOREIGN KEY` requires a value to exist in another table's primary key, preventing orphaned references.

```java
@Column(nullable = false)
private Long productId;  // must exist in products.id
```

The database prevents inserting a wishlist item for a nonexistent product.

---

# Referential Integrity

Referential Integrity is the guarantee that foreign keys always point to existing rows.

The database enforces this; you cannot have a wishlist item with a nonexistent productId.

---

# 🗑️ Cascade

Cascade is an option to automatically propagate deletions.

If `cascade = REMOVE` is set on a relationship, deleting the parent also deletes children — e.g., deleting a User also deletes all their Wishlist items.

Chapter 16 doesn't use cascades; Chapter 18 will revisit this decision.

---

# @ManyToOne

`@ManyToOne` marks a relationship where many rows in this table reference one row in another table.

```text
Many Wishlist items → One Product
Many Wishlist items → One User
```

Chapter 16 uses plain `Long` for foreign keys; Chapter 18 will add `@ManyToOne` annotations.

---

# @OneToMany

`@OneToMany` marks the inverse side of a `@ManyToOne` relationship.

```text
One User ← Many Wishlist items
One Product ← Many Wishlist items
```

Chapter 18 will add `@OneToMany` to User and Product after the `@ManyToOne` relationships are in place.

---

# Lazy Loading

Lazy Loading defers fetching related data until it is actually used.

```java
wishlist.getUser();  // triggers a database query here
```

Chapter 18 will configure lazy vs. eager loading on relationships.

---

# Eager Loading

Eager Loading fetches related data immediately when the parent row is loaded.

```java
// Query: SELECT * FROM wishlist JOIN users ON ...
// Returns Wishlist with User data already populated
```

Chapter 18 will decide when eager loading is worth the extra query cost.

---

# N+1 Query Problem

The N+1 problem occurs when loading N rows triggers N+1 queries: one to load N rows, then one query per row to load related data.

```text
Load 1000 wishlist items (1 query)
For each item, load its User (1000 more queries)
= 1001 queries instead of 1
```

Proper relationship configuration in Chapter 18 will address this.

---

# Connection Pool

A Connection Pool is a cache of database connections reused across requests, avoiding the overhead of creating a new connection for each query.

Hibernate manages connection pooling automatically; tuning is deferred to Chapter 23.

---

# Timestamp

A Timestamp is a date-and-time value, used for audit trails and recency sorting.

```java
@Column(nullable = false, updatable = false)
private LocalDateTime createdAt;
```

Created at insert, never changed. Used to sort Wishlist items by recency.

---

# Audit Columns

Audit Columns track when rows are created and updated.

CartWise uses `createdAt` (when inserted, never changes) and `updatedAt` (when last modified).

---

# Idempotence (Database Context)

An operation is idempotent if running it multiple times has the same effect as running it once.

`INSERT OR REPLACE` is idempotent (inserting the same row twice replaces it, once).
`INSERT` alone is not (inserting twice fails or creates duplicates).

---

# Index

An Index is a database structure that speeds up lookups on a column, at the cost of slower inserts and more storage.

`UNIQUE (slug)` creates an index automatically. `CREATE INDEX product_category_idx ON products(category)` creates an index explicitly for queries filtering by category.

Chapter 16 uses only the unique index on slug; performance tuning is Chapter 23+.

---

# Transaction

A Transaction is a group of database operations that succeed or fail together (atomicity).

```text
BEGIN
  INSERT into wishlist ...
  UPDATE users SET wishlist_count = ...
COMMIT   or ROLLBACK
```

If anything fails, the whole transaction rolls back. Chapter 17 will use transactions for correctness.

---

# ACID

ACID are the guarantees a database provides:

```text
Atomicity       transactions succeed or fail as a whole
Consistency     constraints are always satisfied
Isolation       concurrent transactions don't interfere
Durability      committed data survives crashes
```

PostgreSQL guarantees ACID; this is why databases are preferred over files.

---

# Slug (Database Context)

In the database, a slug is a natural key — a unique, human-readable identifier used in URLs.

```text
/product/iphone-16-pro
       ↑ this is the slug, stored in products.slug column
```

The database enforces `UNIQUE (slug)` so products cannot collide.
