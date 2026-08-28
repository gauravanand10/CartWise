# 📖 CH27 — Glossary

> **Project:** CartWise
> **Chapter:** Homepage & Global UI Redesign

This glossary explains the important terms and concepts introduced while diagnosing and removing the site's remaining marketplace-style patterns.

---

# 🧊 Stale Build Artifact

A Stale Build Artifact is a compiled output (here, `frontend/dist/`) that no longer reflects the current source code, because nothing has forced it to be rebuilt.

```text
Source fixed:   21 Aug, 22:27
Bundle served:  built 17 Aug, 00:31   ← four days older than the fix
```

Source control tracks code, not build output — `dist/` is gitignored by design, so an old build sits there silently until something explicitly rebuilds it.

---

# 🕳️ Verification Gap

A Verification Gap is a mismatch between what was checked and what a user actually experiences — here, checking the source and the dev server while the deployed/previewed instance served something older.

```text
Checked    source code, dev server
Not checked  the actual built bundle being served
Result       a "COMPLETE" report that was true and misleading at once
```

---

# 📦 Bundle Text Grep

Bundle Text Grep is searching the literal, compiled JavaScript output for a string, rather than trusting that its absence from source guarantees its absence from what ships.

```text
Source grep       0 hits  →  looked clean
Bundle grep       15 hits →  the truth
```

The only reliable way to confirm what a running instance is actually serving.

---

# 🪤 Silent Matcher Failure

A Silent Matcher Failure is when a search tool reports zero results not because nothing matched, but because the tool itself gave up — with no error to indicate it.

```text
Select-String -SimpleMatch     0 hits   (wrong — tool limitation)
[System.IO.File]::ReadAllText  15 hits  (right — reads the whole file)
```

`-SimpleMatch` silently fails on very long minified lines. A tool reporting a clean result is not the same as a result being clean.

---

# 🎢 Marketplace Silhouette

A Marketplace Silhouette is a visual shape so strongly associated with discount-marketplace design that it reads as urgency and clutter regardless of the actual words inside it.

```text
Full-bleed dark band, white text, pinned to the top of every page
   →  reads as "EXTRA 20% OFF · ENDS TONIGHT"
   →  even when the actual text is a calm disclosure notice
```

Fixed by restyling the container itself, not just correcting the copy inside it.

---

# 🟢 Saturated Badge

A Saturated Badge is a small UI element using a bright, high-chroma color to compete for attention, independent of whether the number on it is real.

```text
bg-success (green), bold white text, top-left of every card
   → "44% off", repeated up to 100 times on one page
```

The single most visually loud element on the homepage before this chapter — removed rather than restyled, since both the original and discounted prices were already printed elsewhere on the same card.

---

# 🎭 Fake Interaction

A Fake Interaction is a UI element that looks functional but performs no real action, misleading anyone who uses it as intended.

```text
<form onSubmit={(e) => { e.preventDefault(); }}>
   Subscribe →  nothing happens, nothing is sent, nothing is stored
```

Worse than a false claim in copy, because it invites a real action from the user and then discards it silently. No honest rewording exists for a form with nothing behind it — it was deleted, not softened.

---

# 🔢 Number Inconsistency

A Number Inconsistency is the same fact being stated with different values in different places on the same page, which undermines trust in all of them at once.

```text
Hero copy:    "nine retailers"
Footer chips: seven listed
Actual count:  five (matches STORES, the real source of truth)
```

Fixed by deriving every count from the same real source (`STORES`) instead of hardcoding a number in more than one place.

---

# 🧟 Dead Claim

A Dead Claim is fabricated copy left behind after the feature that justified it was already removed elsewhere.

```text
"Track price drops" promo card    still present
PriceDrops rail                    already deleted, two chapters ago
```

The claim survived because deleting a section doesn't automatically delete every other place that referenced the same idea — found by searching for the underlying concept, not just the deleted component's name.

---

# 🎨 Semantic Color Misuse

Semantic Color Misuse is using a color reserved for one meaning (danger, destructive, unavailable) to represent something unrelated, purely for visual effect.

```text
Wishlist "saved" state    was bg-danger (red)
Out-of-stock state          also bg-danger (red)
```

Saving a product is neither dangerous nor destructive — spending the danger color on it dilutes what that color means everywhere else it's used correctly.

---

# 🧹 Restraint Pass vs Design Decision

A distinction drawn explicitly in this chapter's scope: some visual issues are the fast-fashion pattern this chapter exists to remove; others are separate design judgment calls that happen to also be imperfect.

```text
Restraint pass    remove clutter, remove fabricated urgency, remove
                   saturated competing colors
Design decision    e.g. two categories sharing the same icon glyph —
                   a real imperfection, but fixing it means choosing
                   new icons, not removing anything
```

Named and deferred rather than folded into scope it doesn't belong to.

---

# 🌐 DOM Probe

A DOM Probe is checking the actual rendered page in a browser — computed styles, rendered text, live class names — rather than inferring behavior from source code alone.

```text
servedFrom : http://localhost:4173
scripts    : /assets/index-DKTMY54b.js   ← confirms the file just built
percentOff : false     saveUpTo : false     nineRetailers : false
```

The final check in the verification chain — confirms not just that the right code was written, but that it is what a real visitor's browser actually receives.
