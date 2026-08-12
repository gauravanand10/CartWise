# 💻 CH14 — Commands

> **Project:** CartWise  
> **Chapter:** State Management

This file contains the commands used to audit, harden, verify, and commit the State Management changes.

---

# 🚀 Development Commands

## Start Development Server

```bash
npm run dev
```

Starts the CartWise development server. Cross-tab verification requires two browser tabs pointed at the same running instance.

---

## Build Production Version

```bash
npm run build
```

Runs `tsc -b` and then `vite build`.

---

## Preview Production Build

```bash
npm run preview
```

Runs the production build locally for final verification.

---

# 🔍 State Audit Commands

## Find Every useState Call

```bash
grep -rn "useState" src --include=*.tsx --include=*.ts
```

## Find Every useContext / Context Definition

```bash
grep -rn "useContext\|createContext" src --include=*.tsx --include=*.ts
```

## Find Every localStorage Touchpoint

```bash
grep -rn "localStorage" src --include=*.tsx --include=*.ts
```

This is the command that surfaced the third duplication (`useRecentSearches`) that wasn't part of the original two-feature comparison.

## List All Context Providers Specifically

```bash
grep -rln "createContext" src/features
```

### Expected

```text
src/features/wishlist/context/wishlistContext.ts
src/features/compare/context/compareContext.ts
```

Confirms exactly two Context providers exist in the application.

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

# 🗂️ Shared Store Verification

## Confirm persistedList.ts Location

```bash
ls src/lib/
```

### Expected

```text
currency.ts
persistedList.ts
```

## Confirm No New Dependencies Were Added

```bash
git diff package.json
```

### Expected

```text
(no output — package.json unchanged)
```

---

# 🧪 Migration Testing

## Seed a Legacy Bare Array (DevTools Console)

```js
localStorage.setItem("cartwise:wishlist", JSON.stringify(["iphone-16-pro", "galaxy-s25-ultra"]));
```

Then reload the page and confirm both products still appear, in the same order, with no console errors.

## Inspect the Migrated Value

```text
DevTools → Application → Local Storage → cartwise:wishlist
```

### Before a real write

```json
["iphone-16-pro","galaxy-s25-ultra"]
```

### After one add/remove/toggle/clear action

```json
{"v":1,"items":["iphone-16-pro","galaxy-s25-ultra"]}
```

## Confirm Reading Alone Does Not Rewrite Storage

```text
Seed a legacy array
      ↓
Reload
      ↓
Inspect storage immediately, before clicking anything
      ↓
Value is still the legacy bare array
```

---

# 🪟 Cross-Tab Verification

## Open Two Tabs on the Same Instance

```text
Tab A: http://localhost:5175/wishlist
Tab B: http://localhost:5175/wishlist
```

## Track Writes Made by the Receiving Tab (DevTools Console, Tab B)

```js
let writesMadeByTabB = [];
const originalSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = (...args) => {
    writesMadeByTabB.push(args);
    return originalSetItem(...args);
};
```

Then perform an action in Tab A, and in Tab B check:

```js
writesMadeByTabB;
```

### Expected

```text
[]
```

Confirms the receiving tab never writes in response to a sync event — the loop-free guarantee.

## Test the storage Event Directly (DevTools Console)

```js
window.dispatchEvent(new StorageEvent("storage", {
    key: "cartwise:wishlist",
    newValue: JSON.stringify({ v: 1, items: ["pixel-9-pro"] }),
    oldValue: localStorage.getItem("cartwise:wishlist"),
    storageArea: localStorage,
}));
```

Verify the UI updates without a reload.

## Test the Clear Path

```js
window.dispatchEvent(new StorageEvent("storage", {
    key: null,
    newValue: null,
    oldValue: localStorage.getItem("cartwise:wishlist"),
    storageArea: localStorage,
}));
```

### Expected

```text
Wishlist state resets to empty, no crash.
```

---

# 🚨 Hostile Storage Testing

## Force localStorage to Throw (DevTools Console)

```js
const throwError = () => { throw new Error("Storage blocked"); };
Object.defineProperty(window, "localStorage", {
    value: { getItem: throwError, setItem: throwError, removeItem: throwError },
});
```

Then click wishlist/compare controls and confirm:

```text
No uncaught error in console.
Page renders fully.
```

Reload the tab afterward to restore normal `localStorage` behavior.

---

# ❤️ Wishlist Regression Testing

```text
Add / remove / toggle / clear         → unchanged
Sort (recent/price/rating)            → unchanged, storage unmutated
Duplicate prevention                  → unchanged
Persistence across reload             → unchanged
Self-healing of unresolvable slugs    → unchanged
```

---

# ⚖️ Compare Regression Testing

```text
Add / remove                          → unchanged
4-item cap, 5th control disabled      → unchanged
Persistence across reload             → unchanged
Cap still applies to a value written  → verify by cross-tab test
by another tab
```

---

# 🌿 Git Commands

## Check Exactly What Changed

```bash
git status
```

### Expected

```text
modified:   src/features/wishlist/context/WishlistProvider.tsx
modified:   src/features/compare/context/CompareProvider.tsx
new file:   src/lib/persistedList.ts
```

## Stage Changes

```bash
git add .
```

## Commit

```bash
git commit -m "refactor: harden state management with cross-tab sync and schema versioning"
```

## Amend a Bad Commit Message

```bash
git commit --amend -m "refactor: harden state management with cross-tab sync and schema versioning"
```

Use plain `-m` with standard quoting rather than a shell here-string, to avoid stray characters ending up in the subject line.

## Push

```bash
git push origin main
```

## Verify History

```bash
git log --oneline -5
```

---

# 📄 Documentation Commands

## Create Chapter Folder

```bash
mkdir -p docs/CH14_State_Management
```

## Commit Documentation

```bash
git add docs/CH14_State_Management
git commit -m "docs: add Chapter 14 state management documentation"
git push origin main
```

---

# 📌 Command Summary

```bash
grep -rn "useState\|useContext\|localStorage" src --include=*.tsx --include=*.ts
npm run dev
npx tsc --noEmit
npx eslint src --max-warnings=0
npm run build
git add .
git commit -m "refactor: harden state management with cross-tab sync and schema versioning"
git push origin main
```
