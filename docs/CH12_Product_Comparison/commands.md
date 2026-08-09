# 💻 CH12 — Commands

> **Project:** CartWise  
> **Chapter:** Product Comparison

This file contains the commands used to develop, verify, and commit the Product Comparison system.

---

# 🚀 Development Commands

## Start Development Server

```bash
npm run dev
```

Starts the CartWise development server.

---

## Build Production Version

```bash
npm run build
```

Creates the optimized production build.

---

## Preview Production Build

```bash
npm run preview
```

Runs the production build locally for final verification.

---

# 🔍 TypeScript

## Check TypeScript

```bash
npx tsc --noEmit
```

### Expected

```text
0 errors
```

This verifies that the Product Comparison implementation does not introduce TypeScript errors.

---

# 🧹 ESLint

## Check Source Code

```bash
npx eslint src --max-warnings=0
```

### Expected

```text
0 errors
0 warnings
```

---

# ⚖️ Compare Feature Testing

## Open Compare Page

```text
/compare
```

Verify:

- Selected products appear.
- Product columns render correctly.
- Add-product slot appears when capacity remains.
- Remove controls work.
- Comparison sections render.
- Empty state works.

---

# ➕ Add Product

From a Product Card or Product Details page:

```text
Product
   ↓
Compare
   ↓
Compare Selection
```

Verify that the product appears in the comparison.

---

# 🗑️ Remove Product

From the comparison page:

```text
Product
   ↓
Remove
```

Verify that the product column disappears immediately.

---

# 🧹 Clear Comparison

Use the comparison clear action.

Expected:

```text
Selected Products
      ↓
Clear
      ↓
Empty Compare State
```

---

# 📊 Differences Only

Enable the Differences Only control.

Expected behavior:

```text
All Rows
   ↓
Filter
   ↓
Only Different Rows
```

Rows where all selected products have identical values should disappear.

---

# ➕ Product Picker

Open the Product Picker.

Verify:

- Available products appear.
- Already-selected products cannot be selected again.
- Products can be added.
- Picker closes correctly.
- Picker renders correctly when comparison capacity is available.

---

# 🔢 Maximum Product Count

CartWise supports:

```text
Maximum = 4 products
```

Test:

```text
1 Product
↓
2 Products
↓
3 Products
↓
4 Products
```

At four products:

- Add-product slot should disappear.
- Additional products should not be added.

---

# 🧪 Invalid Product

Test an unknown product identifier.

Expected behavior:

```text
Unknown Product
      ↓
null / missing result
      ↓
Graceful handling
```

The comparison system must not crash.

---

# 📱 Responsive Testing

Test the Compare page at:

```text
320px
375px
390px
414px
480px
768px
1024px
1280px
1536px
1920px
```

---

## Mobile Checks

At:

```text
320px
375px
390px
414px
480px
```

verify:

- No page-level horizontal overflow.
- Product information remains readable.
- Comparison region scrolls horizontally where required.
- Specification labels remain understandable.
- Remove buttons remain accessible.
- Product picker fits the viewport.
- Empty state remains usable.
- Differences Only remains accessible.
- Four-product comparison remains usable.

---

## Tablet Checks

At:

```text
768px
```

verify:

- Comparison columns remain readable.
- Horizontal scrolling behaves correctly.
- Controls remain accessible.
- Sections do not overlap.

---

## Desktop Checks

At:

```text
1024px
1280px
1536px
1920px
```

verify:

- Comparison grid uses available space correctly.
- Product columns remain balanced.
- No unnecessary horizontal page overflow.
- Sticky specification labels behave correctly.
- Comparison controls remain visible and usable.

---

# ↔️ Horizontal Scroll Verification

The comparison region may require horizontal scrolling on narrow screens.

Verify:

```text
Page
└── Comparison Container
    └── Horizontal Scroll
```

The entire page should not accidentally become wider than the viewport.

---

# 📌 Sticky Specification Labels

When horizontally scrolling through comparison values, verify that specification labels remain available where the responsive layout supports sticky positioning.

