# 🛡️ CH25 — Production Hardening & Deployment

> **Project:** CartWise  
> **Chapter:** Production Hardening & Deployment  
> **Feature:** Secrets, Rate Limiting, Docker, CI/CD, Real Health Checks

---

# 👋 Welcome

Every chapter before this one made CartWise more correct. This chapter makes it survivable.

Up to this point, CartWise only existed as `mvnw spring-boot:run` and `npm run dev` on one laptop. The JWT signing key was sitting in plaintext in a YAML file. There was no rate limiting on the login endpoint — nothing stopping a script from trying ten thousand passwords a minute. The health check endpoint returned a hardcoded `"UP"` regardless of whether the database was actually reachable. None of that mattered while CartWise was a solo project running on one machine. All of it matters the moment CartWise is meant to run anywhere else.

The chapter's own final report put it bluntly, in a finding nobody wanted to find:

> "It was committed. `git log --all -S` found it in `9e002aa`. Parameterising it now does not un-publish it — it is recoverable from history permanently."

That's the JWT secret. Not a hypothetical risk — an actual, real, historical exposure, caught by actually searching git history rather than assuming the current file state was the whole story.

```text
🔍 Audit every secret
       ↓
🚦 Rate limit what can be abused
       ↓
🐳 Prove it runs in a container, from empty
       ↓
🤖 Prove CI actually catches a broken build
       ↓
🌐 Fix CORS before it becomes a real deployment blocker
       ↓
❤️ Make the health check actually check something
       ↓
✅ A stack that could genuinely be deployed
```

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- Why a secrets audit has to include git history, not just the current working tree.
- Why a leaked dev-only key can be "accepted, not fixed" and still be a responsible decision.
- Why a token bucket beats a fixed-window rate limiter for the kind of bursty, human-driven traffic a login form actually sees.
- Why rate limiting has to be scoped differently for public endpoints (per-IP) versus authenticated ones (per-user).
- Why a multi-stage Dockerfile matters, and what "dev-convenience image" actually costs in production.
- Why proving CI works means proving it can fail, not just watching it pass once.
- Why a hardcoded CORS origin list is a real deployment bug waiting to happen, not a style preference.
- Why a health check that always returns "UP" is worse than having no health check at all.
- Why liveness and readiness are different questions, and what happens when a system only answers one of them.
- Why `tsc --noEmit` can report "0 errors" while checking nothing at all — and how that surfaced in this exact chapter.

---

# 🧭 What "Production-Ready" Actually Required

```text
🔐 Part A — Secrets audit
🚦 Part B — Rate limiting
🐳 Part C — Dockerize both services
🤖 Part D — CI/CD
🌐 Part E — CORS, HTTPS-readiness, headers
❤️ Part F — Health checks and logging
```

Six parts, and every single one of them found at least one real, previously-unnoticed problem. This wasn't a chapter of applying best-practice checkboxes to a codebase that was already fine — it was six separate investigations, each of which turned up something that would have caused a real incident in a real deployment.

---

# 🤔 "Accepted" vs. "Fixed"

This chapter introduced a distinction worth being precise about, because the two outcomes look similar in a changelog and are not similar at all.

**Fixed** means the underlying problem no longer exists.

**Accepted** means the underlying problem still exists, but a informed decision was made that dealing with it now is worse than the cost of leaving it, and that decision is written down so nobody re-discovers the same problem from scratch later.

```text
                    Fixed                          Accepted
JWT in prod         No default value; app          The dev key is permanently
                    refuses to boot without         burned in git history —
                    JWT_SECRET set                  never promote it, never reuse it

CORS origin list    Hardcoded YAML → env-           N/A — this was a real bug,
                    var-driven                      fully fixed

Readiness probe     N/A                             group.readiness.include
                                                     doesn't work on Boot 4.1.0;
                                                     removed rather than shipping
                                                     something that looks
                                                     configured but silently
                                                     does nothing
```

