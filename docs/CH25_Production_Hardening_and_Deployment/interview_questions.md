# 🎯 CH25 — Interview Questions

> **Project:** CartWise  
> **Chapter:** Production Hardening & Deployment
>
> This chapter covers secrets auditing (including git history), rate limiting design, multi-stage Docker builds, proving CI actually catches failure, a real CORS bug, and health checks that reflect genuine application state.

---

# 📚 Beginner Level

## Q1. What were the six parts of this chapter?

### Answer

```text
Part A — Secrets audit
Part B — Rate limiting
Part C — Dockerize both services
Part D — CI/CD
Part E — CORS, HTTPS-readiness, headers
Part F — Health checks and logging
```

---

## Q2. Why can't a secrets audit stop at grepping the current codebase?

### Answer

Grepping the working tree only finds what's currently visible. A secret removed from a file today can still be sitting in an old commit, fully recoverable by anyone with access to the repository's history. `git log -S` searches history directly, which is what actually found the JWT key in this chapter.

---

## Q3. What did `git log --all -S` find, and what commit was it in?

### Answer

The literal JWT signing key, committed in `9e002aa` ("feat: implement Chapters 18-20") — several chapters before this one, and never noticed until this chapter's audit specifically searched history rather than just the current files.

---

## Q4. Why is the exposed JWT key described as "burned" rather than simply "fixed"?

### Answer

Removing the key from the current config file stops it from being visible going forward, but does not un-publish the historical commit that still contains it. Anyone with access to the repo's history can recover it permanently. "Burned" means: never reuse this value in any real environment, ever again — the fix isn't erasing the past exposure, it's making sure the exposure never becomes consequential.

---

## Q5. Why does `application-test.yml`'s signing key stay hardcoded, while the dev key does not?

### Answer

The test key signs tokens that never leave the JVM during a test run — it has no real-world exposure surface. Parameterizing it would force every developer and CI runner to supply a value before tests could even run, adding friction with no actual security benefit.

---

## Q6. What rate-limiting mechanism was chosen, and why not Redis?

### Answer

A hand-rolled, in-memory token bucket. Redis (or any external store) would introduce new infrastructure to solve a problem that a single-instance deployment doesn't actually need distributed state to solve. Since CartWise deploys as one container, the simpler solution is also the correct one for now.

---

## Q7. What are the three rate-limit buckets, their limits, and how each is keyed?

### Answer

```text
auth    /api/auth/**                  10 / 60s   per IP
write   wishlist + comparison writes  60 / 60s   per user
admin   CH24 image backfill           3 / hour   per user
```

---

## Q8. What HTTP status and header does a rate-limited request receive?

### Answer

```text
HTTP 429
Retry-After: 5
{"code": "RATE_LIMIT_EXCEEDED", "message": "...", "timestamp": "..."}
```

Routed through the same `GlobalExceptionHandler` shape every other error already uses.

---

## Q9. What is a multi-stage Docker build, and why does it matter for a production image?

### Answer

A Dockerfile with separate build and runtime stages — the build stage has the full toolchain (Maven, full JDK), the runtime stage copies only the compiled artifact into a slim final image. Without this, a "dev-convenience" image would ship the entire build toolchain into production, bloating the image and increasing attack surface for no benefit.

---

## Q10. What real bug did the CORS review find?

### Answer

The allowed-origins list was hardcoded in YAML, and the environment variable meant to override it (`CARTWISE_ALLOWED_ORIGINS`) couldn't actually do so. The stack booted, reported healthy, and would have silently rejected every request from the real, deployed frontend running on a different port than the hardcoded value.

---

## Q11. What did `/api/health` return before this chapter, and why was that a problem?

### Answer

A hardcoded `"UP"`, regardless of whether the database or any real dependency was actually reachable. It told an operator nothing true about the system's actual health — a health check indistinguishable from no health check at all.

---

# 📚 Intermediate Level

## Q12. Explain why a continuously-refilling token bucket is more correct than a fixed-window rate limiter for this use case.

### Answer