Example:

```text
RAM | Product A | Product B | Product C
```

The label should remain understandable while moving between product columns.

---

# 💾 localStorage Testing

### Test 1 — Save

```text
Add Product A
Add Product B
```

Reload the browser.

Expected:

```text
Product A
Product B
```

remain selected.

---

### Test 2 — Clear

```text
Clear Comparison
```

Reload the browser.

Expected:

```text
Empty Compare State
```

---

# 🔄 Browser Navigation

Verify:

```text
Product
   ↓
Compare
   ↓
Product
   ↓
Back
   ↓
Compare
```

Also test:

```text
Back
Forward
Reload
```

The application should not crash or enter an invalid comparison state.

---

# 🖥️ Browser Console

Open:

```text
F12
```

Then:

```text
Console
```

Check for:

```text
No red errors
No uncaught exceptions
No unexpected React warnings
```

---

# 🌐 Network Verification

Open:

```text
F12 → Network
```

Check that the comparison flow does not produce unexpected failed requests.

---

# ♿ Accessibility Verification

Verify:

- Keyboard navigation.
- Visible focus states.
- Accessible button labels.
- Product picker accessibility.
- Dialog accessibility.
- Toggle state accessibility.
- Expand/collapse state accessibility.

Important attributes include:

```text
aria-pressed
aria-expanded
aria-live
aria-modal
role="alert"
role="table"
role="row"
role="rowheader"
role="cell"
```

---

# 🧪 Comparison Logic Verification

The comparison engine should be tested independently from the UI.

Verify:

```text
3 products
↓
Comparison sections
↓
Comparison rows
↓
Differences
↓
Winner calculations
↓
Verdict
```

---

# 📏 Unit Normalization

Test comparison values that use different representations.

Conceptually:

```text
Value A
Value B
      ↓
Normalization
      ↓
Comparable Values
      ↓
Winner
```

The comparison engine should not incorrectly compare values merely because their units are represented differently.

---

# 🏆 Winner Edge Cases

Test:

### Case 1 — Clear Winner

```text
A = 5000
B = 4500
C = 4800
```

Expected:

```text
A → Winner
```

### Case 2 — Tie

```text
A = 5000
B = 5000
C = 5000
```

Expected:

```text
No winner
```

### Case 3 — Missing Value

```text
A = 5000
B = —
C = 4800
```

Expected:

```text
Missing value is not treated as a real value.
```

### Case 4 — Non-comparable Attribute

Expected:

```text
—
```

rather than an incorrect winner.

### Case 5 — Equal Ranking

If multiple products have equivalent values, the UI should avoid falsely declaring a single winner.

---

# 🔀 Cross-Category Comparison

Test products from different categories.

Verify that category-specific attributes do not produce misleading comparisons.

Example:

```text
Category A
     +
Category B
```

Non-applicable values should be represented appropriately.

---

# 📊 Four-Product Verification

Verify that a comparison containing four products renders exactly four product cells for applicable comparison rows.

Expected:

```text
Specification
├── Product A
├── Product B
├── Product C
└── Product D
```

---

# 🧱 Rendering Verification

The comparison UI should expose the correct semantic structure.

Verify:

```text
role="table"
role="row"
role="rowheader"
role="cell"
```

Also verify:

```text
aria-expanded
aria-pressed
aria-live
aria-modal
aria-busy
role="alert"
```

where applicable.

---

# 📁 Expected Feature Structure

```text
src/
└── features/
    └── compare/
        ├── components/
        │   ├── CompareEmpty.tsx
        │   ├── CompareGrid.tsx
        │   ├── CompareProductColumn.tsx
        │   ├── CompareToolbar.tsx
        │   ├── CompareVerdictCard.tsx
        │   ├── ComparisonSection.tsx
        │   └── ProductPicker.tsx
        │
        ├── config/
        │   └── sections.ts
        │
        ├── context/
        │   ├── CompareProvider.tsx
        │   └── compareContext.ts
        │
        ├── hooks/
        │   ├── useCompareSelection.ts
        │   └── useComparison.ts
        │
        ├── utils/
        │   ├── buildComparison.ts
        │   └── metrics.ts
        │
        ├── constants.ts
        ├── ComparePage.tsx
        ├── index.ts
        ├── services/
        └── types/
```