Every "accepted" item in this chapter has the same shape: something was found, a real fix was attempted or considered, and the honest answer was "fixing this now would either require infrastructure this chapter didn't scope for, or would require shipping something unverified." Both of those are legitimate reasons to accept a limitation. Neither is a legitimate reason to hide one.

---

# 🔍 Part A: The Secrets Audit

## What Grep Alone Would Have Missed

A naive secrets audit greps the current codebase for anything that looks like a key or password. This chapter did that — and found seven real instances — but the audit that actually mattered was a different command entirely:

```bash
git log --all -S "cartwise-dev-only-signing-key" 
```

`git log -S` searches the *history* of every commit for a string, not just the current state of files. This is what surfaced commit `9e002aa` — the JWT signing key had been committed in a much earlier chapter (18-20) and, critically, **removing it from the current file does not remove it from history.** Anyone with a clone of the repository, or access to it before this fix, can still recover that exact key with one command.

This is the single most important lesson of Part A: a secrets audit that only checks the working tree is answering the wrong question. The right question is "has this value ever been visible to anyone with repo access," and only git history can answer that honestly.

## What Was Actually Found

```text
1. application-dev.yml — literal JWT signing key
2. application-dev.yml — DB url/username/password (cartwise/cartwise)
3. application-dev.yml — hardcoded CORS origin
4. application-test.yml — literal test signing key
5. db/dev-seed/dev-users.sql — BCrypt hashes (in comments)
6. .claude/settings.local.json — Postgres superuser password
7. Openverse client secret (from CH24) — searched for, never found
```

Six of seven moved to environment variables. Two deliberately did not, and the reasoning matters more than the action:

**The test signing key stays literal.** It signs tokens that never leave the JVM during a test run. Parameterizing it would mean the test suite can't run unconfigured — every developer, and every CI runner, would need to supply a value before `mvn test` could even start. That's friction added for zero real security benefit, since the key never touches anything outside the test process.

**The dev-seed passwords stay in the file.** They're BCrypt hashes for accounts that only load when `spring.sql.init.mode` is explicitly not `never` — which is already gated to dev only, established back in Chapter 22. Moving hashed, gated, dev-only credentials to an environment variable would be security theater; the actual protection is the profile gate, not the storage format.

## What the Brief Got Wrong

Worth stating plainly, the same way every prior chapter has: `application-prod.yml` was already fully environment-variable-driven with zero defaults before this chapter started — there was nothing to fix there. And the Openverse client secret this chapter's brief expected to find had, in fact, never been committed at all — Chapter 24's own handling of that secret held up under scrutiny.

## The Discovery Nobody Was Looking For

There was no root `.gitignore` in the entire repository. Every ignored-by-convention file — build artifacts, IDE settings, local config — had simply never been committed by luck rather than by design. This chapter added one, along with a `.env.example` documenting all 17 required environment variables with no real values filled in, so a fresh deployment target knows exactly what it needs to supply without guessing.

---

# 🚦 Part B: Rate Limiting

## Why a Token Bucket, and Why Not Redis

No rate limiting existed anywhere in the backend before this chapter. The decision that shaped everything downstream: CartWise deploys as a single container, so introducing Redis or any external state store purely to support rate limiting would be adding real infrastructure to solve a problem a much smaller solution already handles.

```java
// The whole mechanism, conceptually
class TokenBucket {
    capacity;           // max requests allowed in a burst
    refillRate;         // tokens added per second, continuously
    availableTokens;    // current balance

    tryConsume() {
        refill();  // add tokens based on elapsed time since last check
        if (availableTokens >= 1) { availableTokens--; return true; }
        return false;
    }
}
```

