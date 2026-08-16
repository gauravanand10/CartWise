# 🎯 CH24 — Interview Questions

> **Project:** CartWise  
> **Chapter:** Real Data Integration
>
> This chapter covers researching and closing out an unfulfillable requirement (live pricing), sourcing real Creative Commons photography, correcting a prior misdiagnosis of a UI bug, and auditing every navigation element in a running application.

---

# 📚 Beginner Level

## Q1. What were the three parts of this chapter, and how did each one actually turn out?

### Answer

```text
Part A — live pricing        → closed, unfulfillable, no fake data used
Part B — real photography    → completed and verified
Part C — navigation audit    → completed and verified
```

---

## Q2. What free pricing APIs were tried, and what happened with each?

### Answer

```text
eBay Browse API     → 403
Pexels               → 401
Unsplash             → 401
PricesAPI            → 1,000 free calls/month, but signup
                        is a web form only, no programmatic path
Amazon PA-API        → requires an approved affiliate account
```

---

## Q3. Why weren't DummyJSON or FakeStore used, given they're keyless and immediately available?

### Answer

Both serve fabricated data. Presenting fabricated numbers as "live pricing" would be actively misleading rather than simply incomplete — the chapter's brief explicitly forbade substituting fake data to paper over a real gap.

---

## Q4. What is Openverse, and why was it chosen for photography?

### Answer

A WordPress Foundation project indexing Creative Commons-licensed and public domain media. It was the only candidate that could be used without a human first completing a signup flow — a working token could be obtained programmatically.

---

## Q5. How many total Openverse API requests did it take to source photos for all 50 products?

### Answer

Seven — one search per product category, not one search per product.

---

## Q6. Why did searching by category work better than searching by exact product name?

### Answer

Openverse indexes licensed stock/community photography, not product catalogs. A search for the literal name "Amazfit GTR 4" returns nothing useful, because nobody licenses a CC photo of that specific device under that name. A search for "smartwatch" returns real, relevant, correctly-licensed results.

---

## Q7. What two filters were applied to every Openverse search, and why?

### Answer

```text
license_type = commercial   (CartWise's broader use includes ads/affiliate
                              links, so a non-commercial-only license
                              would be unlawful to use)
mature = false                (excludes inappropriate content)
```

---

## Q8. Why is the attribution string stored exactly as Openverse returns it, rather than built from its individual parts (creator, license, etc.)?

### Answer

A hand-assembled credit line risks misrepresenting the actual license terms — for example, crediting a CC0 work (which requires no attribution at all) as if it were CC BY (which does). Storing the API's own pre-composed string avoids that entire class of mistake.

---

## Q9. What was the final spread of license types across the 50 sourced photos?

### Answer

```text
by-sa   23
by      23
cc0      3
pdm      1
```

---

## Q10. What did the idempotency check on the image backfill job prove, and how was it tested?

### Answer

Running the backfill job a second time returned `{"updated": 0, "skipped": 50}` — nothing was re-fetched or duplicated. This was tested by literally running the job twice and comparing the two results, not inferred from reading the code.

---

## Q11. What HTTP status did an unauthenticated request to the image backfill endpoint return, and why does that matter?

### Answer

`401`. It matters because it confirms — by actually sending the request, not by reading the security configuration — that the endpoint is genuinely protected, not just assumed to be.

---

# 📚 Intermediate Level

## Q12. Walk through why "no viable free pricing API exists" is a defensible research conclusion rather than a cop-out.

### Answer

The conclusion is only defensible because every real candidate was actually called and produced a real, logged result (specific status codes, specific rejection reasons) — not because the researcher stopped after a quick guess. The distinguishing feature of good negative research is that someone else could re-run the same calls and get the same rejections. A defensible "no" has evidence; an indefensible one has only "I assume."

---

## Q13. Explain the original (incorrect) theory for why 23 homepage images appeared permanently stuck loading, and what testing revealed instead.

### Answer

```text
Original theory: Vite's dev server returns a 200 with an HTML body
                  for missing asset paths instead of a real 404,
                  so the browser's onError event never fires and
                  the image fallback never engages.

What testing revealed: both a genuine 404 and a genuine
                  200-with-wrong-content-type DID correctly
                  trigger onError. The theory was directly
                  falsified by the test meant to confirm it.

Actual cause: the 23 images were loading="lazy" and below the
              fold, in a browser tab that was backgrounded
              (visibilityState: "hidden") — lazy images simply
              don't load while a tab is hidden, which looks
              identical to "broken" from the outside.
```

---

## Q14. A fix had already been built around the incorrect theory before the mistake was caught. What was that fix, and why was shipping it worse than shipping nothing?

### Answer

