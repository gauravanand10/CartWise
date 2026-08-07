# 🎯 CH08 — Interview Questions

> This chapter focuses on the **Homepage Development** of CartWise. These questions cover homepage architecture, user experience, reusable sections, product presentation, and frontend engineering decisions.

---

# 📚 Beginner Level

---

## Q1. What is a Homepage?

### Answer

A Homepage is the first page users see after opening an application.

It serves as the entry point and introduces users to the platform.

For CartWise, the Homepage helps users:

- Search products
- Discover deals
- Explore categories
- View trending products
- Compare products

---

## Q2. Why is the Homepage important?

### Answer

The Homepage creates the user's first impression.

A well-designed Homepage should:

- Clearly explain the product
- Guide users toward important actions
- Improve engagement
- Encourage exploration

A confusing Homepage often causes users to leave the application.

---

## Q3. What is the Hero Section?

### Answer

The Hero Section is the topmost and most prominent section of a Homepage.

It usually contains:

- Main Heading
- Short Description
- Search Box
- Primary CTA
- Visual Elements

The Hero Section immediately communicates the purpose of the application.

---

## Q4. Why does CartWise use a Hero Search?

### Answer

Searching is the primary functionality of CartWise.

Placing the Search Bar inside the Hero Section encourages users to begin interacting with the platform immediately.

---

## Q5. What are Hero Stats?

### Answer

Hero Stats display quick information that builds user trust.

Examples include:

- Products Compared
- Supported Stores
- Happy Users
- AI Recommendations

These statistics make the application appear informative and credible.

---

## Q6. What are Hero Categories?

### Answer

Hero Categories provide shortcuts to popular product categories.

Examples:

- Mobiles
- Laptops
- Electronics
- Fashion

They improve navigation and product discovery.

---

## Q7. What are Floating Products?

### Answer

Floating Products are decorative product cards displayed around the Hero Section.

Their purpose is to:

- Add visual depth
- Demonstrate the product UI
- Improve the overall appearance of the Homepage

---

## Q8. What are Trending Searches?

### Answer

Trending Searches display commonly searched products.

They help users begin exploring the platform without typing a search query.

---

## Q9. What are Flash Deals?

### Answer

Flash Deals highlight products currently available at discounted prices.

They encourage users to explore time-sensitive offers.

---

## Q10. What are AI Picks?

### Answer

AI Picks showcase products recommended by artificial intelligence.

In the current implementation, CartWise displays placeholder recommendations until AI integration is completed.

---

# 🚀 Intermediate Level

---

## Q11. Why is the Homepage divided into multiple sections?

### Answer

Dividing the Homepage into sections improves:

- Readability
- Navigation
- Maintainability
- Component Reusability

Each section focuses on one specific purpose.

---

## Q12. Why are Product Cards reused across multiple sections?

### Answer

The same Product Card component is used in:

- Flash Deals
- Trending Products
- AI Picks
- Recommended Products
- Price Drops

This ensures UI consistency and reduces duplicate code.

---

## Q13. What is a Product Grid?

### Answer

A Product Grid arranges multiple Product Cards in a structured layout.

Grids improve readability and efficiently display large collections of products.

---

## Q14. Why are placeholder images used?

### Answer

CartWise currently focuses on frontend development.

Placeholder images allow UI development to continue while backend APIs are still under development.

Future backend services will provide actual product images.

---

## Q15. Why separate Homepage into reusable components?

### Answer

Smaller reusable components are:

- Easier to maintain
- Easier to test
- Easier to reuse
- Easier to update

Large monolithic pages become difficult to manage.

---

## Q16. What is an Offer Card?

### Answer

Offer Cards highlight special promotions or featured offers.

They attract user attention and increase engagement.

---

## Q17. What is a Brand Collection?

### Answer

Brand Collections group products by manufacturer.

Examples:

- Apple
- Samsung
- Sony
- Dell

This makes browsing products easier.

---

## Q18. What is Recently Viewed?

### Answer

Recently Viewed displays products the user has interacted with previously.

Currently, CartWise uses placeholder frontend data.

Persistent storage will be added later.

---

## Q19. What are Recommended Products?

### Answer

Recommended Products suggest items users may be interested in.

Future AI integration will personalize these recommendations.

---

## Q20. What are Price Drops?

### Answer

Price Drops highlight products whose prices have recently decreased.

They help users identify better purchasing opportunities.

---

# 🔥 Advanced Level

---

## Q21. Why should Homepage sections be independent components?

### Answer

Independent components improve:

- Reusability
- Maintainability
- Scalability

Each section can evolve independently without affecting the others.

---

## Q22. How does the Homepage improve scalability?

### Answer

Because every section is modular, new sections can be added or removed without redesigning the entire page.

---

## Q23. Why should Homepage data eventually come from APIs?

### Answer

Backend APIs allow the Homepage to display:

- Live products
- Real prices
- Updated ratings
- Dynamic recommendations

This keeps content current without changing the frontend.

---

## Q24. How does CartWise prepare for AI integration?

### Answer

The Homepage already contains UI sections such as AI Picks and AI Score.

When AI services are implemented, these placeholders can be replaced without redesigning the interface.

---

## Q25. Why is the Homepage considered a composition of reusable components?

### Answer

The Homepage combines multiple reusable components rather than implementing everything directly.

This approach improves flexibility and code organization.

---

# 🏗️ Real-world & System Design Questions

---

## Q26. How do companies like Amazon structure their Homepage?

### Answer

Large e-commerce platforms divide the Homepage into independent, reusable sections.

Examples include:

- Recommendations
- Trending Products
- Deals
- Categories
- Personalized Content

Each section is developed independently but follows the same design system.

---

## Q27. Why should Homepage sections load independently?

### Answer

Independent loading improves:

- Performance
- User Experience
- Fault Isolation

If one section fails, the remaining Homepage can still function.

---

## Q28. How will the CartWise Homepage evolve in the future?

### Answer

Future improvements include:

- Backend APIs
- Live Product Data
- AI Recommendations
- Personalized Content
- Price Prediction
- Voice Search
- Image Search

The current architecture is already prepared for these additions.

---

## Q29. What is the biggest Homepage mistake beginners make?

### Answer

Building one enormous component.

Instead, each Homepage section should be its own reusable component with a single responsibility.

---

## Q30. Why is Homepage Development covered after Layout Architecture?

### Answer

The Homepage depends on:

- Routing
- Layouts
- Shared Components
- Design System

Completing those foundations first makes Homepage development cleaner, faster, and more maintainable.

---

# 📌 Key Takeaways

After completing these questions, you should be able to explain:

- The purpose of a Homepage.
- The role of the Hero Section.
- Why CartWise divides the Homepage into reusable sections.
- The importance of Product Cards and Product Grids.
- Why placeholder images are currently used.
- How the Homepage architecture supports future backend and AI integration.
