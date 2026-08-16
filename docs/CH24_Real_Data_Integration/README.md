# 📸 CH24 — Real Data Integration

> **Project:** CartWise  
> **Chapter:** Real Data Integration  
> **Feature:** Live Photography, Navigation Audit, Pricing Research

---

# 👋 Welcome

Every chapter before this one built real infrastructure around fake content. Fifty products, seeded once, with `placehold.co` gray boxes standing in for photos and prices typed in by hand. It worked — the app was never wrong on purpose — but it also never looked like something a stranger would trust.

This chapter had one blunt goal:

> **Make the parts of the site people actually look at be real.**

That split into three genuinely different problems, and they didn't turn out equally solvable:

```text
📸 Real product photography  → solved
🔗 Every button goes somewhere real → solved
💰 Live prices from a real pricing API → could not be solved, honestly
```

The third one is the most important result in this chapter, and it isn't a failure. Every free pricing API that was tested either required a credit card, an approval process, or — in the one case that looked promising — a human filling out a web form no agent can complete. Rather than quietly substituting fabricated data (DummyJSON, FakeStore — both keyless, both fake) and calling it "live pricing," the chapter closed that part out as unfulfillable and said so plainly. A wrong number with a confident label is worse than an honest gap.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- Why a free-tier check has to mean actually calling the API, not reading its marketing page.
- Why "no viable option exists" is sometimes the correct, honest final answer to a research task.
- Why searching once per category beat searching once per product — a cheaper design that also happened to solve a rate-limit problem as a side effect.
- Why Creative Commons attribution has to be stored verbatim, not reassembled from parts.
- Why a self-diagnosed bug can turn out to be a misdiagnosis, and what it looks like to correct that honestly instead of leaving a bad fix in place.
- Why `loading="lazy"` combined with a backgrounded browser tab can look exactly like a broken image loader, and isn't.
- Why a navigation audit has to be performed by actually clicking through a running app, not by reading the router configuration.
- Why some dead links should stay dead, deliberately, with the reason recorded — not silently repointed to something plausible-looking.

---

# 🧭 What This Chapter Actually Covers

```text
🔍 Research: which free APIs are real?
       ↓
🚫 Pricing — no viable free option, closed honestly
       ↓
📸 Photography — Openverse, verified working
       ↓
🖼️ 50 products, real CC-licensed photos, persisted
       ↓
🔗 Full navigation audit, every button checked by hand
       ↓
🐛 A self-correction: a "bug fix" from an earlier session
   turned out to be based on a wrong diagnosis
       ↓
✅ Honest final report
```

---

# 🤔 "No Viable Option" vs. "I Didn't Try Hard Enough"

These look the same from the outside — an empty result — and they are not the same thing. The difference is what was actually attempted before concluding.

**What was tried, with real calls, not assumptions:**

```text
eBay Browse API        → 403 (real request, real rejection)
Pexels                 → 401 (real request, needs a key)
Unsplash               → 401 (real request, needs a key)
PricesAPI               → advertises 1,000 free calls/month,
                          no programmatic signup — web form only
Amazon PA-API           → requires an approved affiliate account
DummyJSON / FakeStore   → keyless, but the data is fabricated
```

Every one of those is a documented, verified outcome — not a guess. The conclusion "no viable free pricing API exists without a human-completed signup" is earned, not assumed. That distinction is the entire point of doing research honestly: the value isn't in finding an API, it's in being able to prove you actually looked.

---

# 📸 Choosing Openverse

Openverse (a WordPress Foundation project indexing Creative Commons media) was the one candidate that answered without a human in the loop — a programmatic registration returned a working OAuth2 token immediately, no email click required to get *something* working, though a verification email did exist and raising the rate tier did depend on it.

```text
Unverified anonymous tier:  100 requests/day,   5/hour
Verified anonymous tier:    200 requests/day,  20/minute
```

