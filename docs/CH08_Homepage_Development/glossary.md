# 📖 CH08 — Glossary

> This glossary explains the homepage terminology and UI sections implemented in the CartWise Homepage.

---

# 🏠 Homepage

The Homepage is the first screen users see after opening CartWise.

It introduces the platform, highlights important products, and guides users toward discovering and comparing items.

### CartWise Context

The Homepage is composed of multiple reusable sections built using the shared component library and layout architecture.

---

# 🎯 Hero Section

The Hero Section is the most prominent area at the top of the Homepage.

It immediately communicates the purpose of the application and encourages users to start searching.

### CartWise Context

The Hero Section includes:

- Hero Banner
- Search Box
- Statistics
- Categories
- Floating Products
- Trending Searches

---

# 🖼️ Hero Banner

The Hero Banner is the primary visual element displayed inside the Hero Section.

It introduces CartWise with branding, messaging, and call-to-action content.

---

# 🔍 Hero Search

Hero Search is the main search input displayed inside the Hero Section.

It encourages users to begin searching for products immediately after landing on the Homepage.

Backend-powered search functionality will be introduced in a future chapter.

---

# 📊 Hero Stats

Hero Stats display quick statistics that build user confidence.

Examples include:

- Products Compared
- Supported Stores
- Happy Users
- AI Recommendations

These values currently use placeholder data.

---

# 🗂️ Hero Categories

Hero Categories provide quick access to popular shopping categories.

Examples:

- Mobiles
- Laptops
- Electronics
- Fashion
- Home Appliances

They improve product discoverability.

---

# 📦 Floating Products

Floating Products are decorative product cards displayed around the Hero Section.

They create depth, movement, and visual interest while showcasing the design language of CartWise.

---

# 🔥 Trending Searches

Trending Searches highlight commonly searched products.

Examples:

- iPhone
- MacBook
- Gaming Laptop
- Smart Watch

This section helps users begin exploring without typing.

---

# 🎁 Offer Card

Offer Cards highlight featured promotions or special deals.

They attract user attention and increase engagement with important content.

---

# ⚡ Flash Deals

Flash Deals display products currently available at discounted prices.

They encourage users to explore time-sensitive offers.

---

# 🤖 AI Picks

AI Picks showcase products that would eventually be recommended by AI.

### CartWise Context

Currently, this section displays placeholder recommendations until AI integration is implemented.

---

# 📈 Trending Products

Trending Products display popular products receiving high user interest.

This section helps users discover products that are currently in demand.

---

# 🏢 Brand Collections

Brand Collections group products by manufacturer.

Examples:

- Apple
- Samsung
- Sony
- Dell

This improves browsing by brand.

---

# 🕒 Recently Viewed

Recently Viewed displays products the user has explored earlier.

### CartWise Context

Currently uses placeholder frontend data.

Persistent storage will be introduced later.

---

# ⭐ Recommended Products

Recommended Products present suggested items to the user.

At present, recommendations are static.

Future chapters will replace these with personalized AI recommendations.

---

# 💸 Price Drops

Price Drops highlight products whose prices have recently decreased.

This section helps users identify better purchasing opportunities.

---

# 🛍️ Product Card

A Product Card is the primary reusable component used to display product information.

Typical information includes:

- Product Image
- Product Name
- Price
- Rating
- Store
- Badges

Multiple homepage sections reuse the same Product Card component.

---

# 🧱 Product Grid

A Product Grid arranges multiple Product Cards in a structured layout.

Grids provide consistency while displaying large numbers of products.

---

# 🤖 AI Score

The AI Score represents an intelligent evaluation of a product.

### CartWise Context

The UI has already been prepared, but actual AI-generated scores will be introduced in a future chapter.

---

# 🏷️ Product Badge

A Product Badge highlights important product information.

Examples:

- Best Seller
- New Arrival
- Trending
- Limited Offer

Badges improve visual scanning.

---

# 🖼️ Placeholder Image

A Placeholder Image is a temporary image displayed until real product images become available.

### CartWise Context

The Homepage intentionally uses placeholder product images.

Future backend APIs will provide actual product images.

---

# 📌 Summary

The Homepage brings together every major concept introduced in previous chapters. By combining reusable components, the design system, and layout architecture, CartWise delivers a modern landing page that is scalable, visually consistent, and ready for future backend and AI integration.
