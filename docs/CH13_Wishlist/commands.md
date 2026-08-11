# 💻 CH13 — Commands

> **Project:** CartWise  
> **Chapter:** Wishlist

This file contains the commands used to develop, verify, and commit the Wishlist system.

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

Runs `tsc -b` and then `vite build`, so the build fails on a TypeScript error before any output is produced.

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

This verifies that the Wishlist implementation does not introduce TypeScript errors.

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

The `react-hooks` rules matter for this chapter — they are what catch a missing effect dependency or a hook called conditionally.

---

# ❤️ Wishlist Feature Testing

## Open Wishlist Page

```text
/wishlist
```

Verify:

- Saved products appear.
- The card count matches the navbar badge.
- The toolbar shows the correct saved count.
- Sorting changes the order.
- Clear all empties the list.
- The empty state appears with suggestions.

---

# ➕ Save a Product

From a homepage card, a search result, or a product page:

```text
Product
   ↓
❤️ Heart
   ↓
Wishlist Selection
```

Verify:

- The heart fills.
- The navbar badge increments.
- The product appears on `/wishlist`.

---

# ➖ Remove a Product

```text
Saved Product
      ↓
❤️ Heart (again)
      ↓
Removed
```

Verify that only that product disappears, and that the badge decrements.

---

# 🔁 Toggle Verification

```text
Save   → Unsave  → Save
```

Verify the wishlist returns to its original state and no duplicate is created.

---

# 🚫 Duplicate Verification

Click the heart on the same product from three different places:

```text
Homepage card
Search result
Product details
```

### Expected

```text
1 saved product
```

---

# 🧹 Clear Wishlist

From the toolbar:

```text
Clear all
   ↓
Empty state
```

Verify the badge returns to zero and the suggestions block appears.

---

# 🔃 Sorting Verification

```text
Recently added        newest saved first
Price: Low to High    ascending
Price: High to Low    descending
Customer Rating       highest first, more reviews wins a tie
```

Then switch back to **Recently added**.

### Expected

```text
Original order intact
```

This is the check that catches a mutating sort.

---

# 💾 Persistence Verification

## Inspect Stored Value

```text
DevTools → Application → Local Storage → cartwise:wishlist
```

### Expected

```json
["slug-c","slug-b","slug-a"]
```

Newest first.

---

## Reload Test

```text
Save 3 products
      ↓
Reload
      ↓
3 products still saved
```

---

## Corrupt Value Test

Set the stored value manually and reload:

```text
"not json"        → empty wishlist, no crash
{"a":1}           → empty wishlist, no crash
["a","a"]         → one entry
["a",42,null]     → one entry
```

---

## Missing Slug Test

Add a slug that does not exist to the stored array and reload:

```text
["iphone-16-pro","does-not-exist"]
      ↓
Pruned automatically
      ↓
Badge corrects itself
```

---

# ⏳ Loading State Verification

```text
Open /wishlist with saved products
      ↓
Skeleton (card count matches the selection)
      ↓
Grid, with no layout jump
```

The 300 ms delay comes from `WISHLIST_LATENCY_MS`.

---

# ⚖️ Independence Verification

```text
Add products to Compare
      ↓
Clear the Wishlist
      ↓
Comparison unchanged
```

and:

```text
Save products to the Wishlist
      ↓
Clear the Comparison
      ↓
Wishlist unchanged
```

---

# ♿ Accessibility Verification

## Keyboard

```text
Tab to a heart  → visible focus ring
Enter / Space   → toggles
Tab to sort     → native select, arrow keys work
```

## Screen Reader

```text
"Add to wishlist, toggle button, not pressed"
"Remove from wishlist, toggle button, pressed"
"Wishlist (3)"
```

---

# 📱 Responsive Verification

```text
360px    1 column
400px    2 columns
1024px   3 columns
1280px   4 columns
```

Verify the toolbar wraps instead of overflowing on narrow screens.

---

# 🌿 Git Commands

## Check Status

```bash
git status
```

---

## Stage Changes

```bash
git add .
```

---

## Commit

```bash
git commit -m "feat: implement Chapter 13 wishlist"
```

---

## Push

```bash
git push origin main
```

---

## Verify History

```bash
git log --oneline -5
```

---

# 📄 Documentation Commands

## Create Chapter Folder

```bash
mkdir -p docs/CH13_Wishlist
```

---

## Commit Documentation

```bash
git add docs/CH13_Wishlist
git commit -m "docs: add Chapter 13 wishlist documentation"
git push origin main
```

---

# 📌 Command Summary

```bash
npm run dev
npm run build
npm run preview
npx tsc --noEmit
npx eslint src --max-warnings=0
git add .
git commit -m "feat: implement Chapter 13 wishlist"
git push origin main
```