A **continuous** refill, not a fixed window, is the detail that matters. A fixed-window limiter (e.g., "10 requests per 60-second window, resetting on the minute") has a well-known flaw: a caller can spend their entire allowance in the last second of one window, then spend a full new allowance in the first second of the next — twenty requests in two seconds, technically compliant with "10 per minute." A continuously-refilling bucket has no window boundary to exploit; tokens trickle back in smoothly, so there's no seam to burst across.

## Per-IP vs. Per-User Scoping

```text
Bucket    Endpoints                        Limit               Keyed by
auth      /api/auth/**                     10 / 60s            IP address
write     wishlist + comparison writes     60 / 60s            authenticated user
admin     CH24 image backfill              3 / hour            authenticated user
```

This scoping decision is not arbitrary. Auth endpoints are public — there's no user identity yet to key against, since the whole point is establishing one — so IP address is the only available signal, imperfect as it is (shared IPs, NATs, and VPNs all complicate it, but it's still the correct default). Write endpoints are authenticated, so keying per-user is strictly better: one abusive account can't exhaust the shared allowance of every other user behind the same IP, which a per-IP limit on an authenticated endpoint would risk.

## Wired Into the Existing Error Contract

The interceptor was built as a Spring MVC interceptor specifically so a `429` response flows through the same `GlobalExceptionHandler` every other error already uses — not a bolted-on, differently-shaped response type:

```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again in 5 seconds.",
  "timestamp": "2026-08-16T19:37:20.435239766Z"
}
```

Verified, not assumed: ten real login attempts against a fresh limiter returned real `401`s (wrong credentials), and the eleventh returned a real `429` with a `Retry-After: 5` header — the actual rate limit engaging exactly where it was configured to.

## The Documented Limitation

```text
State lives in one JVM heap.
A second replica doubles the effective limit.
```

This is honestly unavoidable given the "no new infrastructure" constraint this chapter operated under, and it's exactly the kind of limitation that's fine to accept *today* and dangerous to forget *later*. The moment CartWise ever runs more than one backend instance, this rate limiter silently stops doing its job — not by erroring, but by quietly allowing twice the configured traffic through. Documented specifically so that future work (horizontal scaling, if it ever happens) knows exactly what breaks and why.

---

# 🐳 Part C: Docker — Proving It From Empty

## Multi-Stage, Not Dev-Convenience

Both Dockerfiles were written as genuine multi-stage builds — Maven/Node in a build stage, a slim JRE or nginx serving only the compiled output in the runtime stage. The distinction that matters: a naive Dockerfile that just runs `mvnw spring-boot:run` inside a container ships the entire build toolchain (Maven, the full JDK, every dev dependency) into what's supposed to be a lean production artifact. Multi-stage builds discard all of that after compilation, keeping only what's actually needed to run.

## The Fresh-Database Proof

The same discipline Chapter 22 established for Flyway — prove migrations apply cleanly to a genuinely empty database, not one that's already been migrated before — was re-run here, specifically inside Docker:

```bash
docker compose down -v && docker compose up --build
```

`-v` drops the volume, guaranteeing Postgres starts with nothing in it. The real, pasted logs:

```text
Successfully validated 4 migrations
Migrating schema "public" to version "1 - baseline"
Migrating schema "public" to version "2 - add functional index lower category"
Migrating schema "public" to version "3 - seed products"
Migrating schema "public" to version "4 - add product image attribution"
Successfully applied 4 migrations to schema "public", now at version v4
Started CartwiseBackendApplication in 7.292 seconds
```

This is real evidence, independently reproducible by anyone who runs the same command — not a claim resting on trust.

## Confirming No Secrets Leaked Into an Image Layer

```bash
docker history cartwise-backend:latest
```

Confirmed the image's environment and layer history contain only `JAVA_OPTS` and `SPRING_PROFILES_ACTIVE` — no secret values baked into any layer. One honest caveat surfaced during this exact check: the built JAR *does* contain the already-committed dev signing key, because it's compiled directly into `application-dev.yml`. This isn't a new leak — it's the same already-public, already-accepted Part A finding surfacing again in a different artifact. The runtime value is confirmed overridden by the real `JWT_SECRET` environment variable at container start, verified by checking the actual running value's prefix rather than assuming the override took effect.

