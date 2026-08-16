# 🎨 CH20 — Product Discovery & Visual Design System

> **Project:** CartWise  
> **Chapter:** Product Discovery & Visual Design System

---

# 👋 Welcome

Chapter 17 gave CartWise a product endpoint that returned everything, in whatever order the database felt like. Chapter 20 is where browsing becomes a real feature — and where the app stops looking like a wireframe.

Two halves ship together because neither works alone. A category tile grid needs an endpoint that can answer "give me smartphones, cheapest first, page 2." A filtering API needs a UI that lets someone actually use it. Building one without the other produces either an API nobody calls or a UI that filters mock data.

There's a third thing this chapter does that isn't in the title: it wires the frontend to the backend for the first time. `services/api.ts` was written in Chapter 17 and had **zero importers** — every screen was rendering mock data. Chapter 17's docs deferred the swap to "Chapter 19," which turned out to be roles. So the debt sat.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- How to add optional filtering, sorting, and pagination to a REST endpoint without a combinatorial explosion of query methods.
- Why JPA Specifications beat a `@Query` with `(:param IS NULL OR ...)` predicates.
- What a page envelope is, and why changing a response shape is a breaking change that must be migrated, not shimmed.
- Why every sorted, paginated query needs a tie-breaker column.
- How to build a design token layer so colour has one source of truth.
- Why "vibrant pastel" is a contradiction unless you separate surface colours from accent colours.
- How to measure WCAG contrast ratios, and why measuring beats eyeballing.
- Why a comparison table and a browse page should not look the same.
- Why auto-advancing carousels are an accessibility problem.

---

# 🗺️ Part A — The Discovery API

## The problem with five optional filters

CartWise now supports filtering by category, brand, price floor, price ceiling, and stock status. Five optional filters means **32 possible query shapes** (2⁵). You cannot write 32 repository methods.

Two approaches were considered:

**Approach 1 — one `@Query` with null guards:**

```java
@Query("SELECT p FROM Product p WHERE " +
       "(:category IS NULL OR LOWER(p.category) = :category) AND " +
       "(:brand IS NULL OR p.brand = :brand) AND " +
       "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
       "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
       "(:inStock IS NULL OR p.inStock = :inStock)")
```

This works, but every request ships all five conditions to PostgreSQL whether or not the user asked for them. Worse, the query text stops describing what the query does — you have to mentally evaluate five null checks to know what SQL will run.

**Approach 2 — JPA Specifications (chosen):**

```java
public final class ProductSpecifications {
    public static Specification<Product> matching(ProductQuery query) {
        return Specification.allOf(
            categoryEquals(query.category()),
            brandEquals(query.brand()),
            priceAtLeast(query.minPrice()),
            priceAtMost(query.maxPrice()),
            inStockIs(query.inStock())
        );
    }
    // each returns null when the filter is absent, and null specs are skipped
}
```

Specifications compose only what was asked for. No filters produces **no `WHERE` clause at all**.

The cost is honest: the SQL is no longer visible in the source. That's why this chapter's verification pastes the *actual generated statement* rather than asserting what it should be.

One query remains hand-written — the category aggregate — because Spring Data derives filtering and ordering but not aggregation.

---

## The page envelope (a breaking change)

`GET /api/products` used to return a bare array. It now returns:

```json
{
  "content": [ /* ProductDto[] */ ],
  "page": 0,
  "size": 20,
  "totalElements": 8,
  "totalPages": 1
}
```

**This breaks the Chapter 17 contract.** It was handled by migration, not by a compatibility shim:

```text
Migrated:  ProductController
           ProductService
           frontend/src/services/api.ts  (fetchProducts now takes params,
                                          returns ApiPage<ApiProduct>)

NOT done:  a legacy /api/products/all endpoint
```

Two contracts means two behaviours to keep in step, and the "legacy" one never actually retires. One contract, migrated in the same commit.

`PageResponse` is hand-written rather than serialising Spring's `Page` directly. Serialising `Page` publishes framework internals — `pageable`, `sort.sorted`, `numberOfElements` — as a public API contract that a Spring upgrade could silently change.

---

## Query parameters

