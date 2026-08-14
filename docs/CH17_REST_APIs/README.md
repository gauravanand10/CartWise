# 🔌 CH17 — REST APIs

> **Project:** CartWise  
> **Chapter:** REST APIs

---

# 👋 Welcome

Chapters 1–16 built the foundation: a React frontend, a Spring Boot backend, and a PostgreSQL database with entities and repositories.

But the frontend and backend were still separate islands. The frontend ran on `localhost:5173`, the backend on `localhost:8080`, and they did not talk to each other.

A REST API is the bridge. It is a contract — a set of HTTP endpoints that say "frontend, you can ask me for products, and I will send you JSON back."

Chapter 17 is where that contract is fulfilled. Five endpoints turn the database into accessible data.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- What REST is and why it is the standard for web APIs.
- How HTTP methods (GET, POST, DELETE) map to database operations.
- What a DTO is and why it is separate from an entity.
- How services orchestrate repositories and apply business logic.
- How controllers route HTTP requests to services.
- What status codes (200, 201, 404, 409, 400) mean and when to return them.
- How to handle errors consistently across all endpoints.
- Why validation happens at the API boundary, not the database.
- How to test endpoints with curl and from the frontend's JavaScript.
- What "duplicate prevention" means in the API (409 Conflict).
- Why the five endpoints chosen in this chapter are enough, and what is deferred to later chapters.

---

# 📡 What Is REST?

REST (Representational State Transfer) is an architectural style for web APIs that uses HTTP's built-in methods and semantics.

```text
GET    /api/products          → "give me all products"
GET    /api/products/iphone   → "give me the iPhone product"
POST   /api/users/1/wishlist  → "save this product to user 1's wishlist"
DELETE /api/users/1/wishlist/iphone → "remove iPhone from user 1's wishlist"
```

Each endpoint is a resource (`/api/products`, `/api/users/:userId/wishlist`). Each HTTP method is an operation (GET = read, POST = create, DELETE = remove). The response is JSON.

CartWise's API is REST — it uses standard HTTP methods, standard status codes, and resource-oriented URLs.

---

# 🔗 The Five Endpoints

CartWise Chapter 17 exposes exactly five endpoints. No more, no less.

```text
GET    /api/products
GET    /api/products/{slug}
GET    /api/users/{userId}/wishlist
POST   /api/users/{userId}/wishlist
DELETE /api/users/{userId}/wishlist/{slug}
```

Each endpoint:
- Has a clear, single responsibility
- Returns consistent JSON shapes (DTOs)
- Returns correct HTTP status codes
- Handles errors gracefully
- Is tested with real HTTP requests

---

# 🛍️ GET /api/products — List All Products

Returns all products in the catalogue.

**Request:**

```bash
GET http://localhost:8080/api/products
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "slug": "iphone-16-pro",
    "name": "iPhone 16 Pro",
    "brand": "Apple",
    "category": "Smartphones",
    "price": 129999,
    "originalPrice": 139999,
    "rating": 4.8,
    "reviewCount": 12500,
    "inStock": true,
    "imageUrl": "https://via.placeholder.com/300x300?text=iPhone+16+Pro"
  },
  {
    "id": 2,
    "slug": "galaxy-s25-ultra",
    "name": "Galaxy S25 Ultra",
    "brand": "Samsung",
    "category": "Smartphones",
    "price": 124999,
    "originalPrice": 134999,
    "rating": 4.7,
    "reviewCount": 8300,
    "inStock": true,
    "imageUrl": "https://via.placeholder.com/300x300?text=Galaxy+S25+Ultra"
  },
  // ... more products
]
```

**Status Code:** `200 OK`

**Error Cases:** None for this endpoint — it always succeeds, even if the list is empty.

**Implementation:**

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
}
```

The service fetches all products from the repository and converts them to DTOs.

---

# 🔍 GET /api/products/{slug} — Get One Product

Returns a single product by its slug.

**Request:**

```bash
GET http://localhost:8080/api/products/iphone-16-pro
```

**Response (200 OK):**

```json
{
  "id": 1,
  "slug": "iphone-16-pro",
  "name": "iPhone 16 Pro",
  "brand": "Apple",
  "category": "Smartphones",
  "price": 129999,
  "originalPrice": 139999,
  "rating": 4.8,
  "reviewCount": 12500,
  "inStock": true,
  "imageUrl": "https://via.placeholder.com/300x300?text=iPhone+16+Pro"
}
```

**Status Code:** `200 OK`

**Error Cases:**

```bash
GET http://localhost:8080/api/products/nonexistent-product
```

**Response (404 Not Found):**

```text
(empty body, status code only)
```

**Status Code:** `404 Not Found`

**Implementation:**

```java
@GetMapping("/{slug}")
public ResponseEntity<ProductDto> getProductBySlug(@PathVariable String slug) {
    return productService.getProductBySlug(slug)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}
