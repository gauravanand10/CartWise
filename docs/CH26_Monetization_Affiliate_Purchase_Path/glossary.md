# 📖 CH26 — Glossary

> **Project:** CartWise
> **Chapter:** Monetization — Affiliate Purchase Path

This glossary explains the important terms and concepts introduced while turning CartWise into a monetized, honestly-presented product.

---

# 💰 Affiliate Marketing

Affiliate Marketing is earning a commission when a referred visitor completes a purchase on someone else's site.

```text
CartWise            compares products, sends the reader elsewhere
Retailer's site      the actual purchase happens here
Commission            paid to CartWise only if that purchase happens
```

CartWise never holds the money, the inventory, or the transaction itself.

---

# 🏷️ Affiliate Tag

An Affiliate Tag is the credential embedded in an outbound URL that tells a retailer which affiliate to credit for a sale.

```text
https://www.amazon.in/s?k=iPhone+16&tag=cartwise-test-00
                                     └── the tag
```

Different retailers use different parameter names for the same idea — `tag=` for Amazon, `affid=` for Flipkart.

---

# 🧩 tag-param

`tag-param` is the name of the query parameter a given retailer expects its affiliate tag under.

```text
Amazon     tag-param = tag
Flipkart   tag-param = affid
Other 3    tag-param = unknown (no first-party program exists)
```

Stored as configuration, not hardcoded, because it varies per retailer and would otherwise require a code change to add a new one.

---

# 🎛️ Configuration-Driven Credential

A Configuration-Driven Credential is a value the system reads from environment variables rather than source code, so swapping a placeholder for a real one requires zero code changes.

```text
Placeholder tag set   → status: PLACEHOLDER
Real tag set          → status: PAID
                          (same code path either way)
```

Proven by test: constructing the same service with a real-looking tag instead of the placeholder flips both the URL and the reported status.

---

# 🔀 Server-Side Redirect (302)

A Server-Side Redirect is an HTTP response telling the browser to go somewhere else, issued by the backend rather than a link written directly in the frontend.

```text
GET /api/affiliate/click/amazon/iphone-16-pro
        ↓
302 Found
Location: https://www.amazon.in/s?k=iPhone+16+Pro&tag=cartwise-test-00
```

This keeps the real affiliate tag out of the frontend entirely — the browser never sees it until the backend hands it over in the redirect.

---

# 📇 Click Record

A Click Record is a single row logged when a reader is redirected to a retailer, used to measure how often affiliate links are actually used.

```text
affiliate_clicks
  product_id | user_id (nullable) | retailer | clicked_at
```

Deliberately minimal — no IP address, no user agent, no request body. Only what's needed to attribute a click to a product and, if signed in, a user.

---

# 👤 Anonymous Attribution

Anonymous Attribution is recording a click without tying it to a specific user, because the reader wasn't signed in or the request carried no auth token.

```text
Signed-in click     user_id = 5
Anonymous click      user_id = NULL
```

A plain `<a href>` navigation sends no Authorization header even for a signed-in user, which is why the click endpoint accepts a POST from JavaScript as well — the fallback link alone would misclassify every signed-in click as anonymous.

---

# 🗑️ ON DELETE CASCADE vs ON DELETE SET NULL

Two different foreign-key behaviours, chosen deliberately per relationship rather than picking one default.

```text
Product deleted   → its clicks are deleted (CASCADE)
                     the click was about that specific product
User deleted      → their clicks survive, anonymised (SET NULL)
                     the referral happened regardless of who made it
```

---

# ⚖️ Clear and Conspicuous Disclosure

Clear and Conspicuous Disclosure is the FTC-derived standard that a paid link must be disclosed in a way "difficult to miss," not buried in a footnote or a collapsed section.

```text
Wrong    disclosure exists somewhere, technically, if you look hard enough
Right    disclosure is always visible, same text size as what it explains
```

Applied here as: an always-rendered notice above every set of offers, a per-link label, and a dedicated disclosure page — never a tooltip, never a `<details>`.

---

# 🚦 PAID / PLACEHOLDER / NONE

A three-state status replacing an earlier boolean for whether a given retailer's link is actually earning anything.

```text
PAID          a real, approved affiliate tag is configured
PLACEHOLDER   only the test tag is configured — earns nothing
NONE          no affiliate program exists for this retailer at all
```

The boolean version this replaced rendered "Yes, this is a paid affiliate link" for a retailer running on the placeholder — a false statement about a real commercial relationship. Caught before shipping.

---

# 🪣 Rate-Limit Bucket Reuse