---

# 🤖 Part D: Proving CI Actually Catches Failure

## Why "It Passed" Isn't Enough

A CI pipeline that has only ever been observed passing hasn't been verified — it's been trusted. The difference matters: a workflow file with a typo in its test command, or a job that's misconfigured to always report success, looks identical to a working pipeline right up until the day it actually needed to catch something and didn't.

This chapter's verification method: deliberately break something, confirm CI catches it, then revert and confirm CI passes again.

```text
Frontend break:  broke the attribution passthrough
                 → VITEST_EXIT=1, 1 failed / 126 passed
                 Reverted → VITEST_EXIT=0, 127 passed

Backend break:   made TokenBucket never reject
                 → the exact test asserting rejection failed
                 Reverted → MVN_EXIT=0, 361 passed
```

Two workflows were written: `ci.yml` (backend tests, frontend tests, `tsc -b`, ESLint — on every push and PR) and `docker.yml` (builds both images on a successful main-branch push, does not push to a registry, stated explicitly in the file rather than left ambiguous).

## What Couldn't Be Verified, and Why That's Stated Plainly

No live GitHub Actions run was actually triggered in this chapter — there was no `gh` CLI authentication available, and the brief explicitly forbade committing during the work itself. Rather than claim a live CI pass that never happened, the workflow's exact commands were run locally, with deliberate breaks, as the substitute proof. This is a real limitation of what could be verified in this specific environment, named directly rather than glossed over.

---

# 🌐 Part E: The CORS Bug That Would Have Broken the Deployed Frontend

This is the most consequential single finding in the entire chapter, and it was found almost by accident — while auditing CORS configuration for the "no wildcards, no hardcoded localhost" requirement, a much worse problem surfaced.

```text
The bug:
  CORS was a hardcoded YAML list.
  CARTWISE_ALLOWED_ORIGINS (the environment variable meant to
  override it) could not actually override it.
       ↓
  The Docker stack booted successfully, reported healthy,
  passed every health check —
  while allowing only localhost:5173 as an origin.
       ↓
  The actual Dockerized frontend serves from :8081.
       ↓
  Every single request from the real, running frontend
  would have been silently rejected by CORS —
  the application would look completely broken to a user,
  while every backend health signal reported green.
```

This is worth sitting with. A container that reports healthy and still doesn't work is a specific, dangerous failure mode — it defeats the entire purpose of health checks, because the monitoring signal says everything is fine while the actual user-facing behavior is completely broken. Fixed, and verified by actually sending a real preflight request from the correct origin (`200`, with the right `Access-Control-Allow-Origin` header) and from a deliberately wrong one (`403`) — not by reading the config and assuming it was now correct.

## Headers and HTTPS-Readiness

```text
X-Content-Type-Options: nosniff        (Spring default, kept)
X-Frame-Options: DENY                  (Spring default, kept)
Cache-Control: no-store                (Spring default, kept)
Referrer-Policy: same-origin           (added)
Content-Security-Policy                (added)
server.forward-headers-strategy: framework   (added — correctly
                                               interprets X-Forwarded-*
                                               headers from a reverse
                                               proxy/load balancer,
                                               since Spring Boot itself
                                               doesn't terminate TLS)
```

HSTS is configured but correctly does not appear over plain HTTP — confirmed rather than assumed, since a header that fires under the wrong protocol is a subtle bug that's easy to miss in a quick read of the config.

---

# ❤️ Part F: A Health Check That Was Lying

## The Finding the Brief Predicted, Found for Real

```text
/api/health returned a hardcoded "UP"
```