```text
?category=smartphone     filter by category slug (case-insensitive)
?brand=Apple             filter by brand
?minPrice=10000          inclusive lower bound
?maxPrice=150000         inclusive upper bound
?inStock=true            hide out-of-stock products
?sort=price-asc          price-asc | price-desc | rating-desc | name-asc
?page=0&size=20          zero-indexed, default size 20, max 100
```

---

## Validation: clamp vs. reject

The rule implemented, and worth stating because it's a judgement call:

> **Clamp when the request is immoderate. Reject when it is incoherent.**

```text
?size=5000                 200, clamped to 100        (immoderate — you want a lot)
?page=-1                   400                        (incoherent — page −1 has no meaning)
?minPrice=999999&maxPrice=1  400                      (incoherent — empty by construction)
?sort=nonsense             400, lists valid values    (incoherent)
?category=does-not-exist   200, empty content         (a filter matching nothing
                                                       is an empty result, not a 404)
```

Clamping `page=-1` to `0` would silently answer a different question. A client looping over pages would never learn its arithmetic was wrong.

**A noted inconsistency:** `?size=0` currently clamps to `1`. By the stated rule it should reject — a page of zero items is incoherent, not immoderate. This is a small deviation from the chapter's own principle and is recorded here rather than hidden.

---

## The tie-breaker

Every ordering is tie-broken by `id`:

```sql
order by p1_0.price desc, p1_0.id
```

Without it, two products at the same price have **no defined order**. Across pages, that means an item can appear twice or vanish entirely — the classic offset-pagination bug. It's invisible in testing until two rows collide.

---

## Categories without a categories table

`GET /api/categories` returns `[{name, slug, productCount}]`, derived by `GROUP BY` on the products table. **No categories table was created.**

The reasoning: a category here has no attributes of its own — no description, image, ordering, or parent. A table would begin life with exactly one meaningful column duplicating the product's, plus CRUD endpoints, admin surface, and an FK migration to keep it honest.

The trade-off, stated rather than buried:

- A category with zero products cannot exist
- There is no way to pre-create one
- Renaming a category means updating every product

The day any of those matters, a table is correct and this endpoint becomes its read model.

The slug is **derived** (`lower(replace(name, ' ', '-'))`), never stored. A stored slug is a second copy of the name that can disagree with it.

---

## Indexes — and one that doesn't work

Two indexes were added:

```sql
create index idx_products_category on products (category)
create index idx_products_price on products (price)
```

**Honest note on measurement:** at 8 seed rows these are not a speedup, and no benchmark here would show anything but noise. PostgreSQL will sequentially scan 8 rows in preference to any index, every time. They exist because these query shapes are now permanent parts of the API, and an index is cheapest to add before the table is large.

**A gap that needs naming:** `idx_products_category` **does not serve the `?category=` filter.** The predicate compares `lower(category)`, and a B-tree on the raw column cannot satisfy a functional expression. Making it index-backed requires:

```sql
CREATE INDEX idx_products_category_lower ON products (lower(category));
```

JPA's `@Index` cannot declare that. It needs a real migration tool (Flyway or Liquibase), which CartWise does not yet have — `ddl-auto` is still doing schema management. **This is now the strongest argument for adding migrations in a later chapter.**

The index still earns its place for the `GROUP BY` in the category endpoint. `idx_products_price` *is* directly usable, since the price predicates and `ORDER BY price` don't wrap the column.

---

# 🎨 Part B — The Design System

## What was there before

The pre-read found colour defined in three competing places:

```text
1. A :root block in index.css that Tailwind knows nothing about
2. constants/colors.ts — a second palette, magenta #C026D3,
   conflicting with the stylesheet's blue #2563eb, imported by nothing
3. 989 Tailwind palette utilities across 170 distinct classes
```

Two of those files had zero importers and were deleted.

---

## Tokens first

The palette is now declared once, in Tailwind v4's `@theme` block:

