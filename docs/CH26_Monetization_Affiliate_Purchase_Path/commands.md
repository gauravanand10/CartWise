# 💻 CH26 — Commands

> **Project:** CartWise
> **Chapter:** Monetization — Affiliate Purchase Path

This file contains the commands used to build, verify, and check the affiliate system, the expanded catalogue, and the redesign.

---

# 🚀 Development Commands

## Start Backend (Dev Profile)

```powershell
cd D:\Software_Engineering\CartWise\backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=dev"
```

Wait for `Started CartwiseBackendApplication` — confirms Flyway ran through V6 and the app is up on 8080.

---

## Start Frontend

```powershell
cd D:\Software_Engineering\CartWise\frontend
npm run dev
```

---

# 🛫 Flyway Commands

## Check Migration Status

```bash
./mvnw flyway:info
```

### Expected

```text
| Category  | Version | Description                    | State   |
| Versioned | 1       | baseline                       | Success |
| Versioned | 2       | add functional index lower cat | Success |
| Versioned | 3       | seed products                  | Success |
| Versioned | 4       | add product image attribution  | Success |
| Versioned | 5       | add affiliate clicks           | Success |
| Versioned | 6       | expand catalogue to 100        | Success |
```

---

# 🗄️ Database — Catalogue Verification

## Connect via psql

```bash
psql -U cartwise -d cartwise_dev -h localhost
```

---

## Verify Product Count

```sql
SELECT COUNT(*) FROM products;
```

### Expected

```text
count
-------
  100
```

---

## Verify Category Breakdown

```sql
SELECT category, COUNT(*) FROM products GROUP BY category ORDER BY category;
```

### Expected

```text
category      | count
--------------+-------
Accessories   |    16
Earbuds       |    12
Headphones    |    11
Laptop        |    16
Smartphone    |    22
Smartwatch    |    11
Television    |    12
```

---

## Check a Renamed Product Resolved Correctly

```sql
SELECT id, slug, name FROM products WHERE slug IN ('samsung-galaxy-buds-4-pro', 'sony-wf-1000xm6');
```

### Expected

```text
Both slugs return 0 rows — corrected in place to their real current model
names, same IDs. Confirm the corrected slugs instead:
SELECT id, slug, name FROM products WHERE id IN (<the two known IDs>);
```

---

# 💰 Database — Affiliate Verification

## Inspect the Click Table

```sql
\d affiliate_clicks
```

---

## Count Clicks by Retailer

```sql
SELECT retailer, COUNT(*) FROM affiliate_clicks GROUP BY retailer ORDER BY retailer;
```

---

## Confirm Both Attribution Paths Exist

```sql
SELECT
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) AS attributed,
  COUNT(*) FILTER (WHERE user_id IS NULL)     AS anonymous
FROM affiliate_clicks;
```

---

## Confirm a User Deletion Anonymises, Not Deletes, Their Clicks

```sql
BEGIN;
DELETE FROM users WHERE id = <test user id>;
SELECT COUNT(*) FROM affiliate_clicks WHERE user_id = <test user id>; -- expect 0
SELECT COUNT(*) FROM affiliate_clicks WHERE product_id IN (SELECT product_id FROM affiliate_clicks WHERE user_id IS NULL); -- rows survive, anonymised
ROLLBACK;
```

---

# 🔀 Manual Redirect Verification

## Confirm a Real 302 Without Following It

```bash
curl -s -D - -o /dev/null http://localhost:8080/api/affiliate/click/amazon/iphone-16-pro
```

### Expected

```text
HTTP/1.1 302
Location: https://www.amazon.in/s?k=iPhone+16+Pro&tag=cartwise-test-00
Cache-Control: no-store
```

---

## Follow It and Confirm the Retailer Page Actually Loads

```bash
curl -sL -o /dev/null -w "final_url=%{url_effective}\nhttp=%{http_code}\n" \
  http://localhost:8080/api/affiliate/click/amazon/iphone-16-pro
```

---

## Confirm a Retired Slug 404s Instead of Redirecting

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/affiliate/click/amazon/<old-slug>
```

### Expected

```text
404
```

---

## Confirm the Affiliate Tag Never Reaches Rendered Markup

```bash
# In the browser console, on a page rendering "Visit store" links:
document.querySelectorAll('a[rel*="sponsored"]')
```

### Expected

```text
Every href points at /api/affiliate/click/<retailer>/<slug>
No href contains tag=, affid=, or the raw retailer domain
```

---

# 🚦 Rate Limit Verification

## Hammer the Click Endpoint

```bash
for i in $(seq 1 40); do
  curl -s -o /dev/null -w "%{http_code} " http://localhost:8080/api/affiliate/click/amazon/iphone-16-pro
