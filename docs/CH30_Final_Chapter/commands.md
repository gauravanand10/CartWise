# 💻 CH30 — Commands

> **Project:** CartWise
> **Chapter:** Final Chapter — Real Imagery, Real Search, Deployment Prep, Mobile Submission, and Project Retrospective

This file contains the commands used to close out the whole project: tiered imagery matching, real backend search, deployment prep, the mobile build, and the final full-project audit.

---

# 🖼️ Imagery — Tiered Backfill

## Re-run the Backfill With Exact-Match-First Logic

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--backfill.images=true --backfill.tier=exact-then-category"
```

(Or whatever the project's actual backfill trigger mechanism is — confirm against `ImageBackfillService` before assuming a flag name.)

---

## Verify Match-Rate Results

```sql
SELECT
  COUNT(*) FILTER (WHERE image_match_tier = 'exact')    AS exact_matches,
  COUNT(*) FILTER (WHERE image_match_tier = 'category')  AS category_matches,
  COUNT(*) FILTER (WHERE image_url IS NULL)              AS no_image
FROM products;
```

### Expected

```text
exact_matches | category_matches | no_image
--------------+-------------------+----------
           24 |                76 |        0
```

---

## Spot-Check for Mismatches Visually, Not Just Programmatically

```text
Open every product's detail page in a real browser and actually look at
the photo — a search-token match or a passed test does not guarantee the
image is genuinely representative. This is how the kitchen-photo and
JFK-broadcast mismatches were found; neither would show up in a query.
```

---

# 🔎 Search — Verification

## Confirm the Real Endpoint Finds All 100 Products

```bash
for term in "iphone" "pixel" "galaxy" "thinkpad" "sony" "bose" "garmin"; do
  echo "=== $term ==="
  curl -s "http://localhost:8080/api/products?q=$term" | jq '.content | length'
done
```

---

## Confirm a Product Only Findable in the Old Mock File Now Resolves via the Real API

```bash
curl -s "http://localhost:8080/api/products?q=Garmin+Fenix+8" | jq '.content[].slug'
```

### Expected

```text
Returns a real result — this was one of the products invisible to the
old mock-file-backed search
```

---

## Confirm the Mock File Is Actually Gone

```bash
find frontend/src -iname "*mock*product*"
```

### Expected

```text
No results
```

---

# 🚀 Deployment — Configuration Validation

## Validate Railway Config Locally (if the CLI is available)

```bash
railway up --detach --dry-run
```

---

## Validate Render Config Structure

```bash
# render.yaml is schema-checked by Render on connect — at minimum,
# confirm it's valid YAML before handoff:
python3 -c "import yaml; yaml.safe_load(open('render.yaml'))"
```

---

## Confirm Every Documented Secret Is Actually Referenced Somewhere Real

```bash
grep -rn "System.getenv\|@Value" backend/src/main/java | grep -oE '"[A-Z_]+"' | sort -u
```

Cross-check this list against `DEPLOYMENT.md` — every secret the app actually reads should be documented, and nothing documented should be unused.

---

# 📱 Mobile — Build and Run

## Add the Android Platform

```bash
cd frontend
npx cap add android
npx cap sync android
```

---

## Run on a Real Emulator (Not Just Build)

```bash
npx cap run android
```

---

## Build a Signed Release AAB

```bash
cd android
./gradlew bundleRelease
```

### Expected

```text
app/build/outputs/bundle/release/app-release.aab
```

---

## Confirm the Capacitor Origin Is in the Backend's CORS Allowlist

```bash
curl -s -H "Origin: capacitor://localhost" -I http://localhost:8080/api/products | grep -i "access-control-allow-origin"
```

### Expected

```text
Access-Control-Allow-Origin: capacitor://localhost
```

If this is missing, the wrapped app will silently fail against any real deployment, not just locally.

---

## Confirm Play Store Screenshot Dimensions

```bash
identify -format "%wx%h\n" screenshots/*.png
```

### Expected

```text
Every image at or under the Play Store's 2:1 aspect ratio limit
```

---

# 🔬 Final Project Audit

## Full Backend Suite (Docker Must Be Running)

```bash
cd backend
./mvnw clean test
```

### Expected

```text
Tests run: 409, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

---

## Full Frontend Suite

```bash
cd frontend
npx vitest run
npx tsc -b
npx eslint .
```

---

## Fresh-Build Verification (Chapter 27's Method, One Final Time)

```powershell
Remove-Item -Recurse -Force dist
npm run build
$bundleText = [System.IO.File]::ReadAllText("dist\assets\index-<hash>.js")
@("% off","Save up to","AI score","storeRating","Compared across 9","9 stores","10-minute","Never overpay") |
  ForEach-Object { "$_ -> " + ([regex]::Matches($bundleText, [regex]::Escape($_))).Count }
```

### Expected

```text
All zero — a final, project-wide confirmation, not just this chapter's
```

---

## Find Stale Comments Describing Removed Limitations

```bash
grep -rn "mock catalogue\|mock data\|placeholder data" backend/src frontend/src --include=*.ts --include=*.tsx --include=*.java
```

Manually confirm each hit still describes something real — correct or remove any that no longer do.

---

# 🌿 Final Protected Commit

```bash
git status --porcelain -- docs/
git add -A -- . ':!docs'
git diff --cached --name-only -- docs/
git commit -m "feat: final chapter — real imagery, real search, deployment prep, and mobile package"
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
curl -s "http://localhost:8080/api/products?q=<term>"
railway up --detach --dry-run
npx cap add android && npx cap sync android
npx cap run android
cd android && ./gradlew bundleRelease
curl -s -H "Origin: capacitor://localhost" -I http://localhost:8080/api/products
./mvnw clean test
npx vitest run
npx tsc -b
npx eslint .
Remove-Item -Recurse -Force dist
npm run build
git add -A -- . ':!docs'
git commit -m "feat: final chapter — real imagery, real search, deployment prep, and mobile package"
git push origin main
```
