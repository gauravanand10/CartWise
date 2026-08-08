# 📖 CH11 — Glossary

> This glossary explains the important terms, concepts, and technologies introduced while building the **Product Details** experience in CartWise.

---

# 📦 Product Details

The Product Details page provides complete information about a selected product.

It brings together:

- Product information
- Images
- Pricing
- Store offers
- Specifications
- AI insights
- Reviews
- Related products

---

# 🔗 Dynamic Route

A Dynamic Route allows the application to display different content based on a value in the URL.

Example:

```text
/product/iphone-16-pro
/product/galaxy-s25-ultra
/product/sony-wh-1000xm6
```

The product slug identifies which product should be displayed.

---

# 🏷️ Product Slug

A slug is a URL-friendly identifier for a product.

Example:

```text
iPhone 16 Pro
```

becomes:

```text
iphone-16-pro
```

Slugs make product URLs readable and shareable.

---

# 🧭 Product Routing

Product Routing connects a product card to its corresponding Product Details page.

The flow is:

```text
Product Card
     ↓
Product Slug
     ↓
Product Route
     ↓
Product Details
```

---

# 🖼️ Product Gallery

The Product Gallery displays multiple images of a product.

It includes:

- Main image
- Thumbnails
- Previous button
- Next button
- Image selection
- Zoom interaction

---

# 🔍 Image Zoom

Image Zoom allows users to inspect product images more closely.

This is particularly useful for:

- Product materials
- Camera modules
- Ports
- Design details

---

# 🏷️ Product Hero

The Product Hero is the primary section at the top of the Product Details page.

It presents the most important product information immediately.

Examples include:

- Product name
- Brand
- Rating
- AI score
- Availability
- Price
- Product badges

---

# 💰 Pricing Card

The Pricing Card presents the primary purchasing information.

It can contain:

- Current price
- Original price
- Discount
- Savings
- EMI information
- Delivery information

---

# 🏪 Store Comparison

Store Comparison allows users to compare the same product across different retailers.

CartWise can display:

- Store name
- Price
- Delivery
- Availability
- Price difference

This supports the core CartWise goal of helping users **compare better and buy smarter**.

---

# 🛒 Store Offer

A Store Offer represents one retailer's offer for a product.

Example:

```text
Amazon
₹129,999
In Stock
Free Delivery
```

Multiple Store Offers can be displayed together.

---

# 📊 Specification

A Specification describes a technical property of a product.

Examples:

```text
Display → 6.3 inch
RAM → 8 GB
Storage → 256 GB
Battery → 4685 mAh
```

---

# 📚 Specification Group

Related specifications are grouped into logical categories.

Examples:

- Display
- Processor
- Memory
- Camera
- Battery
- Connectivity

Grouping makes large specification sets easier to understand.

---

# 📖 Product Description

The Product Description provides additional information about the product.

It can contain:

- Overview
- Highlights
- Features
- What's in the Box

---

# 🤖 AI Insights

AI Insights summarize product information into decision-oriented recommendations.

CartWise displays information such as:

- AI Score
- Summary
- Pros
- Cons
- Best For
- Who Should Buy
- Who Should Avoid

The current implementation uses mock/static data.

Actual AI integration belongs to a later chapter.

---

# ⭐ Rating

A Rating represents the average user evaluation of a product.

For example:

```text
4.7 / 5
```

Ratings help users quickly understand general customer satisfaction.

---

# 📊 Rating Distribution

Rating Distribution shows how reviews are distributed across rating levels.

Example:

```text
5 ★ █████████████
4 ★ ███████
3 ★ ███
2 ★
1 ★
```

This gives more context than displaying only the average rating.

---

# 📝 Review

A Review is feedback submitted by a customer about a product.

Reviews can include:

- Rating
- Review text
- Reviewer
- Date
- Helpful count

---

# ✅ Verified Purchase

A Verified Purchase badge indicates that the review is associated with a verified purchase.

It helps users distinguish verified customer feedback.

