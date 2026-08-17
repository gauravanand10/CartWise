# 💻 CH25 — Commands

> **Project:** CartWise  
> **Chapter:** Production Hardening & Deployment

This file contains the commands used to audit secrets, verify rate limiting, build and prove the Docker stack, test CI/CD failure and recovery, verify CORS, and confirm real health checks.

---

# 🔍 Secrets Audit

## Grep the Working Tree

```bash
grep -rn "cartwise-dev-only\|password\|secret\|BEGIN.*KEY" \
  --include="*.yml" --include="*.yaml" --include="*.sql" --include="*.json" .
```

Starting point only — confirm every hit manually, don't trust the grep alone.

---

## Search Full Git History for a Known Value

```bash
git log --all -S "cartwise-dev-only-signing-key" --oneline
```

### Expected (if exposed)

```text
9e002aa feat: implement Chapters 18-20
```

This is the check a working-tree-only audit would miss entirely — `-S` searches every commit's content, not just the current state.

---

## Confirm a Secret Was Never Committed

```bash
git log --all -S "<the-secret-value>" --oneline
```

### Expected (clean)

```text
(no output)
```

Used in this chapter to confirm the Openverse client secret from CH24 was never exposed.

---

## Check for a Root .gitignore

```bash
ls -la .gitignore
```

If missing, create one before doing anything else — this chapter found none existed.

---

# 🚦 Rate Limiting Verification

## Trigger the Auth Rate Limit

```bash
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

### Expected

```text
401 (×10 — wrong credentials, but under the limit)
429 (×1 — the 11th, rate limited)
```

---

## Inspect the 429 Response Directly

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
```

### Expected (once limited)

```text
HTTP/1.1 429
Retry-After: 5
{"code":"RATE_LIMIT_EXCEEDED","message":"Too many requests. Try again in 5 seconds.","timestamp":"..."}
```

---

## Confirm Per-User Scoping on Write Endpoints

```bash
# As user A, exhaust the write bucket
for i in $(seq 1 61); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8080/api/wishlist/1 \
    -H "Authorization: Bearer <user-A-token>"
done

# As user B, confirm the bucket is independent
curl -i -X POST http://localhost:8080/api/wishlist/1 \
  -H "Authorization: Bearer <user-B-token>"
```

### Expected

```text
User A's 61st request → 429
User B's request       → 200 or 201 (unaffected)
```

---

# 🐳 Docker Verification

## Build Both Images

```bash
docker compose build
```

---

## Fresh-Database Boot (the real proof)

```bash
docker compose down -v
docker compose up --build
```

### Expected (real Flyway log excerpt)

```text
Successfully validated 4 migrations
Migrating schema "public" to version "1 - baseline"
Migrating schema "public" to version "2 - add functional index lower category"
Migrating schema "public" to version "3 - seed products"
Migrating schema "public" to version "4 - add product image attribution"
Successfully applied 4 migrations to schema "public", now at version v4
Started CartwiseBackendApplication in 7.292 seconds
```

`-v` is not optional — it drops the volume, guaranteeing the database starts genuinely empty.

---

## Confirm No Secrets Baked Into an Image Layer

```bash
docker history cartwise-backend:latest
docker inspect cartwise-backend:latest --format '{{json .Config.Env}}'
```

### Expected

```text
Only JAVA_OPTS and SPRING_PROFILES_ACTIVE present.
No literal secret values in any layer or env list.
```

---

## Confirm the Runtime JWT Value Is Actually Overridden

```bash
docker compose exec backend env | grep JWT_SECRET
```

Confirm the running container's value matches your `.env` / compose override, not the value compiled into `application-dev.yml`.

---

# 🤖 CI/CD Verification (Local Proof, No Live Trigger)

## Run the Exact Backend Command CI Runs

```bash
cd backend
./mvnw clean test
```

## Deliberately Break Something, Confirm the Suite Catches It

```bash
# Example: temporarily make TokenBucket never reject
# (edit the file, don't commit)
./mvnw clean test
echo "Exit code: $?"
```

### Expected

```text
The specific test asserting rejection fails.
Exit code: 1 (or non-zero)
```

## Revert and Confirm Recovery

```bash
git checkout -- backend/src/main/java/com/cartwise/security/TokenBucket.java
./mvnw clean test
echo "Exit code: $?"
```

### Expected

```text
Tests run: 361, Failures: 0, Errors: 0
Exit code: 0
```

## Same Pattern, Frontend

```bash
cd frontend
npx vitest run
# break something, confirm failure, revert, confirm pass
```

---

# 🌐 CORS Verification

## Preflight From the Correct Origin

