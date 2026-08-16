# 🎯 CH20 — Interview Questions

> **Project:** CartWise
> **Chapter:** Product Discovery & Visual Design System
>
> This chapter covers optional filtering with Specifications, pagination and its pitfalls, breaking API changes, design tokens, WCAG contrast, and accessibility in interactive components.

---

# 📚 Beginner Level

## Q1. What is pagination, and why does an API need it?

### Answer

Pagination splits a large result set into pages.

```text
?page=0&size=20   rows 1–20
?page=1&size=20   rows 21–40
```

Without it, `GET /api/products` on a catalogue of 100,000 products would serialise every row into one response. That's slow to query, slow to transfer, slow to parse, and the client can only render a screenful anyway.

---

## Q2. What is a page envelope, and why not just return an array?

### Answer

```json
{
  "content": [ /* rows */ ],
  "page": 0,
  "size": 20,
  "totalElements": 8,
  "totalPages": 1
}
```

A bare array carries the rows but not the metadata. The client can't render "Page 2 of 5" or disable the Next button, because it has no idea how many pages exist.

---

## Q3. Why is changing `GET /api/products` from an array to an envelope a "breaking change"?

### Answer

Any client doing `response.map(...)` now crashes — the response is an object, not an array.

Breaking means existing callers stop working until they're updated. CartWise handled it by migrating every caller in the same commit, rather than shipping a compatibility endpoint.

---

## Q4. What does the `?category=does-not-exist` request return, and why not 404?

### Answer

`200 OK` with `content: []` and `totalElements: 0`.

A filter that matches nothing is an **empty result**, not a missing resource. The `/api/products` collection exists; it just has no rows matching that filter. A 404 would mean the endpoint itself is gone.

---

## Q5. What is a design token?

### Answer

A named value for a design decision, defined once.

```css
--color-accent-primary: #7A3BD1;
```

Components reference `bg-accent-primary`, never `#7A3BD1`. Rebranding becomes a one-line edit instead of a find-and-replace across 200 files.

---

## Q6. What does a WCAG contrast ratio of 4.5:1 mean?

### Answer

It's the luminance difference between text and its background, on a scale from 1:1 (identical, invisible) to 21:1 (black on white).

4.5:1 is the WCAG AA minimum for normal body text. Below it, the text is hard or impossible to read for people with low vision.

---

## Q7. Why is an auto-advancing carousel an accessibility problem?

### Answer

It violates WCAG 2.2.2 (Pause, Stop, Hide): content moves without user control.

Practically — it shifts under someone mid-sentence, it steals focus, and screen-reader users lose their position. CartWise deleted `BannerCarousel` (a `setTimeout` auto-advance) and replaced it with a rail the user drives.

---

## Q8. What does `prefers-reduced-motion` do?

### Answer

It's a CSS media feature exposing the OS-level "reduce motion" accessibility setting.

```css
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms; }
}
```

Respecting it isn't cosmetic. For people with vestibular disorders, parallax and large transforms cause real nausea and dizziness.

---

## Q9. What is a tie-breaker in a sorted query?

### Answer

A secondary sort column that guarantees a total ordering.

```sql
ORDER BY price DESC, id
```

Without `id`, two products at the same price have no defined order — the database is free to return them differently on different runs.

---

## Q10. Why does CartWise derive categories with `GROUP BY` instead of creating a categories table?

### Answer

A category here has no attributes of its own — no description, image, ordering, or parent. A table would start with exactly one meaningful column duplicating the product's `category` string, plus CRUD endpoints, admin surface, and an FK migration to keep it honest.

The trade-offs were accepted openly: a category with zero products cannot exist, there's no way to pre-create one, and renaming means updating every product row.

---

# 📚 Intermediate Level

## Q11. Five optional filters. Why Specifications instead of one `@Query` with null guards?

### Answer

Five optional filters is 2⁵ = 32 possible query shapes. You cannot write 32 repository methods.

**The `@Query` approach:**

