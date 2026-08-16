# 💻 CH20 — Commands

> **Project:** CartWise  
> **Chapter:** Product Discovery & Visual Design System

Commands used to develop, test, and verify CartWise's discovery API and design token system.

---

# 🚀 Development

## Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend on `localhost:8080`. Startup log now registers `/api/categories` alongside the product routes.

---

## Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend on `localhost:5173`.

---

## Build and Verify

```bash
cd backend
mvn clean verify
```

Expected: `[INFO] BUILD SUCCESS`

---

## Frontend Type and Lint Checks

```bash
cd frontend
npx tsc --noEmit
npx eslint . --max-warnings=0
```

Both must pass clean. The `--max-warnings=0` flag is what caught the prop-to-state anti-pattern in FilterBar.

---

# 🔍 Testing the Discovery API

## GET /api/categories

```bash
curl http://localhost:8080/api/categories
```

### Expected (200 OK)

```json
[
  { "name": "Headphones",  "slug": "headphones",  "productCount": 1 },
  { "name": "Laptop",      "slug": "laptop",      "productCount": 1 },
  { "name": "Smartphone",  "slug": "smartphone",  "productCount": 5 },
  { "name": "Television",  "slug": "television",  "productCount": 1 }
]
```

**Verify:** counts sum to the total product count (1+1+5+1 = 8).

---

## GET /api/products — Default Page

```bash
curl http://localhost:8080/api/products
```

### Expected (200 OK)

```json
{
  "content": [ /* 8 products */ ],
  "page": 0,
  "size": 20,
  "totalElements": 8,
  "totalPages": 1
}
```

Note the envelope. This is **not** a bare array — that's the Chapter 17 contract this chapter broke.

---

## Filter by Category

```bash
curl "http://localhost:8080/api/products?category=smartphone"
```

**Verify:** `totalElements` is 5, and every item in `content` has `"category": "Smartphone"`.

Case-insensitive — `?category=SMARTPHONE` returns the same rows.

---

## Filter by Price Range

```bash
curl "http://localhost:8080/api/products?minPrice=60000&maxPrice=140000"
```

**Verify by hand against the seed data.** Both bounds are inclusive.

---

## Filter by Stock

```bash
curl "http://localhost:8080/api/products?inStock=true"
```

**Verify:** `nothing-phone-3` (the seeded out-of-stock product) is absent.

---

## Sorting

```bash
curl "http://localhost:8080/api/products?sort=price-asc"
curl "http://localhost:8080/api/products?sort=price-desc"
curl "http://localhost:8080/api/products?sort=rating-desc"
curl "http://localhost:8080/api/products?sort=name-asc"
```

**Verify the actual order**, don't assume it. For `name-asc` specifically, check that `iphone-16-pro` sorts near the top, not last — if it's last, the `lower(name)` fix has regressed and you're sorting by raw collation again.

---

## Pagination

```bash
curl "http://localhost:8080/api/products?page=0&size=3"
curl "http://localhost:8080/api/products?page=1&size=3"
curl "http://localhost:8080/api/products?page=2&size=3"
```

**Verify:**
- `totalPages` is 3
- Content lengths are 3, 3, 2
- No product ID appears on two pages
- No product is missing across all three

---

## Combined Query

```bash
curl "http://localhost:8080/api/products?category=smartphone&inStock=true&minPrice=60000&maxPrice=140000&sort=price-desc&page=1&size=2"
```

This is the query whose generated SQL is pasted in the chapter README.

---

# ⚠️ Testing Validation

## Negative Page (400)

```bash
curl -i "http://localhost:8080/api/products?page=-1"
```

```json
{ "message": "page must be zero or greater" }
```

Rejected, not clamped — page −1 is incoherent, not merely immoderate.

---

## Inverted Price Range (400)

```bash
curl -i "http://localhost:8080/api/products?minPrice=999999&maxPrice=1"
```

```json
{ "message": "minPrice (999999) cannot be greater than maxPrice (1)" }
```

---

## Negative Price (400)

```bash
curl -i "http://localhost:8080/api/products?minPrice=-5"
```

```json
{ "message": "minPrice cannot be negative" }
```

---

## Unknown Sort (400)

```bash
curl -i "http://localhost:8080/api/products?sort=nonsense"
```

```json
{ "message": "sort must be one of: price-asc, price-desc, rating-desc, name-asc (received 'nonsense')" }
```