```bash
curl -i -X OPTIONS http://localhost:8080/api/products \
  -H "Origin: http://localhost:8081" \
  -H "Access-Control-Request-Method: GET"
```

### Expected

```text
HTTP/1.1 200
Access-Control-Allow-Origin: http://localhost:8081
```

---

## Preflight From an Invalid Origin

```bash
curl -i -X OPTIONS http://localhost:8080/api/products \
  -H "Origin: http://evil.example.com" \
  -H "Access-Control-Request-Method: GET"
```

### Expected

```text
HTTP/1.1 403
```

---

## Confirm the Environment Variable Actually Overrides the Default

```bash
CARTWISE_ALLOWED_ORIGINS=http://localhost:9999 docker compose up backend
# then repeat the preflight checks against :9999 instead of :8081
```

This is the exact check that caught the original bug — confirm the env var genuinely changes behavior, not just that it's read without error.

---

# ❤️ Health Check Verification

## Confirm Normal Health

```bash
curl -i http://localhost:8080/actuator/health
```

### Expected

```json
{"status":"UP","components":{"db":{"status":"UP", ...}, ...}}
```

---

## Simulate a Real Outage

```bash
docker compose stop postgres
curl -i http://localhost:8080/actuator/health
```

### Expected

```text
HTTP/1.1 503
{"status":"DOWN","components":{"db":{"status":"DOWN","details":{"error":"..."}}}}
```

---

## Check Whether Readiness Reflects the Outage (it currently doesn't)

```bash
curl -i http://localhost:8080/actuator/health/readiness
```

### Expected (documented gap)

```text
HTTP/1.1 200
{"status":"UP"}     ← stays UP even with the database down
```

This is the known, accepted limitation — not a bug to "fix" by re-running the command differently.

---

## Confirm Recovery

```bash
docker compose start postgres
curl -i http://localhost:8080/actuator/health
```

### Expected

```text
HTTP/1.1 200
{"status":"UP", ...}
```

---

# 🙊 Logging Audit

## Search for Accidental Sensitive Logging

```bash
grep -rn "log\.\(debug\|info\|warn\|error\)" backend/src/main/java | grep -i "password\|token\|jwt\|secret"
```

### Expected

```text
No matches, or every match confirmed to log only a
non-sensitive derivative (e.g., exception class name).
```

---

## Confirm Hibernate Bind Logging Is Not at DEBUG

```bash
grep -A2 "hibernate.orm.jdbc.bind" backend/src/main/resources/application*.yml
```

### Expected

```yaml
hibernate.orm.jdbc.bind: INFO
```

Never `DEBUG` — that level logs actual bound parameter values, including password hashes.

---

# 🔍 TypeScript — The Real Check

## The Vacuous Command (do not trust this alone)

```bash
cd frontend
npx tsc --noEmit
```

Confirm first whether the root `tsconfig.json` has `"files": []` — if so, this command checks nothing.

## The Real Command

```bash
cd frontend
npx tsc -b
```

### Expected

```text
(no output = success, or real errors listed)
```

This is the command CI actually runs after this chapter.

---

# 🧪 Full Test Suite

## Backend

```bash
cd backend
./mvnw clean test
```

### Expected

```text
Tests run: 361, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

## Frontend

```bash
cd frontend
npx vitest run
```

### Expected

```text
Test Files  7 passed (7)
Tests       127 passed (127)
```

## ESLint

```bash
cd frontend
npx eslint .
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
git commit -m "feat: Chapter 25 production hardening - secrets audit, rate limiting, Docker, CI/CD, CORS fix, real health checks"
```

---

## Handling a Merge Conflict on Push (docs written manually elsewhere)

```bash
git pull origin main --no-edit
```

If conflicts appear only in files you've hand-written elsewhere and want to keep as-is:

```bash
git checkout --ours <path-to-file>
git add <path-to-file>
git commit --no-edit
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
mkdir -p docs/CH25_Production_Hardening_and_Deployment
```

---

## Commit Documentation

```bash
git add docs/CH25_Production_Hardening_and_Deployment
git commit -m "docs: add Chapter 25 production hardening documentation"
git push origin main
```

---

# 📌 Command Summary

```bash
git log --all -S "<secret-value>" --oneline
docker compose down -v && docker compose up --build
docker history cartwise-backend:latest
curl -i -X OPTIONS http://localhost:8080/api/products -H "Origin: http://localhost:8081"
docker compose stop postgres && curl -i http://localhost:8080/actuator/health
cd backend && ./mvnw clean test
cd frontend && npx tsc -b && npx vitest run && npx eslint .
git add -A
git commit -m "feat: Chapter 25 production hardening - secrets audit, rate limiting, Docker, CI/CD, CORS fix, real health checks"
git push origin main
```