```css
@theme {
  /* Surfaces — pastel. Low saturation, high lightness. Tile backgrounds. */
  --color-tile-mint:   #C6F0DA;
  --color-tile-butter: #FBEEBE;
  --color-tile-blush:  #FBD8E4;
  --color-tile-sky:    #CDE3FB;
  --color-tile-lilac:  #DFD7FB;
  --color-tile-peach:  #FCDCC6;

  /* Accents — saturated. Buttons, badges, active states. */
  --color-accent-primary:   #7A3BD1;
  --color-accent-secondary: #0E7C7B;

  /* Semantic */
  --color-success:   #1E7A46;
  --color-danger:    #C62E3E;
  --color-rating:    #B8690E;
  --color-ink:       #1F1A2E;
  --color-ink-muted: #5A5270;
}
```

**Why "vibrant pastel" isn't a contradiction here:** pastel means low saturation and high lightness; vibrant means high saturation. They can't be the same colour. What reads as poppy-pastel is pastel *surfaces* carrying saturated *accents*. Separating those two roles is the entire trick.

---

## Measured contrast, not eyeballed

Every pair was computed with the WCAG 2.1 relative-luminance formula against the actual hex values.

| Tile | Hex | vs ink | vs ink-muted |
|---|---|---|---|
| mint | `#C6F0DA` | 13.55:1 | 5.87:1 |
| butter | `#FBEEBE` | 14.51:1 | 6.29:1 |
| blush | `#FBD8E4` | 12.88:1 | 5.58:1 |
| sky | `#CDE3FB` | 12.83:1 | 5.56:1 |
| lilac | `#DFD7FB` | 12.24:1 | 5.30:1 |
| peach | `#FCDCC6` | 13.00:1 | 5.63:1 |

Every tile clears 4.5:1 against **both** ink and ink-muted — so a tile can carry a heading *and* a product count without either failing. No tile shipped failing and none needed adjusting.

| Accent | Hex | vs white |
|---|---|---|
| accent-primary | `#7A3BD1` | 6.22:1 |
| accent-secondary | `#0E7C7B` | 5.01:1 |
| success | `#1E7A46` | 5.35:1 |
| danger | `#C62E3E` | 5.44:1 |

These are white-text-on-accent surfaces, so the white ratio is the one that governs.

`--color-rating` was added mid-chapter. The star had been sitting on `accent-secondary`, which made it read as a different symbol than intended. Rather than ship a mismatched value, amber candidates were measured: `#D98324` failed at 2.82:1, `#B8690E` passed at 4.02:1 against the page surface. (The star is a non-text graphical element, so WCAG 1.4.11's 3:1 threshold applies, not 4.5:1.)

---

## The two-zone rule

This is the core design decision of the chapter.

```text
DISCOVERY   home, category grid, browse, empty states
            pastel tiles, colour blocking, high visual energy
            job: make browsing feel fun, invite exploration

DECISION    compare table, product detail, wishlist
            calm surface, high contrast
            colour used ONLY to encode meaning
            job: make differences legible
```

**Why:** comparison is a focused reading task. Decorative colour on a comparison table is actively harmful, because the eye cannot distinguish decorative colour from meaningful colour. If a cell is green, that has to *mean* something — cheaper, in stock, better spec. Pastel patchwork behind it destroys that signal.

The compare table was **not** restyled.

**One deliberate deviation:** the browse results grid is a discovery route, but its grid is calm. A wall of product cards is itself a reading task, and pastel behind them would compete with the information on them. The colour energy sits in the chips and tiles *above* the grid.

---

## Components

**HeroBanner** — scroll-snap rail, gradient promo cards, dot buttons, arrow-key navigation. Replaces `BannerCarousel`, which auto-advanced on a `setTimeout`.

> **Why no auto-advance:** it's a WCAG 2.2.2 problem (moving content the user can't pause) and it steals focus mid-read. Verified it does not move on its own over a 3-second sample.

**CategoryTileGrid** — one tile per category from `GET /api/categories`. Tile colour and glyph derive from a **djb2 hash of the slug**, not array position.

> **Why the hash matters:** the category list is alphabetical. With index-based colouring, adding a "Camera" category would recolour every tile after it. Hash the slug, and a category keeps its colour forever.

**PromoCard / PromoRow** — original CartWise copy, CSS gradients plus authored geometry. Every CTA routes somewhere real.

**FilterBar** — chips, price range, stock toggle, sort. All writing to the URL.

