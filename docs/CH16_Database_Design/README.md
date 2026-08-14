# 🗄️ CH16 — Database Design

> **Project:** CartWise  
> **Chapter:** Database Design

---

# 👋 Welcome

Chapter 15 proved the backend skeleton works. The `/api/health` endpoint talked to the browser, CORS was configured, and layering was in place.

But it did not touch a database.

A backend without a database is still an island — the data lives nowhere, changes are lost when the server restarts, and every user sees the same hardcoded health message. The moment you add a database, the backend becomes real: data persists, multiple users can have separate wishlists, and prices can change once and be seen everywhere.

Chapter 16 is where that happens. It models the data CartWise needs, creates the schema in PostgreSQL, seeds sample data, and wires the database to the backend so that when Chapter 17 adds REST endpoints, there is somewhere for the data to live.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- Why relational databases are the standard for web applications.
- How JPA and Hibernate map Java objects to database tables.
- What an entity is, how it is defined, and how it differs from a DTO.
- The difference between auto-generated IDs and natural keys (slugs).
- What a foreign key is and why it matters.
- How repositories work and what Spring Data JPA generates for you.
- Why `ddl-auto: create-drop` is right for development but wrong for production.
- How to seed sample data so the database is never empty.
- What constraints (unique, not-null, foreign key) prevent bad data from entering.
- Why the User entity is a stub — and what Chapter 18 will add to it.
- How to inspect the actual PostgreSQL schema and confirm it matches the code.

---

# 🐘 PostgreSQL — CartWise's Database

CartWise uses PostgreSQL, not MySQL, SQLite, or any other relational database.

```text
PostgreSQL          MySQL             SQLite

Enterprise-grade    Widely supported  File-based, no server
Full ACID           Good for web      Good for development
JSON support        Faster for simple Good for mobile apps
Extensible          schemas           Limited concurrency
```

CartWise chose PostgreSQL for one reason: **it is the production database for CartWise's deployment model** (Chapter 23). Using the same database in development that will be used in production prevents the "works locally but breaks in production" surprises.

---

# 🔗 Database Connection

The backend connects to PostgreSQL via JDBC (Java Database Connectivity), managed by Hibernate and Spring Data JPA.

`application-dev.yml`:

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
```

Breaking down the connection string:

```text
jdbc:postgresql://localhost:5432/cartwise_dev
       ↑           ↑        ↑    ↑
    driver    hostname    port   database name
```

`localhost:5432` is PostgreSQL's default address when running on your local machine. `cartwise_dev` is the database name — a separate namespace for CartWise's development data.

`ddl-auto: create-drop` tells Hibernate: "on startup, drop all tables and recreate them from the @Entity classes." This is correct for development (always starting from a clean schema) but dangerous for production (you would lose all data on restart).

---

# 🏛️ Entities — The Domain Model

An Entity is a Java class that maps one-to-one to a database table. Each field in the entity becomes a column in the table.

```text
@Entity
public class Product { ... }
       ↓
CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    slug VARCHAR UNIQUE,
    ...
);
```

CartWise has exactly three entities in Chapter 16:

```text
Product      the catalogue, what users save references to
Wishlist     a saved item, belongs to a user
Comparison   an item in a compare selection, belongs to a user
```

---

# 📦 Product Entity

The Product entity represents a product in CartWise's catalogue.

```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private Integer originalPrice;

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false)
    private Integer reviewCount;

    @Column(nullable = false)
    private Boolean inStock;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructor, getters, setters (generated by IDE or Lombok)
}
```

Every field corresponds to a database column:

```text
@Id                             → PRIMARY KEY, auto-incremented by the database
@Column(unique = true)          → UNIQUE constraint, no two products have the same slug
@Column(nullable = false)       → NOT NULL constraint, every product must have this field
@Column(updatable = false)      → createdAt never changes after insert
price, originalPrice            → integers in rupees (₹1,29,999 = 129999)
rating                          → decimal (4.8, 4.9, etc.)
reviewCount                     → how many reviews exist for this product
inStock                         → boolean, true/false
createdAt, updatedAt            → audit timestamps
```

The slug is the natural key — the identity users see in the URL (`/product/iphone-16-pro`). The `id` is the surrogate key — the primary key the database uses internally.

---

# ❤️ Wishlist Entity

The Wishlist entity represents one saved product in a user's wishlist.

```java
@Entity
@Table(name = "wishlist")
public class Wishlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Getters, setters
}
```

The table is simple:

```text
id          primary key
userId      foreign key → users.id (which user saved this?)
productId   foreign key → products.id (which product was saved?)
createdAt   timestamp (used for recency sorting)
```

**No composite unique constraint yet.** Chapter 18, when User is modeled properly, will add `UNIQUE (user_id, product_id)` to prevent the same user saving the same product twice.

**No explicit `@ManyToOne` relationship yet.** The Chapter 16 stub uses plain `Long` foreign keys. Chapter 18 will add proper JPA relationships (`@ManyToOne`, `@OneToMany`) when User is a real entity with eager/lazy loading decisions to make.

---

# ⚖️ Comparison Entity

The Comparison entity represents one product in a user's active comparison.

```java
@Entity
@Table(name = "comparison")
public class Comparison {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Integer position;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Getters, setters
}
```

The `position` field (0–3) enforces the four-item cap:

```text
User A's comparison:
  position 0: iPhone 16 Pro
  position 1: Galaxy S25 Ultra
  position 2: Pixel 9 Pro
  position 3: OnePlus 13
  position 4: (blocked by the cap)
```

Like Wishlist, Comparison uses plain `Long` for foreign keys in Chapter 16, waiting for Chapter 18 to add full JPA relationships.

---

# 👤 User Entity — Stub

The User entity is deliberately minimal in Chapter 16:

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // No password, no roles, no auth fields — Chapter 18
}
```

User is a stub because Chapter 18 is where authentication lives. Adding password hashing, JWT, roles, and OAuth here would mix two concerns — database design and authentication — when they deserve separate chapters.

A comment in the code marks where Chapter 18 will expand:

```java
// Chapter 18: add password, passwordSalt, roles, emailVerified, etc.
```

---

# 🗂️ Repository Interfaces

A Repository is the data-access layer. Spring Data JPA generates the implementation from an interface.

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
}
```

`JpaRepository<Product, Long>` provides basic CRUD methods automatically:

```text
save(product)           → INSERT or UPDATE
findById(id)            → SELECT WHERE id = ?
findAll()               → SELECT *
deleteById(id)          → DELETE WHERE id = ?
```

Custom queries are added as interface methods. Spring Data JPA recognizes method names and generates SQL:

```java
Optional<Product> findBySlug(String slug);
// generates: SELECT * FROM products WHERE slug = ?
```

CartWise has three repositories:

**ProductRepository:**

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
    List<Product> findByCategory(String category);
}
```

**WishlistRepository:**

```java
@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserIdAndProductId(Long userId, Long productId);
}
```

**ComparisonRepository:**

```java
@Repository
public interface ComparisonRepository extends JpaRepository<Comparison, Long> {
    List<Comparison> findByUserIdOrderByPosition(Long userId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserIdAndProductId(Long userId, Long productId);
}
```

Notice the method names: `findByUserIdOrderByCreatedAtDesc` is self-documenting SQL:

```text
find by UserId        → WHERE user_id = ?
Order by CreatedAt    → ORDER BY created_at
Desc                  → DESC
```

Spring Data JPA reads the method name, generates the SQL, and executes it. No XML, no query strings, no manual JDBC.

---

# 🌱 Sample Data — Seeding the Database

On startup, Hibernate creates the schema, then `data.sql` inserts sample products:

`src/main/resources/data.sql`:

```sql
INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES 
('iphone-16-pro', 'iPhone 16 Pro', 'Apple', 'Smartphones', 129999, 139999, 4.8, 12500, true, 'https://via.placeholder.com/300x300?text=iPhone+16+Pro', NOW(), NOW()),
('galaxy-s25-ultra', 'Galaxy S25 Ultra', 'Samsung', 'Smartphones', 124999, 134999, 4.7, 8300, true, 'https://via.placeholder.com/300x300?text=Galaxy+S25+Ultra', NOW(), NOW()),
('pixel-9-pro', 'Pixel 9 Pro', 'Google', 'Smartphones', 119999, 129999, 4.9, 5200, true, 'https://via.placeholder.com/300x300?text=Pixel+9+Pro', NOW(), NOW());
```