A fixed-window limiter resets its allowance at a clock boundary — "10 requests per minute, reset on the minute." This allows a caller to spend a full allowance in the final second of one window and another full allowance in the first second of the next, achieving 20 requests in 2 seconds while technically staying "compliant" with each individual window. A token bucket refills continuously based on elapsed time, with no window boundary to exploit — the rate is smoothed rather than reset, closing that specific abuse pattern.

---

## Q13. Why is per-IP scoping used for auth endpoints but per-user scoping used for wishlist/compare writes?

### Answer

Auth endpoints (login/signup) are public — there's no authenticated identity yet, since establishing one is the entire point of the request, so IP address is the only signal available, imperfect as it is. Wishlist/compare writes happen after authentication, so a per-user key is available and strictly more precise: it prevents one abusive account from exhausting an allowance that would otherwise be shared with every other legitimate user behind the same IP address (a real scenario behind NATs, shared offices, or VPNs).

---

## Q14. What is the documented limitation of the in-memory rate limiter, and when does it actually matter?

### Answer

State lives in a single JVM's heap. It's correct for exactly one running container. The moment a second replica exists, each instance holds its own independent bucket for the same key — the effective, real-world limit silently doubles, with no error or warning signaling the change. It doesn't matter today (single-instance deployment) but would need to be revisited the moment horizontal scaling is introduced.

---

## Q15. Walk through the fresh-database proof performed in Part C, and explain why `-v` matters.

### Answer

```bash
docker compose down -v && docker compose up --build
```

`-v` drops the associated Docker volumes, which is what guarantees Postgres starts with a genuinely empty data directory rather than one left over from a previous run. Without it, "testing against a fresh database" could actually be testing against a database that already has the schema from last time — silently invalidating the entire point of the check. The real, pasted Flyway logs afterward show V1 through V4 applying in strict order against that verified-empty starting state.

---

## Q16. Why does proving a CI pipeline "can fail" matter more than confirming it currently passes?

### Answer

