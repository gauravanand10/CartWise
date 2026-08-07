# 📖 CH07 — Glossary

> This glossary explains the layout architecture concepts used throughout the CartWise application.

---

# 🏗️ Layout

A Layout is the overall structure of a webpage.

Instead of creating the same page structure repeatedly, a layout provides a reusable skeleton that every page can follow.

### CartWise Context

The primary layout includes:

- Navbar
- Category Strip
- Main Content
- Footer

---

# 🏠 MainLayout

The MainLayout is the root layout used by most pages in CartWise.

It ensures every page shares a consistent structure while allowing the main content to change.

---

# 🧭 Navbar

The Navbar is the primary navigation bar displayed at the top of the application.

It provides quick access to important sections and remains consistent throughout the application.

### CartWise Context

The Navbar includes:

- Logo
- Search Bar
- Navigation Actions

---

# 🏷️ Logo

The Logo represents the identity of the application.

It is usually placed inside the Navbar and provides quick navigation back to the homepage.

### CartWise Context

The CartWise logo reinforces the project's branding and improves recognition.

---

# 🔍 Search Bar

The Search Bar allows users to quickly search for products.

### CartWise Context

Although backend search functionality is introduced later, the Search Bar is already part of the layout architecture.

---

# 🎛️ NavActions

NavActions are the interactive controls displayed inside the Navbar.

Examples include:

- Wishlist
- Profile
- Notifications
- Theme Toggle

### CartWise Context

Current actions focus on frontend navigation, with additional actions planned for future chapters.

---

# 📂 Category Strip

The Category Strip displays popular shopping categories for quick navigation.

Examples:

- Mobiles
- Laptops
- Electronics
- Fashion
- Home Appliances

It improves discoverability and user navigation.

---

# 📄 Main Content

The Main Content Area is the section where page-specific content is rendered.

Examples:

- Homepage
- Search Results
- Product Details
- Wishlist

Only this section changes while the rest of the layout remains consistent.

---

# 🦶 Footer

The Footer appears at the bottom of every page.

It typically contains:

- Copyright
- Links
- Policies
- Contact Information

The Footer provides consistency across the application.

---

# 📱 Responsive Layout

A Responsive Layout automatically adapts to different screen sizes.

Examples:

- Mobile
- Tablet
- Laptop
- Desktop

CartWise layouts are designed with responsiveness in mind.

---

# 🧭 Navigation Flow

Navigation Flow describes how users move between different sections of the application.

A clear navigation flow improves usability and reduces user confusion.

---

# 🔄 Persistent UI

Persistent UI refers to interface elements that remain visible while users navigate between pages.

Examples:

- Navbar
- Footer

Persistent UI improves familiarity and creates a seamless browsing experience.

---

# 📦 Layout Component

A Layout Component is a reusable React component responsible for arranging page structure.

Instead of duplicating navigation and footer code across pages, they are encapsulated inside a single layout component.

---

# 🎯 User Experience (UX)

User Experience (UX) refers to how users feel while interacting with an application.

A well-designed layout contributes significantly to a positive user experience by making navigation intuitive and consistent.

---

# 📌 Summary

The Layout Architecture of CartWise establishes a consistent structure for every page in the application. By centralizing elements such as the Navbar, Footer, Search Bar, and Category Strip, the project achieves better maintainability, improved navigation, and a more professional user experience.