**ProductCard** — restyled, not rebuilt.

---

## ProductCard: the hard one

It appears in **both zones**, so it had to work on a pastel discovery grid and on a calm wishlist page.

The resolution: **it belongs to neither zone — it is a neutral object the zone frames.** Its surface is always `bg-card` with a hairline border, so it reads as a distinct object against pastel and needs no variant on the wishlist.

Colour inside the card is strictly semantic: `success` on the discount badge, `danger` on the out-of-stock veil, `accent-primary` on the compare toggle, `rating` on the star, `ink` everywhere else. That rule is what makes it safe in the decision zone — a decorative pastel header would compete with the green that means "cheaper" the moment two cards sit side by side.

**A `variant="discovery"` prop was rejected**: it doubles the states to verify and makes every one of ~30 call sites responsible for knowing its zone.

**Chapter 13's accessibility was verified intact after restyling, not assumed:**

```text
heart before:  aria-pressed="false"  aria-label="Add iPhone 16 Pro to wishlist"
heart after:   aria-pressed="true"   aria-label="Remove iPhone 16 Pro from wishlist"
compare:       aria-pressed false→true, "Add…" → "Remove … from comparison"
focus rings:   FilterBar 9/9, pagination 5/5, cards 6/6 (0 missing)
```

---

## URL-synced filter state

```text
/browse?category=smartphone&sort=price-desc&inStock=true&minPrice=60000&maxPrice=130000
```

Filter state lives in the query string, not component state. A filtered view is shareable and survives refresh. **This closes the gap noted in Chapter 14** ("search filter state not URL-synced").

Design details:

- Defaults are omitted (`sort=name-asc`, `page=0`) so a plain `/browse` stays clean
- Changing a filter resets to page 0 — page 3 of a *different* result set renders empty and looks like "no results"
- `size` is URL-readable, since a page number without the size it was computed against is ambiguous

Verified: reloading a fully-filtered URL reproduced the view and restored all four controls. Browser back undoes exactly one filter. At `size=3`: 3 pages, 3+3+2 = 8 products, no duplicates across pages, `aria-current` correct, Previous/Next disabled at the ends.

---

## Motion

Tile hover lift, grid stagger capped at ~210ms total, hero card entry. No route transitions.

**⚠️ Honestly unverified:** the runtime rendering under `prefers-reduced-motion: reduce` was **not observed**. The OS setting could not be toggled from the build environment, and `matchMedia('(prefers-reduced-motion: reduce)').matches` reported `false` throughout.

What *was* verified, by walking the generated stylesheets:

```text
.motion-reduce:transition-none          gated by (prefers-reduced-motion: reduce)
.motion-reduce:group-hover:scale-100    gated by reduce AND (hover: hover)
.motion-reduce:hover:translate-y-0      gated by reduce AND (hover: hover)
html { scroll-behavior: auto }          gated by (prefers-reduced-motion: reduce)

16 elements carry motion-reduce classes; all gated correctly
```

Framer-motion animations additionally branch on `useReducedMotion()`.

**The rules exist and are correctly gated. That is CSS-level verification, not "I watched it."** To close this yourself: DevTools → `Cmd/Ctrl+Shift+P` → "Emulate CSS prefers-reduced-motion: reduce" → hover a tile and reload the grid.

---

## Responsive — measured

Chrome refused to size the window below the 1536px screen width, so measurement was done inside same-origin iframes, where media queries evaluate against the iframe viewport.

| Width | Hero cards | Category cols | Product cols | Overflow |
|---|---|---|---|---|
| 360 | 1 | 2 | 2 | none |
| 768 | 2 | 3 | 3 | none |
| 1280 | 3 | 6 | 4 | none |

The chip row scrolls horizontally at 360 and not above. Nothing broke at any width.

---

# 🐛 Bugs Found During Verification

**1. `?sort=name-asc` put "iPhone 16 Pro" last, after "Sony."**

`ORDER BY name` sorts by the database's collation, so every capital precedes every lowercase. "iPhone" landed last in a list labelled A–Z — and being collation-dependent, the same code would sort differently on a different database. Fixed with `JpaSort.unsafe(ASC, "lower(name)")`. Re-tested: iPhone sorts 2nd, and the generated SQL reads `order by lower(p1_0.name), p1_0.id`.