```java
@Query("SELECT p FROM Product p WHERE " +
       "(:category IS NULL OR LOWER(p.category) = :category) AND " +
       "(:brand IS NULL OR p.brand = :brand) AND " +
       "(:minPrice IS NULL OR p.price >= :minPrice) AND ...")
```

This works, but every request ships all five conditions to PostgreSQL whether asked for or not. And the query text stops describing what the query does — you have to mentally evaluate five null checks to know what SQL runs.

**Specifications:**

```java
Specification.allOf(
    categoryEquals(query.category()),   // returns null when absent
    brandEquals(query.brand()),
    priceAtLeast(query.minPrice()),
    priceAtMost(query.maxPrice()),
    inStockIs(query.inStock())
)
```

Null specs are skipped. No filters produces **no `WHERE` clause at all**.

The honest cost: the SQL is no longer visible in source. That's why verification pastes the actual generated statement instead of asserting what it should be.

---

## Q12. Walk through what SQL is generated for a filtered, sorted, paginated request.

### Answer

For `?category=smartphone&inStock=true&minPrice=60000&maxPrice=140000&sort=price-desc&page=1&size=2`:

```sql
select p1_0.id, p1_0.brand, p1_0.category, ..., p1_0.slug, p1_0.updated_at
from products p1_0
where lower(p1_0.category)=?
  and p1_0.price>=?
  and p1_0.price<=?
  and p1_0.in_stock
order by p1_0.price desc, p1_0.id
offset ? rows fetch first ? rows only

select count(p1_0.id) from products p1_0
where lower(p1_0.category)=? and p1_0.price>=? and p1_0.price<=? and p1_0.in_stock
```

Two statements: one for the page, one for `totalElements`. `WHERE`, `ORDER BY`, and `OFFSET/FETCH` are all in the database — nothing is filtered in Java.

---

## Q13. Why is there a second `COUNT` query, and can it be avoided?

### Answer

`totalElements` and `totalPages` require knowing the full size of the filtered set. The page query only fetches N rows, so it can't tell you the total.

It can be avoided — by not reporting totals. Cursor pagination ("give me rows after id 4821") skips the count entirely and is much faster at scale. But it cannot render a page-number control, only "Next."

CartWise's UI has numbered pages, so the count is the price of the feature.

---

## Q14. What's CartWise's rule for clamping versus rejecting an invalid query parameter?

### Answer

> **Clamp when the request is immoderate. Reject when it is incoherent.**

```text
?size=5000                   200, clamped to 100    (greedy but meaningful)
?page=-1                     400                    (page −1 has no meaning)
?minPrice=999999&maxPrice=1  400                    (empty by construction)
?sort=nonsense               400, lists valid values
```

Clamping `page=-1` to `0` would silently answer a different question. A client looping over pages would never learn its arithmetic was wrong.

**A known deviation:** `?size=0` currently clamps to `1`. By the stated rule it should reject — a page of zero items is incoherent, not immoderate. This is recorded as an inconsistency rather than defended.

---

## Q15. Why was `PageResponse` hand-written instead of serialising Spring's `Page`?

### Answer

Serialising `Page` directly publishes framework internals as a public API contract:

```json
{
  "pageable": { "sort": { "sorted": true, "unsorted": false }, ... },
  "numberOfElements": 20,
  "first": true,
  "empty": false
}
```

Clients start depending on `pageable.sort.sorted`. A Spring upgrade changes that shape, and the API breaks without anyone touching the API code.

A hand-written DTO means the contract changes only when you decide it changes.

---

## Q16. `idx_products_category` exists. Why doesn't it speed up `?category=smartphone`?

### Answer

Because the predicate is `lower(category)`, not `category`.

```sql
-- The index stores raw values:
CREATE INDEX idx_products_category ON products (category);
-- Stores: "Smartphone", "Laptop", "Headphones"

-- The query asks about transformed values:
WHERE lower(category) = 'smartphone'
```

A B-tree on the raw column cannot satisfy a functional expression. PostgreSQL would have to compute `lower()` on every row to check — so it just scans.

The fix is a functional index:

```sql
CREATE INDEX ON products (lower(category));
```