The message lists the valid values — an error that tells you the fix.

---

## Non-Numeric Price (400)

```bash
curl -i "http://localhost:8080/api/products?minPrice=abc"
```

Bind failure, re-bodied by `GlobalExceptionHandler` into the standard error shape.

---

## Oversized Page (200, Clamped)

```bash
curl "http://localhost:8080/api/products?size=5000"
```

**Verify:** `"size": 100` in the response. Clamped, not rejected — asking for a lot is greedy but meaningful.

---

## Unknown Category (200, Empty)

```bash
curl "http://localhost:8080/api/products?category=does-not-exist"
```

```json
{ "content": [], "page": 0, "size": 20, "totalElements": 0, "totalPages": 0 }
```

**Verify: 200, not 404.** A filter matching nothing is an empty result, not a missing resource.

---

# 🔓 Verifying Public Access (CH19 Regression)

```bash
curl -i http://localhost:8080/api/categories
curl -i http://localhost:8080/api/products
curl -i http://localhost:8080/api/products/iphone-16-pro
```

All three must return 200 **without** a token.

`/api/categories` needed its own `permitAll` line in `SecurityConfig` — CH19 enumerated `/api/products` and `/api/products/*` rather than using a wildcard, so the new route inherited nothing and would have 401'd.

---

# 🗄️ Inspecting the Generated SQL

Enable SQL logging in `application-dev.yml`:

