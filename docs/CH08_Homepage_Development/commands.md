# 💻 CH08 — Commands

> **Chapter:** Homepage Development

This chapter focuses on building the CartWise Homepage using reusable components created in previous chapters. Most work involves creating React components and organizing homepage sections.

---

# 📁 Create Homepage Feature

## Command

```bash
mkdir src/features/homepage
```

### Purpose

Creates the homepage feature module.

---

# 📁 Create Homepage Components

```bash
mkdir src/features/homepage/components
```

### Purpose

Stores all homepage-specific components.

---

# 📁 Create Homepage Data

```bash
mkdir src/features/homepage/data
```

### Purpose

Stores mock homepage data.

Currently, CartWise uses placeholder data until backend APIs are integrated.

---

# 📁 Create Homepage Types

```bash
mkdir src/features/homepage/types
```

### Purpose

Stores TypeScript interfaces related to homepage data.

---

# 📁 Create Homepage Constants

```bash
mkdir src/features/homepage/constants
```

### Purpose

Stores homepage-specific constants.

---

# 📄 Create Hero Section

```bash
touch src/features/homepage/components/Hero.tsx
```

### Purpose

Creates the Hero Section displayed at the top of the Homepage.

---

# 📄 Create Hero Banner

```bash
touch src/features/homepage/components/HeroBanner.tsx
```

### Purpose

Displays the primary marketing banner.

---

# 📄 Create Hero Search

```bash
touch src/features/homepage/components/HeroSearch.tsx
```

### Purpose

Creates the homepage search component.

---

# 📄 Create Hero Stats

```bash
touch src/features/homepage/components/HeroStats.tsx
```

### Purpose

Displays homepage statistics.

---

# 📄 Create Hero Categories

```bash
touch src/features/homepage/components/HeroCategories.tsx
```

### Purpose

Displays featured shopping categories.

---

# 📄 Create Floating Products

```bash
touch src/features/homepage/components/FloatingProducts.tsx
```

### Purpose

Creates decorative floating product cards.

---

# 📄 Create Trending Searches

```bash
touch src/features/homepage/components/TrendingSearches.tsx
```

### Purpose

Displays popular search keywords.

---

# 📄 Create Offer Card

```bash
touch src/features/homepage/components/OfferCard.tsx
```

### Purpose

Displays promotional offers.

---

# 📄 Create Homepage Sections

```bash
touch src/features/homepage/components/FlashDeals.tsx
touch src/features/homepage/components/AIPicks.tsx
touch src/features/homepage/components/TrendingProducts.tsx
touch src/features/homepage/components/BrandCollections.tsx
touch src/features/homepage/components/RecentlyViewed.tsx
touch src/features/homepage/components/RecommendedProducts.tsx
touch src/features/homepage/components/PriceDrops.tsx
```

### Purpose

Creates all reusable homepage sections.

---

# 📄 Create Product Components

```bash
touch src/features/homepage/components/ProductCard.tsx
touch src/features/homepage/components/ProductGrid.tsx
touch src/features/homepage/components/AIScore.tsx
touch src/features/homepage/components/ProductBadge.tsx
```

### Purpose

Creates reusable product presentation components.

---

# ▶️ Start Development Server

```bash
npm run dev
```

### Purpose

Starts the local development server.

Open:

```text
http://localhost:5173
```

---

# 🏗️ Build Production Version

```bash
npm run build
```

### Purpose

Creates an optimized production build.

---

# 👀 Preview Production Build

```bash
npm run preview
```

### Purpose

Runs the production build locally before deployment.

---

# 🔄 Restart Development Server

Stop the server:

```text
Ctrl + C
```

Restart it:

```bash
npm run dev
```

---

# 📂 Expected Folder Structure