```

The service queries the repository. If found, return 200 + DTO. If not found, return 404 with no body.

---

# ❤️ GET /api/users/{userId}/wishlist — Get User's Wishlist

Returns all products a user has saved to their wishlist, in order of recency (newest first).

**Request:**

```bash
GET http://localhost:8080/api/users/1/wishlist
```

**Response (200 OK):**

```json
[
  {
    "id": 5,
    "product": {
      "id": 1,
      "slug": "iphone-16-pro",
      "name": "iPhone 16 Pro",
      // ... other product fields
    },
    "savedAt": "2025-08-10T14:32:18Z"
  },
  {
    "id": 6,
    "product": {
      "id": 2,
      "slug": "galaxy-s25-ultra",
      "name": "Galaxy S25 Ultra",
      // ... other product fields
    },
    "savedAt": "2025-08-10T14:20:00Z"
  }
]
```

**Status Code:** `200 OK`

**Error Cases:** None — the endpoint always succeeds, even if the user has no wishlist items (empty array).

**Implementation:**

```java
@RestController
@RequestMapping("/api/users/{userId}/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemDto>> getUserWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }
}
```

The service queries `WishlistRepository.findByUserIdOrderByCreatedAtDesc()`, joins each entry with its product data, and returns a list of WishlistItemDto.

---

# ➕ POST /api/users/{userId}/wishlist — Add to Wishlist

Adds a product to a user's wishlist.

**Request:**

```bash
POST http://localhost:8080/api/users/1/wishlist
Content-Type: application/json

{
  "productSlug": "iphone-16-pro"
}
```

**Response (201 Created):**

```text
(empty body, status code only)
```

**Status Code:** `201 Created`

**Error Cases:**

**Case 1: Product doesn't exist**

```bash
POST http://localhost:8080/api/users/1/wishlist
Content-Type: application/json

{
  "productSlug": "nonexistent-product"
}
```

**Response (404 Not Found):**

```json
{
  "status": 404,
  "message": "Product not found: nonexistent-product"
}
```

**Status Code:** `404 Not Found`

**Case 2: Product already in wishlist (duplicate)**

```bash
POST http://localhost:8080/api/users/1/wishlist
Content-Type: application/json

{
  "productSlug": "iphone-16-pro"
}
```

(called twice with the same slug)

**Response (409 Conflict):**

```json
{
  "status": 409,
  "message": "Product already in wishlist"
}
```

**Status Code:** `409 Conflict`

**Case 3: Missing or blank input**

```bash
POST http://localhost:8080/api/users/1/wishlist
Content-Type: application/json