---

# 👍 Helpful Count

The Helpful Count indicates how many users found a review useful.

Example:

```text
👍 Helpful · 124
```

---

# 🔗 Related Products

Related Products are products that are relevant to the currently viewed product.

They can include:

- Similar products
- Frequently compared products
- Recommended products

---

# 🧩 Product Section

A Product Section is a reusable structural component used to organize different areas of the Product Details page.

Examples:

- AI Insights
- Specifications
- Reviews
- Related Products

Reusable sections maintain consistent spacing and layout.

---

# ❤️ Wishlist Action

The Wishlist Action represents the user's ability to save a product for later.

The Product Details page exposes this action, while the complete Wishlist workflow is handled in a later chapter.

---

# ⚖️ Compare Action

The Compare Action allows users to add a product to the comparison workflow.

The full comparison experience is implemented in a later chapter.

---

# 📤 Share Action

The Share Action allows users to share a product.

Depending on the platform, this can use:

- Native sharing
- Clipboard copying
- Shareable product URL

---

# ⏳ Loading Skeleton

A Loading Skeleton is placeholder content displayed while product information is loading.

Instead of showing a blank page, the interface presents the expected structure while data becomes available.

---

# ⚠️ Error State

An Error State is displayed when the Product Details data cannot be loaded successfully.

It provides feedback instead of leaving the user with a broken interface.

---

# ❌ Product Not Found

The Product Not Found state appears when the requested product slug does not correspond to an available product.

Example:

```text
/product/abcd
```

The page provides:

- Explanation
- Search Products action
- Homepage action
- Popular product recommendations

---

# 🗂️ Product Catalogue

The Product Catalogue contains the available product records used by the Product Details system.

Each product can contain information such as:

- Identity
- Slug
- Brand
- Category
- Images
- Pricing
- Specifications

---

# 🧱 Product Data Model

The Product Data Model defines the structure of product information used by the application.

Separating product data from UI components makes the Product Details system easier to maintain and extend.

---

# 🔄 Product Service

The Product Service is responsible for retrieving product information.

The current implementation uses local mock data.

Later, the same service layer can communicate with backend APIs.

---

# 🪝 useProduct

`useProduct` is a custom hook used to manage Product Details data and state.

It separates product retrieval logic from presentation components.

---

# 🖼️ useGallery

`useGallery` is a custom hook responsible for Product Gallery behavior.

It can manage:

- Current image
- Thumbnail selection
- Previous image
- Next image
- Gallery state

---

# 🧮 Pricing Utility

Pricing utilities contain reusable logic related to product pricing.

Examples include:

- Discount calculation
- Savings calculation
- Price formatting
- Store price comparison

---

# 💱 Currency Utility

The currency utility provides consistent formatting for monetary values.

CartWise primarily displays prices in Indian Rupees:

```text
₹
```

---

# 📱 Responsive Product Details

Responsive Product Details means the entire Product Details experience adapts to different screen sizes.

The page must remain usable on:

- Mobile
- Tablet
- Laptop
- Desktop
- Ultra-wide displays

---

# ♿ Accessibility

Accessibility ensures that Product Details can be used by as many users as possible.

Important areas include:

- Keyboard navigation
- Focus states
- Button labels
- Image alt text
- Semantic structure

---

# 🧩 Feature-first Architecture

The Product Details implementation follows the Feature-first Architecture used throughout CartWise.

Product-specific components, data, hooks, utilities, and types remain grouped inside the Product feature.

This keeps the codebase modular and scalable.

---

# 🔌 Backend-ready Architecture

The Product Details page currently uses mock data.

However, product retrieval is separated from UI components so that a future backend API can replace the mock data without requiring a complete UI rewrite.

---

# 📌 Summary

The Product Details system transforms a search result into a complete product evaluation experience.

It combines dynamic routing, product galleries, pricing, store comparison, specifications, AI insights, reviews, and related products while maintaining the reusable and responsive architecture established in earlier CartWise chapters.