This is exactly the failure mode the original brief warned about — a health endpoint that reflects nothing about actual application health, just the fact that the JVM is running and able to respond to HTTP at all. Replaced with real Spring Boot Actuator, health-only exposure (allowlisted, not the full Actuator surface), and — critically — **proven**, not just configured:

```text
Postgres stopped
       ↓
/actuator/health → 503, db: DOWN
       ↓
Container's own health check → unhealthy (failing streak: 12)
```

An actual outage was simulated and the system's own signal correctly reflected it. That's the bar a health check has to clear to be trustworthy — not "returns a plausible-looking JSON shape," but "actually goes red when the thing it's supposed to be checking is actually down."

## The Readiness/Liveness Gap, Found and Correctly Left Unfixed

```text
/actuator/health/readiness → 200/UP, even with the database down.
```

Boot's default readiness group excludes the database check by design — readiness and liveness are meant to answer different questions, and the framework's default split doesn't consider "can I reach my database" a readiness concern out of the box. The documented fix (`management.endpoint.health.group.readiness.include`) was attempted and **did not take effect** on Spring Boot 4.1.0.

The response to a fix that doesn't work is not to ship it anyway because it looks correct in the config file. The response taken here: remove the non-functional config, point both probes at the same overall health check for now, and record the finding plainly rather than let a future engineer trust a group configuration that silently does nothing. The same discipline Chapter 24 used when it caught and reversed its own incorrect `SafeImage` fix.

## Logging, Actually Audited

All 19 log statements in the codebase were individually checked — not sampled, not spot-checked. Confirmed: no password, token, or JWT is ever logged, even at DEBUG level; `JwtTokenProvider` logs only the exception *class name* on failure, never the token or the reason in a way that could leak signing details; sensitive DTO fields are masked with `***` wherever they'd otherwise appear in a log line. Production now emits structured (ECS-format) JSON to stdout — correct for a containerized environment, where a file-based log path would assume a host filesystem that doesn't reliably exist. `hibernate.orm.jdbc.bind` was pinned to `INFO` specifically to prevent a DEBUG-level footgun: at DEBUG, Hibernate logs bound parameter values — including BCrypt password hashes — directly into whatever log aggregator is downstream.

---

# 🐛 The `tsc --noEmit` Discovery

This deserves its own section because it's a direct continuation of a pattern from Chapter 24 — a verification step that looked correct and, on closer inspection, wasn't checking anything real.

```text
Root frontend/tsconfig.json:
  { "files": [], "references": [...] }
```

An empty `files` array means `npx tsc --noEmit`, run at the root, has nothing to type-check — it exits successfully every time, regardless of whether the actual project code has errors. Every "0 errors" reported by this exact command in Chapter 24 was **true, but vacuous** — accurate in the narrowest possible sense, and misleading in every sense that mattered. Switching to `tsc -b` (which correctly follows the project references to `tsconfig.app.json` and `tsconfig.node.json`) immediately surfaced three real, pre-existing errors: an unused import left over from Chapter 24's own work, and two stale test fixtures.

This is now the command CI actually runs. The lesson generalizes past this one config file: a green check can mean "nothing was wrong" or "nothing was checked," and those look identical from the outside until someone verifies the verification step itself.

---

# 📋 Full Verification Performed

```text
Backend:     361 tests, 0 failures (up from CH24's 359 — 2 new tests
             for the rate limit's boundary condition)
Frontend:    127/127 passed
tsc -b:      0 errors (the real check, not the vacuous one)
ESLint:      0 errors, 3 rules relaxed only in test-support files,
             each justified by path in the config
Docker:      both images build; fresh-database boot confirmed with
             real pasted Flyway logs; no secrets in built layers
CI:          both a real failure and a real recovery independently
             reproduced locally, in the exact commands CI runs
CORS:        real preflight requests, from both a valid and an
             invalid origin, confirmed correct
Health:      real Postgres outage simulated; 503/DOWN observed;
             recovery to 200/UP confirmed after restart
```