`@Index` in JPA cannot declare this. It needs a real migration tool (Flyway/Liquibase), which CartWise doesn't have yet — the strongest argument for adding one.

The existing index still earns its place: it serves the `GROUP BY` in the category endpoint.

---

## Q17. Are the indexes actually helping at 8 seed rows?

### Answer

No, and the report says so rather than pretending otherwise.

PostgreSQL will sequentially scan 8 rows in preference to any index, every time — the index lookup plus heap fetch costs more than reading the whole table. A benchmark here would show noise.

They exist because these query shapes are now permanent parts of the API, and an index is far cheaper to add before the table is large than after.

---

## Q18. Why does `?sort=name-asc` need `lower(name)` rather than `name`?

### Answer

This was a real bug. `ORDER BY name` sorts by the database's collation, which places every capital before every lowercase:

```text
Broken (ORDER BY name):     Broken output:
  "LG OLED C5"                LG, MacBook, Nothing, OnePlus, Pixel,
  "MacBook Air M4"            Samsung, Sony, iPhone   ← iPhone last!
  "iPhone 16 Pro"
```

"iPhone 16 Pro" landed last in a list labelled A–Z. Worse, it's collation-dependent — the same code sorts differently on a differently-configured database.

Fixed with `JpaSort.unsafe(ASC, "lower(name)")`. Generated SQL now reads `order by lower(p1_0.name), p1_0.id`.

---

## Q19. Why is filter state in the URL rather than component state?

### Answer

```text
/browse?category=smartphone&sort=price-desc&inStock=true&minPrice=60000
```

Four things come free:

- **Shareable** — send someone the exact filtered view
- **Bookmarkable** — save a search
- **Survives refresh** — F5 doesn't reset your work
- **Browser back works correctly** — back undoes exactly one filter

This closes a gap explicitly noted in Chapter 14: "search filter state not URL-synced."

---

## Q20. Why does changing a filter reset the page to 0?

### Answer

Because page 3 of a *different* result set is usually empty.

```text
User is on:  ?category=smartphone&page=2      (5 smartphones, 3 pages)
User picks:  ?category=television&page=2      (1 television, 1 page)
Result:      empty grid, looks like "no results found"
```

The user changed a filter and the app appeared to break. Resetting to page 0 is the only sane behaviour.

---

# 🎨 Design System Questions

## Q21. "Vibrant pastel" sounds like a contradiction. How is it resolved?

### Answer

It *is* a contradiction as a single colour. Pastel means low saturation and high lightness; vibrant means high saturation. One colour cannot be both.

The resolution is to separate the roles:

```text
SURFACES (pastel)     tile backgrounds — #C6F0DA, #FBEEBE, #FBD8E4
                      low saturation so text on them stays readable

ACCENTS (saturated)   buttons, badges, prices — #7A3BD1, #0E7C7B
                      high saturation, used in small areas
```

Pastel surfaces carrying saturated accents reads as "poppy pastel." Skip this separation and pick colours per component, and you get mud within a few chapters.

---

## Q22. Why were contrast ratios measured rather than eyeballed?

### Answer

Because two colours that *look* clearly different can still fail 4.5:1. Perceived difference and computed luminance ratio are not the same thing — the calculation weights green far more heavily than blue, with gamma correction on each channel.

Every CartWise tile was computed against both `ink` and `ink-muted`:

| Tile | Hex | vs ink | vs ink-muted |
|---|---|---|---|
| mint | `#C6F0DA` | 13.55:1 | 5.87:1 |
| butter | `#FBEEBE` | 14.51:1 | 6.29:1 |
| blush | `#FBD8E4` | 12.88:1 | 5.58:1 |
| sky | `#CDE3FB` | 12.83:1 | 5.56:1 |
| lilac | `#DFD7FB` | 12.24:1 | 5.30:1 |
| peach | `#FCDCC6` | 13.00:1 | 5.63:1 |

All clear 4.5:1 against **both**, so a tile can carry a heading and a product count without either failing.

---

## Q23. `--color-rating` was added mid-chapter. Why?

