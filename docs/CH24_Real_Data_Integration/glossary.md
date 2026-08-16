# 📖 CH24 — Glossary

> **Project:** CartWise  
> **Chapter:** Real Data Integration

This glossary explains the important terms and concepts introduced while sourcing real product photography, researching live pricing options, and auditing every navigation element in CartWise.

---

# 🚫 Unfulfillable Requirement

An Unfulfillable Requirement is a task that, after genuine research, has no viable path to completion under the current constraints.

```text
Tried: eBay Browse, Pexels, Unsplash, PricesAPI, Amazon PA-API
Result: every one needs a human signup, a credit card, or approval
Conclusion: no viable free pricing API exists
```

Distinguished from giving up — the conclusion is only valid if every real option was actually tested, not assumed.

---

# 🔍 Verified vs. Assumed API Failure

Verified vs. Assumed API Failure is the difference between "I called it and got a 401" and "I read that it probably needs a key."

```text
Verified:  eBay Browse → 403 (actual response, actual status code)
Assumed:   "this API probably requires payment" (untested claim)
```

Only verified failures were used to justify closing Part A.

---

# 🖼️ Openverse

Openverse is a WordPress Foundation project that indexes openly-licensed and public domain media (primarily Creative Commons) and exposes it via a searchable API.

```text
Search a term
     ↓
Filter by license_type, mature
     ↓
Get back: URL, creator, license, ready-made attribution string
```

Chosen because it was the only image source that didn't require a human to complete a signup before any usable access was granted.

---

# 🔑 Rate Tier

A Rate Tier is the request quota an API grants, which can differ based on authentication status.

```text
Openverse unverified anonymous:  100/day,   5/hour
Openverse verified anonymous:    200/day,  20/minute
```

The design was built around the slower tier first, then made largely irrelevant by a cheaper search strategy.

---

# 🗂️ Category-Level Search

Category-Level Search is querying an image API once per product *category*, rather than once per individual product.

```text
Wrong: search "Amazfit GTR 4" → no useful CC-licensed results
Right: search "smartwatch"    → real, relevant, license-clean results
```

Cut the total API calls needed for 50 products from 50 down to 7 — one per category — which incidentally solved the rate-limiting problem this design started out working around.

---

# ⚖️ License Type Filter

A License Type Filter restricts search results to media whose license permits a specific use.

```text
license_type = commercial   → excludes non-commercial-only licenses
mature = false               → excludes adult content
```

Required because CartWise's broader context (ads, affiliate links elsewhere in the roadmap) makes a non-commercial-only image legally unusable, even if it looks fine visually.

---

# ✍️ Verbatim Attribution

Verbatim Attribution is storing an API's exact, pre-composed credit line rather than reconstructing one from separate fields.

```text
Stored exactly:
"Smartphone" by Insights Unspoken is licensed under CC BY-SA 2.0.
To view a copy of this license, visit [url].
```

Prevents a specific, easy-to-miss class of bug: a hand-assembled credit line can misstate a license's actual terms — e.g., crediting a CC0 (no attribution required) work as if it were CC BY (attribution required).

---

# 📜 CC0 / BY / BY-SA / PDM

These are specific Creative Commons license types, each with different obligations.

```text
CC0   — public domain dedication, no attribution required
BY    — attribution required
BY-SA — attribution required, derivative works must share alike
PDM   — public domain mark, no attribution required
```

CartWise's 50 seeded photos ended up spread across all four: 23 BY-SA, 23 BY, 3 CC0, 1 PDM — meaning correct, per-image attribution handling genuinely mattered, not just as a formality.

---

# 🐛 Misdiagnosis

A Misdiagnosis is a bug explanation that seems plausible, gets built around, and turns out to be wrong once directly tested.

```text
Claimed cause:  Vite's dev server returns 200-HTML for missing
                assets, so onError never fires
Actual cause:   loading="lazy" images below the fold, in a
                backgrounded browser tab, simply don't load yet
```

Both a real `404` and a real `200`-with-wrong-content-type were directly tested and both correctly triggered `onError` — falsifying the original theory.

---

# 🕵️ Root Cause vs. Plausible Cause

Root Cause vs. Plausible Cause is the distinction between an explanation that's actually been verified and one that merely fits the symptoms.

```text
Plausible: "the dev server quirk explains the stuck images"
Root cause: directly tested whether onError fires under both
            a real 404 and a 200-wrong-content-type — it does,
            under both — ruling the plausible explanation out
```

The chapter's second, corrected bug report is a direct example of this distinction being taken seriously rather than glossed over.

---

# 🙈 Backgrounded Tab

A Backgrounded Tab is a browser tab that isn't currently in focus — `document.visibilityState === "hidden"`.

```text
Foreground tab  → lazy images load as the user scrolls
Backgrounded tab → lazy images do not load at all, by design
                    (this is a real browser optimization,
                    not a bug)
```

The actual root cause of the "stuck" images originally misattributed to a server quirk.

---

# ⏱️ Unverifiable Guard

An Unverifiable Guard is a proposed fix that cannot be confirmed correct under the available testing conditions.

```text
Attempted: an IntersectionObserver-based loading guard
Problem:   its callback couldn't be reliably triggered under
           browser automation, due to the same visibility
           throttling that caused the original misdiagnosis
Decision:  do not ship it — ship only what can be verified
```

Shipping an unverified fix was explicitly rejected in favor of a smaller, provably-correct one.

---

# 🔗 Navigation Audit

A Navigation Audit is a manual, click-by-click check of every interactive element in a running application, confirming each one leads to a real, populated destination.

```text
Reading the router config    → confirms routes exist
Clicking every actual button → confirms buttons are wired
                                to those routes correctly

These are NOT the same check.
```

Performed against the live running app for this chapter, not inferred from source code alone.

---

# 💀 Dead Link (Left Dead, Deliberately)

A Dead Link Left Dead is a non-functional link that is intentionally not repointed, with the reason for that decision recorded.

```text
"Visit store" (Amazon, Flipkart, etc.)
     → left dead: scoped into a later monetization chapter,
       wiring it now would be building ahead of that decision

Footer "Privacy Policy" / "Terms"
     → removed, not repointed: no such policy exists yet,
       and pointing it at the catalogue would falsely imply
       one does
```

Distinguished from a link that's simply broken and forgotten — the difference is that the reasoning is written down.

---

# 🎭 Mock/Real Data Split

The Mock/Real Data Split is when different parts of the same application read from two different, disagreeing data sources for what should be the same content.

```text
/browse         → real 50 seeded products, real photos
/search          → separate mock catalogue, 20 products,
                    placeholder images
```

Flagged independently by both the navigation audit (Part C) and the image-fetching work (Part B) in this chapter — the same underlying gap surfacing from two different angles.

---

# 🔁 Idempotency Check

An Idempotency Check confirms that running an operation a second time has no unintended additional effect.

```text
First run:   {"updated": 50, "skipped": 0}
Second run:  {"updated": 0,  "skipped": 50}
```

Proves the image backfill job can be safely re-run without re-fetching or duplicating data — a real property tested, not assumed from the code's structure.

---

# 🔒 Auth-Gated Backfill Endpoint

An Auth-Gated Backfill Endpoint is an administrative operation (like triggering an image fetch for all products) that requires authentication to invoke.

```text
Unauthenticated POST → 401
```

Confirmed by actually sending an unauthenticated request and checking the response, not by reading the security config and assuming it's correctly applied.