A 10-second timeout that would swap in a fallback glyph if an image hadn't finished loading in that window. Had it shipped, it would have replaced every legitimate below-the-fold photo with a "broken image" icon the moment the timer expired — even though the image was never actually broken, just not yet loaded because the tab was backgrounded. This is worse than shipping nothing because it actively degrades correct behavior (a real photo, waiting to lazy-load) into what looks like a confirmed bug (a permanently broken image), based on a diagnosis that had already been disproven.

---

## Q15. Why was the more sophisticated `IntersectionObserver`-based fix ultimately not shipped either?

### Answer

Its correctness couldn't be verified under browser automation — the same visibility throttling that caused the original misdiagnosis also prevented the observer's callback from firing reliably in automated tests. Rather than ship a fix that looked more correct but couldn't actually be proven to work, the smaller, verifiable version (`onError` plus an `onLoad`-with-zero-`naturalWidth` check) shipped instead, with the reasoning documented in the file so a future engineer doesn't reintroduce the naive timeout.

---

## Q16. What is the practical difference between reading a router's configuration file and performing a real navigation audit?

### Answer

A router config proves a *route* exists and what component it renders. It says nothing about whether the *button, link, or chip a user actually clicks* is correctly wired to trigger navigation to that route. Several of this chapter's dead links — a search field with no `<form>` and no navigation call, brand tiles that were plain unstyled `<button>` elements with no `onClick` at all — would have looked completely fine in a router file, because the router was never the problem. The problem was upstream of it, in components that never called it.

---

## Q17. Give three examples of dead navigation elements found in this chapter, and what each one's root cause turned out to be.

### Answer

```text
CategoryStrip's 9 chips     → <button> elements with literally
                               no handler attached, showing 4
                               fabricated category names

Hero search field            → no <form> wrapper, no
                               useNavigate call — pressing
                               Enter did nothing

Notifications bell           → to="#" — which resolves to
                               "stay on the current page,"
                               not a broken link in the
                               traditional 404 sense, but
                               functionally identical to one
```

---

## Q18. Why were the "Visit store" outbound retailer links deliberately left non-functional, rather than fixed in this chapter?

### Answer

Those links belong to a later, dedicated monetization chapter where the actual decision about affiliate linking gets made deliberately — what tracking to attach, what disclosure is legally required, which retailers to support. Wiring them here would mean building ahead of a decision that hasn't been made yet, and potentially building something that has to be redone once that decision is finalized.

---

## Q19. Why were the footer's "Privacy Policy" and "Terms" links removed entirely instead of repointed somewhere plausible, like the catalogue?

### Answer

No privacy policy or terms of service document exists yet. Repointing those links to `/browse` would make the footer *look* complete while actually being misleading — a "Privacy Policy" link that leads to a product catalogue implies a policy exists when it doesn't, which is arguably worse for user trust than having no link there at all. Removing the link and stating the reason is honest; silently repointing it just to pass a "no dead links" checklist is not.

---

## Q20. What second, smaller bug was discovered incidentally while fixing the search box, and how was it handled?

### Answer

`/search` was found to be serving from an entirely separate, 20-product mock catalogue with placeholder images, never calling the real backend API at all — while `/browse` correctly served the real, 50-product seeded catalogue with real photos. `useSearch` was updated to correctly accept and act on `?q=` and `?category=` parameters so the search box functions end-to-end, but the deeper mock/real data split between the two pages was explicitly flagged as out of scope for this chapter, not silently absorbed into "fixed" without mention.

---

# 📚 Advanced Level

## Q21. Explain how "search once per category" solved the rate-limiting problem this design started out engineering around, as a side effect rather than the direct goal.

### Answer

The initial plan assumed 50 requests would be needed (one per product), which — at the unverified anonymous tier of 5/hour — would require a 10-hour paced batch job. The actual design goal was correctness (getting a relevant photo per product), and category-level search achieved that goal in 7 requests total. Seven requests comfortably fits inside even the slowest tier tested, several times over. The rate-limiting problem wasn't solved by finding a faster tier or a clever pacing algorithm — it disappeared because a better-designed solution to the *actual* problem (relevance) needed far fewer calls than the original plan assumed.

---

## Q22. If Openverse's category-level photos are visibly not the exact product (e.g., a generic smartphone photo representing the iPhone 16 Pro), is this a defect in the implementation, or an inherent limitation of the chosen approach?

### Answer

It's an inherent, previously-accepted limitation, not an implementation defect — the chapter's decisions explicitly ruled out manufacturer-exact photography as out of scope, since that would require either scraping (rejected for legal reasons) or a paid/licensed image source. Given that constraint, a real, correctly-licensed, category-relevant photo is the best achievable outcome, not a failure to achieve a better one. The value in documenting this plainly (rather than letting it pass silently) is that it's the kind of gap a user would notice immediately on the actual page, and pretending otherwise would undermine trust in the rest of the chapter's honest reporting.

---

## Q23. Design a test that would have caught the original `onError`/Vite-dev-server misdiagnosis *before* a fix was built around it, rather than after.

