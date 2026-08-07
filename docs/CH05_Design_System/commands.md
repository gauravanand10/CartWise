# 💻 CH05 — Commands

> **Chapter:** Design System

This chapter covers the commands and files used while setting up and maintaining the CartWise Design System.

---

# 📦 Install Tailwind CSS

## Command

```bash
npm install tailwindcss @tailwindcss/vite
```

### Purpose

Installs Tailwind CSS along with its Vite plugin.

This forms the foundation of the CartWise Design System.

---

# 📦 Verify Tailwind Installation

## Command

```bash
npm list tailwindcss
```

### Purpose

Checks whether Tailwind CSS has been installed correctly.

Example Output

```text
cartwise
└── tailwindcss@4.x.x
```

---

# 📄 Configure Vite Plugin

Inside:

```text
vite.config.ts
```

Import the Tailwind plugin.

```ts
import tailwindcss from "@tailwindcss/vite";
```

Register the plugin.

```ts
plugins: [
    react(),
    tailwindcss(),
]
```

### Purpose

Allows Vite to process Tailwind CSS during development and production builds.

---

# 📄 Import Tailwind

Inside:

```text
src/index.css
```

Add

```css
@import "tailwindcss";
```

### Purpose

Loads the Tailwind CSS framework into the project.

---

# ▶️ Start Development Server

## Command

```bash
npm run dev
```

### Purpose

Starts the local development server.

Open

```text
http://localhost:5173
```

to view the application.

---

# 🏗️ Production Build

## Command

```bash
npm run build
```

### Purpose

Generates an optimized production build.

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

Sometimes configuration changes require restarting Vite.

Stop the server.

```text
Ctrl + C
```

Restart.

```bash
npm run dev
```

---

# 📂 Design System Files

The Design System primarily lives inside:

```text
src/
├── index.css
├── constants/
├── assets/
└── shared/
```

These files define:

- Color Palette
- Typography
- Shadows
- Gradients
- Radius
- Utility Classes
- Animation Constants

---

# 🚨 Common Errors

---

## Tailwind Classes Not Working

### Possible Causes

- Tailwind not installed
- Missing Tailwind import
- Development server not restarted

### Solution

Verify installation.

```bash
npm list tailwindcss
```

Restart the server.

```bash
npm run dev
```

---

## Styles Not Updating

### Cause

The development server cached previous styles.

### Solution

Restart Vite.

```text
Ctrl + C
```

```bash
npm run dev
```

---

## Unknown Utility Class

### Cause

The class name is incorrect.

### Solution

Verify the spelling using the Tailwind documentation.

---

# 📌 Best Practices

- Keep design tokens centralized.
- Avoid inline styles.
- Reuse utility classes consistently.
- Maintain one color palette throughout the application.
- Use consistent spacing values.
- Keep animations subtle and purposeful.
- Avoid creating duplicate styles.

---

# 📝 Commands Summary

| Command | Purpose |
|----------|---------|
| `npm install tailwindcss @tailwindcss/vite` | Install Tailwind CSS |
| `npm list tailwindcss` | Verify Tailwind installation |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `Ctrl + C` | Stop development server |

---

# ✅ Summary

The CartWise Design System is built on **Tailwind CSS v4** and configured through **Vite**. While this chapter introduces only a few commands, these commands establish the styling foundation that every component and page will follow throughout the application. The remaining work in this chapter focuses on defining consistent design rules rather than executing additional terminal commands.
