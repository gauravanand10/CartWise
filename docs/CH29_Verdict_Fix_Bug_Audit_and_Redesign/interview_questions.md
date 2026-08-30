# 🎤 CH29 — Interview Questions

> **Project:** CartWise
> **Chapter:** Verdict Algorithm Fix, Full Codebase Bug Audit, and Distinctive Frontend Redesign

---

# ⚖️ The Verdict Algorithm

## 1. Why "one vote per signal" instead of just deleting the extra price rows?

### Answer
Because the extra rows themselves aren't the problem — they're useful information; a shopper comparing products genuinely wants to see the price at each retailer. The problem was letting each of those rows also cast an independent vote in the ranking, when they're all reporting the same underlying fact. So the fix keeps every row rendered exactly as before, and only changes how `buildVerdict` counts them: seven displayed rows about price now contribute one vote, decided by a single canonical row, instead of seven.

---

## 2. You chose equal weighting across the remaining signals. Why not tune it — give rating more weight than a spec, for instance?

### Answer
Because any specific weighting needs a number to justify it, and there's no real source for a number like "rating matters twice as much as a spec." That's not a neutral technical choice, it's an opinion dressed up as math — and it's exactly the category of thing this project has spent several chapters removing: a plausible-looking figure with nothing real behind it. Equal weighting is the only option that doesn't require inventing something. It's a less impressive-sounding answer than a "smart" tuned curve, but it's the honest one.

---

## 3. What was actually wrong with how the old algorithm handled a tie, beyond it being technically incorrect?

### Answer
It wasn't just incorrect, it was actively misleading. `count > wins[best]` means a genuine tie gets resolved by whichever product happened to be compared first — and the UI then presented that outcome with total confidence, a single named "Best overall" winner, no indication anywhere that the actual scores were equal. A user has no way to know they're looking at a coin flip dressed up as a verdict. The fix doesn't change how often ties happen, it changes whether the user is told the truth when one does.

---

# 🐞 The Bug Audit

## 4. Of the six bugs you found, which one actually worried you most and why?

### Answer
The missing error boundary, because of what it combines with. On its own, a missing error boundary means any unexpected render error takes down the whole page instead of just the component that failed — bad, but bounded. Combined with bug #2 — a component that could throw on an empty array whenever the affiliate configuration was unset, which is the default state — it meant a completely ordinary, unconfigured deployment was one render away from a blank white screen on every product page, with no navigation, no footer, and no way back except manually editing the URL. Neither bug alone is catastrophic. Together, they were.

---

## 5. How did you actually prove bug #2 was real and fixed, rather than just writing a fix and moving on?

### Answer
By reverting it and watching it fail first. I temporarily undid the fix, re-ran the test suite, and confirmed I got the exact failure the bug predicted — a reduce on an empty array with no initial value. Only after seeing that real failure did I restore the fix and confirm the suite passed again. That's a stronger claim than "the tests pass" — it's proof the tests would have caught the original bug if they'd existed before the bug was introduced, not just that they're satisfied with the current state.

---

## 6. You reported a race-condition test that initially looked like a real bug, then turned out not to be. Walk through what happened.

### Answer
Testing rapid wishlist toggling, my first check appeared to show the UI and the server disagreeing about state — which would have been a real, serious bug. But before reporting it, I looked closer at how I'd made the comparison, and found the error was mine: I'd compared the product's display name against its URL slug, two different string formats that will never match even when everything is working correctly. I re-ran the test properly, comparing the right values, at 1, 5, and 9 rapid clicks, and found no desync in any run — rapid clicks can coalesce (the last click wins), but the UI and server never actually disagree. It would have been easy to report the first result as a finding; the honest thing was to distrust my own measurement first and check it.

---

# 🎨 The Redesign

## 7. The brief was "distinctive, but don't abandon restraint." How do those two things not just cancel each other out?

