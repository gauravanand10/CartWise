# 💻 CH23 — Commands

> **Project:** CartWise  
> **Chapter:** Finish Wiring & Consolidate

This file contains the commands used to develop, verify, and commit the auth layer, real wishlist/compare API wiring, ProductCard unification, and Tailwind token migration.

---

# 🚀 Development Commands

## Start Backend (Dev Profile)

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

## Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

## Build Frontend Production Version

```bash
cd frontend
npm run build
```

Runs `tsc -b` then `vite build` — fails on a TypeScript error before any output is produced.

---

# 🔍 TypeScript

## Check TypeScript

```bash
cd frontend
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
cd frontend
npx eslint src
```

### Expected (as of this chapter)

```text
3 errors (all pre-existing, unrelated to this chapter's diff)
0 warnings
```

The 3 remaining errors live in `useCatalogueParams.test.tsx:27` (file untouched this chapter) and `renderWithProviders.tsx:67,69` (`locationRef`/`LocationRecorder`, outside this chapter's changes). Confirm any lint failures are actually pre-existing by checking they fall outside your diff before assuming they're new.

---

# 🔐 Auth Feature Testing

## Sign Up a New User

```text
Navigate to /signup
Fill email + password (8-72 bytes)
Submit
```

Verify:

- 201 response, redirect to the page the user was trying to reach (or home)
- Session appears under `cartwise.auth.session` in DevTools → Application → Local Storage

---

## Log In

```text
Navigate to /login
Fill existing credentials
Submit
```

Verify:

- 200 response, session stored, redirect completes
- Navbar switches from "Login" to showing the user's email + "Sign out"

---

## Log In With Wrong Password

```text
Navigate to /login
Fill correct email, wrong password
Submit
```

### Expected

```text
401 — generic failure message
(deliberately identical whether the email exists or not — anti-enumeration)
```

---

## Session Persistence on Reload

```text
Log in
      ↓
Reload the page
      ↓
Still logged in — no re-login prompt
```

---

## Route Protection

```text
Log out
Navigate directly to /wishlist by URL
      ↓
Redirected to /login
```

Repeat for `/compare`.

---

# ❤️ Wishlist — Real API Verification

## Toggle a Wishlist Item

```text
Log in
Toggle a heart on any ProductCard
```

Verify:

- Heart fills immediately (optimistic update, before any network response)
- Reload the page — heart is still filled (proves backend persistence, not localStorage)

---

## Confirm Persistence via Database, Not Just the UI

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "SELECT * FROM wishlists WHERE user_id = <your-user-id>;"
```

### Expected

```text
The row actually exists in the wishlists table.
```

This is the check that distinguishes real backend persistence from a UI that merely looks consistent with a stale cache.

---

## Double-Click Race Condition Check

```text
Click a heart twice, quickly, in succession (add then remove)
```

Verify:

- Final state matches the last click's intent
- No item reappears that was just removed (the 404-on-DELETE fix)

---

# ⚖️ Compare — Real API Verification

## Add to Compare

```text
Log in
Add 2-3 products to Compare
```

Verify:

- Compare page reflects the additions
- `psql -U cartwise -d cartwise_dev -h localhost -c "SELECT * FROM comparisons WHERE user_id = <your-user-id>;"` shows the rows

---

## Independence Check

```text
Remove an item from Wishlist
      ↓
Compare selection unchanged

Clear the Compare selection
      ↓
Wishlist unchanged
```

---

## Server-Side Cap Enforcement

```text
Attempt to add a 5th product to Compare
```

### Expected

```text
Rejected — 4-item cap enforced server-side, not just client-side
```

---

# 🧱 ProductCard Verification

## Confirm Zero Remaining References to the Deleted Component

```bash
grep -r "features/home/components/product/ProductCard" frontend/src
```

### Expected

```text
No matches.
```

Run this before deleting the file, not just after, to confirm it's actually safe.

---

## Visual Consistency Check

```text
Visit every page rendering a ProductCard:
  Homepage
  Search results
  Wishlist
  Compare
  Related products
```

Verify all render identically from the single merged component.

---

# 🎨 Tailwind Token Verification

## Confirm Tailwind Version Before Migrating

```bash
cd frontend
cat package.json | grep tailwindcss
```

Confirms whether `@theme` (v4) or `theme.colors` in `tailwind.config.js` (v3) is the correct migration path.

---

## Diff Old vs New Color Values

```bash
git diff frontend/src/index.css
```

Manually confirm every migrated color's hex/rgb value is unchanged — this should be a pure structural move.

---

## Visual Regression Check

```text
Load every page in light mode — confirm no color shifted
Toggle dark mode, if implemented — confirm no color shifted
```

---

# 🧪 Test Suite

## Backend — Full Suite

```bash
cd backend
./mvnw clean test
```

### Expected

```text
Tests run: 351, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

351 = the CH22 baseline (313) plus the 38 new comparison backend tests.

---

## Frontend — Full Suite

```bash
cd frontend
npx vitest run
```

### Expected

```text
Test Files  7 passed (7)
Tests       127 passed (127)
```

127 = 120 (CH21 baseline) + 7 new auth tests.

---

## Frontend — Build Verification

```bash
cd frontend
npm run build
```

### Expected

```text
✓ built in ~1.3s
```

---

# 🗄️ Database Inspection

## Confirm Wishlist Table Exists and Is Populated

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "\d wishlists"
psql -U cartwise -d cartwise_dev -h localhost -c "SELECT COUNT(*) FROM wishlists;"
```

---

## Confirm Comparisons Table Exists and Is Populated

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "\d comparisons"
psql -U cartwise -d cartwise_dev -h localhost -c "SELECT COUNT(*) FROM comparisons;"
```

---

## Confirm Users Table Has the Newly Signed-Up Account

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "SELECT id, email FROM users ORDER BY id DESC LIMIT 5;"
```

---

# 🌿 Git Commands

## Check Status

```bash
git status
```

---

## Stage Changes

```bash
git add -A
```

---

## Commit

```bash
git commit -m "feat: Chapter 23.5 - auth layer, wishlist/compare wired to real API with optimistic updates"
```

---

## Handling a Merge Conflict on Push (if the remote has moved)

```bash
git pull origin main
```

If conflicts appear only in doc files where you want to keep your local version:

```bash
git checkout --ours <path-to-conflicted-file>
git add <path-to-conflicted-file>
git commit -m "merge: keep local docs, resolve conflict with remote"
git push origin main
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
mkdir -p docs/CH23_Finish_Wiring_and_Consolidate
```

---

## Commit Documentation

```bash
git add docs/CH23_Finish_Wiring_and_Consolidate
git commit -m "docs: add Chapter 23 finish wiring documentation"
git push origin main
```

---

# 📌 Command Summary

```bash
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
cd frontend && npm run dev
cd frontend && npx tsc --noEmit
cd frontend && npx eslint src
cd backend && ./mvnw clean test
cd frontend && npx vitest run
cd frontend && npm run build
psql -U cartwise -d cartwise_dev -h localhost -c "SELECT * FROM wishlists WHERE user_id = <id>;"
psql -U cartwise -d cartwise_dev -h localhost -c "SELECT * FROM comparisons WHERE user_id = <id>;"
git add -A
git commit -m "feat: Chapter 23.5 - auth layer, wishlist/compare wired to real API with optimistic updates"
git push origin main
```