### Answer

The rating star had been placed on `accent-secondary` (teal). It read as a different symbol — teal doesn't say "star rating," and it collided semantically with the accent's other uses.

Rather than ship a mismatched value, amber candidates were measured:

```text
#D98324   2.82:1  ← failed (needs 3:1 for non-text graphics, WCAG 1.4.11)
#B8690E   4.02:1  ← passed
```

The star is a non-text graphical element, so the 3:1 threshold applies rather than 4.5:1.

---

## Q24. Explain the two-zone rule and the reasoning behind it.

### Answer

```text
DISCOVERY   home, category grid, browse, empty states
            pastel tiles, colour blocking, high visual energy
            job: make browsing feel fun, invite exploration

DECISION    compare table, product detail, wishlist
            calm surface, high contrast
            colour ONLY where it encodes meaning
            job: make differences legible
```

The reasoning: comparison is a focused reading task. Decorative colour on a comparison table is *actively harmful*, because the eye cannot distinguish decorative colour from meaningful colour. If a cell is green, that must mean something — cheaper, in stock, better spec. Pastel patchwork behind it destroys the signal.

This is why the compare table was not restyled despite the chapter's visual brief.

---

## Q25. The browse grid is a discovery route but renders calm. Isn't that inconsistent?

### Answer

It's a deliberate deviation, and the reasoning holds.

A wall of product cards is *itself* a reading task — the user is scanning names, prices, and ratings. Pastel behind them would compete with the information on them.

The colour energy sits in the chips and category tiles *above* the grid. You arrive through colour; you read in calm.

---

## Q26. `ProductCard` appears in both zones. How was that resolved without a `variant` prop?

### Answer

By making it belong to **neither** zone — a neutral object that whichever zone frames.

```text
Surface:  always bg-card + hairline border
          → reads as a distinct object on a pastel grid
          → reads as normal on a calm wishlist
          → no variant needed

Colour inside: strictly semantic
          success       discount badge
          danger        out-of-stock veil
          accent-primary compare toggle
          rating        the star
          ink           everything else
```

The semantic rule is what makes it safe in the decision zone. A decorative pastel header would compete with the green that means "cheaper" the moment two cards sit side by side.

**Why `variant="discovery"` was rejected:** it doubles the states to verify and pushes zone-awareness onto ~30 call sites, each of which can get it wrong.

---

## Q27. Why derive tile colours from a hash instead of array position?

### Answer

Because the category list is alphabetical, and array position is unstable.

```text
Index-based:                      Hash-based (djb2 of slug):
  Headphones  → tile[0] mint        Headphones  → hash → mint
  Laptop      → tile[1] butter      Laptop      → hash → sky
  Smartphone  → tile[2] blush       Smartphone  → hash → peach
  Television  → tile[3] sky         Television  → hash → butter

Add "Camera" (sorts first):
  Camera      → tile[0] mint  ✗     Camera      → hash → lilac  ✓
  Headphones  → tile[1] butter ✗    Headphones  → hash → mint   ✓ unchanged
  Laptop      → tile[2] blush  ✗    Laptop      → hash → sky    ✓ unchanged
  ...every tile recoloured          ...everything else stable
```

Hashing a stable key means a category keeps its colour forever. Users build spatial memory around colour; shuffling it on every catalogue change destroys that.

---

## Q28. Why was `snap-center` unusable for the hero rail?

### Answer

This was the chapter's most instructive bug — and it produced **no error at all**.

```text
snap-center:  snap position = card.centre − rail.centre
              With 3 cards visible, computed offsets were:
                  −419, −26, 367, 760
              Maximum scrollable distance: 340

              Not one offset was within [0, 340].
              → browser pinned the rail at 0
              → arrow keys, dot clicks, and drag ALL silently did nothing

snap-start:   snap position = card.offsetLeft
              Always within [0, maxScroll] by construction.
```

Fixed with `snap-start`. Re-tested: ArrowRight 0 → 340, ArrowLeft 340 → 0, dots follow.

