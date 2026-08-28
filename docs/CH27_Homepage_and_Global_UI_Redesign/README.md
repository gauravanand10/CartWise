# 🎨 CH27 — README

> **Project:** CartWise
> **Chapter:** Homepage & Global UI Redesign

This chapter exists because a prior chapter's "COMPLETE" report and reality disagreed — the homepage still showed a "Save up to ₹25,000" banner after Chapter 26 explicitly reported deleting it. Chasing that discrepancy down changed what "verified" means for the rest of the project, and along the way surfaced a much longer list of marketplace-style fabricated urgency than the one banner anyone had actually noticed.

---

# 🎯 Why This Chapter Exists

```text
User report        "the top bar still says 25,000/- off"
Prior report        "Save up to ₹25,000 today — deleted"

Both were true. The source was clean. The build wasn't.
```

The homepage had drifted into looking like a discount-marketplace clone — a dark rotating top bar, saturated green "% OFF" pills on every card, urgency language, a footer promising a newsletter that didn't exist — despite an earlier design pass already having defined a calm, restrained, single-accent system elsewhere on the site.

---

# 🕵️ The Real Bug: A Stale Build, Not Stale Code

```text
frontend/dist/    gitignored, never rebuilt automatically
                   served by docker-compose and `vite preview` regardless
                   of how current the source is

Fix landed in source:     21 Aug 2026, 22:27
Bundle actually served:   built 17 Aug 2026, 00:31  (older than the fix)
```

Grepping source found zero occurrences of the old copy. Grepping the actual shipped JavaScript bundle found all of it, verbatim — the discount banner, "Delivering to Patiala," "10-minute delivery." The build artifact was quietly frozen in time, and nothing in the verification process up to this point had ever checked it directly.

A second contributor: the fix that removed this content had never been committed. A clean checkout at that point in time would have reproduced the stale bar from scratch.

---

# 🔬 What "Verified" Means Now

```text
Before   read the source, read the dev server, call it verified
After    rm -rf dist && npm run build
             ↓
         read the produced bundle as raw text (not a partial-match tool)
             ↓
         serve that exact build
             ↓
         probe the live DOM for the strings that must be gone
             and the ones that must be present
```

One tool trap found along the way: PowerShell's `Select-String -SimpleMatch` silently fails to match inside very long minified lines — it reported zero hits on a string present fifteen times in the bundle. `[System.IO.File]::ReadAllText` reading the whole file as one string is what actually works. This distinction now matters for every future verification pass on this project.

---

# 🧹 The Fast-Fashion Pattern, Found in Full

The one banner anyone noticed was the smallest part of the problem.

```text
Removed
  Green "N% off" pill on every product card    (up to 100 on /browse)
  Footer newsletter signup                      form did nothing at all
  "AI score on every result" — footer copy       last survivor of a claim
                                                  removed everywhere else
  Mismatched retailer counts                     "nine", "seven", "five"
                                                  on one page load
  "Track price drops" promo card                 same claim CH26.5 already
                                                  deleted the rail for
  Same slide, duplicated on /browse's hero        one click from the fix
  UPPERCASE red "OUT OF STOCK" over a photo       the dimming already says it
  Wishlist "saved" state using the danger color   danger means destructive,
                                                   not "saved"
  Seven dead files of fabricated stats/pricing    unreferenced, confirmed by
                                                   a full import scan first
```

The newsletter form is worth naming specifically: its submit handler called `preventDefault()` and did nothing else. Anyone who entered their email and pressed Subscribe had every reason to believe they'd signed up for something. Nothing was ever sent anywhere — but the interaction itself was fake, not just the copy around it.

---

# 🪧 The Top Bar: Kept, Restyled

```text
Before   full-bleed dark band, white text — the exact silhouette of a
         marketplace's rotating "EXTRA 20% OFF · ENDS TONIGHT" strip,
         regardless of what words were actually in it
After    page-neutral background, one hairline rule, same two honest
         messages already established in Chapter 26.5:
         the reference-price caveat, and a link to how CartWise
         actually makes money
```

Not deleted outright — removing it would push the disclosure and the reference-price caveat below the fold on every route, which cuts against the same disclosure standard Chapter 26 was built around.

---

# ✅ Verification Discipline

```text
Fresh build           rm -rf dist && npm run build, twice (one fix mid-chapter)
Bundle text grep       every "must be absent" string: 0 occurrences
                       every "must be present" string: confirmed with counts
Live DOM probe         served the exact built bundle, checked class names
                       and rendered text directly, not assumed from code
Contrast               measured, not eyeballed — every pairing checked
Non-happy-path sweep   404 page, disabled states, empty states — confirmed
                       unaffected by this pass
```

One honestly reported, unresolved item: a single test run out of ten showed an unreproduced failure (1 failed / 147 passed, unusually slow). Nine other runs were clean. Reported as an unreproduced flake rather than claimed as identified — the test name wasn't captured before the log was overwritten.

---

# 🚧 Known Gaps, Named Rather Than Hidden

```text
Two remaining "% off" strings    product page + comparison table —
                                  same pattern, different pages, deferred
Hardcoded retailer star ratings  still present on offer rows — flagged in
                                  the prior chapter too, not yet taken
Category-tile glyph collisions   two pairs of categories share a glyph —
                                  a design decision, not a restraint pass
Five saturated store gradients   on the product page's retailer monograms
Seven unused legacy UI files     dead code in the old palette — not deleted,
                                  since they render nothing and aren't
                                  fabricating any claim
```
