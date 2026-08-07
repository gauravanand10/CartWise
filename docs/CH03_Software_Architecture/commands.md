# 💻 CH03 — Commands

> **Chapter:** Software Architecture

Unlike Project Initialization, this chapter is primarily about organizing the project into a scalable structure. Most of the work involves creating folders and files rather than installing new technologies.

---

# 📁 Create Feature Directories

The following commands can be used to create the initial project structure.

## Create Features Directory

```bash
mkdir src/features
```

### Purpose

Stores all business features of CartWise.

---

## Create Shared Directory

```bash
mkdir src/shared
```

### Purpose

Stores reusable components shared across multiple features.

---

## Create Pages Directory

```bash
mkdir src/pages
```

### Purpose

Stores application pages.

---

## Create Layouts Directory

```bash
mkdir src/layouts
```

### Purpose

Stores reusable page layouts.

---

## Create Hooks Directory

```bash
mkdir src/hooks
```

### Purpose

Stores reusable custom React hooks.

---

## Create Services Directory

```bash
mkdir src/services
```

### Purpose

Stores API calls and business logic.

> Currently reserved for future backend integration.

---

## Create Utils Directory

```bash
mkdir src/utils
```

### Purpose

Stores helper functions.

---

## Create Types Directory

```bash
mkdir src/types
```

### Purpose

Stores global TypeScript types and interfaces.

---

## Create Constants Directory

```bash
mkdir src/constants
```

### Purpose

Stores constant values such as routes, colors, and configuration values.

---

## Create Assets Directory

```bash
mkdir src/assets
```

### Purpose

Stores images, SVGs, fonts, and other static resources.

---

## Create Data Directory

```bash
mkdir src/data
```

### Purpose

Stores mock data until backend APIs are implemented.

---

# 📄 Create Initial Files

Example commands:

```bash
touch src/main.tsx
touch src/App.tsx
touch src/index.css
```

---

# 📂 Example Project Structure

```text
src/
├── assets/
├── components/
├── constants/
├── data/
├── features/
├── hooks/
├── layouts/
├── pages/
├── services/
├── types/
├── utils/
├── App.tsx
├── main.tsx
└── index.css
```

---

# 🔍 Verify Project Structure

Inside VS Code, verify that the folders are organized correctly.

A well-structured project should clearly separate:

- Features
- Shared Components
- Layouts
- Hooks
- Services
- Utilities
- Types

---

# 🚨 Common Mistakes

## Mixing Everything Inside One Folder

❌ Bad

```text
src/
├── Button.tsx
├── Navbar.tsx
├── ProductCard.tsx
├── Search.tsx
├── Wishlist.tsx
├── Home.tsx
```

This becomes difficult to manage as the project grows.

---

## Creating Deeply Nested Folders

Avoid excessive nesting such as:

```text
components/
└── ui/
    └── common/
        └── reusable/
            └── buttons/
```

Keep the structure simple and intuitive.

---

## Mixing Business Logic with UI

Business logic should remain inside services or hooks, not inside UI components.

---

# 📌 Best Practices

- Group related files together.
- Keep folder names meaningful.
- Avoid unnecessary nesting.
- Prefer reusable components.
- Separate UI from business logic.
- Plan folder structure before adding features.

---

# 📝 Commands Summary

| Command | Purpose |
|----------|---------|
| `mkdir src/features` | Create features directory |
| `mkdir src/shared` | Create shared directory |
| `mkdir src/pages` | Create pages directory |
| `mkdir src/layouts` | Create layouts directory |
| `mkdir src/hooks` | Create hooks directory |
| `mkdir src/services` | Create services directory |
| `mkdir src/utils` | Create utilities directory |
| `mkdir src/types` | Create types directory |
| `mkdir src/constants` | Create constants directory |
| `mkdir src/assets` | Create assets directory |
| `mkdir src/data` | Create mock data directory |
| `touch <filename>` | Create new files |

---

# ✅ Summary

This chapter introduced the folder and file organization used by CartWise. While only a few terminal commands are required, the architectural decisions made here establish the structure that every future feature will follow.