**Why it matters:** nothing threw. A screenshot looked perfect. Finding it required actually pressing the arrow key and reading the resulting `scrollLeft`.

---

## Q29. What was wrong with "Highlight 2 of 4" on an untouched rail?

### Answer

The active-card calculation measured distance against the rail's **centre**. With three cards visible, the middle card is nearest the centre at rest — so at `scrollLeft: 0`, the control announced card 2, which the user had never scrolled to.

Screen-reader users would hear a position that didn't match reality.

Fixed by measuring **leading edges**, matching `snap-start`. Now: "Highlight 1 of 4" at rest.

---

## Q30. What is the prop-to-state anti-pattern, and where did it appear?

### Answer

Copying a prop into state and syncing it with `useEffect`:

```jsx
// Wrong — FilterBar's price drafts
const [draft, setDraft] = useState(value);
useEffect(() => { setDraft(value); }, [value]);
```

The component renders once with the **stale** value, the effect fires, then it re-renders with the correct one. That's a visible flash and a wasted render.

React's documented fix is to adjust state during render instead of in an effect. `tsc` and `eslint --max-warnings=0` both clean after the rewrite.

---

# 🏗️ Architecture Questions

## Q31. Why migrate every caller instead of keeping a legacy array endpoint?

### Answer

```text
With a legacy endpoint:
  /api/products      → page envelope
  /api/products/all  → bare array (deprecated)

  Two behaviours to keep in step forever.
  Every future filter must be implemented twice or documented as unsupported.
  The "legacy" one never actually retires — something always still calls it.
```

One contract, migrated in the same commit, is cheaper over the life of the project. The migration touched three files: `ProductController`, `ProductService`, `services/api.ts`.

---

## Q32. When would a categories table become the right call?

### Answer

The moment a category needs attributes of its own:

- A description or hero image for the category landing page
- Custom display ordering (not alphabetical)
- Parent/child hierarchy (Electronics → Phones → Smartphones)
- The need to pre-create an empty category before stocking it
- Renaming without updating every product row

At that point the table is correct, and `GET /api/categories` becomes its read model rather than being deleted.

---

## Q33. `services/api.ts` had zero importers before this chapter. What does that reveal?

### Answer

That Chapter 17's API client was written and never wired. Every screen rendered mock data, and the swap was deferred to "Chapter 19" — which turned out to be roles, so the debt sat untouched.

Two lessons:

1. **Deferring to a named future chapter is fragile.** The plan changed; the deferral was silently orphaned.
2. **"The endpoint works" and "the app uses the endpoint" are different claims.** Chapter 17's verification tested the API with curl, which passed — while no user-facing screen called it.

---

## Q34. The app is now "half-wired." Why is that worse than fully mocked?

### Answer

```text
Before:  everything mock          → consistent, if fake
After:   home + /browse → real API
         wishlist + compare → mock

         /browse and /search now overlap conceptually,
         one server-backed and one not
```

Fully mocked is at least coherent — a developer knows nothing is real. Half-wired means a developer must know *which* screens are real, and that knowledge lives nowhere but in someone's head.

It was accepted as scope, and it's recorded in the chapter's "what is now worse" section rather than buried.

---

## Q35. Why do two `ProductCard` components still exist?

### Answer

They sit on different data models:

```text
components/ui/ProductCard.tsx
  BigDecimal-derived prices, has brand and inStock

features/home/components/product/ProductCard.tsx
  formatted-string prices, no brand, no inStock
```

Both were migrated onto tokens; neither was unified. Unification is a real refactor with its own verification burden and was out of scope.

Worth noting: one was nearly deleted as a "dead duplicate" after a grep missed its relative `./ProductCard` imports. `tsc` caught it immediately and it was restored from git — a reminder that grep on an import name is not a reachability proof.

---

# 🧪 Scenario-Based Questions

## Q36. Two products cost exactly ₹79,999. A user pages through `?sort=price-asc&size=10`. What can go wrong without a tie-breaker?

### Answer

The database has no defined order between the tied rows, and it may resolve them differently for the page-1 query and the page-2 query.

