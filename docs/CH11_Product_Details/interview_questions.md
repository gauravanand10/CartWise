# 🎯 CH11 — Interview Questions

> This chapter focuses on the design and implementation of the **Product Details** experience in CartWise, including dynamic routing, product data, galleries, pricing, store comparison, specifications, AI insights, reviews, responsive design, and scalable frontend architecture.

---

# 📚 Beginner Level

---

## Q1. What is a Product Details page?

### Answer

A Product Details page displays complete information about a selected product.

In CartWise, it brings together:

- Product images
- Product information
- Pricing
- Store offers
- Specifications
- Reviews
- AI insights
- Related products

It allows users to evaluate a product before making a purchase decision.

---

## Q2. Why does CartWise need a Product Details page?

### Answer

The Search System helps users discover products, but users need more information before deciding what to buy.

The Product Details page provides that deeper information.

The user flow becomes:

```text
Search
  ↓
Product
  ↓
Product Details
  ↓
Purchase Decision
```

---

## Q3. What is dynamic routing?

### Answer

Dynamic routing allows one route structure to display different content depending on a URL parameter.

For example:

```text
/product/iphone-16-pro
/product/galaxy-s25-ultra
/product/sony-wh-1000xm6
```

The route remains the same while the product identifier changes.

---

## Q4. What is a product slug?

### Answer

A slug is a URL-friendly representation of a product.

For example:

```text
iPhone 16 Pro
```

can become:

```text
iphone-16-pro
```

Slugs make URLs easier to read, share, and understand.

---

## Q5. Why are slugs useful?

### Answer

Slugs provide readable URLs.

Instead of:

```text
/product/12345
```

CartWise can use:

```text
/product/iphone-16-pro
```

This makes the URL easier for users to understand and share.

---

## Q6. What is a Product Gallery?

### Answer

A Product Gallery displays multiple images of a product.

CartWise's gallery supports:

- Main image
- Thumbnails
- Previous/next navigation
- Image selection
- Zoom interaction

---

## Q7. Why are multiple product images useful?

### Answer

A single image rarely provides enough information about a physical product.

Multiple images allow users to inspect:

- Front
- Back
- Side
- Camera
- Ports
- Design details

This improves confidence before purchasing.

---

## Q8. What is a Product Specification?

### Answer

A specification describes a technical characteristic of a product.

Examples:

```text
Display → 6.3 inch
RAM → 8 GB
Storage → 256 GB
Battery → 4685 mAh
```

---

## Q9. Why should specifications be grouped?

### Answer

Products can have dozens of specifications.

Displaying everything in one large list makes the page difficult to scan.

Grouping them into categories such as:

- Display
- Processor
- Memory
- Camera
- Battery

makes the information easier to understand.

---

## Q10. What is Store Comparison?

### Answer

Store Comparison allows users to compare prices and offers for the same product across multiple retailers.

For example:

```text
Amazon          ₹129,999
Flipkart        ₹131,499
Croma           ₹132,000
Reliance        ₹133,499
```

This directly supports CartWise's goal of helping users compare prices before purchasing.

---

# 🚀 Intermediate Level

---

## Q11. Why should product data be separated from UI components?

### Answer

Separating data from UI improves maintainability.

Instead of hardcoding product information inside components, the application can retrieve product data through a service.

This also makes future backend integration easier.

---

## Q12. What is the purpose of a Product Service?

### Answer

The Product Service handles product retrieval.

The UI should not need to know where the product data comes from.

The service can initially use mock data:

```text
UI
 ↓
Product Service
 ↓
Mock Data
```

Later it can become:

```text
UI
 ↓
Product Service
 ↓
REST API
 ↓
Backend
 ↓
Database
```

This allows the UI architecture to remain stable while the data source changes.

---

## Q13. Why use a custom `useProduct` hook?

### Answer

A custom hook separates product-related state and retrieval logic from presentation.

Instead of placing all logic inside `ProductPage`, the page can consume the hook.

Conceptually:

```text
ProductPage
     ↓
useProduct
     ↓
Product Service
     ↓
Product Data
```

This makes the code easier to test and maintain.

---

## Q14. What is the purpose of `useGallery`?

### Answer

`useGallery` manages gallery-specific behavior.

It can handle:

- Current image
- Thumbnail selection
- Previous image
- Next image
- Gallery state

This keeps gallery logic separate from the visual gallery component.

---

## Q15. Why should Product Cards navigate using a slug?

### Answer

Using a slug creates a direct connection between the product card and Product Details page.

Example:

```text
Product Card
     ↓
iphone-16-pro
     ↓
/product/iphone-16-pro
```

This also makes product links easy to share.

---

## Q16. What happens when an invalid product URL is opened?

### Answer

The application should not crash.

For example:

```text
/product/abcd
```

should display a dedicated **Product Not Found** state.

CartWise provides actions such as:

- Search all products
- Go to homepage
- Popular product recommendations

This creates a graceful failure experience.

---

## Q17. Why are Loading and Error states important?

### Answer

Network or data retrieval operations are not always instantaneous or successful.

The application therefore needs to handle:

```text
Loading
   ↓
Success
```

and:

```text
Loading
   ↓
Error
```

A Loading Skeleton prevents the interface from appearing blank, while an Error State communicates failure clearly.

---

## Q18. What is an AI Insight section?

### Answer

The AI Insight section converts product information into decision-oriented information.

CartWise displays:

- AI Score
- Summary
- Pros
- Cons
- Best For
- Who Should Buy
- Who Should Avoid

The current implementation uses mock/static data.

Actual AI APIs belong to a later chapter.

---

## Q19. Why shouldn't AI functionality be directly implemented inside Product Details components?

