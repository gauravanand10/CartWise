# 📖 CH25 — Glossary

> **Project:** CartWise  
> **Chapter:** Production Hardening & Deployment

This glossary explains the important terms and concepts introduced while auditing secrets, adding rate limiting, containerizing both services, wiring CI/CD, fixing CORS, and building real health checks for CartWise.

---

# 🔍 Secrets Audit

A Secrets Audit is a systematic search for credentials, keys, or sensitive values that shouldn't be exposed — checked against both the current codebase and its full history.

```text
grep the working tree     → finds what's currently visible
git log -S "<value>"      → finds what was ever committed,
                             even if since removed
```

Both are necessary; neither alone is sufficient.

---

# 🕳️ Git History Exposure

Git History Exposure is a secret that was committed at some point and remains permanently recoverable from the repository's history, even after being removed from the current files.

```text
Remove secret from current file  → hides it going forward
Secret still sits in commit X    → recoverable forever,
                                    by anyone with repo access
```

Discovered in this chapter: the JWT signing key, committed in `9e002aa`, still fully recoverable via `git log --all -S`.

---

# 🔥 Burned Key

A Burned Key is a credential that has been exposed and must be treated as permanently compromised — never reused, never promoted to a real environment, even after the immediate leak is patched.

```text
Rotating the key in current config   ≠   un-exposing the old one
```

The dev-only JWT key from this chapter is treated this way: accepted as burned, rather than pretending parameterizing it going forward erases its history.

---

# ✅ Accepted vs. Fixed

Accepted vs. Fixed is the distinction between a problem whose root cause is eliminated (Fixed) and one that's knowingly left in place, with the reasoning recorded, because addressing it now costs more than the risk of leaving it (Accepted).

```text
Fixed:    prod refuses to boot without JWT_SECRET set
Accepted: the dev key's historical git exposure — cannot
          be un-published, only never repeated
```

Both are legitimate outcomes. Silence about which one applies is not.

---

# 🪣 Token Bucket

A Token Bucket is a rate-limiting algorithm where a bucket holds a capacity of tokens, refills continuously over time, and each request consumes one token — rejected only when the bucket is empty.

```text
capacity: 10
refillRate: 10 per 60s, continuous
       ↓
Request arrives → refill based on elapsed time → 
  tokens available? consume one, allow
  tokens empty?     reject
```

Chosen over a fixed-window limiter specifically because it has no window boundary to exploit.

---

# 🪟 Fixed-Window Limiter (and its flaw)

A Fixed-Window Limiter resets an allowance at a fixed clock boundary (e.g., every 60 seconds on the minute) rather than refilling continuously.

```text
"10 requests per minute, resets on the minute"
       ↓
10 requests at 0:59
10 more requests at 1:00
       ↓
20 requests in 2 seconds — technically compliant
```

The exploit a token bucket's continuous refill avoids.

---

# 🔑 Per-IP Scoping

Per-IP Scoping keys a rate limit to the caller's network address, used when no authenticated identity exists yet.

```text
Auth endpoints (login/signup) → per-IP
  (there's no user identity established until
  the request succeeds)
```

---

# 👤 Per-User Scoping

Per-User Scoping keys a rate limit to an authenticated account rather than a network address.

```text
Wishlist/compare writes → per-user
  (one abusive account can't exhaust an allowance
  shared with every other user behind the same IP)
```

Chosen wherever authentication has already occurred, since it's a strictly more precise signal than IP address.

---

# 🧱 Multi-Stage Build

A Multi-Stage Build is a Dockerfile pattern using separate stages for building and running an application, discarding the build toolchain from the final image.

```text
Stage 1 (build):    Maven + full JDK, compiles the JAR
Stage 2 (runtime):  slim JRE only, copies in the compiled JAR
       ↓
Final image contains no Maven, no build-time dependencies
```

Distinguished from a "dev-convenience image" that ships the entire toolchain into what's meant to be a lean production artifact.

---

# 🗑️ Fresh-Database Proof

A Fresh-Database Proof is verifying an application boots and migrates correctly against a genuinely empty database, not one that's already been migrated before.

```text
docker compose down -v && docker compose up --build
       ↓
-v drops the volume — Postgres starts with nothing in it
       ↓
Real Flyway logs show V1 through V4 applying in order
```

The same discipline Chapter 22 established for Flyway, re-proven here specifically inside a container.

---

# 🕵️ Deliberate Break (CI Verification)

A Deliberate Break is intentionally introducing a real failure into code to confirm a test suite or CI pipeline actually catches it, before trusting that pipeline's passing state.

```text
Break something real → confirm CI/test fails →
Revert → confirm CI/test passes again
```

Distinguishes "this pipeline has only ever been observed passing" from "this pipeline has been proven to actually catch failure."

---

# 🌐 CORS (Cross-Origin Resource Sharing)

CORS is a browser security mechanism that restricts which origins (domains/ports) a web page is allowed to make requests to.

```text
Frontend origin: http://localhost:8081
Backend allows:  [http://localhost:8081, ...]
       ↓
Match → request permitted
Mismatch → browser blocks the response
```

The chapter's central bug: a hardcoded allowed-origins list that an environment variable couldn't actually override.

---

