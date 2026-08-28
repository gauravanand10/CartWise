# Deploying the frontend to GitHub Pages

Chapter 30.1. Short and precise, on purpose — the long reasoning for every decision here lives in
`.github/workflows/deploy-pages.yml`, `frontend/vite.config.ts`, and `frontend/src/main.tsx`.

GitHub Pages serves static files only. It **cannot run the backend or the database** — this
deploys the frontend alone, and it still needs a real backend to call. Deploy that first: see
`DEPLOYMENT.md` (Railway or Render).

## What already exists, ready to run

- `.github/workflows/deploy-pages.yml` — builds, gates on `tsc`/`eslint`/`vitest`, and publishes
  `frontend/dist` on every push to `main` that touches `frontend/**`.
- `frontend/vite.config.ts` and `frontend/src/main.tsx` — build the app for, and route it
  correctly under, a subpath (`/CartWise/`) rather than assuming the domain root.

Nothing above requires any further code change. What remains is two settings only the repository
owner can set.

## What you need to do (two settings, then push)

**1. Enable Pages, once.**
Repo → **Settings → Pages → Build and deployment → Source** → select **"GitHub Actions"**.
(Not "Deploy from a branch" — that's the older mechanism this workflow does not use.)

**2. Set one repository variable — the backend's real URL.**
Repo → **Settings → Secrets and variables → Actions → Variables tab → New repository variable**:

| Name | Value |
|---|---|
| `VITE_API_URL` | Your deployed backend's API URL, e.g. `https://cartwise-backend.up.railway.app/api` — from whichever of `DEPLOYMENT.md`'s two paths you followed. Include the trailing `/api`. |

A **Variable**, not a Secret — this value ends up in the built JavaScript bundle, readable by
anyone who opens dev tools, so a Secret would only hide it from your own workflow logs, not from
a visitor. `frontend/Dockerfile` explains the same distinction for the Docker build path.

**3. Add this site's origin to the backend's CORS allowlist.**
On whichever backend platform you deployed to, add to `CARTWISE_ALLOWED_ORIGINS`:

```
https://<your-github-username>.github.io
```

Host only — no `/CartWise/`. An origin is scheme + host, never a path. This is additive: keep
every origin already there (see `DEPLOYMENT.md`'s CORS table).

**4. Push to `main`, or run the workflow manually.**
A push touching `frontend/**` triggers it automatically. To publish without a code change (e.g.
right after setting `VITE_API_URL` for the first time), run it by hand: **Actions →
"Deploy frontend to GitHub Pages" → Run workflow**.

If step 1 hasn't been done yet, the workflow's `Configure Pages` step fails with a clear error
rather than silently doing nothing — that failure is itself the signal that step 1 is still
outstanding.

## Expected result

`https://<your-github-username>.github.io/CartWise/` — for this repository as it stands,
**`https://gauravanand10.github.io/CartWise/`**.

Until step 2 is set, the site still deploys and loads, but every API call fails — same failure
shape Chapter 30's Android emulator run hit before its own CORS/API-URL gaps were found and fixed.
The workflow prints a `::warning::` on its Build step's log when `VITE_API_URL` is unset, so this
is visible in the Actions run rather than only discoverable by opening the deployed site.

## Verified this chapter, without deploying anything

- Built locally with the real base path (`VITE_BASE_PATH=/CartWise/`) and confirmed every asset
  URL in the output `index.html` is correctly prefixed (`/CartWise/assets/...`,
  `/CartWise/favicon.svg`).
- Served that exact build from a standalone static server reproducing GitHub Pages' actual
  behavior — files at their real subpath, any unmatched path answered with `404.html` at a 404
  status — and confirmed in a real (headless) browser that:
  - `/CartWise/` renders the real homepage, not a blank page.
  - `/CartWise/privacy` — a client-side route, loaded directly rather than navigated to — renders
    the actual Privacy Policy page via the `404.html` SPA-fallback mechanism, not GitHub's default
    404 text and not a blank screen.
  - `/CartWise/search` renders its shell and a graceful in-app error state (the API was pointed at
    a deliberately invalid host for this test), not the app's crash-screen `ErrorBoundary`.
- Confirmed the full frontend test suite (189 tests), `tsc -b`, and `eslint .` all still pass with
  the `basename`/`base` changes in place.
- Confirmed `render.yaml`'s and `DEPLOYMENT.md`'s existing CORS origins (the Render frontend URL,
  and `https://localhost` for the Chapter 30 Android app) are unchanged — this chapter's origin was
  added alongside them, not in place of them.

No GitHub, Railway, or Render account was created or modified by this chapter. GitHub Pages was
not enabled. Nothing was deployed anywhere live.
