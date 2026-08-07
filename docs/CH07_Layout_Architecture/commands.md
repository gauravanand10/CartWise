# 💻 CH07 — Commands

> **Chapter:** Layout Architecture

This chapter focuses on building the reusable layout structure of CartWise. These commands create the directories and files required for layouts and their supporting components.

---

# 📁 Create Layout Directory

## Command

```bash
mkdir src/layouts
```

### Purpose

Creates the directory for reusable layouts.

---

# 📄 Create MainLayout

## Command

```bash
touch src/layouts/MainLayout.tsx
```

### Purpose

Creates the primary layout used across the application.

The MainLayout is responsible for rendering:

- Navbar
- Category Strip
- Main Content
- Footer

---

# 📁 Create Navbar Component

## Command

```bash
mkdir src/shared/components/Navbar
```

```bash
touch src/shared/components/Navbar/Navbar.tsx
```

### Purpose

Creates the application's primary navigation bar.

---

# 📁 Create Footer Component

## Command

```bash
mkdir src/shared/components/Footer
```

```bash
touch src/shared/components/Footer/Footer.tsx
```

### Purpose

Creates the application's footer.

---

# 📁 Create Logo Component

## Command

```bash
mkdir src/shared/components/Logo
```

```bash
touch src/shared/components/Logo/Logo.tsx
```

### Purpose

Creates the reusable CartWise logo component.

---

# 📁 Create SearchBar Component

## Command

```bash
mkdir src/shared/components/SearchBar
```

```bash
touch src/shared/components/SearchBar/SearchBar.tsx
```

### Purpose

Creates the reusable search bar displayed inside the Navbar.

---

# 📁 Create NavActions Component

## Command

```bash
mkdir src/shared/components/NavActions
```

```bash
touch src/shared/components/NavActions/NavActions.tsx
```

### Purpose

Creates the navigation actions section.

Examples:

- Wishlist
- Notifications
- User Profile

---

# 📁 Create CategoryStrip Component

## Command

```bash
mkdir src/shared/components/CategoryStrip
```

```bash
touch src/shared/components/CategoryStrip/CategoryStrip.tsx
```

### Purpose

Creates the horizontal category navigation below the Navbar.

---

# ▶️ Start Development Server

## Command

```bash
npm run dev
```

### Purpose

Starts the Vite development server.

Open:

```text
http://localhost:5173
```

---

# 🏗️ Build Production Version

## Command

```bash
npm run build
```

### Purpose

Builds the production-ready version of CartWise.

---

# 👀 Preview Production Build

## Command

```bash
npm run preview
```

### Purpose

Runs the production build locally before deployment.

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

# 📂 Expected Folder Structure

```text
src/
├── layouts/
│   └── MainLayout.tsx
│
└── shared/
    └── components/
        ├── Navbar/
        │   └── Navbar.tsx
        ├── Footer/
        │   └── Footer.tsx
        ├── Logo/
        │   └── Logo.tsx
        ├── SearchBar/
        │   └── SearchBar.tsx
        ├── NavActions/
        │   └── NavActions.tsx
        └── CategoryStrip/
            └── CategoryStrip.tsx
```

---

# 🚨 Common Errors

## Layout Not Rendering

### Cause

The page is not wrapped with `MainLayout`.

### Solution

Verify that the page is rendered through the layout inside your routing configuration.

---

## Navbar Appears on Some Pages Only

### Cause

Navbar has been added directly inside individual pages.

### Solution

Move the Navbar into `MainLayout`.

---

## Footer Missing

### Cause

Footer component is not included inside the layout.

### Solution

Import and render the Footer within `MainLayout`.

---

## Search Bar Not Working

### Cause

The SearchBar component is not connected or imported correctly.

### Solution

Verify the component import and ensure it is rendered inside the Navbar.

---

## Duplicate Layout Code

### Cause

Navbar and Footer have been copied into multiple pages.

### Solution

Keep all shared layout elements inside `MainLayout` and render page-specific content using routing.

---

# 📌 Best Practices

- Keep only shared UI inside layouts.
- Never duplicate Navbar or Footer across pages.
- Make layout components reusable.
- Keep page-specific logic outside the layout.
- Use descriptive component names.
- Build layouts before creating feature pages.

---

# 📝 Commands Summary

| Command | Purpose |
|----------|---------|
| `mkdir src/layouts` | Create layouts directory |
| `touch src/layouts/MainLayout.tsx` | Create MainLayout |
| `mkdir src/shared/components/Navbar` | Create Navbar folder |
| `mkdir src/shared/components/Footer` | Create Footer folder |
| `mkdir src/shared/components/Logo` | Create Logo folder |
| `mkdir src/shared/components/SearchBar` | Create SearchBar folder |
| `mkdir src/shared/components/NavActions` | Create NavActions folder |
| `mkdir src/shared/components/CategoryStrip` | Create CategoryStrip folder |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |

---

# ✅ Summary

This chapter establishes the structural foundation of the CartWise user interface. By creating reusable layout components such as **MainLayout**, **Navbar**, **Footer**, **SearchBar**, **Logo**, **NavActions**, and **CategoryStrip**, every page can share a consistent structure while keeping the codebase modular, maintainable, and ready for future expansion.