The chapter's design was built around the slower tier first — a paced batch job, because 50 products at 5/hour would take 10 hours. Then a cheaper design made that whole calculation unnecessary.

---

# 🔑 Search Once Per Category, Not Once Per Product

Openverse indexes Creative Commons *media*, not product SKUs. Searching for the literal product name — `"Amazfit GTR 4"` — returns nothing useful, because nobody licenses a stock photo of a specific smartwatch model under CC and tags it with that exact name.

The fix wasn't a better search string. It was a different question:

```text
Wrong question:  "What does an Amazfit GTR 4 look like?"
Right question:  "What does a smartwatch look like?"
```

```text
7 categories → 7 searches → distributed across 50 products
```

Seven requests fit comfortably inside even the *unverified* rate tier, several times over — which means the whole rate-limit-pacing problem this design started out solving for turned out not to matter. A cheaper, simpler approach solved a harder problem as a side effect of solving an easier one correctly.

---

# ⚖️ Licensing, Handled Correctly

Two filters were applied to every Openverse query:

```text
license_type = commercial   (excludes non-commercial-only images —
                              CartWise runs ads/affiliate links elsewhere,
                              a non-commercial license there would be unlawful)
mature = false
```

And the attribution string returned by the API is stored **verbatim**, not reconstructed:

```text
"attribution": "\"Smartphone\" by Insights Unspoken is licensed
under CC BY-SA 2.0. To view a copy of this license, visit
https://creativecommons.org/licenses/by-sa/2.0/."
```

This detail matters more than it looks. A hand-assembled credit line — creator name here, license type there, glued together by a template — is exactly how a `CC0` (no attribution required at all) work ends up wrongly credited as `CC BY` (attribution required), or how a `BY-SA` work's share-alike terms get silently dropped from the copy. Storing the API's own composed string sidesteps that entire class of mistake.

**Final license distribution across all 50 products:**

```text
by-sa   23
by      23
cc0      3
pdm      1
```

---

# 🐛 A Bug That Wasn't the Bug It Looked Like

This is worth its own section, because it's the most instructive part of the chapter.

An earlier pass reported that `SafeImage`'s error-handling had a hole: 23 homepage images sat permanently in a "still loading" state, and the theory was that Vite's dev server was returning `200 text/html` for missing asset paths instead of a real `404` — meaning the browser's `onError` event would never fire, and the fallback would never engage.

A fix was built around that theory. And it was wrong.

```text
The real cause:
  loading="lazy" images, below the fold,
  in a browser tab that was backgrounded (visibilityState: "hidden")
       ↓
  Lazy images simply do not load at all while the tab is hidden
       ↓
  Looks identical to "stuck, broken image loader"
  from the outside — but nothing was actually broken
```

The correct diagnosis only came from directly testing whether a real `404` and a real `200`-with-wrong-content-type both correctly triggered `onError` — they did, both of them. The original theory was falsified by the exact test that was supposed to confirm it.

**What makes this worth documenting rather than quietly fixing:** the first fix — a 10-second timeout that would swap in a fallback glyph if an image hadn't finished loading — was already built and would have shipped. Had it gone out, it would have replaced every legitimate below-the-fold photo with a broken-image icon before a user ever scrolled down to see it, purely because the tab happened to be backgrounded when the timer fired. Removing that fix, going back to first principles, and shipping only what could be verified — `onError` plus an `onLoad`-with-zero-`naturalWidth` check — is a better outcome than leaving a plausible-looking fix for a problem that didn't exist.

A more sophisticated `IntersectionObserver`-based guard was attempted next and abandoned for the same reason: it couldn't be verified under browser automation, where the same visibility throttling made the callback unreliable to test. Shipping an unverified guard was rejected in favor of the smaller, provably-correct version.

---

# 🔗 The Navigation Audit

Every clickable element in the frontend was tested by actually running the app and clicking, not by reading `App.tsx`'s route table and assuming the buttons pointing at those routes were wired correctly.