### Answer
They only conflict if "distinctive" is assumed to mean more color or more visual noise — which is what the site already had too much of before Chapter 26 started cleaning it up. Distinctiveness came instead from things restraint doesn't forbid: real typographic contrast (a 700-weight heading against 400-weight body reads as considered, where a flat 600 everywhere reads as generic), motion that means something rather than decorating, and one specific detail — tabular numerals on price columns — that has nothing to do with color at all and is directly about what CartWise actually does: put numbers next to each other for comparison. None of it adds a second color to the palette.

---

## 8. Why does font-variant-numeric: tabular-nums matter enough to call out specifically?

### Answer
Because it's the one typographic decision in this whole pass that's actually about CartWise rather than generic good taste. Most proportional fonts give different digits different widths — a "1" is narrower than a "7" — so two prices stacked in a column don't align on their digits by default, and a product built around comparing numbers side by side should not have numbers that visually wobble when stacked. Tabular numerals fix that specifically where columns of figures occur — price blocks, offer rows, the comparison table — not applied globally, since forcing every digit to fixed width in body prose actually looks mechanical rather than refined.

---

## 9. What's the reduced-motion bug you found in your own work, and why is it worse than a normal accessibility miss?

### Answer
An animation that goes from `opacity: 0` to `opacity: 1` and back needs the reduced-motion override to reset those properties explicitly. Just writing `animation: none` for `prefers-reduced-motion` disables the keyframes but leaves whatever the last computed style was — and if that element's animation both starts and ends invisible, turning the animation off can leave it permanently invisible. That's a worse outcome than the animation running normally, and it specifically hits the people who requested reduced motion because of vestibular or attention-related conditions — the exact users a "considerate" fix is supposed to be for. Catching it meant actually checking what the override does, not just confirming the media query exists.

---

# 🕵️ The /search Fork

## 10. You found a second version of a bug from an earlier chapter. How did you avoid over-reacting or under-reacting to it?

### Answer
By measuring it precisely instead of pattern-matching on the label. The earlier bug (catalogue.ts) was dangerous specifically because the local file's data silently disagreed with the real database, which caused real wishlist rows to be deleted when a lookup failed. /search's mock data doesn't do that — every one of its 20 entries agrees with the real database on price and rating. The actual problem is narrower: it's missing 80 of the 100 real products entirely, so searching for something real can come back empty even though the product exists and `/browse` would find it. Same category of bug, genuinely different severity — treating it as identical to the earlier one would have either caused unnecessary alarm or, if I'd dismissed it as "already handled," missed a real gap.

---

## 11. Why didn't you just fix /search the same way you fixed the product detail page fork?

### Answer
Because the fix that worked for the detail page — pointing it at an endpoint that already existed — doesn't exist here. The real product API supports filtering by category, brand, price range, and stock status, but has no free-text search capability. Building search entirely client-side, by fetching all 100 products and filtering in the browser, is the exact architecture an earlier chapter explicitly ruled out for good reasons. So the actual fix is new backend work — a real search capability — which wasn't something this chapter's brief authorized me to invent scope for. I fixed what I could respect the boundary on (removing the fabricated store count riding alongside it) and left a clear, specific note in the code for whoever picks up the real migration.

---

## 12. Looking at this chapter as a whole, what's the throughline connecting the verdict fix, the bug audit, and the /search discovery?

### Answer
All three are versions of the same question: does what the interface claims match what's actually true underneath it? The verdict was claiming a confident, multi-factor judgment while actually just measuring price seven times over. The bugs were UI states quietly claiming things worked — loading, saving, navigating — when they sometimes didn't. And /search was implicitly claiming to search the catalogue while only searching a fifth of it. None of these were dishonesty in the sense of someone deliberately lying; they were gaps between what a feature appears to do and what it actually does, found the same way every fabrication issue in this project has been found — by checking the real behavior directly instead of trusting what the code or the copy claims.