```text
src/
└── features/
    └── homepage/
        ├── components/
        │   ├── Hero.tsx
        │   ├── HeroBanner.tsx
        │   ├── HeroSearch.tsx
        │   ├── HeroStats.tsx
        │   ├── HeroCategories.tsx
        │   ├── FloatingProducts.tsx
        │   ├── TrendingSearches.tsx
        │   ├── OfferCard.tsx
        │   ├── FlashDeals.tsx
        │   ├── AIPicks.tsx
        │   ├── TrendingProducts.tsx
        │   ├── BrandCollections.tsx
        │   ├── RecentlyViewed.tsx
        │   ├── RecommendedProducts.tsx
        │   ├── PriceDrops.tsx
        │   ├── ProductCard.tsx
        │   ├── ProductGrid.tsx
        │   ├── AIScore.tsx
        │   └── ProductBadge.tsx
        ├── constants/
        ├── data/
        └── types/
```

---

# 🚨 Common Errors

## Homepage Not Rendering

### Cause

The Homepage component is not connected to the routing system.

### Solution

Verify that the Homepage route is correctly defined in `AppRoutes.tsx`.

---

## Components Not Displaying

### Cause

Homepage components have not been imported into the main Homepage component.

### Solution

Check all component imports and ensure they are rendered in the correct order.

---

## Placeholder Images Missing

### Cause

Incorrect image paths or missing placeholder assets.

### Solution

Verify that placeholder images exist inside the `assets/` directory and that the import paths are correct.

---

## Product Grid Layout Broken

### Cause

Incorrect grid classes or inconsistent card dimensions.

### Solution

Use the shared `ProductGrid` component and follow the Design System spacing guidelines.

---

## Repeated UI Code

### Cause

Creating product cards directly inside each section.

### Solution

Reuse the existing `ProductCard` component across all homepage sections.

---

# 📌 Best Practices

- Keep every homepage section independent.
- Reuse shared components wherever possible.
- Keep homepage data separate from UI.
- Use placeholder data until backend APIs are available.
- Maintain consistent spacing and styling using the Design System.
- Avoid large monolithic Homepage components.

---

# 📝 Commands Summary

| Command | Purpose |
|----------|---------|
| `mkdir src/features/homepage` | Create homepage feature |
| `mkdir src/features/homepage/components` | Create homepage components |
| `mkdir src/features/homepage/data` | Create mock data |
| `mkdir src/features/homepage/types` | Create types |
| `mkdir src/features/homepage/constants` | Create constants |
| `touch Hero.tsx` | Create Hero section |
| `touch HeroBanner.tsx` | Create Hero banner |
| `touch HeroSearch.tsx` | Create Hero search |
| `touch HeroStats.tsx` | Create Hero statistics |
| `touch HeroCategories.tsx` | Create Hero categories |
| `touch FloatingProducts.tsx` | Create floating products |
| `touch TrendingSearches.tsx` | Create trending searches |
| `touch OfferCard.tsx` | Create offer card |
| `touch FlashDeals.tsx` | Create Flash Deals section |
| `touch AIPicks.tsx` | Create AI Picks section |
| `touch TrendingProducts.tsx` | Create Trending Products section |
| `touch BrandCollections.tsx` | Create Brand Collections section |
| `touch RecentlyViewed.tsx` | Create Recently Viewed section |
| `touch RecommendedProducts.tsx` | Create Recommended Products section |
| `touch PriceDrops.tsx` | Create Price Drops section |
| `touch ProductCard.tsx` | Create Product Card |
| `touch ProductGrid.tsx` | Create Product Grid |
| `touch AIScore.tsx` | Create AI Score |
| `touch ProductBadge.tsx` | Create Product Badge |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |

---

# ✅ Summary

This chapter establishes the complete Homepage structure of CartWise using modular, reusable components. The Homepage is organized into independent sections such as the Hero, Flash Deals, AI Picks, Trending Products, Brand Collections, Recently Viewed, Recommended Products, and Price Drops. By combining these sections with shared UI components, the Homepage remains scalable, maintainable, and ready for future backend and AI integration.
