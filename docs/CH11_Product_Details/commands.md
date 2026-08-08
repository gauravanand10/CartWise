# 💻 CH11 — Commands

> **Chapter:** Product Details  
> **Project:** CartWise

This chapter documents the commands used while implementing, verifying, and committing the Product Details experience.

---

# 🚀 Development

## Start Development Server

```bash
npm run dev
```

### Purpose

Starts the CartWise development server for testing the Product Details experience.

---

## Build Production Version

```bash
npm run build
```

### Purpose

Creates the optimized production build.

---

## Preview Production Build

```bash
npm run preview
```

### Purpose

Runs the production build locally so the final application can be tested before deployment.

---

# 🔍 TypeScript Verification

```bash
npx tsc --noEmit
```

### Purpose

Checks the entire project for TypeScript errors without generating JavaScript output.

### Expected Result

```text
0 errors
```

---

# 🧹 ESLint Verification

```bash
npx eslint src --max-warnings=0
```

### Purpose

Checks the source code for linting errors and warnings.

### Expected Result

```text
0 errors
0 warnings
```

---

# 🌐 Test Product Routes

The Product Details page uses dynamic routes.

Examples:

```text
/product/iphone-16-pro
/product/galaxy-s25-ultra
/product/oneplus-14
/product/google-pixel-10
/product/sony-wh-1000xm6
```

### Purpose

Verifies that different product slugs load their corresponding product information.

---

# ❌ Test Invalid Product Route

Example:

```text
/product/abcd
```

### Expected Result

The application should display the Product Not Found state instead of crashing.

---

# 🖼️ Test Product Gallery

Verify:

- Thumbnail selection
- Previous image
- Next image
- Image switching
- Zoom interaction

Example flow:

```text
Product
  ↓
Gallery
  ↓
Select Thumbnail
  ↓
Main Image Changes
```

---

# 🏪 Test Store Comparison

Verify that store offers are displayed correctly.

Expected information includes:

- Store name
- Price
- Delivery
- Availability
- Visit Store action

---

# 📊 Test Specifications

Verify specification groups such as:

```text
Display
Processor
Memory
Camera
Battery
Connectivity
```

Check that specification sections can be expanded and collapsed where applicable.

---

# 🤖 Test AI Insights

Verify that the Product Details page displays:

- AI Score
- Summary
- Confidence
- Pros
- Cons
- Best For
- Who Should Buy
- Who Should Avoid

The current implementation uses mock/static data.

---

# ⭐ Test Reviews

Verify:

- Overall rating
- Rating distribution
- Review cards
- Verified Purchase badge
- Helpful count

---

# 🔗 Test Related Products

Open a Product Details page and select a related product.

Expected flow:

```text
Product A
   ↓
Related Product
   ↓
Product B
```

The URL should update to the selected product's slug.

---

# ❤️ Test Wishlist Action

Verify that the Wishlist action behaves according to the current implementation.

The complete Wishlist system belongs to a later chapter.

---

# ⚖️ Test Compare Action

Verify that the Compare action connects correctly to the existing Compare workflow.

The complete comparison experience is implemented in a later chapter.

---

# 📤 Test Share Action

Verify that the Share action works according to the current implementation.

Possible behavior:

- Native share
- Copy product URL
- Share confirmation

---

# 📱 Responsive Testing

Use browser DevTools to test the Product Details page at:

```text
320px
375px
390px
414px
480px
640px
768px
1024px
1280px
1536px
1920px
```

Verify:

- No horizontal scrolling
- Gallery adapts correctly
- Product information remains readable
- Pricing remains usable
- Store cards stack correctly
- Specifications remain readable
- Reviews remain readable
- Buttons remain accessible
- Typography scales correctly
- Spacing remains consistent

---

# 🧪 Browser Console

Open Developer Tools:

```text
F12
```

Then open:

```text
Console
```

Verify:

```text
No red errors
No uncaught exceptions
```

---

# 🌐 Git Commands

## Check Repository Status

```bash
git status
```

### Purpose

Shows modified, deleted, staged, and untracked files.

---

## Check Recent Commits

