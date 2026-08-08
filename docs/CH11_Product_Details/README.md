# 🛍️ CH11 — Product Details

> **Project:** CartWise  
> **Chapter:** Product Details

---

# 👋 Welcome

A user has searched for a product.

They found it.

But now comes the important question:

> **"Is this actually the product I should buy?"**

A search result can show a product name and price, but that's rarely enough to make a confident purchasing decision.

Users want to see:

- 🖼️ Product images
- 💰 Price
- 🏪 Store offers
- 📊 Specifications
- ⭐ Ratings
- 📝 Reviews
- 🤖 AI insights
- 🔗 Similar products

This is where the **Product Details** experience comes in.

Chapter 10 helped users **discover** products.

Chapter 11 helps users **understand** them.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- How dynamic product pages work.
- How product slugs are used in URLs.
- How Product Details are structured.
- How product data is separated from UI.
- How product galleries work.
- How store prices can be compared.
- How specifications are organized.
- How reviews and ratings are displayed.
- How AI insights can assist purchasing decisions.
- How loading, error, and not-found states are handled.
- How Product Details connects with Search and future Compare/Wishlist features.

---

# 🔄 The User Journey

The CartWise shopping journey is now becoming:

```text
🏠 Homepage
      │
      ▼
🔍 Search
      │
      ▼
📦 Search Results
      │
      ▼
🛍️ Product Details
      │
      ├──────────────┐
      ▼              ▼
⚖️ Compare       ❤️ Wishlist
```

The Product Details page is therefore the bridge between **product discovery** and **purchase decision-making**.

---

# 🔗 Dynamic Product Routing

Every product has a unique URL.

Example:

```text
/product/iphone-16-pro
```

Another product:

```text
/product/galaxy-s25-ultra
```

Another:

```text
/product/sony-wh-1000xm6
```

The route structure is:

```text
/product/:slug
```

The application extracts the slug and loads the corresponding product.

---

# 🏷️ Product Slugs

Instead of using an unreadable ID:

```text
/product/839201
```

CartWise uses a readable slug:

```text
/product/iphone-16-pro
```

This makes product URLs:

- Easier to understand
- Easier to share
- Easier to bookmark
- More user-friendly

---

# 🖼️ Product Gallery

The Product Gallery is one of the first elements users interact with.

It provides:

- Main product image
- Thumbnail images
- Previous button
- Next button
- Image switching
- Zoom interaction

A product can therefore be explored visually before the user reads its technical information.

---

# 🏷️ Product Hero

The Product Hero presents the most important product information immediately.

It includes:

- Product name
- Brand
- Category
- Rating
- AI Score
- Availability
- Product badges
- Pricing information

The user should be able to understand the basic product identity without scrolling through the entire page.

---

# 💰 Pricing

The pricing section communicates the most important purchasing information.

It can display:

```text
Current Price
Original Price
Discount
Savings
EMI
Delivery
```

For example:

```text
₹129,999
₹139,999
7% OFF
Save ₹10,000
```

This makes the value proposition immediately visible.

---

# 🏪 Store Comparison

One of CartWise's core goals is helping users compare prices.

The Product Details page therefore displays offers from multiple stores.

Example:

```text
Amazon             ₹129,999
Flipkart           ₹131,499
Croma              ₹132,000
Reliance Digital   ₹133,499
Vijay Sales        ₹134,000
```

Users can compare:

- Price
- Delivery
- Availability
- Store

The cheapest available offer can be highlighted to make the decision easier.

---

# 📊 Product Specifications

Products contain many technical specifications.

Displaying everything as one large block would make the page difficult to scan.

CartWise groups specifications into logical sections.

Example:

```text
Display
├── Size
├── Resolution
└── Refresh Rate

Processor
├── Chip
├── CPU
└── GPU

Memory
├── RAM
└── Storage

Camera
├── Main Camera
├── Ultra-wide
└── Front Camera
```

This makes technical information easier to navigate.

---

# 📖 Product Description

The Product Description provides additional context about the product.

It can contain:

- Overview
- Highlights
- Features
- What's in the Box

This complements the structured specifications with more human-readable information.

---

# 🤖 AI Insights

CartWise also introduces an AI-oriented decision section.

The current implementation uses mock/static data.

It provides:

### AI Score

A simplified score representing the overall recommendation.

### Summary

A concise explanation of the product.

### Pros

Important advantages.

### Cons

Important limitations.

### Best For

The type of user or use case the product suits.

### Who Should Buy

Users who are likely to benefit from the product.

### Who Should Avoid

Users for whom another product may be more suitable.

Actual AI API integration belongs to a later chapter.

---

# ⭐ Ratings & Reviews

Users need social proof before purchasing.

CartWise displays:

- Overall rating
- Rating distribution
- Reviews
- Verified Purchase badges
- Helpful counts

A rating distribution provides more information than an average score alone.

For example:

```text
5 ★ █████████████
4 ★ ███████
3 ★ ███
2 ★
1 ★
```

---

# 🔗 Related Products

A user may discover that the current product isn't the best option.

Instead of forcing them to return to Search, CartWise provides related products.

These can include:

- Similar products
- Frequently compared products
- Recommended products

The user can move directly from one product to another.

```text
Product A
   ↓
Related Product B
   ↓
Related Product C
```

---

# ❤️ Product Actions

The Product Details page provides important actions:

- ❤️ Wishlist
- ⚖️ Compare
- 📤 Share

