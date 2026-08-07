# 🎯 CH05 — Interview Questions

> This chapter focuses on the **Design System** of CartWise. These questions cover UI consistency, design principles, Tailwind CSS, design tokens, typography, spacing, colors, animations, and scalable frontend design.

---

# 📚 Beginner Level

---

## Q1. What is a Design System?

### Answer

A Design System is a collection of reusable design principles, components, and guidelines that ensure a consistent user experience across an application.

It usually includes:

- Colors
- Typography
- Spacing
- Shadows
- Components
- Icons
- Animations

Instead of designing every page independently, developers follow one unified system.

---

## Q2. Why is a Design System important?

### Answer

A Design System helps maintain consistency across an application.

Benefits include:

- Uniform UI
- Faster development
- Easier maintenance
- Better collaboration
- Improved user experience

Without a Design System, different pages often end up looking inconsistent.

---

## Q3. What is a Color Palette?

### Answer

A Color Palette is the predefined collection of colors used throughout an application.

Examples include:

- Primary
- Secondary
- Accent
- Success
- Warning
- Error

Using a consistent palette strengthens branding and improves visual consistency.

---

## Q4. What is Typography?

### Answer

Typography is the way text is styled and presented.

It includes:

- Font Family
- Font Size
- Font Weight
- Line Height
- Letter Spacing

Good typography improves readability and accessibility.

---

## Q5. What is Spacing?

### Answer

Spacing refers to the distance between UI elements.

Examples:

- Margin
- Padding
- Gap

Consistent spacing creates cleaner and more organized interfaces.

---

## Q6. What is Border Radius?

### Answer

Border Radius controls the roundness of UI elements.

Examples:

- Buttons
- Cards
- Images
- Inputs

Using consistent border radius creates a unified visual language.

---

## Q7. What are Shadows?

### Answer

Shadows create depth and help distinguish elements from the background.

They improve visual hierarchy by emphasizing important UI components.

---

## Q8. What are Gradients?

### Answer

Gradients blend two or more colors together.

They are commonly used for:

- Hero Sections
- Buttons
- Backgrounds
- Cards

Gradients create a modern and visually appealing interface.

---

## Q9. What are Animations?

### Answer

Animations provide smooth transitions and visual feedback.

Examples:

- Hover Effects
- Fade In
- Scale
- Slide

Good animations improve user experience without becoming distracting.

---

## Q10. Why is UI consistency important?

### Answer

Consistency helps users predict how an application behaves.

It improves:

- Learnability
- Usability
- Accessibility
- Professional appearance

---

# 🚀 Intermediate Level

---

## Q11. What are Design Tokens?

### Answer

Design Tokens are reusable values used throughout an application.

Examples:

- Primary Color
- Font Size
- Shadow
- Radius
- Animation Duration

Updating one token updates the entire design consistently.

---

## Q12. Why did CartWise build a Design System?

### Answer

CartWise contains many pages and reusable components.

Without a Design System, maintaining visual consistency would become difficult.

The Design System allows every feature to follow the same design language.

---

## Q13. Why use Tailwind CSS for a Design System?

### Answer

Tailwind CSS provides:

- Utility-first styling
- Faster development
- Consistent spacing
- Responsive utilities
- Reduced CSS duplication

It aligns well with reusable component development.

---

## Q14. What is Glassmorphism?

### Answer

Glassmorphism is a UI style that uses:

- Blur
- Transparency
- Soft borders
- Subtle shadows

It creates a frosted glass appearance and is used selectively within CartWise.

---

## Q15. What is Visual Hierarchy?

### Answer

Visual Hierarchy is the arrangement of UI elements based on importance.

Important elements are emphasized using:

- Size
- Color
- Weight
- Position
- Contrast

---

## Q16. Why should colors be centralized?

### Answer

Centralizing colors ensures:

- Consistency
- Easy updates
- Better maintainability
- Strong branding

Changing one color updates the entire application.

---

## Q17. Why should animations be standardized?

### Answer

Standardized animations create predictable interactions.

Benefits include:

- Consistent user experience
- Better maintainability
- Easier design updates

---

## Q18. Why should spacing remain consistent?

### Answer

Consistent spacing creates:

- Cleaner layouts
- Better readability
- Improved visual balance

Random spacing makes interfaces appear unprofessional.

---

## Q19. What is a Utility Class?

### Answer

A Utility Class performs one specific styling task.

Example:

```html
rounded-xl
shadow-lg
flex
```

Combining utility classes creates complete UI designs.

---

## Q20. Why avoid writing custom CSS everywhere?

### Answer

Excessive custom CSS often leads to:

- Duplicate styles
- Harder maintenance
- Inconsistent design

Using a Design System encourages reuse and consistency.

---

# 🔥 Advanced Level

---

## Q21. How does a Design System improve scalability?

### Answer

As the application grows, new pages automatically follow existing design rules.

This reduces design inconsistencies and simplifies future development.

---

## Q22. How does a Design System reduce technical debt?

### Answer

Reusable design tokens and components eliminate duplicated styling.

This makes future updates significantly easier.

---

## Q23. Why should components use shared design tokens?

### Answer

Using shared tokens ensures:

- Consistency
- Easier maintenance
- Faster redesigns
- Better collaboration

---

## Q24. How would you redesign CartWise without changing every page individually?

### Answer

Update the Design System.

Because all components reference centralized design values, visual changes automatically propagate across the application.

---

## Q25. What happens if every developer creates their own button style?

### Answer

The application quickly becomes inconsistent.

Users encounter different colors, spacing, animations, and typography, reducing the overall quality of the user experience.

---

# 🏗️ Real-world & System Design Questions

---

## Q26. How do large companies maintain UI consistency?

### Answer

Companies like Google, Microsoft, and Airbnb maintain centralized Design Systems containing:

- Components
- Tokens
- Guidelines
- Documentation

Every team builds using the same standards.

---

## Q27. Why is a Design System considered an engineering asset?

### Answer

It improves both design and development.

Benefits include:

- Faster implementation
- Reduced bugs
- Better collaboration
- Easier maintenance

---

## Q28. If CartWise introduces a dark mode, how does the Design System help?

### Answer

The Design System centralizes colors and themes.

Changing design tokens allows the application to support dark mode without redesigning every page individually.

---

## Q29. What is the biggest mistake beginners make while styling applications?

### Answer

Applying random colors, spacing, and font sizes independently on each page.

A Design System prevents these inconsistencies.

---

## Q30. Why is the Design System implemented before building more features?

### Answer

Every future page and component depends on the Design System.

Establishing it early ensures that new features automatically inherit a consistent visual language, reducing redesign efforts later.

---

# 📌 Key Takeaways

After completing these questions, you should be able to explain:

- What a Design System is.
- Why CartWise uses a centralized Design System.
- The importance of colors, typography, spacing, shadows, and animations.
- How Design Tokens improve scalability.
- Why UI consistency matters in modern software engineering.
- How a Design System reduces technical debt and simplifies future development.
