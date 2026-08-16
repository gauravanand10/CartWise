# 📖 CH20 — Glossary

> **Project:** CartWise  
> **Chapter:** Product Discovery & Visual Design System

This glossary explains the terms introduced while building CartWise's discovery API and design token system.

---

# 🔍 Filtering

Filtering narrows a result set to rows matching a condition.

```text
/api/products?category=smartphone
→ only products where category = "smartphone"
```

Filtering happens in the database (`WHERE` clause), never in Java after fetching everything.

---

# 🔢 Sorting

Sorting arranges results by a field in a defined order.

```text
?sort=price-asc     cheapest first
?sort=price-desc    most expensive first
?sort=rating-desc   highest rated first
?sort=name-asc      alphabetical
```

Becomes an `ORDER BY` clause in SQL.

---

# 📄 Pagination

Pagination splits a large result set into pages.

```text
?page=0&size=20   rows 1–20
?page=1&size=20   rows 21–40
```

Becomes `OFFSET` and `FETCH FIRST` in SQL. Without it, a catalogue of 100,000 products would be sent in one response.

---

# 📦 Page Envelope

A page envelope is a response wrapper that carries the rows plus the metadata needed to build a pager.

```json
{
  "content": [ /* the rows */ ],
  "page": 0,
  "size": 20,
  "totalElements": 8,
  "totalPages": 1
}
```

A bare array can't tell the client how many pages exist, so it can't render "Page 2 of 5."

---

# 🔀 Offset Pagination

Offset pagination skips N rows and takes the next M.

```sql
ORDER BY price DESC, id
OFFSET 20 ROWS FETCH FIRST 20 ROWS ONLY
```

Simple and supports jumping to any page number. The cost: a second `COUNT` query for the total, and it degrades on very large offsets (the database still walks the skipped rows).

The alternative is cursor pagination ("give me rows after id 4821"), which is faster at scale but cannot render a page-number control. CartWise uses offset because the UI has numbered pages.

---

# ⚖️ Tie-Breaker

A tie-breaker is a secondary sort column that guarantees a total ordering.

```sql
ORDER BY price DESC, id      ← id is the tie-breaker
```

Without it, two products at the same price have **no defined order**. The database may return them differently on different queries — so across pages, a row can appear twice or disappear entirely.

Invisible until two rows collide, which is why it must be designed in rather than discovered.

---

# 🧩 JPA Specification

A Specification is a composable predicate object in Spring Data JPA.

```java
Specification.allOf(
    categoryEquals(category),   // returns null if category is absent
    priceAtLeast(minPrice),
    inStockIs(inStock)
)
```

Null specifications are skipped, so only the requested filters reach the SQL. No filters produces no `WHERE` clause at all.

---

# 🌳 Criteria API

The Criteria API is JPA's programmatic query builder — the machinery Specifications are built on.

```java
(root, query, cb) -> cb.equal(cb.lower(root.get("category")), value)
```

Type-checked at compile time, unlike a JPQL string.

---

# 🗂️ Combinatorial Explosion

The problem where N optional filters produce 2ᴺ possible query shapes.

```text
5 optional filters → 32 combinations
```

You cannot write 32 repository methods. Specifications solve this by composing rather than enumerating.

---

# 🔧 Query Parameter

A key-value pair in the URL after the `?`.

```text
/api/products?category=smartphone&sort=price-asc&page=1
             └─────────── query parameters ────────────┘
```

Used for optional, filter-like inputs. Contrast with a path variable, which identifies a specific resource.

---

# 🎚️ Clamping

Clamping constrains a value to a valid range instead of rejecting it.

```text
?size=5000  →  200 OK, size silently set to 100
```

CartWise's rule: **clamp when a request is immoderate, reject when it is incoherent.** Asking for 5000 items is greedy but meaningful. Asking for page −1 is meaningless.

---

# 🚫 Breaking Change

A change that invalidates the existing API contract, forcing clients to update.

Changing `GET /api/products` from a bare array to a page envelope is breaking: any client doing `response.map(...)` now crashes.

Handled by migrating every caller in the same commit — not by adding a legacy endpoint, which means two behaviours to keep in step forever.

---

# 🧬 Denormalised Column

A column holding data that could have lived in a separate table.

```java
@Column(nullable = false, length = 60)
private String category;   // a string, not a FK to a categories table
```

Simpler until the value needs attributes of its own (description, image, ordering) — then a table is correct.

---

# 📊 GROUP BY Aggregate

A SQL clause that collapses rows into groups and computes a value per group.

```sql
SELECT category, COUNT(*) FROM products GROUP BY category
```

CartWise's category endpoint is derived this way rather than from a categories table.

---

# 🔗 Derived Slug

A URL-safe identifier computed from another field rather than stored.

```java
lower(replace(name, ' ', '-'))
"Home Audio" → "home-audio"
```

Storing it would create a second copy that can disagree with the name.

---

# 📇 Index

A database structure that speeds up lookups on a column.

```sql
CREATE INDEX idx_products_price ON products (price);
```

Trades write speed and disk space for read speed. Not measurable at 8 rows — added before the table grows, not after.

---

# 🔍 Functional Index

An index on an *expression* rather than a bare column.

```sql
CREATE INDEX ON products (lower(category));
```

**Critical distinction:** an index on `category` does **not** serve a query filtering on `lower(category)`. The B-tree stores the raw values; the predicate asks about transformed ones.

JPA's `@Index` cannot declare a functional index — it needs a migration tool.

---

# 🗄️ Schema Migration Tool

A tool (Flyway, Liquibase) that applies versioned, ordered SQL scripts to evolve a database schema.