**What was found dead, and fixed:**

```text
CategoryStrip (9 chips)     → 4 fake category names, no handler at all
                                → now 7 real categories from /api/categories

Hero search field           → no <form>, did nothing on Enter
                                → now submits to /search?q=

Header search bar            → same bug, every page
                                → fixed the same way

"Popular:" search chips ×5  → filled the input, went nowhere
                                → now navigate to /search?q=

7 section CTAs               → no handler wired at all
                                → 6 now route to filtered /browse

10 brand tiles                → <button>, no handler
                                → now /browse?brand=<name>, all 10 verified populated

Notifications bell            → to="#" (resolved to the current page)
                                → removed entirely; no feature exists behind it

Breadcrumb category link     → pointed at /search, which serves mock data
                                → repointed to /browse, which serves the real 50

Footer: 6 links               → About, How Scoring Works, Careers, Contact,
                                  Privacy, Terms — all silently pointed at "/"
                                → removed

Footer: 5 links                → all pointed at unfiltered /search
                                → repointed into /browse with real sort/filter params
```

**What was left dead on purpose, and why that's the correct call:**

```text
5 "Visit store" links (Amazon, Flipkart, Croma,
Reliance, Vijay Sales)

→ These are exactly the outbound retailer links
  scoped into a later monetization chapter.
  Wiring them here would be building ahead of
  when that decision actually gets made.
```

```text
Footer legal links (Privacy, Terms) and
"How scoring works"

→ No privacy policy, terms of service, or scoring
  explanation page exists yet. Repointing these at
  /browse would answer a question nobody asked —
  a "Privacy Policy" link that leads to a product
  catalogue is arguably worse than no link at all,
  because it implies a policy exists when it doesn't.
```

Removing a link and stating why is a real design decision. Quietly repointing it to something that merely stops the 404 is not the same thing, even though both make the audit checklist look "done."

---

# 🐞 A Second, Smaller Bug Found Along the Way

While fixing the search box, a pre-existing split surfaced: `/search` was serving an entirely separate mock catalogue (20 products, `placehold.co` images) and never calling the real API at all, while `/browse` served the real 50 seeded products. `useSearch` was updated to accept `?q=` and `?category=` so the search box works end-to-end — but the underlying mock/real split between the two pages was not resolved, because that's a bigger fix than this chapter's scope, and it was flagged rather than silently absorbed into "navigation audit, done."

---

# 📋 Verification Performed

**Real API response, unparaphrased:**

```json
{
  "id": "cf510223-...",
  "title": "Smartphone",
  "url": "https://live.staticflickr.com/671/21135682726_f8f6da6372_b.jpg",
  "creator": "Insights Unspoken",
  "license": "by-sa",
  "license_version": "2.0",
  "attribution": "\"Smartphone\" by Insights Unspoken is licensed under CC BY-SA 2.0. ..."
}
```

**Backfill result:**

```json
{"updated": 50, "skipped": 0, "unmatched": 0, "unmatchedSlugs": []}
```

**Persisted rows, confirmed via direct query:**

```text
slug                       image_url                              license  creator          fetched_at
iphone-16-pro              live.staticflickr.com/2463/...jpg      by-sa    liewcf           2026-08-16 18:34:20
samsung-galaxy-s25-ultra   live.staticflickr.com/7575/...jpg      by-sa    anykeyh          2026-08-16 18:34:20
google-pixel-10            live.staticflickr.com/...jpg           by-sa    Lars Plougmann   2026-08-16 18:34:20
```

**Photos confirmed real, not just linked:** every stored URL was fetched directly — all returned `HTTP 200`, `image/jpeg`, 98KB–180KB. In the browser, all 11 smartphone-category images reported `loaded: 11, broken: 0` at real resolutions (681×1024, 1024×768, etc).

**Idempotency, actually tested:** running the backfill a second time returned `{"updated": 0, "skipped": 50}` — nothing re-fetched, nothing duplicated.