# 🎭 Healthy-But-Broken

Healthy-But-Broken describes a system whose health checks report success while its actual, user-facing behavior is completely non-functional.

```text
Container health check → passes
Actual frontend request → silently rejected by CORS
       ↓
Dashboard says everything is fine.
Every real user sees a broken application.
```

The specific, dangerous failure mode this chapter's CORS bug represented — arguably worse than an outright crash, because nothing signals the problem.

---

# 🔒 Forward-Headers Strategy

Forward-Headers Strategy is Spring Boot's configuration for correctly interpreting `X-Forwarded-*` headers, needed because the application itself typically doesn't terminate TLS in a containerized deployment.

```text
Reverse proxy / load balancer → terminates HTTPS,
                                  passes X-Forwarded-Proto: https
       ↓
server.forward-headers-strategy: framework
       ↓
Spring correctly treats the request as HTTPS,
even though it arrived over plain HTTP internally
```

---

# 🛡️ Security Headers

Security Headers are HTTP response headers that instruct the browser to enforce additional protections against common attacks.

```text
X-Content-Type-Options: nosniff    prevents MIME-sniffing attacks
X-Frame-Options: DENY               prevents clickjacking via iframes
Content-Security-Policy             restricts what resources can load
Referrer-Policy: same-origin        limits referrer leakage
```

Some are Spring Security defaults (kept); others were added explicitly this chapter.

---

# ❤️‍🩹 Hardcoded Health Check

A Hardcoded Health Check is a health endpoint that returns a fixed, unconditional success response regardless of the actual system's state.

```text
/api/health → always "UP"
       ↓
Tells you nothing about whether the database,
or any real dependency, is actually reachable
```

The exact problem this chapter's brief predicted, and found for real.

---

# 🩺 Liveness vs. Readiness

Liveness vs. Readiness are two different questions a health probe can answer, meant to trigger different responses from an orchestrator.

```text
Liveness:   "Is this process alive, or should it be restarted?"
Readiness:  "Is this instance ready to receive new traffic,
             or should it be temporarily drained?"
```

A database outage is more accurately a readiness problem (stop sending traffic here until it recovers) than a liveness problem (restart the whole process) — but this chapter found Boot 4.1.0's default readiness group doesn't include database health, and the documented fix to include it didn't work.

---

# 🚧 Non-Functional Configuration

Non-Functional Configuration is a setting that appears correctly written and reads as if it should work, but demonstrably has no effect when tested.

```text
management.endpoint.health.group.readiness.include
       ↓
Looks correct in the config file.
Tested directly: readinessState stays UP even with
the database down. Does nothing.
```

The response, correctly, was to remove it and record the finding — not ship it because it looks configured.

---

# 🫥 Vacuous Check

A Vacuous Check is a verification step that reports success not because the thing being checked is correct, but because there was nothing to check in the first place.

```text
tsconfig.json: { "files": [] }
       ↓
tsc --noEmit → "0 errors"
       ↓
True. Also meaningless — there was nothing to check.
```

Discovered retroactively: every "0 TypeScript errors" claim from Chapter 24 was accurate but hollow. Switching to `tsc -b` (which follows the real project references) immediately surfaced 3 genuine pre-existing errors.

---

# 📋 Structured Logging

Structured Logging is emitting log entries in a consistent, machine-parseable format (like JSON) rather than free-form text.

```text
Prod logging: ECS-format JSON → stdout
       ↓
Parseable by any log aggregator without
custom regex parsing
```

Chosen because a containerized environment has no reliable host filesystem to write a traditional log file to — stdout/stderr is the correct target.

---

# 🙊 Sensitive Data in Logs

Sensitive Data in Logs is any credential, token, or personal value that ends up written into application logs — a real risk even when the application's primary logic never intentionally logs such data.

```text
hibernate.orm.jdbc.bind at DEBUG level
       ↓
Logs every bound SQL parameter value —
including BCrypt password hashes
```

Pinned to `INFO` specifically to prevent this exact footgun. All 19 log statements in the codebase were individually audited, not sampled.

---

# 📄 .env.example

A `.env.example` file documents every environment variable an application requires, without providing real values — a template for what a new deployment target needs to supply.

```text
JWT_SECRET=
DATABASE_URL=
DATABASE_USERNAME=
...
```

Added in this chapter alongside the discovery that no root `.gitignore` had ever existed in the repository.

---

# 🧮 Rate-Limit State Locality

Rate-Limit State Locality is the fact that an in-memory rate limiter's state exists only within a single running process.

```text
One container = one shared bucket per key = correct limit
Two containers = two independent buckets per key =
  effective limit silently doubles
```

An explicitly documented, accepted limitation of the in-JVM `TokenBucket` design — correct for a single-instance deployment, wrong the moment a second replica exists.

---

# 🐳 Layer Inspection

Layer Inspection is examining a built Docker image's individual layers and metadata to confirm no secret value was accidentally baked into the final artifact.

```text
docker history <image>
       ↓
Confirms only JAVA_OPTS, SPRING_PROFILES_ACTIVE
appear — no literal secret values in any layer
```

Used to independently verify Part A's secrets work actually held once containerized, rather than assuming a correctly-written Dockerfile guarantees it.