{
  "productSlug": ""
}
```

**Response (400 Bad Request):**

```json
{
  "status": 400,
  "message": "Bad request: productSlug cannot be empty"
}
```

**Status Code:** `400 Bad Request`

**Implementation:**

```java
@PostMapping
public ResponseEntity<Void> addToWishlist(
    @PathVariable Long userId,
    @RequestBody AddToWishlistRequest request
) {
    if (request.productSlug() == null || request.productSlug().isBlank()) {
        throw new IllegalArgumentException("productSlug cannot be empty");
    }
    wishlistService.addToWishlist(userId, request.productSlug());
    return ResponseEntity.status(HttpStatus.CREATED).build();
}
```

The service validates the input, checks if the product exists, checks for duplicates, and inserts a row into the `wishlist` table.

**Request DTO:**

```java
public record AddToWishlistRequest(String productSlug) {}
```

---

# ➖ DELETE /api/users/{userId}/wishlist/{slug} — Remove from Wishlist

Removes a product from a user's wishlist.

**Request:**

```bash
DELETE http://localhost:8080/api/users/1/wishlist/iphone-16-pro
```

**Response (204 No Content):**

```text
(empty body, status code only)
```

**Status Code:** `204 No Content`

**Error Cases:**

**Case 1: Product not in this user's wishlist**

```bash
DELETE http://localhost:8080/api/users/1/wishlist/nonexistent-product
```

**Response (404 Not Found):**

```json
{
  "status": 404,
  "message": "Wishlist item not found"
}
```

**Status Code:** `404 Not Found`

**Implementation:**

```java
@DeleteMapping("/{slug}")
public ResponseEntity<Void> removeFromWishlist(
    @PathVariable Long userId,
    @PathVariable String slug
) {
    wishlistService.removeFromWishlist(userId, slug);
    return ResponseEntity.noContent().build();
}
```

The service finds the wishlist entry by userId and productId (via slug), deletes it, and returns 204 (no body, operation succeeded).

---

# 💼 Request/Response DTOs

DTOs (Data Transfer Objects) are the shapes sent over HTTP. They are separate from @Entity classes to avoid exposing database structure.

**ProductDto:**

```java
public record ProductDto(
    Long id,
    String slug,
    String name,
    String brand,
    String category,
    Integer price,
    Integer originalPrice,
    Double rating,
    Integer reviewCount,
    Boolean inStock,
    String imageUrl
) {}
```

Every product endpoint returns this shape.

**WishlistItemDto:**

```java
public record WishlistItemDto(
    Long id,
    ProductDto product,
    LocalDateTime savedAt
) {}
```

The wishlist GET endpoint returns a list of these — each item with the nested product data.

**AddToWishlistRequest:**

```java
public record AddToWishlistRequest(String productSlug) {}
```

The wishlist POST endpoint accepts this shape.

**ErrorResponse:**

```java
public record ErrorResponse(int status, String message) {}
```

All error cases return this — a consistent shape for all failures.

---

# 🛠️ Service Layer — Business Logic

Services orchestrate repositories and apply business rules. They are separate from controllers (HTTP) and repositories (data access).

**ProductService:**

```java
@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll()
            .stream()
            .map(this::toDto)
            .toList();
    }

    public Optional<ProductDto> getProductBySlug(String slug) {
        return productRepository.findBySlug(slug)
            .map(this::toDto);
    }

    private ProductDto toDto(Product product) {
        return new ProductDto(
            product.getId(),
            product.getSlug(),
            product.getName(),
            product.getBrand(),
            product.getCategory(),
            product.getPrice(),
            product.getOriginalPrice(),
            product.getRating(),
            product.getReviewCount(),
            product.getInStock(),
            product.getImageUrl()
        );
    }
}
```

**WishlistService:**

```java
@Service
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    public List<WishlistItemDto> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(item -> {
                Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));
                return new WishlistItemDto(
                    item.getId(),
                    toProductDto(product),
                    item.getCreatedAt()
                );
            })
            .toList();
    }

    public void addToWishlist(Long userId, String productSlug) {
        Product product = productRepository.findBySlug(productSlug)
            .orElseThrow(() -> new EntityNotFoundException("Product not found: " + productSlug));

        boolean exists = wishlistRepository.existsByUserIdAndProductId(userId, product.getId());
        if (exists) {
            throw new DuplicateEntryException("Product already in wishlist");
        }

        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setUserId(userId);
        wishlistItem.setProductId(product.getId());
        wishlistItem.setCreatedAt(LocalDateTime.now());
        wishlistRepository.save(wishlistItem);
    }

    public void removeFromWishlist(Long userId, String productSlug) {
        Product product = productRepository.findBySlug(productSlug)
            .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        boolean deleted = wishlistRepository.deleteByUserIdAndProductId(userId, product.getId());
        if (!deleted) {
            throw new EntityNotFoundException("Wishlist item not found");
        }
    }

    private ProductDto toProductDto(Product product) {
        return new ProductDto(
            product.getId(),
            product.getSlug(),
            product.getName(),
            product.getBrand(),
            product.getCategory(),
            product.getPrice(),
            product.getOriginalPrice(),
            product.getRating(),
            product.getReviewCount(),
            product.getInStock(),
            product.getImageUrl()
        );
    }
}
```

Services know about business rules:
- A product must exist before saving to wishlist
- A product cannot be saved twice (duplicate check)
- A removal must find the item or error

Controllers know nothing about these rules — they only call the service.

---

# 🎮 Controller Layer — HTTP Routing

Controllers are the thin layer between HTTP and services. They route requests and handle the HTTP protocol.

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductDto> getProductBySlug(@PathVariable String slug) {
        return productService.getProductBySlug(slug)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}

@RestController
@RequestMapping("/api/users/{userId}/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<WishlistItemDto>> getUserWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }

    @PostMapping
    public ResponseEntity<Void> addToWishlist(
        @PathVariable Long userId,
        @RequestBody AddToWishlistRequest request
    ) {
        if (request.productSlug() == null || request.productSlug().isBlank()) {
            throw new IllegalArgumentException("productSlug cannot be empty");
        }
        wishlistService.addToWishlist(userId, request.productSlug());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> removeFromWishlist(
        @PathVariable Long userId,
        @PathVariable String slug
    ) {
        wishlistService.removeFromWishlist(userId, slug);
        return ResponseEntity.noContent().build();
    }
}
```

Controllers:
- Handle `@PathVariable` (URL parameters like `:userId`)
- Handle `@RequestBody` (JSON input)
- Return `ResponseEntity` with correct status codes
- Delegate all logic to services

---

# ⚠️ Error Handling

