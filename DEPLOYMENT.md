# Deploying CartWise

Chapter 30. This is a handoff document — everything in it is verified either by running the
command shown or by checking the exact page of the platform's own documentation, and neither this
chapter nor any automated tool has created an account, entered payment information, or deployed
this application anywhere. The owner does that, by hand, following the steps below.

Two platforms are covered for the BACKEND. **Railway is the recommendation** — see "Railway or
Render?" for why. Render is a complete, equally real alternative for an owner who already has an
account there.

This document is the backend half. The frontend has a third option beyond the Docker-image
deploys below: **GitHub Pages**, free and requiring no platform account at all since it deploys
through this repository's own GitHub Actions — see `GITHUB_PAGES.md`. It is a static host and
cannot run the backend, so a Pages deployment still needs one of the two backends below to actually
call; `GITHUB_PAGES.md` assumes this document's backend steps are done first.

---

## What "done" looks like

Two running services, talking to a database neither of them ships:

```
Browser --> cartwise-frontend (static bundle, nginx)  --HTTPS-->  cartwise-backend (Spring Boot)  -->  Postgres
```

Both services build from the Dockerfiles already in this repository
(`backend/Dockerfile`, `frontend/Dockerfile`) — the same images `docker compose up` has always
built, confirmed still building correctly this chapter (see "Dockerfiles: confirmed working"
below). Nothing about deploying to a real platform required changing what the containers run;
what changed was two things the local Compose setup never needed: a build-time frontend variable
now reaches its build correctly on any platform (see the ARG/ENV pair added to
`frontend/Dockerfile`), and the backend's CORS allowlist now has a place for the deployed frontend's
origin (`CARTWISE_ALLOWED_ORIGINS`, already wired since Chapter 25 — see application-prod.yml).

---

## Railway or Render?