These actions connect Product Details with other parts of CartWise.

The complete Wishlist and Compare workflows are implemented in later chapters.

---

# ⏳ Loading State

Product information may take time to load in a real application.

Instead of displaying an empty page, CartWise uses a **Loading Skeleton**.

The skeleton represents the expected structure of the Product Details page while information is being loaded.

---

# ⚠️ Error State

Sometimes product data cannot be retrieved.

The application therefore provides a dedicated Error State.

Instead of crashing or displaying a blank screen, the user receives meaningful feedback.

---

# ❌ Product Not Found

What happens if the user visits:

```text
/product/abcd
```

and no product exists?

CartWise displays a dedicated Product Not Found experience.

It provides:

- Clear explanation
- Search Products action
- Homepage action
- Popular product recommendations

This creates a graceful failure experience.

---

# 🧩 Product Architecture

The Product Details feature follows CartWise's Feature-first Architecture.

```text
product/
│
├── components/
├── data/
├── hooks/
├── utils/
├── constants.ts
├── index.ts
└── ProductPage.tsx
```

This keeps product-specific functionality isolated from unrelated application features.

---

# 🗂️ Product Data

The implementation separates product data into logical areas.

Examples include:

```text
Catalogue
Editorial Content
Offers
Reviews
Specifications
```

This prevents the Product Details components from becoming large collections of hardcoded information.

---

# 🪝 Custom Hooks

Product behavior is separated into reusable hooks.

Examples:

```text
useProduct
useGallery
```

`useProduct` manages product retrieval and state.

`useGallery` manages gallery behavior.

This keeps UI components focused primarily on presentation.

---

# 🧮 Utility Functions

Reusable business logic is extracted into utilities.

Examples include:

```text
media.ts
pricing.ts
slug.ts
```

These utilities handle responsibilities such as:

- Media processing
- Pricing calculations
- Slug generation and handling

---

# 🔌 Backend Ready

The current Product Details implementation uses mock data.

However, the architecture is intentionally prepared for future backend integration.

Current:

```text
Product Page
     ↓
Product Service
     ↓
Mock Data
```

Future:

```text
Product Page
     ↓
Product Service
     ↓
REST API
     ↓
Backend
     ↓
Database
```

The UI should not need to be completely rewritten when the data source changes.

---

# 📱 Responsive Product Details

The Product Details experience was designed to work across:

```text
📱 Mobile
📱 Tablet
💻 Laptop
🖥️ Desktop
🖥️ Ultra-wide
```

Responsive behavior covers:

- Product Gallery
- Product Information
- Pricing
- Store Comparison
- Specifications
- Reviews
- Related Products
- Buttons
- Typography
- Spacing

The implementation was verified across multiple viewport sizes.

---

# ♿ Accessibility

Product Details also considers accessibility.

Important areas include:

- Keyboard navigation
- Focus states
- Descriptive image text
- Accessible buttons
- Semantic headings
- Screen-reader-friendly controls

Accessibility ensures the interface isn't designed only for mouse and touch users.

---

# ⚡ Performance

The implementation also considers frontend performance.

Important practices include:

- Reusable components
- Efficient state management
- Image handling
- Avoiding unnecessary rendering
- Separating data from presentation

The architecture also leaves room for future optimizations such as:

- Lazy-loaded images
- Caching
- Code splitting
- API-level caching

---

# 🧪 Verification

Before completing Chapter 11, the Product Details experience was verified across multiple areas.

### Functional

- Dynamic product routing
- Product gallery
- Product information
- Pricing
- Store comparison
- Specifications
- AI insights
- Reviews
- Related products
- Product Not Found

### Responsive

- Mobile
- Tablet
- Desktop
- Ultra-wide

### Engineering

```text
TypeScript → 0 errors
ESLint     → 0 errors
Build      → Successful
```

---

# 🌟 Why This Chapter Matters

Chapter 10 allowed users to **find products**.

Chapter 11 allows users to **evaluate products**.

That distinction is important.

The application is moving from:

```text
Product Discovery
```

towards:

```text
Product Decision
```

CartWise is no longer simply displaying products.

It is beginning to help users decide **which product is worth buying**.

---

# 📈 Looking Ahead

The next major step is **Product Comparison**.

Users can now open a product and inspect it individually.

But eventually they will ask:

> **"Which one should I choose?"**

That's where Chapter 12 comes in.

The next flow becomes:

```text
Search
   ↓
Product Details
   ↓
Compare Products
   ↓
Side-by-Side Decision
```

---

# 📌 Key Takeaways

- Product Details converts product discovery into product evaluation.
- Dynamic routes allow every product to have its own URL.
- Slugs create readable and shareable product URLs.
- Product information is separated from UI components.
- Galleries improve visual product exploration.
- Store comparison supports CartWise's core value proposition.
- Specifications make technical information easier to understand.
- AI Insights provide decision-oriented summaries.
- Reviews provide social proof.
- Related Products keep users inside the discovery flow.
- Loading, error, and not-found states create a reliable experience.
- The architecture is prepared for future backend and AI integration.

---

# ➡️ What's Next?

Users can now search for products and explore them in detail.

The next chapter takes the experience one step further.

## ⚖️ Chapter 12 — Product Comparison

We will allow users to place products side-by-side and compare:

- Prices
- Specifications
- Ratings
- Performance
- Cameras
- Battery
- Software
- Stores
- Overall scores

The goal is simple:

> **Compare Better. Buy Smarter.**