```text
Page 1 (OFFSET 0):   ... Product A at position 10
Page 2 (OFFSET 10):  Product A at position 11   ← seen twice

or

Page 1 (OFFSET 0):   ... Product B at position 10
Page 2 (OFFSET 10):  Product C at position 11   ← Product A never appears
```

A row appears twice or vanishes. With `ORDER BY price ASC, id`, the ordering is total and stable across queries.

---

## Q37. A user filters to `?category=smartphone&page=2`, then changes sort to `price-desc`. What should happen to the page number?

### Answer

Reset to page 0.

The result *set* is the same 5 smartphones, but the *ordering* changed completely — page 2 now contains entirely different products than the user was looking at. Preserving the page number preserves a position that no longer means anything.

CartWise resets page on any filter or sort change.

---

## Q38. A new category "Camera" is added with 3 products. What happens to the UI, with no code change?

### Answer

```text
GET /api/categories   → now returns 5 categories including Camera
CategoryTileGrid      → renders a 5th tile automatically
Tile colour           → derived from djb2("camera") — stable, and
                        every existing tile keeps its colour
Glyph                 → derived the same way; an unknown category
                        still gets one (glyphs aren't per-category pictograms)
/browse?category=camera → filters correctly, no route registration needed
```

Nothing is hardcoded per category. This is the payoff of deriving both the category list and the tile styling.

---

## Q39. The catalogue grows to 500,000 products. What breaks first?

### Answer

In rough order:

1. **`?category=` filtering** — the `lower(category)` predicate is unindexed, so it's a full sequential scan on every request. This is the immediate problem and needs the functional index.
2. **The `COUNT` query** — counting 500,000 rows on every page request, twice the work of the page itself.
3. **Deep offsets** — `OFFSET 400000` makes PostgreSQL walk 400,000 rows before returning 20. Offset pagination degrades badly here; cursor pagination would be needed.
4. **The category `GROUP BY`** — aggregating 500,000 rows on every homepage load. Would need caching or a materialised view.

Notably, `?minPrice=`/`?maxPrice=` and `ORDER BY price` are fine — `idx_products_price` is directly usable because those predicates don't wrap the column.

---

## Q40. Someone reports the homepage animations make them nauseous. What's the state of the fix?

### Answer

Honestly: **the code is written but the behaviour was never observed.**

What was verified, by walking the generated stylesheets:

```text
.motion-reduce:transition-none          gated by (prefers-reduced-motion: reduce)
.motion-reduce:group-hover:scale-100    gated by reduce AND (hover: hover)
.motion-reduce:hover:translate-y-0      gated by reduce AND (hover: hover)
html { scroll-behavior: auto }          gated by (prefers-reduced-motion: reduce)

16 elements carry motion-reduce classes; all correctly gated
Framer-motion additionally branches on useReducedMotion()
```

What was **not** verified: the OS setting could not be toggled from the build environment, and `matchMedia('(prefers-reduced-motion: reduce)').matches` reported `false` throughout.

That's CSS-level verification, not "I watched it work." To close it: DevTools → `Cmd/Ctrl+Shift+P` → "Emulate CSS prefers-reduced-motion: reduce" → hover a tile and reload the grid.

Claiming this as done without observing it would be the exact failure mode this project's reports are written to avoid.

---

# 📌 Summary

These questions cover:

- Pagination mechanics, page envelopes, and the offset-vs-cursor trade-off
- Tie-breakers and the silent page-leak bug they prevent
- JPA Specifications versus null-guarded `@Query`, and why
- Breaking changes: migrate, don't shim
- Clamp-versus-reject as a validation philosophy
- Functional indexes and why `@Index` can't express them
- Collation bugs in text sorting
- Design tokens as a single source of truth
- Measured WCAG contrast, and why measuring beats eyeballing
- The pastel-surface / saturated-accent split
- Discovery versus decision zones, and zone-neutral components
- Hash-derived styling for stability under data change
- `snap-start` versus `snap-center`, and bugs that throw no errors
- URL-synced state
- Honest reporting of what was verified versus what was assumed
