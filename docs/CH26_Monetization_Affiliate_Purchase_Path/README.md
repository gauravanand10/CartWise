# 💰 CH26 — README

> **Project:** CartWise
> **Chapter:** Monetization — Affiliate Purchase Path

This chapter turns CartWise from a pure comparison site into one that can actually earn — wiring the five "Visit store" links Chapter 24 deliberately left dead into real, tracked, disclosed affiliate redirects, then following the same standard of honesty outward: a real 100-product catalogue, a full visual redesign, and the removal of every fabricated claim (fake AI scores, fake price history, fake delivery promises, fake financing terms) that had been quietly sitting on the site.

---

# 🎯 Why This Chapter Exists

CartWise has never processed a payment, held inventory, or shipped anything. It compares products and sends readers elsewhere to buy. Chapter 24's navigation audit found five outbound retailer buttons (Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales) and left every one of them dead on purpose — wiring them to real money was explicitly out of scope until this chapter.

```text
Before   "Visit store" buttons exist, go nowhere. 23 mock products.
         Homepage carries fake AI scores, fake "price dropped 90 days"
         claims, fake EMI and delivery promises.
After    Buttons redirect through CartWise, tagged for commission,
         tracked, disclosed. 100 real products. Every commercial claim
         on the site is either real or removed.
```

---

# 🧭 The Affiliate Model, Precisely

CartWise earns a commission if a reader clicks through and buys on the retailer's own site. CartWise never touches the transaction.

```text
Reader clicks "Visit store"
        ↓
CartWise backend builds the real affiliate URL
        ↓
302 redirect → retailer's own site
        ↓
Purchase (or not) happens entirely off CartWise
```

No cart. No checkout. No payment processing. The only two things CartWise adds are the affiliate tag in the outbound URL and a row recording that the click happened.

---

# 🔍 What Real Affiliate Access Actually Requires

Researched, not assumed:

```text
Amazon Associates (amazon.in)
  Self-serve application, discretionary approval.
  180 days to refer 3 qualifying sales or the application can be withdrawn.
  Link parameter: ?tag=

Flipkart Affiliate
  Direct sign-ups paused since 5 May 2018, never reopened.
  Reachable only through affiliate networks (Cuelinks, EarnKaro, CJ, Rakuten).
  Link parameter: affid=

Croma / Reliance Digital / Vijay Sales
  No first-party program with a documented URL parameter.
  Network-only. No parameter was invented — it ships empty rather than guessed.
```

Applying for and being approved for a real account requires a human, outside this session. The system is built so the moment a real credential exists, nothing in the code changes.

---

# ⚙️ Configuration-Driven, Not Hardcoded

Every field that changes on approval lives in environment variables, per retailer:

```text
tag           the credential itself
tag-param     tag (Amazon) vs affid (Flipkart) vs unknown (the other three)
search-url    the URL shape to build the redirect against
```

Proven, not asserted: a test constructs the same config with a real-looking tag instead of the placeholder and asserts the URL and status both flip — zero production code differs between placeholder and real.

---

# 🗄️ Click Tracking

`V5__add_affiliate_clicks.sql` — never editing anything before it:

```text
affiliate_clicks
  id           bigint identity
  product_id   → products(id)  ON DELETE CASCADE
  user_id      → users(id)     ON DELETE SET NULL   (nullable — anonymous allowed)
  retailer     varchar(40)
  clicked_at   timestamptz
```

Deliberately not stored: IP address, user agent, referrer, request body, any device identifier.

The two foreign-key rules differ on purpose:

```text
Product deleted   → its clicks are deleted too (the click was about that product)
User deleted      → their clicks survive, anonymised (the referral happened
                     regardless — an erasure request shouldn't erase history
                     that isn't personally identifying anymore)
```

Both attribution paths are demonstrated in real rows — anonymous (`user_id NULL`) and signed-in — not just designed for.

---

# 🔀 Server-Side URL Construction

The frontend never sees a real or placeholder affiliate tag — it only names a retailer and a slug:

```html
<a href="/api/affiliate/click/amazon/iphone-16-pro" rel="sponsored nofollow noopener">
```

The backend resolves that into the real, tagged retailer URL and issues a 302. A test asserts the rendered page markup never contains the tag string or a raw `tag=` parameter — it fails the moment anyone reintroduces it.

Search URLs for all five retailers were built by driving each retailer's own search box in a real browser and reading back what it produced — not guessed and not trusted from `curl`, since three of the five returned misleading HTTP 200s for broken searches when hit directly.

---

# 🚦 Rate Limiting

The click endpoint reuses Chapter 25's token-bucket limiter — its own bucket, 30 requests/minute per client IP. Click-tracking endpoints are a realistic abuse target. The retailer-list endpoint that backs the disclosure page is explicitly exempt — throttling it would break a legally required disclosure over a commercial concern.

---

# ⚖️ Disclosure

Required under FTC-style guidance ("clear and conspicuous... difficult to miss"), not a design nicety. Two places:

```text
Inline   — an always-visible notice above every set of retailer offers,
           plus a small "Affiliate link" label under each individual button
Page     — a dedicated /affiliate-disclosure page, footer-linked
```

The disclosure page reports real status per retailer — `PAID`, `PLACEHOLDER`, or `NONE` — rather than a boolean. An earlier boolean version rendered "Yes, this is a paid affiliate link" for retailers running on the test placeholder, a false statement about a real commercial relationship on the one page a reader is entitled to a true one. Caught and fixed before shipping.

---

# 📊 Admin Analytics

