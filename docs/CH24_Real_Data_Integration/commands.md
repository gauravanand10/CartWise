# 💻 CH24 — Commands

> **Project:** CartWise  
> **Chapter:** Real Data Integration

This file contains the commands used to research pricing APIs, integrate real product photography, audit navigation, and verify the results.

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

---

# 🔍 Pricing API Research

## Test a Candidate API Directly (don't trust the docs alone)

```bash
curl -i https://api.example-pricing-service.com/v1/search?q=iphone
```

Confirm the actual response — status code, error body — rather than assuming an API works from its marketing page.

### Real results from this chapter

```text
eBay Browse API   → 403
Pexels             → 401
Unsplash           → 401
PricesAPI          → advertises free tier, but signup is a web
                      form with no programmatic endpoint
```

---

# 📸 Openverse Integration

## Register for a Token Programmatically

```bash
curl -X POST https://api.openverse.org/v1/auth_tokens/register/ \
  -H "Content-Type: application/json" \
  -d '{"name": "cartwise", "description": "...", "email": "you@example.com"}'
```

## Request an Access Token

```bash
curl -X POST https://api.openverse.org/v1/auth_tokens/token/ \
  -d "client_id=<id>&client_secret=<secret>&grant_type=client_credentials"
```

### Expected

```json
{"access_token": "...", "expires_in": 43200, "token_type": "Bearer", "scope": "read write"}
```

---

## Search by Category (not by exact product name)

```bash
curl -H "Authorization: Bearer <token>" \
  "https://api.openverse.org/v1/images/?q=smartwatch&license_type=commercial&mature=false"
```

### Expected

```json
{
  "results": [
    {
      "id": "...",
      "title": "...",
      "url": "https://live.staticflickr.com/...",
      "creator": "...",
      "license": "by-sa",
      "attribution": "\"...\" by ... is licensed under CC BY-SA 2.0. ..."
    }
  ]
}
```

---

## Check Your Current Rate Tier

Read the response headers on any request:

```text
x-ratelimit-limit-anon_burst
x-ratelimit-limit-anon_sustained
```

### Expected (verified email)

```text
x-ratelimit-limit-anon_burst: 20/min
x-ratelimit-limit-anon_sustained: 200/day
```

---

## Trigger the Backfill Job

```bash
curl -X POST http://localhost:8080/api/admin/products/backfill-images \
  -H "Authorization: Bearer <your-cartwise-jwt>"
```

### Expected (first run)

```json
{"updated": 50, "skipped": 0, "unmatched": 0, "unmatchedSlugs": []}
```

### Expected (second run — proves idempotency)

```json
{"updated": 0, "skipped": 50}
```

### Expected (unauthenticated)

```text
401
```

---

# 🗄️ Database Verification

## Confirm Image Columns Were Added

```bash
psql -U cartwise -d cartwise_dev -h localhost -c "\d products"
```

Look for `image_url`, `image_license`, `image_source_url`, `image_attribution`, `creator`, `image_fetched_at` (or your actual column names).

---

## Confirm All 50 Products Have Real Photos

```bash
psql -U cartwise -d cartwise_dev -h localhost -c \
  "SELECT slug, image_url, image_license, creator, image_fetched_at FROM products ORDER BY id LIMIT 10;"
```

---

## Confirm License Distribution

```bash
psql -U cartwise -d cartwise_dev -h localhost -c \
  "SELECT image_license, COUNT(*) FROM products GROUP BY image_license;"
```

### Expected

```text
image_license | count
--------------+-------
by-sa         |    23
by            |    23
cc0           |     3
pdm           |     1
```

---

## Confirm No Products Were Missed

```bash
psql -U cartwise -d cartwise_dev -h localhost -c \
  "SELECT COUNT(*) FROM products WHERE image_url IS NULL OR image_url LIKE '%placehold.co%';"
```

### Expected

```text
count
-------
    0
```

---

# 🖼️ Photo Verification

## Confirm a Stored URL Actually Returns a Real Image

```bash
curl -I "https://live.staticflickr.com/2463/...jpg"
```

### Expected

```text
HTTP/2 200
content-type: image/jpeg
content-length: <98000-180000 range>
```

---

## Browser-Based Load Check

```js
// Run in the browser console on /browse
const imgs = [...document.querySelectorAll('img')];
console.log({
  total: imgs.length,
  loaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length,
  broken: imgs.filter(i => i.complete && i.naturalWidth === 0).length,
});
```

### Expected

```json
{"total": 11, "loaded": 11, "broken": 0}
```

---

# 🐛 SafeImage Diagnosis Commands

## Directly Test Whether onError Fires for a Real 404

```html
<img src="/definitely-does-not-exist.jpg" onerror="console.log('error fired')" />
```

## Directly Test a 200-With-Wrong-Content-Type Response

```bash
# Point an <img> at any route your dev server returns 200 HTML for
```

Both should log "error fired" if `onError` is working correctly — confirming or ruling out a dev-server-quirk theory before building a fix around it.

## Check Tab Visibility State (relevant to lazy-loading)

```js
console.log(document.visibilityState); // "visible" or "hidden"
```

Run this before assuming a lazy-loaded image is "stuck" rather than simply not yet triggered.

---

# 🔗 Navigation Audit Commands

## Find Every Anchor/Button With No Real Destination

```bash
grep -rn 'href="#"' frontend/src
grep -rn "to=\"#\"" frontend/src
grep -rn "onClick={() => {}}" frontend/src
```

Starting point only — confirm each result by actually clicking it in the running app, not by the grep result alone.

---

## Confirm Zero Dead Anchors After Fixing

```text
Manually click every element on:
  /
  /browse
  /search
  /compare
  /wishlist
  /product/:slug
```

Record each one's destination and confirm it's a real, populated page.

---

# 🧪 Test Suite

## Backend — Full Suite

```bash
cd backend
./mvnw clean test
```

### Expected

```text
Tests run: 359, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

359 = CH23.5 baseline (351) + 8 new tests (6 image service, 2 mapper).

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

---

## TypeScript Check

```bash
cd frontend
npx tsc --noEmit
```

### Expected

```text
0 errors
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
git commit -m "feat: Chapter 24 real data integration - Openverse product photography, full navigation audit, pricing API research"
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
mkdir -p docs/CH24_Real_Data_Integration
```

---

## Commit Documentation

```bash
git add docs/CH24_Real_Data_Integration
git commit -m "docs: add Chapter 24 real data integration documentation"
git push origin main
```

---

# 📌 Command Summary

```bash
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
cd frontend && npm run dev
curl -X POST http://localhost:8080/api/admin/products/backfill-images -H "Authorization: Bearer <jwt>"
psql -U cartwise -d cartwise_dev -h localhost -c "SELECT image_license, COUNT(*) FROM products GROUP BY image_license;"
cd backend && ./mvnw clean test
cd frontend && npx vitest run
cd frontend && npx tsc --noEmit
git add -A
git commit -m "feat: Chapter 24 real data integration - Openverse product photography, full navigation audit, pricing API research"
git push origin main
```
