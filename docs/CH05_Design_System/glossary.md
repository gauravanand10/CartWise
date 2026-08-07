# 📖 CH05 — Glossary

> This glossary explains the design terminology used throughout the **CartWise Design System**.

---

# 🎨 Design System

A Design System is a collection of reusable design rules, styles, and components that ensure every part of an application looks and behaves consistently.

Instead of designing every page independently, developers and designers follow one shared system.

### CartWise Context

CartWise uses a centralized Design System built with **Tailwind CSS v4**.

It defines:

- Colors
- Typography
- Spacing
- Shadows
- Border Radius
- Gradients
- Animations
- Utility Classes

---

# 🌈 Color Palette

A Color Palette is the predefined collection of colors used throughout an application.

Using a fixed palette creates visual consistency and strengthens brand identity.

### CartWise Context

Every page uses the same primary, secondary, accent, success, warning, and error colors.

---

# 🎭 Theme

A Theme defines the overall visual appearance of an application.

Examples:

- Light Theme
- Dark Theme

### CartWise Context

The design system is built to support future theme expansion.

---

# ✍️ Typography

Typography refers to how text is presented.

It includes:

- Font Family
- Font Size
- Font Weight
- Line Height
- Letter Spacing

Good typography improves readability and accessibility.

---

# 📏 Spacing

Spacing is the distance between UI elements.

Examples:

- Padding
- Margin
- Gap

Consistent spacing creates cleaner interfaces and improves readability.

---

# 🔲 Border Radius

Border Radius controls how rounded an element appears.

Examples:

- Buttons
- Cards
- Inputs
- Images

Using consistent border radius creates a unified visual style.

---

# 🌫️ Shadow

Shadows create the illusion of depth.

They help distinguish elements from the background.

Examples:

- Cards
- Buttons
- Modals
- Dropdowns

---

# ✨ Gradient

A Gradient smoothly blends two or more colors.

Gradients are commonly used in:

- Hero Sections
- Buttons
- Cards
- Backgrounds

They add visual depth and emphasis.

---

# 🎬 Animation

Animations provide visual feedback and improve user experience.

Examples:

- Hover Effects
- Fade In
- Scale
- Slide
- Loading Animations

Animations should enhance usability without becoming distracting.

---

# ⚡ Transition

A Transition controls how smoothly one visual state changes into another.

Examples:

- Hover
- Focus
- Active

Smooth transitions make interactions feel more natural.

---

# 🧩 Utility Class

A Utility Class is a small CSS class that performs one styling task.

Example:

```html
flex
```

```html
rounded-xl
```

```html
shadow-lg
```

CartWise uses utility classes extensively through Tailwind CSS.

---

# 🪟 Glassmorphism

Glassmorphism is a modern UI design style that uses:

- Blur
- Transparency
- Soft Borders
- Light Shadows

to create a frosted-glass appearance.

### CartWise Context

Glass effects are used in selected interface elements to create a premium look.

---

# 📱 Responsive Design

Responsive Design ensures the interface adapts to different screen sizes.

Examples:

- Mobile
- Tablet
- Laptop
- Desktop

The detailed implementation of responsiveness is covered in a later chapter.

---

# 🖱️ Hover State

The visual appearance of an element when a user's cursor moves over it.

Hover states improve interactivity by providing immediate feedback.

---

# 🎯 Design Token

Design Tokens are reusable design values stored in one central location.

Examples:

- Primary Color
- Border Radius
- Shadow
- Font Size
- Animation Duration

Changing one token updates the entire application consistently.

---

# 🎨 Consistency

Consistency means similar elements should always look and behave the same.

For example:

- Every primary button should share the same colors.
- Every card should have the same border radius.
- Every input should follow the same spacing.

Consistency improves usability and creates a professional user experience.

---

# 📌 Summary

The CartWise Design System establishes a shared visual language for the application. By standardizing colors, typography, spacing, animations, and reusable styling principles, the interface remains consistent, maintainable, and scalable as new features are developed.