A pipeline that's only ever been observed passing hasn't actually been tested — it's been trusted. A misconfigured test command, a job that always reports success regardless of outcome, or a typo that silently no-ops a step would all look identical to a working pipeline right up until the moment it actually needed to catch a real failure and didn't. Deliberately breaking something (this chapter broke `TokenBucket`'s rejection logic and a frontend attribution passthrough), confirming the pipeline's local equivalent commands actually fail, then reverting and confirming they pass again, is the only way to know the safety net actually works.

---

## Q17. Why couldn't a live GitHub Actions run actually be triggered in this chapter, and what was done instead?

### Answer

No `gh` CLI authentication was available in the working environment, and the brief explicitly forbade committing during the work itself (commits weren't made until the chapter's review was complete). Instead, the exact commands the CI workflow runs were executed locally, with deliberate breaks introduced and reverted, as a substitute for live verification — explicitly stated as a limitation rather than silently claimed as equivalent to a real CI run.

---

## Q18. Describe the "healthy-but-broken" failure mode the CORS bug represented, and why it's more dangerous than an outright crash.

### Answer

The Docker Compose stack booted successfully and every health check reported passing — while the CORS misconfiguration meant every real request from the actual deployed frontend would be silently rejected by the browser. A crash is loud and immediately investigated. A system that reports itself healthy while being completely non-functional for real users can go unnoticed far longer, because every monitoring signal available says everything is fine.

---

## Q19. What is `server.forward-headers-strategy: framework`, and why does it matter for a containerized deployment?

### Answer

Spring Boot applications typically don't terminate TLS themselves in a real deployment — a reverse proxy or load balancer sits in front, terminates HTTPS, and forwards the request internally over plain HTTP, adding headers like `X-Forwarded-Proto: https` to indicate the original protocol. Without `forward-headers-strategy` set correctly, the application would incorrectly believe every request arrived over plain HTTP, potentially breaking security decisions that depend on knowing the true original protocol (like HSTS behavior).

---

## Q20. Why does HSTS correctly not appear in responses over plain HTTP, and why was this specifically verified rather than assumed?

### Answer

HSTS (`Strict-Transport-Security`) instructs a browser to only ever connect via HTTPS going forward — sending it over an insecure plain-HTTP connection would be nonsensical, since the header's entire purpose is enforcing HTTPS, and Spring correctly suppresses it in that case. This was verified directly (checking actual response headers under both conditions) rather than assumed from reading the configuration, following the same "prove it, don't just configure it" discipline used throughout this chapter.

---

## Q21. What did the readiness-probe investigation find, and why was the "fix" ultimately not shipped?

### Answer

`management.endpoint.health.group.readiness.include` is the documented Spring Boot mechanism for adding the database health indicator to the readiness probe group. It was configured and directly tested — stopping Postgres and checking `/actuator/health/readiness` — and the readiness endpoint stayed `UP` regardless, meaning the configuration had no actual effect on Spring Boot 4.1.0. Rather than leave a setting in place that looks correct in the config file but demonstrably does nothing, it was removed and the finding was documented plainly.

---

## Q22. Explain the `tsc --noEmit` vacuity bug: what was actually happening, and what did it retroactively mean for Chapter 24's own verification claims?

### Answer

The root `tsconfig.json` had `"files": []` — an empty file list. `tsc --noEmit`, run against that config, has literally nothing to type-check, so it reports "0 errors" every single time, regardless of whether the actual project code (referenced via `tsconfig.app.json` and `tsconfig.node.json`) has real errors. This meant Chapter 24's "0 TypeScript errors" claims were technically true but functionally meaningless — nothing was being checked. Switching to `tsc -b`, which correctly follows project references, immediately surfaced 3 real, pre-existing errors.

---

# 📚 Advanced Level

## Q23. A teammate proposes fixing the JWT git-history exposure by rewriting git history to remove the secret entirely. Why might this chapter's actual decision (accept, don't rewrite) still be correct?

### Answer

Rewriting history is disruptive — it changes every downstream commit hash, breaking any existing clones, forks, or open branches that reference the old history, and requires every collaborator to re-clone or carefully rebase. Given that the exposed key is dev-only, was never used to sign anything in a real deployed environment (prod has no default and refuses to boot without a real `JWT_SECRET`), and the actual risk of the historical exposure is low, the cost of a disruptive history rewrite may outweigh the marginal security benefit — for now. This calculation would change immediately if the repository were ever made public, or before any real production deployment; the correct answer isn't fixed forever, it's fixed for the current, accepted risk level.

---

## Q24. Design a test that would prove the auth rate limiter is genuinely scoped per-IP, not accidentally shared globally across all callers.

### Answer

Send 10 requests from IP A (or a simulated distinct client identity), confirm the 11th returns `429`. Then, without waiting for any window to reset, send a single request that simulates arriving from a different IP (e.g., via a different `X-Forwarded-For` value, if that's how the limiter identifies callers) and confirm it succeeds rather than also returning `429`. If it also gets rate-limited, the bucket is being shared globally rather than keyed per-IP — a real, meaningful distinction the naive "send 11 requests and see a 429" check alone wouldn't catch.

---

## Q25. Why is disabling rate limiting in the test suite (rather than tuning the limits higher) the correct default, with an opt-in escape hatch?

### Answer

A CI test runner typically executes many tests from a single process, which — from the rate limiter's perspective — looks like one client hammering the same endpoints repeatedly. Tuning the limits higher just delays the same collision to a larger number of tests; it doesn't remove the coupling between unrelated tests and a shared, stateful bucket. Disabling by default means the vast majority of tests are correctly isolated from rate-limiting concerns entirely, while the specific tests that exist *to verify the rate limiter itself* opt back in via `@TestPropertySource` — making the coupling explicit and intentional only where it's actually the subject under test.

---

## Q26. The CORS bug meant the Dockerized stack "looked healthy" while being broken. Design a verification step that would have caught this specific class of bug earlier, independent of the eventual manual CORS review.

### Answer

An end-to-end smoke test that actually issues a real cross-origin request from the frontend's *actual served origin* (not `localhost:5173`, but wherever the Docker Compose frontend genuinely serves from) against the backend, as part of the Docker fresh-boot verification — rather than treating "backend health check passes" and "frontend can actually talk to backend" as the same claim. This chapter's own manual verification (real preflight requests from both the correct and an incorrect origin) is exactly this kind of test; formalizing it as an automated step in the Docker verification process, rather than a one-time manual check, would catch a regression the next time this configuration changes.

---

## Q27. If a future engineer proposes fixing the liveness/readiness gap by simply excluding the database check from *both* probes (matching Boot's current readiness default), what's wrong with that approach compared to what this chapter actually did?

### Answer

That would silence the symptom rather than address the underlying gap — the container would never restart on a DB outage (arguably fine) but would also never signal *any* form of degradation to an orchestrator, meaning traffic keeps routing to an instance that can't actually serve most real requests. What this chapter actually did — point both probes at the same overall health check that *does* include the database, and document that this means a DB outage currently triggers a full restart rather than the more precise "drain and wait" behavior — preserves the correct failure signal (something is genuinely wrong, don't route here) while being honest that the *specific* remediation (restart vs. drain) isn't yet as precise as it should be. Removing the DB check from both probes would trade a coarse-but-correct signal for a smooth-but-wrong one.

---

## Q28. Explain why "the brief predicted this exact bug and it was found anyway" (the hardcoded health check) is a meaningfully different outcome than if the health check had turned out to be fine.

### Answer

The brief predicted the *category* of failure worth checking for — it didn't guarantee the codebase actually had that specific problem. Finding that the prediction was correct is real evidence the audit was performed thoroughly enough to catch what it was looking for, rather than a check that was run, technically passed some surface-level test, and moved on. It's the difference between "I looked and it happened to be fine" and "I looked specifically for this failure mode and confirmed whether it was present" — the second is a real audit; the first might just be luck.

---

## Q29. A teammate asks why this chapter didn't just fix the readiness probe issue by upgrading or downgrading the Spring Boot version until the documented configuration worked. Is that a reasonable alternative?

### Answer

It's worth considering, but changing the application's core framework version to work around one configuration property is a disproportionate response — it risks introducing unrelated regressions or compatibility issues across the entire application for the sake of one probe's precision. The correct proportional response, which this chapter took, is to accept the current limitation, document it clearly, and revisit it as a small, isolated fix (or as part of a deliberate future framework upgrade evaluated on its own full merits) rather than forcing a large, risky change to solve a narrow problem.

---

# 🧩 Scenario-Based Questions

## Q30. Six months from now, the repository is made public. What from this chapter needs immediate attention as a direct result?

### Answer

The JWT key in commit `9e002aa` becomes a live concern the moment the repository's history is publicly readable, even though it was already "accepted" as burned in a private context. At that point, either rewriting history to remove it, or — more realistically, since the key was never used in a real deployed environment — confirming explicitly and again that no real system has ever signed anything with it, becomes the responsible next step rather than something deferred indefinitely.

---

## Q31. A second backend replica is added to handle increased load. What specifically breaks from this chapter's design, and how would you notice?

### Answer

The in-memory rate limiter's state, documented explicitly as JVM-local. Each replica now holds its own independent token bucket for the same logical key (e.g., the same user, or the same IP), so the *effective* combined rate limit silently doubles — a caller could exhaust one replica's bucket, get load-balanced to the second replica, and continue at full speed. This wouldn't throw an error or log anything unusual; it would only be noticeable through unexpectedly high real-world request volumes making it past what the configured limits imply should be possible, or from a deliberate load test explicitly checking total throughput against the documented limit.

---

## Q32. A new engineer, reading this chapter's report, asks: "If the CORS bug was this severe, why wasn't it caught by the existing test suite?" How would you answer, using only what's documented in this chapter?

### Answer

The existing test suite (361 backend tests) verifies application logic in isolation — it doesn't necessarily exercise the specific combination of "the application running inside a Docker container, with the actual environment-variable-driven configuration, receiving a real cross-origin browser request from the actual served frontend origin." Unit and integration tests can pass completely correctly while a deployment-specific configuration wiring issue (an env var silently failing to override a hardcoded YAML value) goes untested, because that's a *configuration* problem, not a *logic* problem — and most test suites are built to verify logic. This is exactly why Part C and Part E's manual, Docker-based verification existed as separate steps from the standard test suite, and why finding this bug required actually running the containerized stack and sending a real request, not just running `mvn test`.