**Auth enforced:** an unauthenticated `POST` to the backfill endpoint returned `401`.

**Test suite:**

```text
Backend:   359 tests, 0 failures  (up from 351 — 6 new image-service tests,
                                    2 new mapper tests)
Frontend:  127/127 passed, tsc --noEmit clean
```

---

# ⚠️ What's Now Worse

Stated plainly, because a chapter that only lists wins isn't trustworthy.

**Category photos aren't SKU photos.** The iPhone 16 Pro is illustrated by a real, correctly-licensed, category-relevant smartphone photo — that is visibly not an iPhone. This was the accepted design from the start (real photography from a free source cannot mean manufacturer-exact photography), but it's conspicuous enough on the actual page to be worth restating rather than letting it pass silently.

**Only `/browse` shows real photos.** `/search`, `/product/:slug`, and other surfaces still read from the mock catalogue (20 products, `placehold.co` placeholders). Rewiring every feature to the real API is a bigger job than an image chapter, and it's the same mock/real split the navigation audit flagged independently — now confirmed from two different angles in the same chapter.

**The lazy-load-plus-backgrounded-tab edge case is documented, not eliminated.** `SafeImage` handles the two failure modes that can actually be verified (`onError`, `onLoad`-with-zero-width). The genuinely stalled case — an image that would load, but hasn't yet because the tab is hidden — is a real state, correctly left alone rather than "fixed" with an unverifiable guard.

**Brand tile subtitles are still mock copy.** `?brand=Apple` correctly returns 7 real products, but the tile above the link still displays a fabricated count like "248 products."

---

# 🌟 Why This Chapter Matters

Every other chapter in this project added something. This is the first one whose most important result is a documented "no" — and the value isn't in the no itself, it's in the discipline that produced it: real calls, real error codes, real evidence that the search was actually exhaustive before concluding there was nothing to find.

It's also the first chapter that caught its own mistake mid-project and said so, instead of letting a wrong diagnosis quietly stand because admitting it looked worse than staying silent. A fix for the wrong bug is worse than no fix at all, because it looks finished.

```text
Prove the API is fake before rejecting it
Prove the data is real before shipping it
Prove the bug is the bug before fixing it
Prove the fix works before reporting it
```

None of those are exciting. All of them are why this chapter can actually be trusted.

---

# 📌 Key Takeaways

After Chapter 24:

- All 50 seeded products have real, Creative Commons-licensed photography, verifiably fetched and persisted — not placeholders.
- No free live-pricing API could be found without a human-completed signup; this was closed honestly rather than faked.
- Searching once per category instead of once per product cut Openverse API usage from 50 requests to 7 — solving a rate-limit problem by making it irrelevant, not by working around it.
- Attribution strings are stored exactly as the API returns them, avoiding the class of bug where a hand-assembled credit line misstates a license's actual terms.
- A previously-reported bug diagnosis was found to be wrong, its incorrect fix was removed before shipping, and the correct root cause (lazy-loading plus a backgrounded tab) was identified and documented.
- Every clickable element in the frontend was audited by hand, in the running app — not inferred from the router.
- Some dead links were deliberately left dead, with the reason recorded, rather than repointed to something that merely silences the audit.
- The mock/real data split across `/search` and `/product/:slug` was independently flagged by two different parts of this chapter and remains open, deferred work.

---

# 🎯 Chapter Outcome

```text
📸 Real Photography
     ↓
🔗 Real Navigation
     ↓
🚫 An Honest "No" on Live Pricing
     ↓
🐛 A Self-Correction, Documented Rather Than Hidden
     ↓
🏆 A Website That Looks Real Where It Counts
```

Not every gap closed in this chapter. The ones that didn't are written down, and the ones that did are backed by evidence anyone could re-run and check for themselves.

# 🛡️ Chapter 25 — Production Hardening & Deployment
