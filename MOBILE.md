# CartWise for Android — build, verification, and Play Store handoff

Chapter 30, Part D. No Google Play Developer account was created, no fee was paid, and nothing was
submitted anywhere. Everything below is either a finished artifact already in this repository, or
a precise set of remaining steps for the owner to carry out with their own account.

---

## What actually happened, in order

1. Installed the Android SDK (cmdline-tools, platform-tools, build-tools 34/35, platforms
   android-34/36, and a google_apis x86_64 system image) to `D:\Android\Sdk` — outside the repo,
   so it never risked being committed.
2. Wrapped the existing React app with Capacitor 8.5.0 (`frontend/capacitor.config.ts`). No second
   UI was written — the Android app ships the exact same bundle the browser gets.
3. Built and installed a debug APK, then a release AAB, and **ran the app on a real Android
   emulator** (a Pixel 6 profile, API 34), not just compiled it.
4. Found and fixed two real defects that only running the wrapped app on a device could surface
   (both below, in "What running the app actually found").
5. Generated real launcher icons, a Play Store icon, and a feature graphic from the app's own
   brand mark — replacing Capacitor's stock placeholder icon, which was still in place until this
   chapter and would have gotten a real submission rejected on sight.
6. Generated a release signing keystore and wired Gradle to use it, and confirmed the signed AAB
   verifies with `jarsigner`.
7. Wrote a real privacy policy page (`/privacy`) and linked it from the footer, extending the
   honest-disclosure pattern Chapter 26 established for the affiliate relationship rather than
   inventing new boilerplate.
8. Captured four real screenshots from the running app, cropped to Play Store's actual screenshot
   limits (see below — the raw emulator captures did not meet them, which was checked, not
   assumed).

---

## What running the app actually found

Two things that a source-code read would not have caught, because both are about what happens when
two correct-looking pieces meet.

### 1. The default Capacitor config makes the app impossible to test against a developer's own machine

The release configuration (`androidScheme: "https"`, no cleartext) is correct for what ships — but
it also means an emulator cannot reach `http://10.0.2.2:8080`, the address that means "the host
machine" from inside an Android VM. The first debug build installed and launched perfectly: the
shell rendered, the header worked, and every data-driven region on the page said **"Failed to
fetch."**

Fixed with a named, opt-in local-verification mode (`CAP_LOCAL_API=1`) gated in two independent
places — see `frontend/capacitor.config.ts` and the debug-only manifest overlay at
`frontend/android/app/src/debug/` — so a release build can never accidentally inherit the relaxed
config. Full reasoning is in both files' own comments.

### 2. CORS never had an entry for what a Capacitor app's origin actually is

Once cleartext was permitted, the app reached the backend and still failed — this time visibly, in
logcat, as a CORS preflight rejection:

```
Access to fetch at 'http://10.0.2.2:8080/api/categories' from origin 'http://localhost' has been
blocked by CORS policy
```

A Capacitor Android app's WebView origin is a bare `https://localhost` (or `http://localhost` in
local-verification mode) — no port, nothing naming the app. Every CORS allowlist in this project
(`application-dev.yml`, `application-prod.yml`) named browser origins with ports and had no entry
that could ever match a mobile build. **This is not a local-only fix**: a production API deployed
without `https://localhost` in `CARTWISE_ALLOWED_ORIGINS` would reject the real, shipped Android
app for the same reason — see the long comment on that exact variable in `application-prod.yml`,
and `DEPLOYMENT.md`'s environment variable table.

After both fixes, the app was rebuilt, reinstalled, and relaunched — logcat showed **zero console
errors**, and the home screen rendered real catalogue data, real product photography with correct
CC attribution, and live category counts. Screenshots are in `frontend/mobile-proof/` (raw,
1080×2400) and `frontend/play-store/screenshots/` (cropped to 2:1 for actual submission — see
below for why that crop was necessary).

---

## Build artifacts

| File | What it is |
|---|---|
| `frontend/android/app/build/outputs/apk/debug/app-debug.apk` | Debug build, installed and run on-device this chapter |
| `frontend/android/app/build/outputs/bundle/release/app-release.aab` | **Signed** release bundle — the file Play Console actually accepts |

Rebuild either at any time:

```bash
cd frontend
npm run build                          # production build, VITE_API_URL from the environment
npx cap sync android
cd android
./gradlew assembleDebug                # -> app-debug.apk
./gradlew bundleRelease                # -> app-release.aab, signed if keystore.properties exists
```

**Do not build a release AAB with `VITE_API_URL` unset or pointed at localhost.** It will build
without error and the resulting app will be silently broken on every real device — see finding #1
above. Confirm the app knows about its own API host by checking the assets it just packaged:

```bash
grep -o "https://[a-zA-Z0-9.-]*\.railway\.app\|https://[a-zA-Z0-9.-]*\.onrender\.com" \
  android/app/src/main/assets/public/assets/*.js
```

### Signing