### Answer

Directly and deliberately trigger both failure conditions in isolation, with the tab in the foreground: (1) point an `<img>` at a URL guaranteed to return a genuine `404`, and (2) point one at a URL guaranteed to return `200` with a non-image content type (simulating the suspected Vite fallback behavior), and confirm whether `onError` fires for each. This is exactly the test that was eventually run — and if it had been run *before* building the timeout-based fix, the misdiagnosis would have been caught immediately, since both cases correctly triggered `onError` and the fix would never have been necessary. The general lesson: a plausible theory should be falsifiably tested before code is written around it, not after a fix is already built and something still doesn't work as expected.

---

## Q24. Why does verbatim attribution storage matter more for `BY-SA` licensed images specifically, compared to `CC0`?

### Answer

`CC0` requires no attribution at all — getting the credit line wrong for a `CC0` image is a low-stakes mistake (over-crediting something that didn't need it). `BY-SA` ("Attribution-ShareAlike") carries two real obligations: attribution must be provided, and any derivative work must be shared under the same license terms. Reconstructing a `BY-SA` credit line from separate fields risks dropping the share-alike condition entirely, which isn't just a formatting error — it's a genuine license compliance gap. With 23 of the 50 sourced photos under `BY-SA`, getting this specific case right was not a minor detail.

---

## Q25. A teammate proposes fixing the mock/real data split (flagged twice in this chapter, on `/search` and `/product/:slug`) as a "quick addition" to this same chapter, since the image-fetching logic is already built. What's the risk of agreeing to that scope expansion?

### Answer

The mock/real split isn't a photography problem — it's a data-architecture problem spanning multiple features that were each built independently over many earlier chapters, likely with different assumptions about their data source at the time. Folding it into an image chapter risks under-scoping a change that actually needs its own audit (which other pages/components silently depend on the mock catalogue's specific shape or content?), its own test coverage, and its own verification pass — exactly the kind of "quick addition" that turns into an unverified, rushed change bolted onto an otherwise well-verified chapter. The correct response, which this chapter took, is to flag it clearly and leave it for dedicated, properly-scoped work.

---

## Q26. Why is it significant that the chapter's own report explicitly names and corrects a mistake from an earlier session, rather than simply presenting the final, correct version as if it were the only version?

### Answer

Presenting only the final correct diagnosis would hide the fact that a wrong fix was ever built and nearly shipped — which is exactly the information a reviewer or future engineer would need to judge how much to trust future claims from the same process. Documenting the incorrect theory, the fix built around it, why that fix was actively harmful (not just unnecessary), and the falsifying test that caught it, turns a private mistake into a shared, verifiable lesson. It also directly answers a reasonable skeptical question — "how do I know this chapter's other claims are correct?" — with evidence of a real self-correction process, rather than asking for blind trust in a track record with no visible failures.

---

# 🧩 Scenario-Based Questions

## Q27. A user reports that a product photo on `/browse` looks "wrong" — a laptop is showing a photo of a different laptop model. Is this a bug to fix immediately?

### Answer

Check first whether this is the accepted category-photo limitation documented in this chapter, or a genuine mismatch (e.g., a laptop showing a smartphone photo, which would indicate the category search or product-to-category mapping is actually broken). A different laptop model representing a laptop is the expected, accepted behavior of category-level sourcing — not a bug. A completely wrong category would be.

---

## Q28. Six months from now, Openverse changes its API and the stored `image_url` values start returning 404s. What does this chapter's design already have in place to detect that, and what doesn't it have?

### Answer

`SafeImage`'s `onError` handling would correctly detect and gracefully fall back for any individual broken URL — that part of the system was specifically verified to work correctly against real 404s. What isn't in place: any proactive monitoring or alerting that would notice `image_url`s going stale across the catalogue before a user encounters the broken image directly. That's a legitimate gap for a future chapter (likely CH28's monitoring/product-ops scope) rather than something this chapter's image-fetching work was ever meant to cover.

---

## Q29. A new pricing API launches next month with a fully self-serve, keyless signup. Does this chapter's "Part A closed as unfulfillable" conclusion need to be revisited?

### Answer

Yes, and that's expected — "no viable option exists" was a conclusion about the state of available options *at the time of research*, not a permanent architectural decision. Unlike Part B's design (category-level search, verbatim attribution), which are durable engineering choices, Part A's closure is explicitly time-bound to what existed when it was tested. Re-testing periodically, or when a specific new candidate is flagged, is the correct way to revisit it — not assuming the original "no" is permanent.

---

## Q30. If asked to justify, in one sentence, why this chapter is trustworthy despite not completing Part A, what would you say?

### Answer

Because every claim in it — the API rejections, the photo URLs, the idempotency check, the corrected bug diagnosis — is backed by a real, reproducible result rather than an assumption, and the one part that didn't succeed is reported as clearly as the parts that did.