**2. The hero rail was completely unscrollable at desktop width.**

`snap-center` computes snap positions as `card.centre − rail.centre`. With three cards visible, those offsets were **−419, −26, 367, 760** against a maximum scrollable distance of **340**. Not one card could be centred at a reachable offset, so the browser pinned the rail at 0 — arrow keys, dot clicks, and drags all *silently did nothing*.

Fixed with `snap-start`, making each snap position `card.offsetLeft`, reachable by construction. Re-tested: ArrowRight 0 → 340, ArrowLeft 340 → 0, dots follow.

> This is the bug worth remembering. Nothing errored. A screenshot looked perfect. Finding it required actually pressing the arrow key and reading the resulting `scrollLeft`.

**3. The rail announced "Highlight 2 of 4" while untouched at position 0.**

The active-card calculation measured against the rail's *centre*, and with three cards visible the middle one is nearest at rest. The control announced a card the user had never scrolled to. Fixed to measure leading edges, matching `snap-start`.

**4. A prop-to-state anti-pattern in FilterBar's price drafts.**

Syncing URL values in a `useEffect` renders once with stale numbers, then re-renders. Rewritten using React's documented adjust-during-render form. `tsc` and `eslint --max-warnings=0` both clean.

---

# 📉 What Is Now Worse

Recorded deliberately, because a chapter that only lists wins isn't a report.

**Two palettes coexist.** `@theme` and the legacy `:root` block both define colour. Scoping to the discovery zone was the agreed scope, but a developer now has two places to look and can pick the wrong one. Labelled in `index.css` as superseded and frozen.

**Two ProductCards remain**, on two different data models — one with `BigDecimal` prices and `brand`/`inStock`, one with formatted-string prices and neither. Pre-existing, not introduced here. Both were migrated onto tokens; neither was unified. That's a real refactor with its own verification burden.

**The app is half-wired.** Home's category tiles and `/browse` read the real API; wishlist and compare still render mock data. `/browse` and `/search` now overlap conceptually, one server-backed and one not. That inconsistency is *more* visible than it was when nothing called the API.

**`totalElements` costs a second `COUNT` on every request.** Inherent to offset pagination that reports totals — the price of a page-number control.

**Scroll position is not reset on navigation.** Pre-existing (no `ScrollRestoration`), but the new category tiles make it easier to hit.

**The 8-row seed** makes pagination hard to exercise without `?size=`, and makes every index unmeasurable.

---

# 📭 What Is Deliberately Not Here

- Search autocomplete / typeahead
- Faceted counts on filters ("Apple (12)") — needs aggregation queries
- Infinite scroll (pagination only)
- Dark mode (the token layer makes it possible; not implemented)
- A categories database table
- Admin UI for categories or banners
- Real product imagery — placeholders remain placeholders
- Any change to the compare table's information design

---

# 📌 Key Takeaways

- Specifications compose optional filters without a combinatorial explosion of query methods, at the cost of source-visible SQL.
- Changing a response shape is a breaking change. Migrate it; don't shim it.
- Every paginated, sorted query needs a tie-breaker, or rows leak between pages.
- An index on `column` does not serve a predicate on `lower(column)`.
- Define colour once, in tokens. Measure contrast; don't eyeball it.
- Pastel surfaces + saturated accents is what "vibrant pastel" actually means.
- Discovery surfaces and decision surfaces have different jobs and should not look alike.
- Auto-advancing carousels are an accessibility defect, not a feature.
- Derive tile colours from a hash of a stable key, not from array position.

---

# 🎯 Chapter Outcome

```text
Before CH20                      After CH20

GET /api/products returns all    Filtered, sorted, paginated, with a page envelope
No category browsing             GET /api/categories + a tile grid
Frontend renders mock data       Discovery surfaces read the real API
Colour in three places           15 canonical tokens, measured for contrast
Auto-advancing carousel          Keyboard-navigable, user-controlled rail
Filters lost on refresh          Filter state in the URL, shareable
```

# 🧪 Chapter 21 — [to be planned]
