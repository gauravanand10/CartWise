# 💻 CH27 — Commands

> **Project:** CartWise
> **Chapter:** Homepage & Global UI Redesign

This file contains the commands used to diagnose the stale-build issue, verify the actual served output, and check the redesign.

---

# 🚀 Development Commands

## Start Backend (unchanged this chapter — verify nothing touched it)

```powershell
cd D:\Software_Engineering\CartWise\backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=dev"
```

---

## Start Frontend (Dev Server)

```powershell
cd D:\Software_Engineering\CartWise\frontend
npm run dev
```

---

# 🕵️ Diagnosing a Stale Build

## Check for a Shadowing Docker Container

```bash
docker ps
```

If a container is serving an old image on the same port, that's a simpler explanation than a code bug — rule it out first.

---

## Confirm Source Is Actually Clean

```bash
grep -rn "Save up to\|10-minute\|Patiala\|25,000" frontend/src/
```

### Expected (if source is genuinely clean)

```text
Zero hits outside comments describing what was removed
```

---

## Force a Completely Fresh Build

```powershell
cd D:\Software_Engineering\CartWise\frontend
Remove-Item -Recurse -Force dist
npm run build
```

Note the generated hashed filename (e.g. `index-DKTMY54b.js`) — this confirms which build you're actually checking.

---

## Grep the Built Bundle — the Correct Way

```powershell
$bundleText = [System.IO.File]::ReadAllText("dist\assets\index-<hash>.js")
$bundleText -match "Save up to"
```

### Do Not Use

```powershell
Select-String -SimpleMatch "Save up to" dist\assets\index-<hash>.js
```

This silently fails to match on extremely long minified lines — it can report zero hits on a string that is actually present many times. `ReadAllText` reading the whole file as one string is the reliable method.

---

## Serve the Fresh Build and Probe It Live

```bash
cd frontend
npx vite preview --port 4173
```

Then, in the browser console on that served page:

```js
({
  servedFrom: window.location.href,
  scripts: [...document.scripts].map(s => s.src),
  percentOff: document.body.innerText.includes("% off") || document.body.innerText.includes("% OFF"),
  saveUpTo: document.body.innerText.includes("Save up to"),
  aiScore: document.body.innerText.toLowerCase().includes("ai score"),
})
```

---

# 🧹 Fabricated Copy Sweep

## Search the Built Bundle for Forbidden Strings

```powershell
$bundleText = [System.IO.File]::ReadAllText("dist\assets\index-<hash>.js")
@("25,000 today","Save up to","10-minute","Patiala","% OFF","Never overpay","AI score","Track price drops","Blinkit","nine retailers") |
  ForEach-Object { "$_ -> " + ([regex]::Matches($bundleText, [regex]::Escape($_))).Count }
```

### Expected

```text
All zero.
```

---

## Search the Built Bundle for Required Strings

```powershell
@("Reference prices","How CartWise makes money","five retailers","Vijay Sales","Affiliate disclosure") |
  ForEach-Object { "$_ -> " + ([regex]::Matches($bundleText, [regex]::Escape($_))).Count }
```

### Expected

```text
All present, non-zero.
```

---

## Search Source, Excluding Comments and Tests, for Any Remaining Discount Copy

```bash
grep -rn "% off\|% OFF" frontend/src/ --include=*.tsx --include=*.ts | grep -v "\.test\." | grep -v "//"
```

### Expected

```text
Only the two known, explicitly deferred instances (PricingCard, comparison table)
```

---

# 🎨 Design Verification

## TypeScript

```bash
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

## Frontend Test Suite

```bash
npx vitest run
```

### Expected

```text
Test Files  10 passed (10)
     Tests  148 passed (148)
```

Run more than once if anything looks borderline slow — an unreproduced single-run failure is worth noting, not chasing indefinitely without a captured test name.

---

# 🔍 Confirm the Backend Was Genuinely Untouched

```bash
Get-ChildItem -Recurse backend\src | Where-Object { $_.LastWriteTime -gt "<session start time>" }
```

### Expected

```text
NONE — no backend file modified this chapter
```

If this returns anything, `mvn clean test` needs to be run — do not skip it just because the chapter was scoped as frontend-only.

---

# 📱 Responsive Verification

## Iframe Harness (window resizing is unreliable)

```html
<iframe src="http://localhost:4173" style="width:360px; height:900px;"></iframe>
```

Confirm `innerWidth` inside the iframe context matches the intended width before trusting any screenshot taken at that size.

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
git commit -m "fix: rebuild stale frontend artifact and remove remaining marketplace-style UI patterns"
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
mkdir -p docs/CH27_Homepage_and_Global_UI_Redesign
```

---

## Commit Documentation

```bash
git add docs/CH27_Homepage_and_Global_UI_Redesign
git commit -m "docs: add Chapter 27 homepage redesign documentation"
git push origin main
```

---

# 📌 Command Summary

```bash
docker ps
Remove-Item -Recurse -Force dist
npm run build
npx vite preview --port 4173
npx tsc -b
npx eslint .
npx vitest run
git add -A
git commit -m "fix: rebuild stale frontend artifact and remove remaining marketplace-style UI patterns"
git push origin main
```
