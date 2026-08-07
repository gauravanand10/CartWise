# 💻 CH06 — Commands

> **Chapter:** Shared Components

This chapter focuses on building the reusable UI components that power the entire CartWise application.

Unlike previous chapters, most work involves creating React components rather than installing new packages.

---

# 📁 Create Shared Components Directory

## Command

```bash
mkdir src/shared/components
```

### Purpose

Creates the root directory for all reusable UI components.

---

# 📁 Create Component Folders

Organize each component inside its own folder.

```bash
mkdir src/shared/components/Button
mkdir src/shared/components/Card
mkdir src/shared/components/Badge
mkdir src/shared/components/Chip
mkdir src/shared/components/Input
mkdir src/shared/components/Loader
mkdir src/shared/components/Skeleton
mkdir src/shared/components/ErrorState
mkdir src/shared/components/EmptyState
mkdir src/shared/components/GlassPanel
mkdir src/shared/components/PriceTag
mkdir src/shared/components/Rating
mkdir src/shared/components/StoreBadge
mkdir src/shared/components/SectionHeading
```

### Purpose

Keeps every reusable component isolated and easy to maintain.

---

# 📄 Create Component Files

Example:

```bash
touch src/shared/components/Button/Button.tsx
```

Repeat for every component.

Example:

```bash
touch src/shared/components/Card/Card.tsx
touch src/shared/components/Badge/Badge.tsx
touch src/shared/components/Input/Input.tsx
```

---

# 📄 Create Component Styles (Optional)

If component-specific styles are required:

```bash
touch src/shared/components/Button/Button.css
```

> CartWise primarily uses Tailwind CSS, so separate CSS files are rarely needed.

---

# 📄 Create Barrel Export File

```bash
touch src/shared/components/index.ts
```

### Purpose

Exports every shared component from one location.

Example:

```ts
export { default as Button } from "./Button/Button";
export { default as Card } from "./Card/Card";
export { default as Badge } from "./Badge/Badge";
```

This simplifies imports throughout the project.

---

# ▶️ Start Development Server

```bash
npm run dev
```

### Purpose

Starts the development server to preview newly created components.

---

# 🏗️ Build Production Version

```bash
npm run build
```

### Purpose

Ensures all shared components compile successfully.

---

# 👀 Preview Production Build

```bash
npm run preview
```

### Purpose

Runs the production build locally.

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

# 📂 Component Structure

Recommended structure:

```text
shared/
└── components/
    ├── Button/
    │   └── Button.tsx
    ├── Card/
    │   └── Card.tsx
    ├── Badge/
    ├── Chip/
    ├── Input/
    ├── Loader/
    ├── Skeleton/
    ├── ErrorState/
    ├── EmptyState/
    ├── GlassPanel/
    ├── PriceTag/
    ├── Rating/
    ├── StoreBadge/
    ├── SectionHeading/
    └── index.ts
```

---

# 🚨 Common Errors

## Component Not Found

### Cause

Incorrect import path.

### Solution

Verify the component location and import statement.

---

## Duplicate Components

### Cause

Creating multiple versions of the same UI element.

### Solution

Reuse the existing shared component instead of creating a new one.

---

## Props Not Passed Correctly

### Cause

Required props are missing.

### Solution

Verify the component interface and pass all required properties.

---

## Styling Inconsistency

### Cause

Using custom styles instead of the shared Design System.

### Solution

Use the predefined Tailwind utility classes and design tokens.

---

# 📌 Best Practices

- One folder per component.
- One responsibility per component.
- Keep components generic.
- Accept props instead of hardcoding values.
- Reuse existing components before creating new ones.
- Follow the CartWise Design System.
- Avoid embedding business logic inside shared components.

---

# 📝 Commands Summary

| Command | Purpose |
|----------|---------|
| `mkdir src/shared/components` | Create shared components directory |
| `mkdir src/shared/components/<Component>` | Create a component folder |
| `touch <Component>.tsx` | Create a React component |
| `touch index.ts` | Create barrel export file |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `Ctrl + C` | Stop development server |

---

# ✅ Summary

By the end of this chapter, CartWise has a reusable component library that serves as the foundation for every page in the application. These components promote consistency, reduce duplicate code, simplify maintenance, and accelerate future development.