done
```

### Expected

```text
302 302 302 ... (~30-31 times) ... 429 429 429 429 429 ...
```

---

## Confirm the Disclosure-Backing Endpoint Is Exempt

```bash
for i in $(seq 1 40); do
  curl -s -o /dev/null -w "%{http_code} " http://localhost:8080/api/affiliate/retailers
done
```

### Expected

```text
200 200 200 200 ... (never 429)
```

---

# 📊 Admin Analytics Verification

## As Admin

```bash
curl -s -H "Authorization: Bearer <admin-token>" http://localhost:8080/api/admin/affiliate/clicks
```

### Expected

```json
{"totalClicks": 46, "attributedClicks": 3, "anonymousClicks": 43, "..." }
```

---

## As Non-Admin (Should Be Blocked)

```bash
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer <user-token>" http://localhost:8080/api/admin/affiliate/clicks
```

### Expected

```text
403
```

---

## Anonymous (Should Be Blocked)

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/admin/affiliate/clicks
```

### Expected

```text
401
```

---

# 🎨 Design Verification

## TypeScript

```bash
cd frontend
npx tsc -b
```

### Expected

```text
exit 0, no output
```

---

## ESLint

```bash
npx eslint .
```

### Expected

```text
exit 0, no output
```

---

## Search for Any Surviving Fabricated Copy

```bash
grep -riE "no-cost emi|free delivery|10-minute delivery|delivering to|save up to|get it by|EMI per month|AI shopping assistant" frontend/src/
```

### Expected

```text
No hits outside explanatory code comments describing what was removed
```

---

## Search for Leftover References to the Deleted Local Catalogue

```bash
grep -rn "catalogue" frontend/src/features/product/
```

### Expected

```text
No import of a local catalogue.ts data file — only real API-backed services
```

---

# 🧪 Test Suite

## Backend

```bash
cd backend
./mvnw clean test
```

### Expected

```text
Tests run: 393, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

`Skipped: 0` matters here specifically — Docker must be running for the Testcontainers repository tests to execute rather than silently skip.

---

## Frontend

```bash
cd frontend
npx vitest run
```

### Expected

```text
Test Files  10 passed (10)
     Tests  148 passed (148)
```

---

# 🧯 Troubleshooting

## Backend Test Count Looks Wrong

If a custom script sums Surefire's `tests=` XML attribute, don't trust it blindly — that attribute de-duplicates by bare method name, undercounting when the same method name appears in two different `@Nested` classes. Count actual `<testcase>` elements instead:

```bash
grep -c "<testcase" backend/target/surefire-reports/*.xml
```

---

## A "Green" Backend Test Run Skipped More Than Expected

Check whether Docker was actually running before trusting the result:

```bash
docker ps
```

If it wasn't, start it and re-run `./mvnw clean test` — a `BUILD SUCCESS` with Docker down still reports success while silently skipping every Testcontainers-backed test.

---

## Responsive Check at 360px Doesn't Actually Resize

Some browser windows have a minimum width the OS won't let them shrink below. Test inside an iframe instead of resizing the real window:

```html
<iframe src="http://localhost:5173" style="width:360px; height:800px;"></iframe>
```

```js
// Inside the iframe's context
({ innerW: window.innerWidth, scrollW: document.documentElement.scrollWidth, horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth })
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
git commit -m "feat: implement Chapter 26 affiliate monetization, real catalogue, and redesign"
```

---

## Push

```bash
git push origin main
```

---

# 📄 Documentation Commands

## Create Chapter Folder

```bash
mkdir -p docs/CH26_Monetization_Affiliate_Purchase_Path
```

---

## Commit Documentation

```bash
git add docs/CH26_Monetization_Affiliate_Purchase_Path
git commit -m "docs: add Chapter 26 monetization documentation"
git push origin main
```

---

# 📌 Command Summary

```bash
./mvnw spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=dev"
npm run dev
./mvnw flyway:info
curl -s -D - -o /dev/null http://localhost:8080/api/affiliate/click/amazon/iphone-16-pro
./mvnw clean test
npx vitest run
npx tsc -b
npx eslint .
git add -A
git commit -m "feat: implement Chapter 26 affiliate monetization, real catalogue, and redesign"
git push origin main
```