A global exception handler catches errors and returns consistent responses:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(DuplicateEntryException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateEntryException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse(409, ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadInput(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(400, ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse(500, "Internal server error"));
    }
}

public record ErrorResponse(int status, String message) {}
```

Every error gets a consistent shape: `{status, message}`. Developers know what to expect.

---

# ✅ Validation

Input validation happens at the API boundary — the controller — before calling the service.

```java
@PostMapping
public ResponseEntity<Void> addToWishlist(
    @PathVariable Long userId,
    @RequestBody AddToWishlistRequest request
) {
    if (request.productSlug() == null || request.productSlug().isBlank()) {
        throw new IllegalArgumentException("productSlug cannot be empty");
    }
    wishlistService.addToWishlist(userId, request.productSlug());
    return ResponseEntity.status(HttpStatus.CREATED).build();
}
```

This prevents bad data from reaching the service or database. Chapter 19+ will add sophisticated validation (length limits, format checks, etc.); Chapter 17 is minimal but necessary.

---

# 🔄 Duplicate Prevention

Attempting to add the same product twice returns `409 Conflict`:

```bash
POST /api/users/1/wishlist { "productSlug": "iphone-16-pro" }  # 201 Created
POST /api/users/1/wishlist { "productSlug": "iphone-16-pro" }  # 409 Conflict
```

The service checks before inserting:

```java
boolean exists = wishlistRepository.existsByUserIdAndProductId(userId, product.getId());
if (exists) {
    throw new DuplicateEntryException("Product already in wishlist");
}
```

The database also enforces this (Chapter 18 adds a UNIQUE constraint), but the API prevents duplicates at application level too.

---

# 📡 Testing Endpoints with curl

Every endpoint has been tested with real HTTP requests.

**List all products:**

```bash
curl http://localhost:8080/api/products
```

**Get one product:**

```bash
curl http://localhost:8080/api/products/iphone-16-pro
```

**Get user's wishlist:**

```bash
curl http://localhost:8080/api/users/1/wishlist
```

**Add to wishlist:**

```bash
curl -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'
```

**Remove from wishlist:**

```bash
curl -X DELETE http://localhost:8080/api/users/1/wishlist/iphone-16-pro
```

Each endpoint was called multiple times, with valid and invalid inputs, and the actual status codes and responses were recorded.

---

# 🌐 Frontend Integration

The frontend can now call these endpoints via fetch():

```javascript
// Get all products
fetch('http://localhost:8080/api/products')
  .then(r => r.json())
  .then(products => console.log(products))

// Add to wishlist
fetch('http://localhost:8080/api/users/1/wishlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productSlug: 'iphone-16-pro' })
})
  .then(r => r.status === 201 ? console.log('Added') : console.log('Error'))
```

CORS is already configured in Chapter 15, so fetch() from the frontend works transparently.

---

# 📭 What Is Deliberately Not Here

**No pagination.** `/api/products` returns all products. Chapter 19 will add `?limit=10&offset=0`.

**No filtering.** No category filter, no price range, no search. Chapter 19 will add query parameters for filtering.

**No sorting.** Products are returned in database order. Chapter 19 will add `?sort=rating-desc`.

**No authentication.** Endpoints are open. Any userId can access any other user's wishlist. Chapter 18 will add JWT and per-user authorization.

**No comparison endpoints.** Compare is a separate feature that would need the same per-user logic. Chapter 19+ covers this.

**No pagination metadata.** Responses have no `total`, `page`, `pages`. Chapter 19 will add these.

**No HTTP caching headers.** No `ETag`, no `Last-Modified`. Chapter 19+ will optimize.

---

# 📌 Key Takeaways

After Chapter 17:

- Five endpoints expose the core CartWise functionality: list products, get product, get wishlist, add to wishlist, remove from wishlist.
- Each endpoint returns the correct HTTP status code: 200 for success, 201 for created, 204 for no content, 404 for not found, 409 for conflict, 400 for bad input.
- DTOs separate the API contract from database entities, so the database can change without breaking the API.
- Services orchestrate repositories and enforce business rules; controllers route HTTP and delegate.
- Error handling is consistent across all endpoints: every error is a `{status, message}` JSON response.
- Validation happens at the API boundary, before data reaches the database.
- Duplicate prevention returns 409 Conflict, which is semantically correct and testable.
- All endpoints are tested with real HTTP requests; nothing is assumed.
- The frontend can call these endpoints via fetch(); CORS is transparent.

---

# 🎯 Chapter Outcome

CartWise is now a client-server system:

```text
Before CH17                     After CH17

Frontend (React)                Frontend (React)
   ↔ memory + localStorage         ↕ HTTP/REST
Backend (Spring Boot)           Backend (Spring Boot)
   (not accessible)                ↕ SQL
                                Database (PostgreSQL)
```

Data flows from frontend to backend to database and back. The five endpoints are the contract.

# 🔐 Chapter 18 — Authentication & Authorization