---

# 🧪 Final Verification Sequence

Run:

```bash
npx tsc --noEmit
```

Then:

```bash
npx eslint src --max-warnings=0
```

Then:

```bash
npm run build
```

Then:

```bash
npm run preview
```

Finally perform the browser verification.

---

# 🌐 Git Commands

## Check Status

```bash
git status
```

---

## View Recent History

```bash
git log --oneline --decorate --graph --all -20
```

---

## Check Remote

```bash
git remote -v
```

---

# 🔄 Synchronize Before Committing

If the branch is behind `origin/main` and you have uncommitted CH12 work:

```bash
git stash push -m "Chapter 12 Product Comparison"
```

Then:

```bash
git pull --rebase origin main
```

Restore:

```bash
git stash pop
```

---

# 📦 Stage Changes

```bash
git add .
```

Verify:

```bash
git status
```

---

# 💾 Commit Chapter 12

```bash
git commit -m "feat: implement Chapter 12 product comparison"
```

---

# 🚀 Push Chapter 12

```bash
git push origin main
```

---

# 📚 Documentation

Create the documentation directory:

```bash
mkdir docs/CH12_Product_Comparison
```

Documentation files:

```text
README.md
glossary.md
interview_questions.md
commands.md
```

---

# 📝 Documentation Commit

After all four documentation files are created:

```bash
git add .
```

```bash
git commit -m "docs: add Chapter 12 product comparison handbook"
```

```bash
git push origin main
```

---

# ✅ Final Chapter 12 Checklist

Before declaring Chapter 12 complete:

```text
[ ] Compare action works
[ ] Compare badge works
[ ] Compare page works
[ ] Add product works
[ ] Remove product works
[ ] Maximum 4 products enforced
[ ] Product picker works
[ ] Duplicate products prevented
[ ] Differences Only works
[ ] Winner calculations work
[ ] Verdict works
[ ] Store comparison works
[ ] Cross-category comparison handled
[ ] Missing values handled
[ ] Empty state works
[ ] Clear comparison works
[ ] localStorage persistence works
[ ] Browser reload works
[ ] Back/forward navigation works
[ ] Mobile layout verified
[ ] Tablet layout verified
[ ] Desktop layout verified
[ ] Horizontal comparison scrolling verified
[ ] Sticky labels verified where applicable
[ ] Accessibility verified
[ ] Console checked
[ ] Network checked
[ ] TypeScript passes
[ ] ESLint passes
[ ] Production build passes
[ ] Implementation committed
[ ] Implementation pushed
[ ] Documentation committed
[ ] Documentation pushed
```

---

# 📌 Command Summary

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npx tsc --noEmit` | TypeScript verification |
| `npx eslint src --max-warnings=0` | ESLint verification |
| `git status` | Repository status |
| `git log --oneline --decorate --graph --all -20` | Commit history |
| `git remote -v` | Remote repository |
| `git stash push -m "Chapter 12 Product Comparison"` | Temporarily stash work |
| `git pull --rebase origin main` | Synchronize branch |
| `git stash pop` | Restore work |
| `git add .` | Stage changes |
| `git commit -m "feat: implement Chapter 12 product comparison"` | Commit implementation |
| `git push origin main` | Push implementation |
| `git commit -m "docs: add Chapter 12 product comparison handbook"` | Commit documentation |

---

# 📌 Summary

The commands in this chapter cover the complete Product Comparison workflow:

```text
Develop
   ↓
Test
   ↓
Verify Comparison Logic
   ↓
Verify Responsive UI
   ↓
Verify Accessibility
   ↓
Run TypeScript
   ↓
Run ESLint
   ↓
Build
   ↓
Commit
   ↓
Push
```

The same workflow should be followed for future CartWise chapters.
