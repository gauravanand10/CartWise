# 🧹 CH28 — README

> **Project:** CartWise
> **Chapter:** Final Cleanup & First Commit

This chapter closes out two fabrication issues left flagged-but-untaken across the prior two chapters, lands the first real commit of this whole run of work, and — while verifying that the second removal was safe — uncovers a much bigger, pre-existing problem in how CartWise decides its "Best overall" verdict.

---

# 🎯 Why This Chapter Exists

```text
storeRating         flagged in CH26.5, not carried forward into CH27 — still live
Two % off strings    flagged in CH27, deliberately deferred as out of scope
Uncommitted work      three chapters' worth, sitting only in the working tree
```

Three loose ends, all named honestly in prior reports rather than hidden — this chapter closes them.

---

# ⭐ storeRating: Removed, Not Replaced

`STORES[].storeRating` — hardcoded numbers like "Amazon 4.5," "Croma 4.2" — was flagged two chapters ago and simply never carried forward into the next chapter's cleanup list. Found live in six places, rendered in exactly one.

```text
The clearest argument for removing it:
A retailer CartWise had never heard of, named for the first time
by the live API response, was handed a 4.0 out of 5 on arrival.
```

No replacement was invented — no average, no default, no borrowing the product's own rating. The offer row now states only what's real: retailer name, reference price, stock state, and the affiliate label.

---

# 💯 The Two Remaining "% off" Strings

```text
PricingCard.tsx                the discount pill beside the price — display only
compare/config/sections.ts     the "Discount" row in the comparison table
```

The first was purely cosmetic — both prices were already printed, so nothing factual was lost. The second was not cosmetic at all: it was a live input into `buildVerdict`, the function that decides which product a comparison table calls "Best overall." Removing a copy string this time also changed what a real feature actually computes — reported explicitly as an intended effect of the removal, not a side effect discovered later.

---

# 🔬 Verification, Following Chapter 27's Rule

```text
rm -rf dist && npm run build
        ↓
grep the built bundle as raw text (not a partial-match tool)
        ↓
serve the exact bundle just built, DOM-probe it live
```

Two coincidental matches were correctly disambiguated rather than waved through: a real `Discount` product tag unrelated to the removed row, and stray `4.5` / `4.3` numeric substrings that turned out to be SVG icon path coordinates, not leftover rating values. The shipped `STORES` array and the shipped Price section were both read directly out of the built bundle to confirm the fields were actually gone, not just believed gone.

---

# 🌿 The First Real Commit — Protecting docs/ Under Pressure

Three chapters of uncommitted work had accumulated. `git status` surfaced something unplanned: the remote was four commits ahead — the project owner's own manually-written documentation for Chapter 25, committed independently via GitHub's web UI.

```text
A blind push here would have been rejected outright.
A careless "fix" could have overwritten those four commits.
```

Confirmed zero file overlap between the incoming doc commits and this chapter's 117 changed paths, then committed locally and rebased on top rather than force-pushing over anything. `docs/` protection was verified four separate ways before pushing — status, a pathspec-excluded `git add`, a staged-diff check, and a direct inspection of the final commit's file list — all confirming zero touches to `docs/`.

```text
2903e0c..1501f63  main -> main
119 files changed, 6,676 insertions(+), 5,198 deletions(-)
```

---

# 🕵️ The Bigger Finding: "Best Overall" Is Mostly Just "Cheapest"

Proving the Discount-row removal actually changed a verdict meant computing the real "before" and "after" across every possible product comparison, not a handful of hand-picked examples — three hand-picked sets all showed no change, which was itself a signal to widen the search rather than stop there.

```text
Swept: every same-category 4-product comparison the real catalogue admits
Total: 12,605 combinations
Flipped: 226 (1.8%)
```

The sweep surfaced something well beyond the original question:

```text
Verdict agrees with the CHEAPEST product     83.7% of the time
Verdict agrees with the WORST-RATED product  59.2% of the time
Verdict agrees with the BEST-RATED product    8.5% of the time
```

The mechanism: five separate per-retailer price rows, plus "Current price" and "Best store price," all reward the same underlying fact — who's cheapest — seven separate times before a single spec or rating is compared. A real product example: a 4.9-rated headphone loses to a lower-rated competitor 9 wins to 1, because the cheaper product banks seven "wins" on price alone.

```text
Ties resolved silently by array position    270 / 12,605 sets currently
                                             present a coin-flip as a
                                             decisive winner
```

This wasn't caused by removing the Discount row — the Discount row was itself part of the same price bias, and removing it made the bias marginally less severe (9-to-1 instead of 10-to-1 in most cases), which is what surfaced how dominant the underlying weighting problem already was.

---

# 🚧 What This Chapter Deliberately Did Not Do

```text
No change to buildVerdict's weighting     a real recommendation-algorithm
                                            decision, not a verification task
No new default rating                       nothing invented to replace what
                                             was removed
No forced push                              docs/ commits protected instead
```

The verdict-weighting problem is named, measured, and handed off explicitly — not fixed quietly and not left undocumented.