Rate-Limit Bucket Reuse is applying Chapter 25's existing token-bucket limiter to a new endpoint rather than building a second rate-limiting system.

```text
Click endpoint     new bucket, 30 requests/minute per IP
Retailer list      exempt — throttling a legally required disclosure
                    over a commercial concern would be backwards
```

---

# ➕ Additive Migration

An Additive Migration only inserts new rows or adds new structure — it never deletes or renumbers what already exists.

```text
V6__expand_catalogue_to_100.sql
  IDs 1-50   untouched
  IDs 51-100 new
```

Chosen specifically so nothing that already referenced a product by ID — a wishlist entry, a comparison row, a click record — could be silently orphaned by the migration.

---

# 🧪 Orphan Proof

An Orphan Proof is a test performed against a scratch database, not an assumption, confirming that a migration doesn't break existing foreign-key references.

```text
Scratch DB → migrate to V5 → insert wishlist/comparison/click rows
           → apply V6 → check for orphans

Result: 0 orphans across all three tables
```

---

# 🗂️ Data Fork

A Data Fork is when two different parts of a system each hold their own copy of what should be one source of truth, and they're allowed to drift apart.

```text
Database          100 real products (the real source of truth)
Local file         23 products, never grown when the DB grew
Detail page        read the local file → 78 of 100 products 404'd
```

Found in this chapter, dating back to the very first schema migration. Fixed by deleting the local file and reading the database everywhere.

---

# 🧬 Category-Level Spec Template

A Category-Level Spec Template is a fallback data structure describing typical specs for a category (e.g. "Smartphone") rather than the exact specs of one specific product.

```text
Individually researched   23 products — real, product-specific specs
Category template          77 products — generic per-category values
```

Named here as a known, deliberate gap: the database has no columns for structured specs, and inventing per-product values to fill them would be fabrication, not data entry.

---

# 🎨 Design System (Tokens)

A Design System, in this chapter's sense, is a small fixed set of colors, type sizes, and spacing values defined once and reused everywhere, instead of one-off values scattered through components.

```text
Neutral scale      backgrounds, borders, text
Accent (one color)  primary CTAs, active states, badges — nothing else
Type scale          a handful of sizes, not a dozen
Spacing scale        a handful of gaps, not arbitrary pixel values
```

---

# 🎯 Accent Discipline

Accent Discipline is the rule that a single accent color is used sparingly and consistently — if everything is accented, nothing reads as important.

```text
Primary CTA        accent
Active/selected     accent
Section headers     neutral
Secondary links      neutral
```

Audited after the redesign by counting every filled-accent occurrence and checking each one was a genuine primary action.

---

# 🔬 Contrast Ratio (WCAG AA)

A Contrast Ratio is a measured number describing how distinguishable two colors are, calculated from relative luminance — not judged by eye.

```text
Text on background   must clear 4.5:1 for WCAG AA
Non-text elements     lower threshold (3:1) applies, but only for non-text use
```

Every text pairing in this chapter's design system was measured and documented; the one token below 4.5:1 is explicitly restricted to non-text use in code.

---

# 💥 Utility Class Collision

A Utility Class Collision happens when a custom CSS rule accidentally generates a class name identical to one a framework already defines, and the custom one wins by loading later.

```text
Tailwind's rule    .inline-block { display: inline-block; }
Custom token rule   .inline-block { inline-size: 2.5rem; }   ← declared later, wins
```

Caused by a spacing token (`--spacing-block`) whose generated utility name collided with Tailwind's own `inline-block` display utility, silently pinning every `inline-block` element in the app to a fixed width. Root-caused and removed rather than patched around.

---

# 🚫 Fabricated Claim

A Fabricated Claim is a specific, concrete statement presented as fact with no real data behind it.

```text
"AI score: 96"                    no model produced this number
"Price dropped in last 90 days"   no price history is tracked
"Get it by Thursday"              CartWise ships nothing
"No-cost EMI"                     CartWise offers no financing
```

The standard applied throughout this chapter: remove the claim, or replace it with something true — never leave a plausible-sounding invented number in its place.

---

# 🕵️ Dependency Check (before deletion)

A Dependency Check is searching the entire codebase for every reference to something before removing it, so a deletion doesn't leave a dangling import or a broken test.

```text
grep the component/constant/type name across all of src/
        ↓
Confirm every reference before cutting it
        ↓
Delete cleanly, or fix what depended on it first
```

Applied to every removal in this chapter — fabricated homepage sections, dead pricing utilities, an unused type field — before any of it was deleted.