Spring Boot runs `data.sql` automatically after Hibernate creates the tables. The database is never empty — it starts with 3 products.

Prices are in rupees (₹): `129999` = ₹1,29,999.

---

# 🔐 Constraints and Data Integrity

Constraints are rules the database enforces to prevent bad data:

```text
PRIMARY KEY (id)                    → every row must have a unique id
UNIQUE (slug)                       → every product has a unique, unchanging slug
NOT NULL (price)                    → every product must have a price
FOREIGN KEY (productId) → products  → productId must refer to an existing product
CHECK (position >= 0 AND position <= 3)  → comparison position is 0–3
```

These constraints are defined in the @Entity annotations:

```java
@Column(nullable = false, unique = true)
private String slug;

@Column(nullable = false)
private Integer price;
```

When Chapter 17 adds REST endpoints that create wishlists or comparisons, the database will reject invalid data — a nonexistent productId, a duplicate wishlist entry, a position outside 0–3. The database is the final gate.

---

# 🔄 Relationships — Chapter 16 vs. Chapter 18

In Chapter 16, Wishlist and Comparison use plain `Long` for foreign keys:

```java
@Column(nullable = false)
private Long userId;
```

This works but is incomplete. In Chapter 18, when User is a real entity, these become JPA relationships:

```java
@ManyToOne
@JoinColumn(name = "user_id")
private User user;
```

This gives you:

```text
wishlist.getUser()           → load the associated User
user.getWishlists()          → load all this user's wishlist items
```

But that requires decisions about lazy loading, cascading deletes, and circular references — all Chapter 18. For now, plain `Long` keeps it simple.

---

# 🗂️ Database Schema — Actual Structure