### Answer

Separating AI logic from UI keeps the Product Details feature modular.

The UI should display AI results rather than directly managing the AI implementation.

Later, an AI service can provide the data without requiring a major UI redesign.

---

## Q20. Why are Related Products useful?

### Answer

Users may decide that the current product is not the best option.

Related Products allow them to continue exploring alternatives without returning to the Search page.

This creates a continuous discovery flow:

```text
Product
  ↓
Related Product
  ↓
Another Product
```

---

# 🔥 Advanced Level

---

## Q21. How does CartWise handle dynamic product routing?

### Answer

The application uses a dynamic product route containing the product slug.

Conceptually:

```text
/product/:slug
```

When a user visits the route, the application extracts the slug and uses it to retrieve the corresponding product.

---

## Q22. Why should the URL be the source of truth for the selected product?

### Answer

The URL uniquely identifies the current product.

This provides:

- Refresh support
- Bookmarking
- Sharing
- Browser history
- Direct navigation

For example:

```text
/product/iphone-16-pro
```

will always identify the same product.

---

## Q23. How would you replace mock product data with a backend API?

### Answer

The UI should not need to change significantly.

The service layer can change from:

```text
Product Service
      ↓
Mock Catalogue
```

to:

```text
Product Service
      ↓
REST API
      ↓
Backend
```

Because the UI already communicates with the service layer, the data source can be replaced independently.

---

## Q24. How would you design the product data model?

### Answer

A product model should contain the information required to identify and display the product.

Conceptually:

```text
Product
├── id
├── slug
├── name
├── brand
├── category
├── images
├── price
├── rating
├── availability
├── specifications
└── metadata
```

Additional information such as reviews, store offers, and editorial content can be represented separately when appropriate.

---

## Q25. Why should store offers be separate from the core product?

### Answer

The product itself is independent of a specific retailer.

Different stores can offer the same product at different:

- Prices
- Delivery times
- Availability

Separating store offers makes the data model more flexible.

---

## Q26. Why should pricing logic be extracted into utilities?

### Answer

Pricing calculations are reusable business logic.

Examples include:

- Discount calculation
- Savings calculation
- Price formatting
- Comparing store prices

Keeping these operations in utilities prevents duplication across components.

---

## Q27. Why should gallery logic be separated from the gallery UI?

### Answer

Separating behavior from presentation makes components simpler.

The gallery UI is responsible for rendering.

The gallery hook is responsible for state and navigation.

This separation makes both easier to maintain and test.

---

## Q28. How would you improve Product Details performance for thousands of products?

### Answer

Possible improvements include:

- Lazy loading images
- Optimizing image sizes
- Code splitting
- Caching product data
- Avoiding unnecessary re-renders
- Lazy rendering large sections
- Server-side or backend data fetching

The exact strategy would depend on the application's traffic and architecture.

---

## Q29. How would you make the Product Details page accessible?

### Answer

Important improvements include:

- Semantic HTML
- Descriptive image `alt` text
- Keyboard navigation
- Visible focus states
- Accessible buttons
- Proper headings
- Screen-reader-friendly labels
- Accessible accordions

Accessibility should be considered during implementation rather than added at the end.

---

## Q30. How was Chapter 11 verified?

### Answer

The Product Details implementation was verified through functional and responsive testing.

Important checks included:

- Dynamic product routing
- Multiple product pages
- Gallery interactions
- Store comparison
- Specifications
- AI insights
- Reviews
- Related products
- Product Not Found state
- Responsive layouts
- Navigation

The project was also validated using:

```text
TypeScript
ESLint
Production Build
```

before the chapter was marked complete.

---

# 🏗️ Real-world System Design

---

## Q31. How would a production e-commerce application retrieve product details?

### Answer

A typical architecture could look like:

```text
Browser
   ↓
React Application
   ↓
Product Service
   ↓
REST API
   ↓
Backend Service
   ↓
Database
```

The backend would retrieve the product and associated information.

Additional services could provide:

- Reviews
- Store prices
- Recommendations
- AI insights

---

## Q32. How would you handle product data from multiple stores?

### Answer

The product should be represented independently from store offers.

For example:

```text
Product
   │
   ├── Amazon Offer
   ├── Flipkart Offer
   ├── Croma Offer
   └── Reliance Digital Offer
```

This allows each retailer's price and availability to change independently.

---

## Q33. How would you implement price history in the future?

### Answer

Price history could be stored as time-series records.

Example:

```text
Product
   ↓
Price History
   ├── Date → Price
   ├── Date → Price
   └── Date → Price
```

The frontend could then display a price-history chart.

This functionality belongs to a later stage of CartWise.

---

## Q34. How would you handle reviews at scale?

### Answer

Reviews should eventually be stored and retrieved from the backend rather than bundled into frontend code.

The backend could support:

- Pagination
- Sorting
- Rating filtering
- Verified purchase information
- Helpful votes

The frontend would request only the reviews needed for the current view.

---

## Q35. Why is Product Details an important architectural milestone?

### Answer

Product Details connects several major parts of CartWise.

The flow now becomes:

```text
Homepage
   ↓
Search
   ↓
Product Details
   ↓
Compare / Wishlist
```

It therefore establishes the foundation for the next major shopping features.

---

# 📌 Key Takeaways

After completing this chapter, you should be able to explain:

- How dynamic product routing works.
- Why product slugs are useful.
- How Product Details should be structured.
- Why product data should be separated from UI.
- How Product Services prepare the application for backend integration.
- Why galleries, specifications, reviews, and store offers are separate concerns.
- How graceful loading, error, and not-found states improve UX.
- How Product Details connects Search with future Compare and Wishlist features.
