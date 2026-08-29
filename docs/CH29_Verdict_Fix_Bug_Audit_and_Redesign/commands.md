# 💻 CH29 — Commands

> **Project:** CartWise
> **Chapter:** Verdict Algorithm Fix, Full Codebase Bug Audit, and Distinctive Frontend Redesign

This file contains the commands used to fix and prove the verdict algorithm, audit the codebase for real bugs, verify accessibility, and check the redesign.

---

# ⚖️ Verdict Algorithm — Proving the Fix

## Recover the Removed Row's Exact Logic From Git (for an accurate "before")

```bash
git show <commit>^:frontend/src/features/compare/config/sections.ts
```

---

## Run the Full Comparison Sweep

```bash
cd frontend
npx vitest run buildComparison
```

### Expected

```text
12 tests passed, including:
  price-rows-count-once
  7-vs-2 regression (the exact bug this chapter fixed)
  joint winners
  tie reporting
  bestValue ties
  order-permutation (catches a positional tie-break regression)
```

---

## Re-run the Exhaustive Before/After Sweep

```text
Temporary vitest harness (delete after use, do not commit) —
iterates every same-category 4-product combination via the real
getProductBySlug + buildSections + buildVerdict, comparing current
logic against the git-recovered "before" logic.
```

### Expected

```text
winner == cheapest      83.7% -> 52.5%
winner == best-rated      8.5% -> 48.8%
top score tied            2.1% -> 11.3%
```

---

# 🐞 Bug Audit — Proving a Fix Is Real

## Revert-and-Confirm Method (used on bug #2)

```bash
# Temporarily revert the fix
git stash
npx vitest run PricingCard
# Expect a real failure matching the bug's predicted symptom
git stash pop
npx vitest run PricingCard
# Expect a pass
```

---

## Check for Missing Error Boundaries

```bash
grep -rln "componentDidCatch\|getDerivedStateFromError" frontend/src/
```

### Expected (before the fix)

```text
Zero matches — confirms no error boundary exists anywhere in the tree
```

---

## Check for Unhandled Promise Rejections

```bash
grep -rn "\.then(" frontend/src/ | grep -v "\.catch"
```

Manually confirm each hit either has a `.catch` elsewhere in the chain or genuinely needs one added.

---

## Dead-Backend Route Sweep

```bash
# Stop the backend, serve only the built frontend
npx vite preview --port 4173
```

Visit every route with the backend down; confirm no blank screens, the navbar and footer render everywhere, and the browser console shows zero unhandled promise rejections.

---

# ♿ Accessibility Verification

## Focus Management — Route Change

```js
// In the browser console, after navigating
document.activeElement === document.body   // should be false after the fix
document.activeElement.id                   // should be "main-content"
```

---

## Focus Management — Modal Open / Close

```js
({
  focusInsideDialog: document.querySelector('[role="dialog"]')?.contains(document.activeElement),
  focusFellToBody: document.activeElement === document.body,
})
```

After pressing Escape:

```js
document.activeElement === triggerElement   // should return focus to the opener
```

---

## Focus Management — Toggle Click

```js
// Click the wishlist heart, then immediately check
document.activeElement === wishlistButton   // should remain true even as
                                             // the icon inside it remounts
```

---

## Reduced Motion — Confirm No Hidden Content

```js
// With prefers-reduced-motion: reduce emulated
getComputedStyle(el).opacity     // must not be stuck at 0
getComputedStyle(el).transform   // must not be stuck at a hidden state
```

---

## Accessible Name — Verify Against the Authoritative Source, Not a Tree Reader Alone

```js
document.querySelector('input[name="email"]').labels
// Cross-check any tool-reported "missing label" finding against this
// before treating it as a real bug
```

---

# 🎨 Design Verification

## Contrast — Check New Work Against the Design System's Own Rules

```text
Confirm any newly-styled text isn't using a token reserved for
non-text use (e.g. an "icon/glyph only" token) — re-read the
design system's own documented restrictions before measuring,
not just the measurement itself.
```

---

## Fresh-Build Verification (Chapter 27's Method)

```powershell
cd frontend
Remove-Item -Recurse -Force dist
npm run build
$bundleText = [System.IO.File]::ReadAllText("dist\assets\index-<hash>.js")
@("Compared across 9","9 stores","No discount","% off","Save up to","AI score") |
  ForEach-Object { "$_ -> " + ([regex]::Matches($bundleText, [regex]::Escape($_))).Count }
```

### Expected

```text
All zero
```

---

## Confirm Any Remaining Matched String Is From Genuinely Dead Code

```bash
grep -rln "<component-or-class-name>" frontend/src/
```

Trace the import graph manually — if the only importers are themselves unreferenced by any live route, it's a confirmed unreachable island, not a leak.

---

# 🧪 Full Verification Suite

```bash
cd backend
./mvnw clean test
```

```bash
cd frontend
npx vitest run
npx tsc -b
npx eslint .
```

### Expected

```text
Backend:  Tests run: 393, Failures: 0, Errors: 0, Skipped: 0
Frontend: Test Files 14 passed (14) · Tests 182 passed (182)
          exit 0 (tsc) · exit 0 (eslint)
```

---

# 🌿 Protected Commit (Chapter 28's Process)

```bash
git status --porcelain -- docs/
git add -A -- . ':!docs'
git diff --cached --name-only -- docs/
git commit -m "fix: correct the comparison verdict, add an error boundary, close a11y gaps"
git fetch origin
git show --name-only <new-commit-hash> -- docs/
git push origin main
git log --oneline -5
```

### Expected

```text
Every docs/-scoped check returns empty output before pushing.
```

---

# 📌 Command Summary

```bash
npx vitest run buildComparison
grep -rln "componentDidCatch\|getDerivedStateFromError" frontend/src/
grep -rn "\.then(" frontend/src/ | grep -v "\.catch"
npx vite preview --port 4173
Remove-Item -Recurse -Force dist
npm run build
./mvnw clean test
npx vitest run
npx tsc -b
npx eslint .
git add -A -- . ':!docs'
git commit -m "fix: correct the comparison verdict, add an error boundary, close a11y gaps"
git push origin main
```
