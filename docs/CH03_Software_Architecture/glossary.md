# 📖 CH03 — Glossary

> This glossary explains the architectural terminology used throughout the CartWise project.

---

# 🏛️ Architecture

The overall blueprint that defines how CartWise is organized, how different modules interact, and how the project scales over time.

**CartWise Context**

CartWise follows a **Feature-First Architecture**, where related files are grouped by functionality rather than file type.

---

# 🧩 Feature-First Architecture

An organizational approach where every feature owns everything it needs.

Instead of:

```text
components/
pages/
hooks/
services/
```

we group related files together.

Example:

```text
features/
└── homepage/
    ├── components/
    ├── hooks/
    ├── services/
    ├── types/
    └── data/
```

This keeps the codebase modular and easier to maintain.

---

# 📄 Page

A Page represents a complete screen rendered by React Router.

Examples inside CartWise:

- Home
- Search
- Compare
- Wishlist
- Dashboard

Pages compose multiple reusable components.

---

# 🧱 Component

A reusable UI building block.

Examples in CartWise:

- Button
- ProductCard
- SearchBar
- PriceTag
- StoreBadge
- Rating

Components are designed to be reusable throughout the application.

---

# 🎨 Shared Component

A component used by multiple features.

Examples:

- Button
- Card
- Badge
- Loader
- EmptyState

Shared components are stored in the shared directory.

---

# 🪝 Hook

A reusable function that shares logic between components.

Examples:

- useDebounce
- useTheme
- useLocalStorage

Hooks reduce duplicated logic.

---

# 🔧 Service

A module responsible for communicating with APIs or handling business logic.

Current Status:

🚧 Planned

Backend integration will introduce services in later chapters.

---

# 📦 Asset

Static resources used by the application.

Examples:

- Images
- SVG Icons
- Fonts

CartWise currently uses placeholder product images until backend APIs provide real images.

---

# 📝 Type

A TypeScript definition describing the structure of data.

Example:

```ts
interface Product {
  id: number;
  title: string;
  price: number;
}
```

Types improve reliability and autocomplete.

---

# 📁 Utils

Reusable helper functions.

Examples:

- Currency Formatting
- Price Calculation
- Rating Conversion

Utilities avoid duplicated code.

---

# 🎯 Constants

Values that never change.

Examples:

- Route Names
- Theme Colors
- Animation Durations

Keeping constants centralized improves maintainability.

---

# 🗂️ Data

Static mock data used during frontend development.

Since CartWise currently has no backend, product information is temporarily stored in local data files.

---

# 🧭 Layout

A reusable page structure shared across multiple pages.

Examples:

- Navbar
- Footer
- Main Content

Layouts prevent duplication.

---

# 📚 Folder Structure

The hierarchical organization of files and folders.

A good folder structure makes projects easier to navigate, maintain, and scale.

CartWise uses a feature-first organization designed for production-grade applications.

---

# 📌 Summary

The architecture of CartWise is designed around modularity, scalability, and maintainability. Every architectural term introduced in this chapter directly corresponds to the actual project structure, making it easier to understand how the codebase is organized and how future features will fit into it.