After the backend boots, the PostgreSQL schema looks like this:

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    original_price INTEGER NOT NULL,
    rating DOUBLE PRECISION NOT NULL,
    review_count INTEGER NOT NULL,
    in_stock BOOLEAN NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE wishlist (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE comparison (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE
);
```

BIGSERIAL auto-increments on insert. VARCHAR(255) is the Hibernate default for strings. TIMESTAMP stores date and time.

---

# 🔧 JPA and Hibernate — The Bridge Between Java and SQL

JPA (Java Persistence API) is a standard for mapping Java objects to database tables. Hibernate is the implementation CartWise uses.

```text
Java                            Database
@Entity                         → CREATE TABLE
@Id                             → PRIMARY KEY
@Column(unique = true)          → UNIQUE constraint
@ManyToOne                      → FOREIGN KEY
repository.save(product)        → INSERT or UPDATE
repository.findById(1)          → SELECT WHERE id = 1
repository.findBySlug("...")    → SELECT WHERE slug = ?
```

You write Java classes annotated with `@Entity`, and Hibernate generates the SQL and manages the connection. You write repository interfaces with method names, and Spring Data JPA generates the implementation.

This is what allows Chapter 17 to add REST endpoints without touching SQL — the repositories already know how to fetch the data.

---

# 📊 Development vs. Production Configuration

**Development (`application-dev.yml`):**

```yaml
spring.jpa.hibernate.ddl-auto: create-drop
spring.datasource.url: jdbc:postgresql://localhost:5432/cartwise_dev
spring.jpa.show-sql: true
```

Schema is dropped and recreated on every restart. Data is not precious; you start fresh each time. `show-sql: true` logs all SQL so you can see what Hibernate is doing.

**Production (`application-prod.yml`):**

```yaml
spring.jpa.hibernate.ddl-auto: validate
spring.datasource.url: ${DB_URL}
spring.jpa.show-sql: false
```

Schema must already exist (deployed via a migration tool). Hibernate validates the schema but doesn't change it — prevents accidental data loss. `show-sql: false` reduces logging overhead.

The difference is critical: `create-drop` is for development; `validate` is for production. Using `create-drop` in production would erase all data on restart.

---

# 🌍 Why `id` and `slug` Both Exist

The `id` is the database's internal identity — how Hibernate refers to rows:

```java
repository.findById(42)  // SELECT WHERE id = 42
```

The `slug` is the user-facing identity — how URLs refer to products:

```text
/product/iphone-16-pro
       ↑ this is the slug
```

Separating them allows the business to change marketing names, URLs, or even product titles without breaking database relationships. The `id` never changes; the `slug` might. (In CartWise's model, slugs are permanent, but the separation is still a good practice.)

---

# 🚀 What Happens on Startup

When you run `mvn spring-boot:run`, this sequence happens:

```text
1. Spring Boot starts
2. Reads application-dev.yml, sees ddl-auto: create-drop
3. Hibernate generates DROP TABLE statements for all tables (if they exist)
4. Hibernate generates CREATE TABLE statements for all @Entity classes
5. Spring runs data.sql, inserting sample products
6. Backend is ready, /api/health works, repositories can fetch data
7. On next startup, tables are dropped and recreated from scratch
```

The logs show this:

```text
Hibernate: drop table if exists comparison
Hibernate: drop table if exists products
Hibernate: drop table if exists users
Hibernate: drop table if exists wishlist
Hibernate: create table comparison (id bigserial not null, ...)
Hibernate: create table products (id bigserial not null, ...)
Hibernate: create table users (id bigserial not null, ...)
Hibernate: create table wishlist (id bigserial not null, ...)
```

Followed by the INSERT statements from `data.sql`.

---

# 🔍 Inspecting the Schema

To see the actual PostgreSQL schema:

```bash
psql -U postgres -d cartwise_dev
```

Then:

```sql
\dt                    -- list all tables
\d products            -- describe the products table
SELECT * FROM products;  -- see the sample data
```

This is how you verify the schema matches the @Entity definitions — Hibernate generated what you expected, and data is where you put it.

---

# 📭 What Is Deliberately Not Here

Named explicitly:

**No service layer logic.** Repositories only fetch and store; services (Chapter 17) contain business logic.

**No REST endpoints.** No `@PostMapping` or `@GetMapping` to create or retrieve products. That's Chapter 17.

**No authentication.** User table exists but is a stub. Chapter 18 adds password, roles, JWT.

**No complex queries.** Only basic repository methods (`findBySlug`, `findByUserIdOrderByCreatedAtDesc`). Advanced queries (pagination, complex filters) are Chapter 17+.

**No migration tool (Flyway, Liquibase).** The schema is auto-created by Hibernate in dev. Production migrations are Chapter 23.

**No connection pooling tuning.** Hibernate's defaults are fine for now.

**No composite unique constraints yet.** Chapter 18 will add `UNIQUE (user_id, product_id)` to Wishlist and Comparison after User is a real entity.

---

# 📌 Key Takeaways

After Chapter 16:

- PostgreSQL is connected and running; the backend can store and retrieve data.
- Three entities (Product, Wishlist, Comparison) define the schema; Hibernate generates the tables.
- User is a stub, intentionally minimal — Chapter 18 will expand it.
- Three repositories provide data access; Spring Data JPA generates the implementations.
- Sample data seeds the database on startup so it is never empty.
- `ddl-auto: create-drop` in dev (fresh schema each time), `validate` in prod (schema must exist).
- Constraints (unique, not-null, foreign key) are defined in annotations and enforced by the database.
- Slugs are natural keys (user-facing identity); IDs are surrogate keys (database identity).
- The schema is introspectable — you can query PostgreSQL directly to verify Hibernate generated what you expected.

---

# 🎯 Chapter Outcome

CartWise now has persistent storage:

```text
Before CH16                     After CH16

Backend ↔ Memory                Backend ↔ PostgreSQL Database
(data lost on restart)          (data survives restarts)
(no multi-user support)         (multiple users, separate data)
```

Three entities live in PostgreSQL, ready for REST endpoints (Chapter 17), authentication (Chapter 18), and real business logic.

# 🛠️ Chapter 17 — REST APIs
