# 💻 CH04 — Commands

> **Chapter:** Routing & Navigation

This chapter covers the commands and files required to implement routing in the CartWise application using **React Router**.

---

# 📦 Install React Router

## Command

```bash
npm install react-router-dom
```

### Purpose

Installs the React Router library.

This package enables:

- Client-side Routing
- Nested Routing
- Dynamic Routing
- Navigation
- Layout Routing

---

# 📋 Verify Installation

## Command

```bash
npm list react-router-dom
```

### Purpose

Checks whether React Router has been installed successfully.

Example Output

```text
cartwise
└── react-router-dom@7.x.x
```

---

# 📁 Create Routing Folder

## Command

```bash
mkdir src/routes
```

### Purpose

Stores routing-related configuration.

---

# 📄 Create AppRoutes File

## Command

```bash
touch src/routes/AppRoutes.tsx
```

### Purpose

Centralizes all application routes.

---

# 📁 Create Layout Directory

## Command

```bash
mkdir src/layouts
```

### Purpose

Stores reusable layouts shared across multiple pages.

---

# 📄 Create MainLayout

## Command

```bash
touch src/layouts/MainLayout.tsx
```

### Purpose

Creates the main application layout.

This layout contains:

- Navbar
- Footer
- Outlet

---

# 📁 Create Pages Directory

## Command

```bash
mkdir src/pages
```

### Purpose

Stores page-level components.

---

# 📄 Create Homepage

## Command

```bash
touch src/pages/HomePage.tsx
```

### Purpose

Creates the application's homepage.

---

# 📄 Create Search Page

## Command

```bash
touch src/pages/SearchPage.tsx
```

### Purpose

Creates the Search page.

---

# 📄 Create Wishlist Page

## Command

```bash
touch src/pages/WishlistPage.tsx
```

### Purpose

Creates the Wishlist page.

---

# 📄 Create Compare Page

## Command

```bash
touch src/pages/ComparePage.tsx
```

### Purpose

Creates the Product Comparison page.

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

# 🔄 Restart Development Server

Sometimes React Router changes require restarting Vite.

Stop the server:

```text
Ctrl + C
```

Restart it:

```bash
npm run dev
```

---

# 🔍 Check Installed Packages

## Command

```bash
npm list
```

### Purpose

Displays all installed project dependencies.

---

# 🚨 Common Errors

---

## Cannot find module 'react-router-dom'

### Cause

Package not installed.

### Solution

```bash
npm install react-router-dom
```

---

## Page Shows Blank Screen

### Cause

Most common reasons:

- Missing BrowserRouter
- Incorrect Route
- Missing Outlet
- Wrong import

---

## Route Not Found

### Cause

The requested URL has no matching Route.

### Solution

Verify:

- Route path
- Route component
- Navigation link

---

## Outlet Doesn't Render

### Cause

Outlet is missing from MainLayout.

### Solution

Ensure MainLayout contains:

```tsx
<Outlet />
```

---

# 📌 Best Practices

- Keep all routes inside a centralized routing file.
- Use nested routing for shared layouts.
- Keep page components inside the `pages` folder.
- Avoid duplicate route definitions.
- Use meaningful route names.
- Prefer layout-based routing over repeating UI.

---

# 📝 Commands Summary

| Command | Purpose |
|----------|---------|
| `npm install react-router-dom` | Install React Router |
| `npm list react-router-dom` | Verify installation |
| `mkdir src/routes` | Create routing folder |
| `touch src/routes/AppRoutes.tsx` | Create routing configuration |
| `mkdir src/layouts` | Create layouts directory |
| `touch src/layouts/MainLayout.tsx` | Create Main Layout |
| `mkdir src/pages` | Create pages directory |
| `touch src/pages/HomePage.tsx` | Create Home page |
| `touch src/pages/SearchPage.tsx` | Create Search page |
| `touch src/pages/WishlistPage.tsx` | Create Wishlist page |
| `touch src/pages/ComparePage.tsx` | Create Compare page |
| `npm run dev` | Start development server |
| `Ctrl + C` | Stop development server |
| `npm list` | Display installed packages |

---

# ✅ Summary

By the end of this chapter, CartWise has a complete routing foundation. React Router is installed, the routing structure is organized, layouts are prepared, and the project is ready to support seamless navigation as more pages and features are introduced.