Every one of these was independently re-run and confirmed during this chapter's review — not accepted on the strength of the report alone.

---

# ⚠️ What's Now Worse

**The JWT secret in git history is permanent.** Accepted, not fixed — the dev key is treated as burned forever, never reused, never promoted to any real environment. If this repository is ever made public, or before any real production deployment, this needs revisiting, not repeating.

**Rate limiting is disabled in the test suite by default.** A test-suite CI runner shares one client IP across an entire test class, which means enabling the limiter suite-wide would make unrelated tests fail from rate-limit exhaustion rather than their own logic. Disabled globally; individual tests that specifically need to exercise the limiter opt back in via `@TestPropertySource`.

**The Docker Compose stack runs the dev profile.** Prod has no fallback defaults by design (a deliberate Part A decision — no default JWT secret means no accidental prod boot with a dev key), so it's tested separately rather than via the same compose file, and it does boot correctly — but it's a second, less-automated verification path than the dev-profile compose stack.

**Liveness and readiness are currently the same check.** Until the readiness-group configuration issue is resolved on a future Spring Boot version, a database outage will eventually cause the container to *restart* (a liveness failure response) rather than simply *stop receiving new traffic* while existing connections drain (the more correct readiness response). Functionally survivable today, architecturally imprecise.

**Rate-limit state doesn't survive horizontal scaling.** Already covered above — restated here because it belongs in this list, not buried in Part B alone.

---

# 🌟 Why This Chapter Matters

Every prior chapter answered "does this work?" This chapter answered a different, harder question: "what happens when this is attacked, restarted, scaled, or deployed by someone who isn't watching it run on their own laptop?"

```text
A secret in a file       is a mistake.
A secret in git history  is a liability that outlives the fix.

A health check that lies is worse than no health check —
it actively misdirects whoever's trying to diagnose an outage.

A CI pipeline that has only ever passed
is a CI pipeline that has never actually been tested.
```

The CORS bug is the clearest single example of why this chapter's discipline mattered: a container that reports itself healthy while silently rejecting every real request from its own frontend is exactly the kind of failure that looks fine in every dashboard and is completely broken for every actual user. Finding it here, before any real deployment, is the entire point of a hardening chapter existing at all.

---

# 📌 Key Takeaways

After Chapter 25:

- Every real secret is either moved to an environment variable or deliberately, documentedly left as-is with a stated reason.
- The JWT secret's historical exposure in git is known, accepted, and will never be silently forgotten — it's written down, not just fixed forward.
- Rate limiting exists, is scoped correctly (per-IP for public endpoints, per-user for authenticated ones), and was proven by actually triggering a real `429`.
- Both services build as genuine multi-stage Docker images, and the full stack was proven to boot from a truly empty database with real, pasted logs.
- CI/CD was proven to both pass and fail correctly, by deliberately breaking something first.
- A real, previously-invisible CORS bug was found and fixed — one that would have made the deployed frontend completely unusable while every health signal reported green.
- The health check endpoint now genuinely reflects database connectivity, proven by simulating a real outage.
- A readiness/liveness gap was found, a documented fix was attempted and failed, and the honest, unfixed state was recorded rather than papered over.
- `tsc --noEmit`'s silent vacuity was discovered and corrected, retroactively closing a gap in Chapter 24's own verification.

---

# 🎯 Chapter Outcome

```text
🔐 No live secret is exposed going forward
     ↓
🚦 Abuse has a real ceiling
     ↓
🐳 The stack proves itself from nothing, every time
     ↓
🤖 CI proves it can actually fail
     ↓
🌐 The frontend can actually reach the backend, verified
     ↓
❤️ The health check finally tells the truth
     ↓
🏆 A stack that could genuinely be deployed today
```

CartWise isn't live yet. But for the first time, "could it be deployed" has a real, evidenced answer instead of an assumed one.

# 💰 Chapter 26 — Monetization: Affiliate Purchase Path
