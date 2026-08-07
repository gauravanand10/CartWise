# 💻 CH09 — Commands

> **Chapter:** Responsive Design

This chapter focuses on making the existing CartWise frontend fully responsive across different devices. Unlike previous chapters, no new features are introduced. Instead, existing components are enhanced using Tailwind CSS responsive utilities and layout improvements.

---

# ▶️ Start Development Server

## Command

```bash
npm run dev
```

### Purpose

Starts the local development server.

Open:

```text
http://localhost:5173
```

to verify responsiveness during development.

---

# 🏗️ Build Production Version

## Command

```bash
npm run build
```

### Purpose

Creates an optimized production build.

This ensures all responsive changes compile successfully.

---

# ✅ TypeScript Verification

## Command

```bash
npx tsc --noEmit
```

### Purpose

Checks the project for TypeScript errors without generating build files.

### CartWise Result

```text
0 Errors
```

---

# ✅ ESLint Verification

## Command

```bash
npx eslint src
```

### Purpose

Analyzes the source code for linting issues and coding standard violations.

### CartWise Result

```text
0 Errors
```

---

# 👀 Preview Production Build

## Command

```bash
npm run preview
```

### Purpose

Runs the production build locally before deployment.

This allows final responsive verification using the optimized build.

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

### Purpose

Refreshes Vite after making responsive layout or configuration changes.

---

# 🌐 Git Status

## Command

```bash
git status
```

### Purpose

Displays modified files before committing responsive improvements.

---

# ➕ Stage Responsive Changes

## Command

```bash
git add .
```

### Purpose

Stages all responsive design changes for commit.

---

# 📝 Commit Responsive Design

## Command

```bash
git commit -m "feat: complete responsive design across CartWise frontend"
```

### Purpose

Creates a Git commit containing all responsive design improvements.

---

# ☁️ Push to GitHub

## Command

```bash
git push origin main
```

### Purpose

Uploads the responsive design implementation to the remote repository.

---

# 📱 Responsive Utilities Used

Throughout this chapter, Tailwind CSS responsive modifiers are used extensively.

Examples:

```html
sm:
```

```html
md:
```

```html
lg:
```

```html
xl:
```

```html
2xl:
```

### Purpose

Apply different styles based on screen width without writing custom media queries.

---

# 📂 Files Updated

This chapter primarily modifies existing files rather than creating new ones.

Examples include:

```text
src/
├── components/
├── features/
├── pages/
└── index.css
```

Responsive improvements include:

- Layout adjustments
- Responsive typography
- Responsive spacing
- Grid improvements
- Mobile optimizations
- Overflow fixes
- Accessibility improvements

---

# 🚨 Common Errors

## Horizontal Overflow

### Cause

Using fixed widths larger than the viewport.

### Solution

Replace fixed widths with responsive width utilities such as:

```html
w-full
max-w-*
```

---

## Text Overflow

### Cause

Large font sizes on small screens.

### Solution

Use responsive typography.

Example:

```html
text-3xl md:text-5xl lg:text-6xl
```

---

## Grid Breaking on Mobile

### Cause

Too many columns on small devices.

### Solution

Use responsive grid layouts.

Example:

```html
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
xl:grid-cols-4
```

---

## Hidden Interactive Elements

### Cause

Hover-only interactions on touch devices.

### Solution

Ensure important controls remain visible on devices without hover support.

---

## Sticky Elements Overlapping

### Cause

Improper stacking order (`z-index`).

### Solution

Adjust layering to prevent components from covering navigation or page content.

---

# 📌 Best Practices

- Design mobile-first.
- Avoid fixed widths whenever possible.
- Use Tailwind responsive utilities.
- Test across multiple viewport sizes.
- Eliminate horizontal scrolling.
- Keep touch targets large enough for mobile users.
- Reuse existing components instead of creating separate mobile versions.
- Maintain the existing Design System.
- Keep responsiveness inside components whenever possible.

---

# 📝 Commands Summary

| Command | Purpose |
|----------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npx tsc --noEmit` | Verify TypeScript |
| `npx eslint src` | Verify ESLint |
| `git status` | View modified files |
| `git add .` | Stage responsive changes |
| `git commit -m "feat: complete responsive design across CartWise frontend"` | Commit changes |
| `git push origin main` | Push changes to GitHub |
| `Ctrl + C` | Stop development server |

---

# ✅ Summary

This chapter focused on improving the responsiveness of the existing CartWise application rather than introducing new functionality. Using Tailwind CSS responsive utilities, layout refinements, typography scaling, responsive grids, spacing adjustments, and accessibility improvements, the application now delivers a consistent experience across mobile phones, tablets, laptops, desktops, and large displays. All changes were validated using TypeScript, ESLint, and a successful production build before being committed and pushed to GitHub.
