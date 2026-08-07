# 💻 CH10 — Commands

> **Chapter:** Search System

This chapter focuses on building the complete Search System for CartWise. It introduces search functionality, filtering, sorting, URL synchronization, pagination, responsive layouts, and reusable search components.

---

# 📁 Create Search Feature

## Command

```bash
mkdir src/features/search
```

### Purpose

Creates the Search feature module.

---

# 📁 Create Search Components

```bash
mkdir src/features/search/components
```

### Purpose

Stores all search-related UI components.

---

# 📁 Create Search Filters

```bash
mkdir src/features/search/components/filters
```

### Purpose

Stores reusable search filter components.

---

# 📁 Create Search Hooks

```bash
mkdir src/features/search/hooks
```

### Purpose

Stores reusable custom hooks.

Examples:

- useSearch
- useRecentSearches
- useClickOutside

---

# 📁 Create Search Services

```bash
mkdir src/features/search/services
```

### Purpose

Contains the search service responsible for product searching.

Future backend APIs will replace the mock implementation.

---

# 📁 Create Search Utilities

```bash
mkdir src/features/search/utils
```

### Purpose

Contains reusable helper functions.

Example:

- Search matching
- Sorting
- Filtering

---

# 📁 Create Search Data

```bash
mkdir src/features/search/data
```

### Purpose

Stores mock search data.

Examples:

- Trending searches
- Mock products

---

# 📁 Create Search Types

```bash
mkdir src/features/search/types
```

### Purpose

Stores TypeScript interfaces.

---

# 📁 Create Search Constants

```bash
mkdir src/features/search/constants
```

### Purpose

Stores search configuration values.

Examples:

- Default page size
- Price limits
- Debounce duration

---

# 📄 Create Search Components

```bash
touch src/features/search/components/SearchBar.tsx
touch src/features/search/components/SearchSuggestions.tsx
touch src/features/search/components/SearchResults.tsx
touch src/features/search/components/SearchStats.tsx
touch src/features/search/components/SearchSkeleton.tsx
touch src/features/search/components/EmptyState.tsx
touch src/features/search/components/ErrorState.tsx
touch src/features/search/components/NoResults.tsx
touch src/features/search/components/ActiveFilters.tsx
touch src/features/search/components/SortDropdown.tsx
touch src/features/search/components/Pagination.tsx
```

### Purpose

Creates reusable search interface components.

---

# 📄 Create Filter Components

```bash
touch src/features/search/components/filters/CategoryFilter.tsx
touch src/features/search/components/filters/BrandFilter.tsx
touch src/features/search/components/filters/PriceFilter.tsx
touch src/features/search/components/filters/RatingFilter.tsx
touch src/features/search/components/filters/FilterGroup.tsx
```

### Purpose

Creates reusable filter components.

---

# 📄 Create Search Hooks

```bash
touch src/features/search/hooks/useSearch.ts
touch src/features/search/hooks/useRecentSearches.ts
touch src/features/search/hooks/useClickOutside.ts
```

### Purpose

Creates reusable search hooks.

---

# 📄 Create Search Service

```bash
touch src/features/search/services/searchService.ts
```

### Purpose

Contains search logic.

Future backend APIs will replace the mock implementation.

---

# 📄 Create Search Utilities

```bash
touch src/features/search/utils/searchUtils.ts
```

### Purpose

Stores helper functions for searching, filtering, and sorting.

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

Runs the production build locally for verification.

---

# ✅ Verify TypeScript

```bash
npx tsc --noEmit
```

### Purpose

Checks the project for TypeScript errors.

### CartWise Result

```text
0 Errors
```

---

# ✅ Verify ESLint

```bash
npx eslint src --max-warnings=0
```

### Purpose

Checks the project for linting errors and warnings.

### CartWise Result

```text
0 Errors
0 Warnings
```

---

# 🔄 Restart Development Server

Stop:

```text
Ctrl + C
```

Restart:

```bash
npm run dev
```

---

# 🌐 Git Status

```bash
git status
```

### Purpose

Displays modified files before committing the Search System implementation.

---

# ➕ Stage Changes

```bash
git add .
```

### Purpose

Stages all Search System changes.

---

# 📝 Commit Search System

```bash
git commit -m "feat: implement Chapter 10 search system"
```

### Purpose

Creates a Git commit containing the complete Search System implementation.

---

# ☁️ Push to GitHub

```bash
git push origin main
```

### Purpose

Pushes the Search System implementation to GitHub.

---

# 📂 Expected Folder Structure

```text
src/
└── features/
    └── search/
        ├── components/
        │   ├── filters/
        │   ├── SearchBar.tsx
        │   ├── SearchSuggestions.tsx
        │   ├── SearchResults.tsx
        │   ├── SearchStats.tsx
        │   ├── SearchSkeleton.tsx
        │   ├── EmptyState.tsx
        │   ├── ErrorState.tsx
        │   ├── NoResults.tsx
        │   ├── ActiveFilters.tsx
        │   ├── SortDropdown.tsx
        │   └── Pagination.tsx
        ├── hooks/
        ├── services/
        ├── utils/
        ├── constants/
        ├── data/
        └── types/
```

---

# 🚨 Common Errors

## Search Returns No Results

### Cause

Search query does not match available products.

### Solution

Verify search matching logic and mock data.

---

## Filters Not Updating Results

### Cause

Search state is not synchronized.

### Solution

Ensure filters update the shared search state.

---

## URL Not Updating

### Cause

Query parameters are not synchronized with the browser.

### Solution

Use URL query parameters as the source of truth.

---

## Pagination Incorrect

### Cause

Current page is not reset after filters or search changes.

### Solution

Reset pagination whenever search criteria change.

---

## Suggestions Not Appearing

### Cause

Suggestion logic or recent/trending data is missing.

### Solution

Verify suggestion generation and dropdown rendering.

---

# 📌 Best Practices

- Keep search state centralized.
- Synchronize search state with the URL.
- Separate searching, filtering, and sorting.
- Reuse Product Cards.
- Debounce user input.
- Build mobile-first.
- Keep search logic independent from UI.
- Reuse shared components wherever possible.

---

# 📝 Commands Summary

| Command | Purpose |
|----------|---------|
| `mkdir src/features/search` | Create Search feature |
| `mkdir src/features/search/components` | Create Search components |
| `mkdir src/features/search/components/filters` | Create Filter components |
| `mkdir src/features/search/hooks` | Create Search hooks |
| `mkdir src/features/search/services` | Create Search services |
| `mkdir src/features/search/utils` | Create Search utilities |
| `mkdir src/features/search/data` | Create Search data |
| `mkdir src/features/search/types` | Create Search types |
| `mkdir src/features/search/constants` | Create Search constants |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npx tsc --noEmit` | Verify TypeScript |
| `npx eslint src --max-warnings=0` | Verify ESLint |
| `git status` | Check modified files |
| `git add .` | Stage changes |
| `git commit -m "feat: implement Chapter 10 search system"` | Commit implementation |
| `git push origin main` | Push to GitHub |

---

# ✅ Summary

This chapter implemented the complete Search System for CartWise, including product searching, live suggestions, filtering, sorting, pagination, URL synchronization, and responsive layouts. The implementation follows the project's Feature-first Architecture, reuses existing shared components, and prepares the application for future backend API integration while maintaining a scalable and production-ready structure.