A minimal, real, admin-only view over `affiliate_clicks` — total clicks, split by attribution and by retailer — reusing the existing admin-role pattern. Verified: reachable with an admin token, `403` for a signed-in non-admin, `401` for anonymous.

---

# 🛒 Catalogue: 23 Mock Products → 100 Real Ones

The catalogue grew from 23 to 100 real, hand-researched products across 7 categories — real brands, real model names, real specs — added additively (`V6__expand_catalogue_to_100.sql`) so existing product IDs, and every wishlist/comparison/click row referencing them, were left untouched.

```text
Smartphone 22 · Laptop 16 · Accessories 16 · Earbuds 12
Television 12 · Headphones 11 · Smartwatch 11
```

Two model names that couldn't be verified as real (Galaxy Buds 4 Pro, Sony WF-1000XM6) were corrected in place — updated to the real current models, IDs preserved — rather than deleted and re-inserted, precisely so the affiliate and wishlist rows pointing at them wouldn't orphan. That guarantee was proven, not assumed: rows were written against the affected products on a scratch database, the migration applied on top, and every row survived with zero orphans.

Prices remain illustrative reference values, not live quotes — no free live pricing API exists (confirmed by research in Chapter 24, reconfirmed here). Anywhere the UI implied otherwise, the copy was corrected to say so explicitly.

A second, deeper gap was found and closed while wiring this up: the product *detail* page had never actually read from the database. It read from a static local file that mirrored only the original 23 products — a fork dating back to the very first schema migration, which said outright in its own header comment that the database was "mirrored from the frontend catalogue." Nobody had grown the local file when the catalogue grew, so 78 of 100 products silently 404'd on their own detail page. The service layer was rewritten to read the real API for all 100 products, and the local file was deleted outright — not patched, retired.

Structured per-product specs (screen size, RAM, processor, etc.) were found to have never been stored in the database at all — only name, brand, price, and rating existed as real columns. Rather than fabricate spec data or silently fall back to generic per-category templates for the 77 newly added products, this was flagged explicitly: specs live in a frontend template file, covering all 100 products at the category level with 23 individually researched per-product overrides carried over from the original catalogue. This is named here as a known, deliberate gap rather than something quietly resolved either way.

---

# 🎨 Visual Redesign

The site had never had a deliberate design pass. This chapter defined one real design system — a small neutral palette, a single accent color used only for primary actions and active states, a type scale, and a spacing scale — and applied it everywhere: navbar, product cards, detail pages, wishlist, compare, auth, admin, the disclosure page.

The homepage was rebuilt from ten sections to four, every one backed by real data:

```text
Hero              the catalogue's real best-rated product, real photo, one accent CTA
Category grid     real per-category counts against the 100-product catalogue
Two rails         rating-desc and a price band, both live API queries
Promo row         links to real existing routes, no data claims
```

A "Recently added" rail was deliberately not built — the product API has no `created-desc` sort, and faking the section from a different ordering would have repeated the exact problem this chapter was busy fixing elsewhere. Reported as a small, explicit backend gap instead.

A real, site-wide layout bug was found and root-caused during this pass: a custom spacing token (`--spacing-block`) collided with Tailwind's own generated utility class name, silently overriding `.inline-block` to a fixed 40px width across the entire application for the whole chapter. This also explained an earlier, previously-unresolved layout workaround — once identified, the workaround was replaced with the real fix and the stale comment describing it was corrected.

Contrast was measured, not eyeballed — every text pairing clears WCAG AA (4.5:1), with the one sub-AA token explicitly restricted to non-text use and documented as such in code.

---

# 🧹 Fabricated Claims Removed

Auditing the affiliate and redesign work surfaced a wider pattern: multiple parts of the site were making concrete claims about things that don't exist. All were removed, dependency-checked before deletion the same way as everything else in this chapter:

```text
Fake "AI score" badges              no model backs them — removed
"Price dropped in last 90 days"     no price history is tracked — removed
"Refreshed hourly"                  nothing is refreshed — removed
Fake customer reviews               fabricated reviews are a real legal
                                     exposure, not just a style issue — removed,
                                     replaced with an honestly labelled note
                                     derived only from real catalogue figures
"No-cost EMI"                       CartWise offers no financing — removed
"Free delivery" / "Get it by {date}"  CartWise ships nothing — removed
"10-minute delivery"                false on every level — removed
Hardcoded retailer delivery times   same claim, per offer row — removed
"EMI per month" comparison ranking  ranked products on a fabricated number — removed
```

Where a genuine gap was left by a removal, it was filled with something true rather than left blank or re-invented — for example, pricing/delivery/financing terms are now stated plainly as set by the retailer, not by CartWise, with a link to the disclosure page.

---

# 🚧 Known Gaps, Named Rather Than Hidden

```text
No real affiliate account          Placeholder tag only — applying requires a human
Links go to retailer search        No per-product SKU mapping exists yet
Anonymous vs attributed split      Non-JS/middle-click fallback loses attribution
                                    but still counts, so the split isn't fully clean
Per-JVM rate limiter               Multiple replicas would multiply the effective limit
Specs still template-based         77 of 100 products use category-level spec
                                    templates rather than individually stored data
No "Recently added" rail           Blocked on a backend sort the API doesn't support
Hardcoded retailer star ratings    Still present on offer rows, same unverified-
                                    number problem as what was removed — flagged,
                                    not yet taken
Hero photography quality           Category-matched via Openverse, not guaranteed
                                    to visually match the specific featured product
```