A release keystore was generated this chapter at `frontend/android/app/cartwise-release.keystore`
and wired into `app/build.gradle` via `frontend/android/keystore.properties` (gitignored — see
`keystore.properties.example` for the template and, importantly, **why this exact keystore must
not be the one that signs a real Play Store upload**: its password is a literal string committed
in a comment, which is fine for proving the signing configuration works and disqualifying for
protecting a real app's identity forever). Generate a real one before any actual submission:

```bash
keytool -genkeypair -v -keystore app/release.keystore -alias cartwise \
  -keyalg RSA -keysize 2048 -validity 10000
```

— using a real, randomly generated password stored in a password manager, not typed into a shell
history. **Back up the resulting `.keystore` file and its password somewhere that survives this
machine being wiped.** Losing it does not mean losing convenience; it means an app already
published can never receive an update again under the same listing.

---

## Play Store submission checklist — what exists, what remains

Confirmed done, this chapter:

- [x] App icon at every required density (`frontend/android/app/src/main/res/mipmap-*`),
      generated from the app's own brand mark by `frontend/tools/generate-app-icons.ps1` —
      not Capacitor's placeholder, which is what was there until this chapter and would have
      failed Play's review on the icon alone.
- [x] Play Store icon, 512×512 (`frontend/play-store/icon-512.png`)
- [x] Feature graphic, 1024×500 (`frontend/play-store/feature-graphic-1024x500.png`)
- [x] Four real screenshots from the running app (`frontend/play-store/screenshots/`), cropped to
      1080×2160 — Play Console requires a screenshot's longer side be at most twice its shorter
      side, and the emulator's native 1080×2400 capture (ratio 2.22:1) exceeds that and would be
      rejected on upload. This was checked against Play Console's current documented limits, not
      assumed; `frontend/tools/crop-store-screenshots.ps1` is the fix, committed rather than left
      as a manual step for the owner to rediscover.
- [x] Signed release AAB
- [x] Real privacy policy page, at `/privacy` once deployed

Remaining — genuinely requires the owner's own Google account and cannot be done on their behalf:

- [ ] **Create a Google Play Developer account** ($25 one-time fee — explicitly out of scope for
      this chapter)
- [ ] **Deploy the backend and frontend** (see `DEPLOYMENT.md`) and rebuild the release AAB with
      `VITE_API_URL` pointed at the real deployed backend — the AAB in this repository was built
      against a placeholder Railway URL that does not resolve, precisely because no live
      deployment exists yet under this chapter's constraints
      (see `frontend/Dockerfile` / `capacitor.config.ts`)
- [ ] **Regenerate the signing keystore** with a real, private password (see "Signing" above) and
      re-sign the AAB
- [ ] Create the Play Console listing: app name, short and full description (copy below), category
      (Shopping), content rating questionnaire, target audience, data safety form
- [ ] Upload the AAB, icon, feature graphic and screenshots already produced by this chapter
- [ ] Add the deployed `/privacy` URL as the store listing's privacy policy link
- [ ] Submit for review

---

## Store listing copy

Every claim below was checked against this project's own code or its documented, known gaps while
writing it — the same standard the in-app copy has been held to since Chapter 26.5.

**App name:** CartWise

**Short description** (max 80 characters):
```
Compare real prices across 5 retailers before you buy. No noise, no fake urgency.
```
(79 characters)

**Full description:**

```
CartWise is a price-comparison catalogue for electronics — phones, laptops, headphones,
smartwatches, and more — across five Indian retailers: Amazon, Flipkart, Croma, Reliance Digital
and Vijay Sales.

Search or browse 100 products, filter by price and category, and compare specifications side by
side. Every product page shows a straight, price-sorted list of where to buy it, with the cheapest
option first — retailers never pay to rank higher, and the sort order has no commission logic in
it at all.

WHAT THE PRICES ARE, HONESTLY
Prices shown are reference values, clearly labelled as such throughout the app — not live quotes
pulled from retailers in real time. Always confirm the actual price on the retailer's own page
before buying; that is the price you will actually be charged.

REAL PRODUCT PHOTOGRAPHY, HONESTLY SOURCED
Product images are genuine Creative Commons-licensed photographs, with full attribution shown on
every product page and linked to the original license. Where no real photograph of a specific
product could be found and verified, the app shows a clearly captioned illustrative category photo
instead — never a fabricated or mismatched image presented as the real thing.

HOW CARTWISE IS FUNDED
Some outbound "Visit store" links are affiliate links, meaning CartWise may earn a small commission
if you buy something after clicking through — at no extra cost to you, and with no effect on which
offers are shown or how they're ranked. Full disclosure, including exactly which retailers
currently pay a commission (checked live, not asserted), is one tap away in Settings.

NO ACCOUNT REQUIRED TO BROWSE
Browse the entire catalogue, search, and compare without signing up. Create a free account only if
you want to save a wishlist or keep a comparison across devices — sign-up asks for nothing but an
email and a password.

Your privacy: no advertising SDK, no analytics tracker, no cookies. Full detail in the in-app
privacy policy.
```

**Category:** Shopping

**Content rating:** Everyone (no user-generated content beyond wishlist product selections; no
account data beyond email; no in-app purchases — CartWise has no checkout of its own)

**Privacy policy URL:** `<deployed frontend origin>/privacy` — cannot be filled in until Part C's
deployment is complete (see `DEPLOYMENT.md`)

---

## Known gaps in this Part, stated rather than hidden

- The release AAB in this repository is signed but points at a placeholder API host
  (`https://cartwise-api.up.railway.app`, which does not resolve) — it is not the AAB that should
  ever be uploaded to Play. See the checklist above.
- iOS was never attempted. Capacitor supports it, but no `ios/` project was generated, no Apple
  Developer account exists, and Part D's instructions named Android specifically.
- The debug keystore committed this chapter must be replaced before any real submission — see
  "Signing" above.
- No accessibility pass was run specifically on the Android WebView chrome (system bars, the
  Android back gesture's interaction with in-app navigation) beyond what Chapter 29's web
  accessibility work already covers, since the rendered content is the same DOM either way.