```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

Then make a filtered request and read the log:

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

**What to check:**
- `WHERE`, `ORDER BY`, and `OFFSET/FETCH` are all present — nothing filtered in Java
- The ordering ends in `, p1_0.id` — the tie-breaker
- With no filters, there should be **no `WHERE` clause at all**
- A second `COUNT` statement — that's `totalElements`, unavoidable with offset pagination

---

## Verify Indexes Exist

```bash
psql -U cartwise -d cartwise_dev -c "\d products"
```

Look for:

```text
idx_products_category  btree (category)
idx_products_price     btree (price)
```

---

## Confirm the Functional-Index Gap

```bash
psql -U cartwise -d cartwise_dev -c "EXPLAIN SELECT * FROM products WHERE lower(category) = 'smartphone';"
```

**Expected:** a sequential scan, not an index scan — `idx_products_category` stores raw values and cannot satisfy a `lower()` predicate.

At 8 rows PostgreSQL would sequentially scan regardless, so this is a demonstration of the *shape* of the problem, not a performance measurement. The real fix needs a migration tool:

```sql
CREATE INDEX idx_products_category_lower ON products (lower(category));
```

`@Index` in JPA cannot declare this.

# 🎨 Verifying the Design Tokens

## Confirm Tokens Are Declared

```bash
cd frontend
grep -A 25 "@theme" src/index.css
```

Should show the 15 token declarations — six tile surfaces, two accents, and the semantic set.

---

## Count Hex Literals Outside @theme

```bash
grep -roE "#[0-9a-fA-F]{6}" src --include="*.ts" --include="*.tsx" | wc -l
```

**Expected: 0.** Zero hex values in TypeScript was the chapter's stated target, achieved by deleting `constants/colors.ts` and `constants/gradients.ts` (both had zero importers).

```bash
grep -oE "#[0-9a-fA-F]{6}" src/index.css | wc -l
```

**Expected: ~66** — 15 inside `@theme` plus the legacy `:root` block and component layer. Those 51 legacy values are documented debt in components this chapter did not touch, and are labelled in `index.css` as superseded and frozen.

---

## Verify Dead Colour Files Are Gone

```bash
ls src/constants/colors.ts src/constants/gradients.ts
```

**Expected:** `No such file or directory` for both.

---

## Measure a Contrast Ratio

Paste into the browser console to check any pair yourself:

```javascript
function luminance(hex) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = rgb.map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(hex1, hex2) {
  const l1 = luminance(hex1), l2 = luminance(hex2);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

// Every tile against ink and ink-muted
const ink = '#1F1A2E', inkMuted = '#5A5270';
const tiles = {
  mint: '#C6F0DA', butter: '#FBEEBE', blush: '#FBD8E4',
  sky: '#CDE3FB', lilac: '#DFD7FB', peach: '#FCDCC6'
};

Object.entries(tiles).forEach(([name, hex]) => {
  console.log(name, 'vs ink:', contrast(hex, ink), '| vs ink-muted:', contrast(hex, inkMuted));
});
```

**Expected:** every value above 4.5:1 for both. Measured results were 12.24–14.51 against ink, 5.30–6.29 against ink-muted.

---

# 🌐 Frontend Verification

## Homepage Renders

Open `http://localhost:5173`.

**Verify:**
- Hero rail, category tile grid, and promo cards all render
- Category tiles show real counts from `/api/categories`, not hardcoded numbers
- Console is clean (Vite HMR and React DevTools notices are fine)

---

## Category Tile Routes with a Filter

Click any category tile.

**Verify the URL contains the filter:**

```text
/browse?category=smartphone
```

Not just `/browse` with the filter held in component state.

---

## Filter State Survives Reload

Build a fully-filtered URL and hard-reload it:

```text
http://localhost:5173/browse?category=smartphone&sort=price-desc&inStock=true&minPrice=60000&maxPrice=130000
```

**Verify all four controls are restored:**
- Sort dropdown shows `price-desc`
- In-stock checkbox is checked
- Price inputs show 60000 and 130000
- The Smartphone chip is in its pressed state

---

## Browser Back Undoes One Filter

Apply three filters in sequence, then press Back once.

**Verify:** exactly one filter is removed, not all three. Each filter change should be its own history entry.

---

## Pagination Correctness

```text
http://localhost:5173/browse?size=3
```

**Verify:**
- 3 pages
- 3 + 3 + 2 = 8 products total
- No duplicates across pages
- `aria-current` is set on the active page button
- Previous is disabled on page 1, Next disabled on page 3

---

## Changing a Filter Resets the Page

Navigate to page 2, then change the category.

**Verify:** the URL drops back to page 0. Page 2 of a different result set renders empty and looks like "no results found."

---

## Hero Rail Keyboard Navigation

Focus the hero rail and press ArrowRight, then ArrowLeft.

**Verify `scrollLeft` actually changes:**

```javascript
document.querySelector('[data-hero-rail]').scrollLeft
// ArrowRight:  0 → 340
// ArrowLeft:   340 → 0
```

**This is the check that caught the `snap-center` bug.** With `snap-center` the rail was pinned at 0 and every control silently did nothing — no error, and a screenshot looked perfect. Reading `scrollLeft` was the only way to see it.

---

## Hero Rail Position Announcement

Load the page and don't touch the rail.

**Verify it announces "Highlight 1 of 4", not "2 of 4."** The bug was measuring against the rail's centre, where the middle card is nearest at rest — announcing a card the user had never scrolled to.

---

## Hero Rail Does Not Auto-Advance

Watch the rail for several seconds without interacting.

**Verify it does not move on its own.** `BannerCarousel` and its `useCarousel` `setTimeout` were deleted — auto-advance is a WCAG 2.2.2 violation.

---

## Reduced Motion

**⚠️ This is the chapter's one unverified item.** Close it here:

```text
DevTools → Cmd/Ctrl+Shift+P → "Emulate CSS prefers-reduced-motion: reduce"
→ hover a category tile (no lift)
→ reload the page (no stagger on the grid)
```

Confirm at the CSS level too:

```javascript
window.matchMedia('(prefers-reduced-motion: reduce)').matches
// should be true while emulation is active
```

What was verified in the build environment was only that the rules exist and are correctly gated — 16 elements carry `motion-reduce` classes, and framer-motion branches on `useReducedMotion()`. The OS setting could not be toggled there, so the rendered behaviour was never observed.

---

## Responsive Widths

DevTools device toolbar at 360, 768, and 1280.

| Width | Hero cards | Category cols | Product cols | Overflow |
|---|---|---|---|---|
| 360 | 1 | 2 | 2 | none |
| 768 | 2 | 3 | 3 | none |
| 1280 | 3 | 6 | 4 | none |

**Also verify:** the chip row scrolls horizontally at 360 and not above; no horizontal page scrollbar at any width.

---

## Focus Rings

Tab through the page.

**Verify every interactive element shows a visible ring:**

```text
FilterBar    9/9
Pagination   5/5
Cards        6/6
```

---

# 🔁 Regression Checks

## CH13 — Wishlist Accessibility After Restyle

Inspect a heart button before and after clicking:

```text
before:  aria-pressed="false"  aria-label="Add iPhone 16 Pro to wishlist"
after:   aria-pressed="true"   aria-label="Remove iPhone 16 Pro from wishlist"
```

Restyling a component is exactly when accessibility attributes get quietly dropped. Verify, don't assume.

---

## CH13 — Compare Cap

Select four products for comparison.

**Verify:** the other four cards become disabled with a message explaining why, and the four already selected remain clickable so you can deselect.

---

## CH14 — Cross-Tab Sync

Open two tabs, add a product to the wishlist in one.

**Verify** the other tab updates without a reload.

---

## CH17–CH19 — API Regression

```bash
# CH17
curl -i http://localhost:8080/api/products/iphone-16-pro     # 200
curl -i http://localhost:8080/api/products/no-such-slug      # 404

# CH18
curl -i http://localhost:8080/api/users/1/wishlist           # 401

# CH19
ADMIN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin-password"}' | jq -r .token)

curl -i http://localhost:8080/api/admin/users -H "Authorization: Bearer $ADMIN"   # 200
curl -i http://localhost:8080/api/admin/users                                     # 401
```

---

# 🌿 Git

```bash
git status
git add .
git commit -m "docs: add Chapter 20 product discovery and design system handbook"
git push origin main
```

**Note on this repo's history:** CH19 and CH20 code landed together in a single commit (`git add .` swept both), amended to a subject naming Chapters 18–20. The docs commit is separate. Not ideal, but recorded rather than hidden.

---

# 🔍 Debugging

## Category Counts Don't Sum to Total

```bash
psql -U cartwise -d cartwise_dev -c \
  "SELECT category, COUNT(*) FROM products GROUP BY category ORDER BY category;"
```

Compare against `/api/categories`. A mismatch means the aggregate query and the seed data disagree — usually a casing or whitespace inconsistency in `data.sql`.

---

## A Product Appears on Two Pages

The tie-breaker is missing or was dropped. Check the generated SQL:

```sql
order by p1_0.price desc, p1_0.id    ← the ", p1_0.id" must be there
```

Without it, tied rows have no defined order and can leak between pages.

---

## A Filter Silently Does Nothing

Check whether the Specification is being composed:

```bash
# With the filter
curl "http://localhost:8080/api/products?inStock=true"
# Without
curl "http://localhost:8080/api/products"
```

If `totalElements` is identical and the seed data has an out-of-stock product, the predicate isn't reaching the query. Read `show-sql` output — the `WHERE` clause tells you immediately.

---

## A Tile Colour Changed After Adding a Category

Colour must derive from a djb2 hash of the slug, not array position. The category list is alphabetical, so index-based colouring recolours every tile after an insertion.

```javascript
// Same slug must always produce the same index
hashToTileIndex('smartphone')   // stable across catalogue changes
```

---

## Tailwind Utility Doesn't Exist for a Token

The token is in a plain `:root` block rather than `@theme`. Tailwind generates utilities only from `@theme` — a `:root` variable is invisible to it.

---

# 📌 Command Summary

```bash
# Development
cd backend && mvn spring-boot:run
cd frontend && npm run dev

# Discovery API
curl http://localhost:8080/api/categories
curl "http://localhost:8080/api/products?category=smartphone&sort=price-desc&page=0&size=3"

# Validation
curl -i "http://localhost:8080/api/products?page=-1"          # 400
curl -i "http://localhost:8080/api/products?size=5000"        # 200, clamped
curl -i "http://localhost:8080/api/products?category=nope"    # 200, empty

# Checks
cd frontend && npx tsc --noEmit && npx eslint . --max-warnings=0
grep -roE "#[0-9a-fA-F]{6}" src --include="*.tsx" | wc -l     # expect 0
psql -U cartwise -d cartwise_dev -c "\d products"             # indexes

# Git
git add . && git commit -m "docs: add Chapter 20 handbook" && git push origin main
```

---

# 🎯 Next Steps

Open items carried out of this chapter:

- **Schema migrations (Flyway/Liquibase)** — needed for the `lower(category)` functional index, which `@Index` cannot express. This is now the strongest argument for adding migrations.
- **Reduced-motion runtime verification** — 30 seconds in DevTools, per above.
- **Wire wishlist and compare to the API** — the app is currently half-wired.
- **A real test suite** — `Tests run: 1` is a context-load smoke test, not coverage.
- **Palette and ProductCard unification** — two palettes and two cards still coexist.