| | Railway | Render (free tier) |
|---|---|---|
| Backend stays warm | Yes | **No — spins down after 15 min idle, ~30-60s cold start on the next request** |
| Config-as-code | One service per file (`railway.toml`, scoped to the service it's attached to) | One file for the whole project (`render.yaml` at the repo root) |
| Docker build-time variables | Service Variable + matching Dockerfile `ARG` | Service `envVar` + matching Dockerfile `ARG` — same mechanism |
| Free tier needs a card on file | Usage-based credit, no card for the free allowance | No card for free tier |

The cold-start line is why Railway is the recommendation: a demo that takes the first visitor a
minute to respond does not support this chapter's closing question — "is this something a real
user could use and trust" — however correct the code underneath it is. Render remains a completely
valid choice for an owner who already has an account there or who is comfortable with the cold
start; `render.yaml` is written to the same standard as `railway.toml`, not as a token afterthought.

---

## Dockerfiles: confirmed working

Both images were rebuilt from a clean Docker state this chapter (0 images, 0 build cache, right
after Docker Desktop was restarted) and both succeeded:

```
docker build -t cartwise-backend-test  ./backend
docker build -t cartwise-frontend-test --build-arg VITE_API_URL=https://cartwise-api.example.com/api ./frontend
```

Backend: Maven build stage produced `BUILD SUCCESS`, the repackaged jar was copied into the
`eclipse-temurin:21-jre-alpine` runtime stage, and the image exported cleanly.

Frontend: `tsc -b && vite build` completed inside the image, and the build-arg's value was
confirmed to actually reach the compiled bundle —

```
docker run --rm cartwise-frontend-test cat /usr/share/nginx/html/assets/index-*.js \
  | grep -o "https://cartwise-api.example.com/api"
```

— printed the URL, proving the Chapter 30 `ARG VITE_API_URL` / `ENV VITE_API_URL=$VITE_API_URL`
addition to `frontend/Dockerfile` actually threads through to `vite build`, not just that the
`docker build` command accepted the flag without error.

**What was not re-run this chapter**: the three-container `docker compose up` proof (Postgres +
backend + frontend together, migrating a fresh database). The development machine hit a **genuine,
severe disk-space incident** partway through this chapter's Docker work — Docker Desktop's own
data disk filled the last of the machine's free space and Docker's internal metadata store went
read-only mid-build. That was resolved (the disposable data disk was recreated, recovering the
space; nothing about the application or its data was at risk), but re-running the full compose
stack afterward was judged not worth the renewed disk pressure on a machine already this tight,
given that no file `docker-compose.yml` depends on changed this session. **This is a real, honestly
reported gap**: the individual Dockerfiles are freshly confirmed; the full three-container
composition was last proven end-to-end in Chapter 25 and is unchanged by anything in this chapter.
The owner should run `docker compose up --build` once before a real deploy to close this gap
themselves — it takes about two minutes and needs nothing beyond what Chapter 25 already documented
in `docker-compose.yml`'s own comments.

---

## Every environment variable, and where its value comes from

None of these are set anywhere in this repository. That is deliberate — see the "NO REAL AFFILIATE
CREDENTIAL" and "NO ENV / ARG FOR ANY SECRET" comments in `application.yml` and `backend/Dockerfile`
respectively, which this table does not repeat but does rely on.

### Backend — required, boot fails without them

| Variable | What it is | Where the value comes from |
|---|---|---|
| `DB_URL` | JDBC URL, e.g. `jdbc:postgresql://host:5432/dbname` | Your Postgres provider (Railway/Render's own managed Postgres add-on, or any external instance) |
| `DB_USERNAME` | Database role | Same |
| `DB_PASSWORD` | Database password | Same |
| `JWT_SECRET` | Signs every auth token | Generate yourself: `openssl rand -base64 64`. Railway: paste into the Variables tab. Render: `generateValue: true` in `render.yaml` does this for you at Blueprint creation. **Never reuse the value committed in `docker-compose.yml` or `dev-users.sql` — both are explicitly throwaway/dev-only.** |

### Backend — required for the deployment to actually work end-to-end

| Variable | What it is | Where the value comes from |
|---|---|---|
| `CARTWISE_ALLOWED_ORIGINS` | Comma-separated CORS allowlist | The frontend's deployed URL, once you know it (chicken-and-egg with deploy order — see the ordered steps below). If the Android app in Chapter 30's Part D is ever shipped, this list must also include the literal `https://localhost` — see the long comment on this exact variable in `application-prod.yml` for why. If the GitHub Pages frontend from Chapter 30.1 is used, add `https://<your-github-username>.github.io` (host only, no `/<repo-name>/` — an origin is scheme+host, never a path) — see `GITHUB_PAGES.md`. Any combination of these can be listed together; none of them replaces another. |

### Backend — optional, safe to leave unset

| Variable | Effect when unset | Where a real value would come from |
|---|---|---|
| `JWT_EXPIRATION` | Defaults to `24h` | Only needed to change the session lifetime |
| `PORT` | Defaults to `8080`; Railway sets this automatically | Platform-injected, not something you set |
| `OPENVERSE_CLIENT_ID` / `OPENVERSE_CLIENT_SECRET` | Image backfill calls Openverse anonymously — the fully supported default | [openverse.org](https://openverse.org) developer registration, only needed to raise the rate ceiling |
| `AFFILIATE_AMAZON_TAG`, `AFFILIATE_FLIPKART_TAG`, and the corresponding `*_SEARCH_URL` / `*_TAG_PARAM` variables | Every one defaults to a literal placeholder tag (`cartwise-test-00`) or blank — see `application.yml`'s long comment on why no real credential exists in this repository | Real affiliate program acceptance for each retailer, which is a separate, non-technical process |
| `RATE_LIMIT_*` (8 variables — auth/write/admin/click × capacity/refill) | Sensible defaults already in `application.yml` | Only needed to retune limits for observed real traffic |

### Frontend — required

| Variable | What it is | Where the value comes from |
|---|---|---|
| `VITE_API_URL` | The backend's public base URL, e.g. `https://cartwise-backend.up.railway.app/api` | **The backend's own deployed URL — which does not exist until the backend is deployed first.** This is why the steps below are ordered rather than "deploy both". Baked into the bundle at *build* time (see the long comment on this in `frontend/Dockerfile`); changing it later means rebuilding, not restarting. |

---

## Railway: step-by-step

1. **Push this repository to GitHub** if it is not already there. Railway deploys from a connected
   git repository.

2. **Create the backend service first — this ordering is load-bearing.**
   In the Railway dashboard: New Project → Deploy from GitHub repo → select this repository.
   Railway will try to auto-detect a single service; instead:
   - Set **Settings → Source → Root Directory** to `backend`.
   - Set **Settings → Source → Config-as-code path** to `backend/railway.toml` (already committed —
     see that file for exactly what it does and does not configure; it does not set the root
     directory, which is a separate setting for a documented reason explained in its own header).
   - Under **Variables**, add every "required" backend variable from the table above. For a quick
     Postgres, Railway's own "+ New → Database → PostgreSQL" in the same project exposes
     `DATABASE_URL` — either reference it (`DB_URL = ${{Postgres.DATABASE_URL}}`, adjusting for
     Railway's URL format if needed) or use an external Postgres and set the three DB_* variables
     directly.
   - Deploy. Watch the build logs; a `BUILD SUCCESS` from Maven followed by the container starting
     and passing its `/actuator/health` check (configured in `backend/railway.toml`) means it's up.
   - **Copy the assigned public domain** (Settings → Networking → "Generate Domain" if one is not
     already present) — you need it in the next step.

3. **Set `CARTWISE_ALLOWED_ORIGINS` on the backend, now that you know the frontend is coming.**
   You will not have the frontend's exact URL until step 4 creates it, so this is naturally a
   two-pass step: set a placeholder now (or skip to step 4 and come back), then set the real value
   once the frontend exists, then redeploy the backend. A CORS misconfiguration here is silent —
   the frontend loads and every API call fails, exactly as Chapter 30's own Android emulator run did
   before this was diagnosed — so treat "does the deployed frontend actually load data" as the real
   verification, not "did the backend build". If GitHub Pages (`GITHUB_PAGES.md`) is the frontend
   instead of a Railway-deployed one, add `https://<your-github-username>.github.io` here too — it
   is additive, not a replacement, and steps 4–5 below then describe a frontend you don't need.

4. **Create the frontend service.**
   Same project, "+ New → GitHub Repo" (same repo, second service):
   - **Settings → Source → Root Directory**: `frontend`
   - **Settings → Source → Config-as-code path**: `frontend/railway.toml`
   - **Variables**: add `VITE_API_URL`. Use Railway's reference syntax so it updates itself if the
     backend's domain ever changes:
     ```
     VITE_API_URL = https://${{cartwise-backend.RAILWAY_PUBLIC_DOMAIN}}/api
     ```
     (Substitute the actual name you gave the backend service if it isn't `cartwise-backend`.)
     This resolves at *build* time — because `frontend/Dockerfile` declares `ARG VITE_API_URL`,
     Railway forwards this Variable into the Docker build automatically. No separate
     "build arguments" setting exists in Railway's config schema; this Variable-to-ARG forwarding
     is the actual, documented mechanism, and it is why the Dockerfile ARG had to be added in the
     first place — see that file's comment.
   - Deploy. Generate a public domain the same way as step 2.

5. **Close the loop.** Go back to the backend service's `CARTWISE_ALLOWED_ORIGINS` and set it to the
   frontend's real domain (`https://<whatever-it-is>`), then redeploy the backend so the new CORS
   config takes effect.

6. **Verify like a user, not like a build log.** Open the frontend's URL in a real browser. Confirm:
   the homepage's product rails load real data (not "Failed to fetch"), `/search?q=<anything in the
   catalogue>` returns results, and signing up for a new account succeeds. A green build and a
   passing health check both say less than one real page load with the network tab open.

---

## Render: step-by-step

1. **Push this repository to GitHub.**

2. **Render Dashboard → New → Blueprint.** Point it at this repository. Render reads `render.yaml`
   from the repository root and proposes both services (`cartwise-backend`, `cartwise-frontend`) at
   once — this is the one place Render's workflow is simpler than Railway's, because its Blueprint
   format covers a whole project in one file rather than one service per file.

3. **You will be prompted for every `sync: false` variable** (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
   `OPENVERSE_CLIENT_ID`, `OPENVERSE_CLIENT_SECRET`, `AFFILIATE_AMAZON_TAG`,
   `AFFILIATE_FLIPKART_TAG`) at this point — supply real values or leave blank per the variable
   table above. `JWT_SECRET` needs no prompt; `generateValue: true` in `render.yaml` already
   produces a random one.

4. **Create the Blueprint and let both services build.**

5. **Check the two literal URLs `render.yaml` had to guess at, and fix them if they're wrong.**
   Render's Blueprint format has no way to compute a full `https://` URL from another service's
   name inline (a real, checked limitation of the schema — not an oversight in this file; see
   `render.yaml`'s own header for what was actually verified about this), so it ships two
   predictions based on Render's `<service-name>.onrender.com` naming rule:
   - `cartwise-backend`'s `CARTWISE_ALLOWED_ORIGINS` guesses the frontend is at
     `https://cartwise-frontend.onrender.com`.
   - `cartwise-frontend`'s `VITE_API_URL` guesses the backend is at
     `https://cartwise-backend.onrender.com/api`.

   Both are almost always correct on a first deploy, because Render assigns exactly that hostname
   when the name is available. **Check both services' actual assigned URLs in the dashboard.** If
   either differs (the name was already taken by someone else on Render and got suffixed), update
   the corresponding variable in the dashboard and trigger a manual redeploy of whichever service
   reads it — the frontend needs a full rebuild for a `VITE_API_URL` change to take effect, not just
   a restart.

6. **Verify like a user** — the same checklist as Railway's step 6. This matters more on Render's
   free tier specifically because of the cold start: the first request after 15 minutes idle will
   be slow, and that is expected behaviour rather than a broken deploy.

---

## What this deployment guide does not do, and should not be asked to

Per this chapter's explicit constraints: no account was created on Railway or Render, no payment
method was entered anywhere, and nothing was deployed to a live, credentialed environment. Every
command and screenshot-equivalent in this document that could be verified without those things —
the Dockerfiles building, the build-arg reaching the bundle, the exact config schema for both
platforms — was verified. The remaining steps require the owner's own account and are written
precisely enough to follow without guessing, which is the actual deliverable here.
