# 💻 CH28 — Commands

> **Project:** CartWise
> **Chapter:** Final Cleanup & First Commit

This file contains the commands used to remove the remaining fabricated values, verify the build honestly, diagnose the comparison verdict, and land the first real commit.

---

# 🕵️ Confirming Prior Chapters' Deferred Items

## Re-check Everything a Prior Chapter Flagged as Deferred

```bash
grep -rn "storeRating" frontend/src/
```

### Expected (before this chapter)

```text
Live in constants.ts, data/offers.ts, types/product.ts, and rendered
in StoreOfferCard.tsx — confirms it was missed, not resolved
```

---

# 🧹 Removal Dependency Checks

## storeRating — Every Reference, Before Deleting Any

```bash
grep -rln "storeRating" frontend/src/ frontend/src/**/*.test.tsx
grep -rn "storeRating\|store_rating\|retailerRating\|retailer_rating" backend/src/main --include=*.java --include=*.sql --include=*.yml
```

### Expected

```text
Six frontend sites, one render site, zero backend references
```

---

## The Two "% off" Strings

```bash
grep -rn "discountPercent" frontend/src/
```

### Expected

```text
Confirms exactly which files import the helper before removing its
last two call sites
```

---

# 🔬 Fresh-Build Verification (Chapter 27's Method)

## Rebuild Clean

```powershell
cd D:\Software_Engineering\CartWise\frontend
Remove-Item -Recurse -Force dist
npm run build
```

---

## Raw-Text Grep the Actual Bundle

```powershell
$bundleText = [System.IO.File]::ReadAllText("dist\assets\index-<hash>.js")
@("% off","% OFF","No discount","storeRating","Save up to") |
  ForEach-Object { "$_ -> " + ([regex]::Matches($bundleText, [regex]::Escape($_))).Count }
```

### Expected

```text
All zero — but check any near-zero-looking match by hand before trusting
it (e.g. a numeric substring like "4.5" can appear legitimately in SVG
path data or an unrelated rating threshold; don't assume every hit is real)
```

---

## Confirm the Shipped Data Shape Directly

```powershell
$bundleText -match 'monogram:`[A-Z]+`,gradient:[^}]+\}'
```

Read the actual matched object literal to confirm the field list shipped (e.g. confirm `storeRating` is absent from the real array in the bundle, not just believed absent from source).

---

# 🌿 Confirming a Safe Commit Before Pushing

## Check for Remote Divergence First

```bash
git status
```

If it reports the branch is behind, do not force anything — find out what changed remotely before deciding how to proceed.

---

## Confirm Zero File Overlap With Incoming Remote Commits

```bash
git diff --name-only HEAD origin/main
git status --porcelain
```

Compare the two lists by hand — if nothing appears in both, a rebase is safe.

---

## Rebase Rather Than Force-Push

```bash
git add -A -- . ':!docs'
git commit -m "feat: affiliate monetization, real catalogue, and removal of fabricated content"
git pull --rebase origin main
git push origin main
```

---

## Verify docs/ Was Never Touched — Four Independent Checks

```bash
git status --porcelain -- docs/
git diff --cached --name-only -- docs/
git show --name-only --pretty=format: HEAD -- docs/
```

### Expected

```text
Every command returns empty output
```

---

## Confirm What Actually Landed

```bash
git log --oneline -5
git show --stat HEAD
```

---

# 📊 Verdict Algorithm Diagnostic (Ad-Hoc Verification, Not Shipped)

## Recover Removed Logic Exactly, From Git

```bash
git show <commit-hash>^:frontend/src/features/compare/config/sections.ts
```

Use this to reconstruct an exact "before" state for comparison — never approximate removed logic from memory.

---

## Sweep Every Real Comparison the Catalogue Admits

```ts
// Temporary vitest harness only — delete after use, do not commit
// Iterate every same-category 4-product combination via the real
// getProductBySlug + buildSections + buildVerdict, comparing the
// current logic against the recovered "before" logic.
```

### Expected Output Shape

```text
Total combinations swept   : 12,605
Verdict changed             : 226 (1.8%)
Ties before / after         : 447 / 270
Winner == cheapest product  : 83.7%
Winner == best-rated product: 8.5%
```

---

## Clean Up the Diagnostic Harness

```bash
git status --porcelain
```

### Expected

```text
Empty — confirms the temporary harness file(s) were deleted and nothing
from this diagnostic pass leaked into the working tree
```

---

# 🧪 Standard Verification

```bash
cd frontend
npx tsc -b
npx eslint .
npx vitest run
```

```bash
cd backend
./mvnw clean test
```

### Expected

```text
Tests run: 393, Failures: 0, Errors: 0, Skipped: 0    (Docker must be running)
Test Files  10 passed (10)
     Tests  148 passed (148)
```

---

# 📌 Command Summary

```bash
grep -rn "storeRating" frontend/src/
Remove-Item -Recurse -Force dist
npm run build
git status
git add -A -- . ':!docs'
git commit -m "feat: affiliate monetization, real catalogue, and removal of fabricated content"
git pull --rebase origin main
git status --porcelain -- docs/
git push origin main
git log --oneline -5
npx tsc -b
npx eslint .
npx vitest run
./mvnw clean test
```