```bash
git log --oneline --decorate --graph --all -20
```

### Purpose

Displays recent commits and branch history.

---

## Check Remote Repository

```bash
git remote -v
```

### Purpose

Verifies the GitHub repository configured as `origin`.

---

## Stage Changes

```bash
git add .
```

### Purpose

Stages the completed Product Details implementation.

---

## Commit Chapter 11

```bash
git commit -m "feat: implement Chapter 11 product details"
```

### Purpose

Creates the Git commit containing the Product Details implementation.

---

## Push to GitHub

```bash
git push origin main
```

### Purpose

Uploads the Chapter 11 implementation to GitHub.

---

# 📚 Documentation Commands

After completing the Chapter 11 implementation, create the documentation directory:

```bash
mkdir docs/CH11_Product_Details
```

Create the documentation files:

```text
README.md
glossary.md
interview_questions.md
commands.md
```

---

# 🔄 Synchronize Before Committing

If the local branch is behind GitHub and you have uncommitted work:

```bash
git stash push -m "Chapter 11 Product Details"
```

Then:

```bash
git pull --rebase origin main
```

Restore the work:

```bash
git stash pop
```

Stage the changes:

```bash
git add .
```

Check:

```bash
git status
```

Then commit and push.

---

# 📁 Expected Product Feature Structure

```text
src/
└── features/
    └── product/
        ├── components/
        │   ├── AiInsights.tsx
        │   ├── PricingCard.tsx
        │   ├── ProductActions.tsx
        │   ├── ProductHero.tsx
        │   ├── ProductReviews.tsx
        │   ├── ProductSection.tsx
        │   ├── ProductSummary.tsx
        │   ├── RatingSummary.tsx
        │   ├── ReviewCard.tsx
        │   ├── SpecGroupPanel.tsx
        │   ├── StoreComparison.tsx
        │   ├── StoreOfferCard.tsx
        │   └── states/
        │       ├── ProductError.tsx
        │       ├── ProductNotFound.tsx
        │       └── ProductSkeleton.tsx
        │
        ├── data/
        │   ├── catalogue.ts
        │   ├── editorial.ts
        │   ├── offers.ts
        │   ├── reviews.ts
        │   └── specs.ts
        │
        ├── hooks/
        │   ├── useGallery.ts
        │   └── useProduct.ts
        │
        ├── utils/
        │   ├── media.ts
        │   ├── pricing.ts
        │   └── slug.ts
        │
        ├── constants.ts
        ├── index.ts
        └── ProductPage.tsx
```

---

# ✅ Final Verification Sequence

Before considering Chapter 11 complete:

```bash
npx tsc --noEmit
```

```bash
npx eslint src --max-warnings=0
```

```bash
npm run build
```

```bash
npm run preview
```

Then manually verify:

```text
Homepage
   ↓
Search
   ↓
Product
   ↓
Product Details
   ↓
Gallery
   ↓
Pricing
   ↓
Store Comparison
   ↓
Specifications
   ↓
AI Insights
   ↓
Reviews
   ↓
Related Products
```

Finally:

```bash
git status
```

```bash
git add .
```

```bash
git commit -m "feat: implement Chapter 11 product details"
```

```bash
git push origin main
```

---

# 📌 Commands Summary

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npx tsc --noEmit` | Verify TypeScript |
| `npx eslint src --max-warnings=0` | Verify ESLint |
| `git status` | Check repository state |
| `git log --oneline --decorate --graph --all -20` | View recent commits |
| `git remote -v` | Check GitHub remote |
| `git stash push -m "Chapter 11 Product Details"` | Temporarily save changes |
| `git pull --rebase origin main` | Synchronize with GitHub |
| `git stash pop` | Restore stashed changes |
| `git add .` | Stage changes |
| `git commit -m "feat: implement Chapter 11 product details"` | Commit implementation |
| `git push origin main` | Push to GitHub |

---

# 📌 Summary

These commands cover the complete development and verification workflow for the Product Details chapter, from running the application and validating TypeScript and ESLint to testing dynamic routes, verifying the production build, and committing the completed implementation to GitHub.