CartWise doesn't have one yet — it relies on Hibernate's `ddl-auto`, which cannot express functional indexes, data backfills, or safe production changes.

---

# 🎨 Design Token

A named value for a design decision, defined once and referenced everywhere.

```css
--color-accent-primary: #7A3BD1;
```

Components reference the token, never the hex. Changing the brand colour becomes a one-line edit instead of a find-and-replace.

---

# 🎭 @theme (Tailwind v4)

Tailwind v4's block for declaring design tokens. Values inside it generate utility classes automatically.

```css
@theme {
  --color-tile-mint: #C6F0DA;
}
```

Produces `bg-tile-mint`, `text-tile-mint`, etc.

Distinct from a plain `:root` block, which defines CSS variables that Tailwind knows nothing about — so no utilities are generated.

---

# 🖌️ Surface Colour

A colour used as a background for content to sit on.

Pastel in CartWise: low saturation, high lightness, so text placed on it stays readable.

---

# ✨ Accent Colour

A saturated colour used for small, high-attention elements — buttons, badges, active states.

The pastel/accent split is what makes "vibrant pastel" coherent: pastel surfaces carrying saturated accents. A single colour cannot be both.

---

# 🏷️ Semantic Colour

A colour whose meaning is fixed regardless of context.

```text
success  → in stock, cheaper, positive
danger   → out of stock, destructive
rating   → the star
```

Semantic colours must never be reused decoratively, or the signal is destroyed.

---

# 📐 WCAG Contrast Ratio

A number expressing the luminance difference between two colours, from 1:1 (identical) to 21:1 (black on white).

```text
4.5:1   minimum for normal body text (WCAG 1.4.3 AA)
3:1     minimum for large text and non-text graphics (WCAG 1.4.11)
```

Computed from relative luminance, not eyeballed. Two colours that *look* different can still fail.

---

# 💡 Relative Luminance

The perceived brightness of a colour, computed from its RGB channels with gamma correction and human-eye weighting (green counts far more than blue).

The input to every contrast ratio calculation.

---

# 🚦 WCAG 2.2.2 (Pause, Stop, Hide)

The accessibility criterion requiring that auto-moving content can be paused, stopped, or hidden by the user.

An auto-advancing carousel violates this: content shifts under someone mid-read, and screen-reader users lose their place.

CartWise's `BannerCarousel` (a `setTimeout`-driven auto-advance) was deleted and replaced with a user-controlled rail.

---

# 🎞️ prefers-reduced-motion

A CSS media feature exposing the OS-level "reduce motion" accessibility setting.

```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none; }
}
```

Respecting it is not optional — vestibular disorders make animation genuinely painful for some users.

---

# 🧲 Scroll Snap

A CSS mechanism that makes a scrollable container rest at defined positions.

```css
scroll-snap-type: x mandatory;
scroll-snap-align: start;
```

---

# 📍 snap-start vs. snap-center

The two snap alignments — and the source of Chapter 20's most instructive bug.

```text
snap-start    snap position = card.offsetLeft
              always within [0, maxScroll] → always reachable

snap-center   snap position = card.centre − rail.centre
              can compute to negative or beyond maxScroll → unreachable
```

With three cards visible, `snap-center` produced offsets of −419, −26, 367, 760 against a max scroll of 340. Not one was reachable, so the browser pinned the rail at 0 and every control silently did nothing.

`snap-start` is reachable by construction.

---

# 🔢 djb2 Hash

A small, fast string hash function.

Used to map a category slug to a tile colour deterministically:

```text
hash("smartphone") % 6 → tile index
```

**Why not array position:** the category list is alphabetical, so adding "Camera" would recolour every tile after it. Hashing a stable key means a category keeps its colour forever.

---

# 🔗 URL-Synced State

Application state stored in the URL query string rather than component state.

```text
/browse?category=smartphone&sort=price-desc&page=1
```

Makes a view shareable, bookmarkable, and survivable across refresh — and gives browser back/forward correct behaviour for free.

---

# 🔄 Prop-to-State Anti-Pattern

Copying a prop into state and syncing it with `useEffect`.

```jsx
// Wrong
useEffect(() => { setDraft(value) }, [value]);
```

Renders once with the stale value, then re-renders — a visible flash and an extra render. React's documented fix is to adjust state during render instead.

---

# 🗺️ Discovery Zone / Decision Zone

CartWise's two-zone visual rule.

```text
DISCOVERY   home, category grid, browse
            colourful, playful, high visual energy
            job: invite exploration

DECISION    compare table, product detail, wishlist
            calm, high contrast, colour only where it means something
            job: make differences legible
```

Comparison is a focused reading task. Decorative colour there competes with meaningful colour, and the eye cannot tell them apart.

---

# 🃏 Zone-Neutral Component

A component that belongs to neither zone and is instead framed by whichever zone it sits in.

`ProductCard` is always `bg-card` with a hairline border, so it reads as a distinct object on a pastel grid *and* on a calm wishlist — with no `variant` prop, which would double the states to verify and push zone-awareness onto ~30 call sites.

---

# 🔤 Collation

The database's rule for ordering text.

Under a default collation, `ORDER BY name` places every capital before every lowercase — so "iPhone 16 Pro" sorts *after* "Sony" in a list labelled A–Z, and the same code sorts differently on a differently-configured database.

Fixed by sorting on `lower(name)`.

---

# 🧾 PageResponse

CartWise's hand-written page envelope DTO.

Written by hand rather than serialising Spring's `Page`, which would publish framework internals (`pageable`, `sort.sorted`, `numberOfElements`) as a public contract that a Spring upgrade could change.
