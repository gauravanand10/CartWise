# 🎯 CH17 — Interview Questions

> **Project:** CartWise  
> **Chapter:** REST APIs
>
> This chapter covers REST principles, the five endpoints, DTOs, services, controllers, error handling, validation, and testing via HTTP.

---

# 📚 Beginner Level

## Q1. What is REST, and why is CartWise's API a REST API?

### Answer

REST (Representational State Transfer) is an architectural style for web APIs that uses HTTP's built-in methods and semantics as the protocol.

CartWise is REST because:
- Resources are identified by URLs (`/api/products`, `/api/users/:userId/wishlist`)
- HTTP methods (GET, POST, DELETE) are operations (read, create, delete)
- Responses are JSON
- Status codes (200, 404, 409) convey meaning

The alternative would be RPC (Remote Procedure Call), where you call methods by name (`/rpc?method=getProduct&id=1`). REST is cleaner and standard.

---

## Q2. What are the five endpoints in CartWise Chapter 17?

### Answer

```text
GET    /api/products
GET    /api/products/{slug}
GET    /api/users/{userId}/wishlist
POST   /api/users/{userId}/wishlist
DELETE /api/users/{userId}/wishlist/{slug}
```

Each endpoint has one responsibility: list products, get one product, get a user's wishlist, add to wishlist, remove from wishlist.

---

## Q3. What is the difference between a 200 status code and a 201 status code?

### Answer

```text
200 OK       the request succeeded, data is returned
201 Created  the request succeeded and created a new resource
```

GET endpoints return 200. POST endpoints (creating something) return 201.

---

## Q4. When would you return a 404 status code?

### Answer

404 Not Found means the requested resource does not exist.

```bash
GET /api/products/nonexistent-slug → 404
DELETE /api/users/1/wishlist/nonexistent-slug → 404
```

---

## Q5. What is a DTO, and why is it separate from an @Entity?

### Answer

A DTO (Data Transfer Object) is the shape sent over HTTP. An @Entity is the shape in the database.

```text
Entity (Product)                  → toDto() → DTO (ProductDto)
(has database-specific fields)                 (only API fields)
```

DTOs hide database structure. If the database changes, the API contract stays the same (usually).

---

## Q6. What does `@RequestBody` do?

### Answer

`@RequestBody` deserializes JSON from the HTTP request into a DTO.

```java
@PostMapping
public ResponseEntity<Void> addToWishlist(
    @RequestBody AddToWishlistRequest request
) {
    // request.productSlug() is extracted from the JSON body
}
```

The client sends JSON; Spring converts it to a Java object.

---

## Q7. What does `@PathVariable` do?

### Answer

`@PathVariable` extracts a dynamic segment from the URL path.

```java
@GetMapping("/{slug}")
public ResponseEntity<ProductDto> getProduct(@PathVariable String slug) {
    // slug = "iphone-16-pro" from /api/products/iphone-16-pro
}
```

---

## Q8. What is the difference between `ResponseEntity.ok()` and `ResponseEntity.notFound().build()`?

### Answer

```java
ResponseEntity.ok(data)          // 200 OK + response body (data)
ResponseEntity.notFound().build() // 404 Not Found + empty body
```

Use `ok()` when you have data to return. Use `notFound()` when the resource doesn't exist.

---

## Q9. What does a 409 Conflict status code mean, and when is it used?

### Answer

409 Conflict means the request conflicts with the current state.

CartWise uses it for duplicate prevention:

```bash
POST /api/users/1/wishlist { "productSlug": "iphone" }  # 201 Created
POST /api/users/1/wishlist { "productSlug": "iphone" }  # 409 Conflict
```

The second attempt conflicts with the existing state (product already saved).

---

## Q10. What is validation, and where does it happen in the API?

### Answer

Validation is checking that input is valid before processing it.

It happens at the API boundary (controller), before calling the service:

```java
if (request.productSlug() == null || request.productSlug().isBlank()) {
    throw new IllegalArgumentException("productSlug cannot be empty");
}
```

Bad input never reaches the database.

---

# 📚 Intermediate Level

## Q11. Walk through a POST request to add a product to a wishlist. What happens at each layer?

### Answer

```text
1. Browser sends: POST /api/users/1/wishlist { "productSlug": "iphone" }

2. Spring routes to WishlistController.addToWishlist()
   with @RequestBody deserialized to AddToWishlistRequest

3. Controller validates: productSlug is not null/blank

4. Controller calls wishlistService.addToWishlist(userId, slug)

5. Service checks: product exists, not already saved

6. Service calls wishlistRepository.save(wishlistItem)

7. Repository executes: INSERT INTO wishlist (user_id, product_id, created_at) ...

8. Database returns: insert successful

9. Service returns (no exception)

10. Controller returns: ResponseEntity.status(HttpStatus.CREATED).build()
    (201 Created, empty body)

11. Spring sends to browser: HTTP 201 + empty body
```

---

## Q12. What are the three error cases for POST /api/users/{userId}/wishlist, and what status code does each return?

### Answer

```text
Case 1: Product doesn't exist
  throw EntityNotFoundException → caught by @ExceptionHandler → 404 Not Found

Case 2: Product already in wishlist
  throw DuplicateEntryException → caught by @ExceptionHandler → 409 Conflict

Case 3: Missing or blank productSlug
  throw IllegalArgumentException → caught by @ExceptionHandler → 400 Bad Request
```

---

## Q13. Why does the WishlistService call both `productRepository.findBySlug()` and `wishlistRepository.existsByUserIdAndProductId()`?

### Answer

```java
Product product = productRepository.findBySlug(slug)
    .orElseThrow(() -> new EntityNotFoundException(...));

boolean exists = wishlistRepository.existsByUserIdAndProductId(userId, product.getId());
if (exists) {
    throw new DuplicateEntryException(...);
}
```

The first checks "does this product exist?" (404 if no).
The second checks "is this product already saved?" (409 if yes).

Both are necessary because they represent different failure modes with different meanings.

---

## Q14. Why is duplicate prevention checked in the service and not the database?

### Answer

The service can return 409 Conflict, which is the right HTTP status code for "this operation conflicts with existing state."

The database could enforce this with a UNIQUE constraint, but then the error would bubble up as a generic database exception, and the controller would have to translate it to 409.

Checking in the service makes the error handling explicit and cleaner.

---

## Q15. What does `ResponseEntity.noContent().build()` return, and when is it used?

### Answer

```java
ResponseEntity.noContent().build()  → 204 No Content + empty body
```

Used when the operation succeeds but there is nothing meaningful to return.

```bash
DELETE /api/users/1/wishlist/iphone → 204 (product removed, nothing to send back)
```

---

## Q16. Why is ProductService.toDto() a separate method instead of inlining it?

### Answer

```java
private ProductDto toDto(Product product) {
    return new ProductDto(
        product.getId(),
        product.getSlug(),
        // ... map all fields
    );
}
```

Separation of concerns and reusability: the same DTO conversion is used in getAllProducts and getProductBySlug. Extracting it avoids duplication and makes changes (adding a field to the DTO) a single-point update.

---

## Q17. What happens if a service method throws an unhandled exception?

### Answer

The Spring @ExceptionHandler for `Exception.class` catches it and returns:

```json
{ "status": 500, "message": "Internal server error" }
```

The client gets a 500 error and a generic message (no implementation details leak).

---

## Q18. Why does the wishlist endpoint use userId in the URL path (`/api/users/{userId}/wishlist`) instead of just `/api/wishlist`?

### Answer

Because the wishlist is per-user. If the URL were just `/api/wishlist`, the backend would need to know which user is making the request — that requires authentication (Chapter 18).

By including userId in the URL, the endpoint structure makes it clear that this is a user-specific resource.

Currently, any userId works (no authentication), but the structure is ready for Chapter 18 to add authorization checks ("can you only access your own wishlist?").

---

## Q19. What is the purpose of the GlobalExceptionHandler, and what does it catch?

### Answer

It catches exceptions thrown by controllers and services, and converts them to consistent HTTP error responses.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class) → 404
    @ExceptionHandler(DuplicateEntryException.class) → 409
    @ExceptionHandler(IllegalArgumentException.class) → 400
    @ExceptionHandler(Exception.class) → 500
}
```

Without it, each controller would need its own error handling, leading to inconsistent responses.

---

## Q20. Why does POST return 201 Created instead of 200 OK?

### Answer

201 Created is semantically correct — it tells the client "a new resource was created."

200 OK just means "success" without saying what kind of success. For POST that creates something, 201 is more specific and useful.

The client can use the status code to decide its behavior (e.g., 201 might trigger a redirect to the new resource).

---

# ⚛️ Spring/HTTP-Specific Questions

## Q21. What is the difference between `@GetMapping` and `@RequestMapping(method = RequestMethod.GET)`?

### Answer

They are equivalent; `@GetMapping` is a shorthand.

```java
@GetMapping
public ResponseEntity<List<ProductDto>> getAllProducts() { }

// is equivalent to:
@RequestMapping(method = RequestMethod.GET)
public ResponseEntity<List<ProductDto>> getAllProducts() { }
```

`@GetMapping` is clearer and more concise.

---

## Q22. Why is `@RestController` used instead of `@Controller`?

### Answer

`@RestController` is `@Controller` + `@ResponseBody` combined.

```java
@RestController
public ResponseEntity<ProductDto> getProduct(...) {
    return ResponseEntity.ok(dto);  // automatically serialized to JSON
}

// vs @Controller:
@Controller
public ResponseEntity<ProductDto> getProduct(...) {
    @ResponseBody  // required here
    return ResponseEntity.ok(dto);
}
```

`@RestController` is the standard for JSON APIs.

---

## Q23. What does `orElse(ResponseEntity.notFound().build())` do?

### Answer

```java
return productService.getProductBySlug(slug)
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.notFound().build());
```

If `getProductBySlug()` returns an Optional:
- If present: map to `ResponseEntity.ok(data)` → 200 + data
- If empty: orElse returns `ResponseEntity.notFound()` → 404, no data

This is a functional way to handle the "not found" case without an if statement.

---

## Q24. What does `@ExceptionHandler(EntityNotFoundException.class)` mean?

### Answer

It tells Spring: "if any controller or service throws EntityNotFoundException, catch it and call this method."

```java
@ExceptionHandler(EntityNotFoundException.class)
public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse(404, ex.getMessage()));
}
```

Without it, the exception would propagate and return a generic 500 error.

---

## Q25. Why does addToWishlist return `ResponseEntity<Void>` instead of `ResponseEntity<WishlistItemDto>`?

### Answer

The operation succeeds or fails. If successful, there is nothing meaningful to return (the wishlist entry was saved, but the client already knows the input).

Returning 201 Created with an empty body is correct semantics:
- Status code signals "created"
- No body because the client already has the data it sent

If you wanted to return the created entry, you would return `ResponseEntity<WishlistItemDto>`, but that is extra coupling (the client would have to parse it).

---

# 🏗️ Architecture Questions

## Q26. Why is the service layer necessary? Why not have the controller call the repository directly?

### Answer

Services separate business logic from HTTP concerns.

**Without services (controller calls repository directly):**

```text
Controller                      Repository
  ↓                              ↓
POST request → validate input → findBySlug → INSERT
            ↑                   ↑
        HTTP validation      data access
```

Everything mixed together.

**With services (controller calls service calls repository):**

```text
Controller        Service           Repository
  ↓                ↓                 ↓
POST request → validate input → findBySlug → INSERT
 ↑              ↑              ↑
HTTP layer      business logic data access
```

Layered separation means each part can be tested and changed independently. The service can be reused by multiple controllers (e.g., a CLI tool could call the same service).

---

## Q27. What would happen if you removed the duplicate check in WishlistService and relied only on the database constraint?

### Answer

Without the check:

```java
boolean exists = wishlistRepository.existsByUserIdAndProductId(userId, productId);
if (exists) throw new DuplicateEntryException(...);
```

A second POST with the same product would throw a database constraint violation exception. The GlobalExceptionHandler has no specific handler for constraint violations, so it falls through to the generic `Exception.class` handler, returning 500 Internal Server Error.

The client would see a 500 instead of 409, which is semantically wrong and confusing.

Checking in the service and returning 409 is the right approach.

---

## Q28. Why does removeFromWishlist throw an exception if the item is not found, instead of silently succeeding?

### Answer

```java
boolean deleted = wishlistRepository.deleteByUserIdAndProductId(userId, productId);
if (!deleted) {
    throw new EntityNotFoundException("Wishlist item not found");
}
```

If the item doesn't exist and the DELETE returns 204 (success), the client might think the operation did something when it didn't.

Throwing an exception and returning 404 is more accurate:
- 404: "the thing you were trying to delete doesn't exist"
- The client can detect and handle the error

This is a design choice; some APIs silently succeed on DELETE-not-found (idempotent). CartWise chose to error, which is also valid.

---

## Q29. How does the API ensure that the frontend sees up-to-date product prices?

### Answer

By storing only the productId in the wishlist table, not a copy of the price.

When the frontend calls `GET /api/users/1/wishlist`, the service joins with the current `products` table:

```java
Product product = productRepository.findById(item.getProductId())
    .orElseThrow(...);
```

So the price, rating, and all other product data are always current at read time, never stale.

---

## Q30. Why does ProductService have a `toDto()` method, but WishlistItemDto construction is inline in WishlistService?

### Answer

```java
// ProductService
private ProductDto toDto(Product product) { ... }

// WishlistService
new WishlistItemDto(item.getId(), toProductDto(product), item.getCreatedAt())
```

Both approaches work. Extracting `toDto()` as a method is better for reusability and testing, but if the conversion only happens once, inlining is fine.

This is a style choice; the important thing is that DTOs are created at the boundary between service and HTTP.

---

# 🧪 Scenario-Based Questions

## Q31. A user sends `DELETE /api/users/1/wishlist/iphone` twice in quick succession. What happens each time?

### Answer

**First DELETE:**
- Service finds the wishlist entry
- Deletes it from the database
- Returns 204 No Content (success)

**Second DELETE:**
- Service tries to find the wishlist entry
- Doesn't find it (already deleted)
- Throws EntityNotFoundException
- GlobalExceptionHandler catches it
- Returns 404 Not Found

This is correct: the first succeeds, the second fails because the state changed.

---

## Q32. A user sends `POST /api/users/1/wishlist { "productSlug": "iphone" }` three times. What happens each time?

### Answer

**First POST:**
- Validates input ✓
- Checks product exists ✓
- Checks not already saved ✓
- Inserts into database ✓
- Returns 201 Created

**Second POST:**
- Validates input ✓
- Checks product exists ✓
- Checks not already saved ✗ (it is!)
- Throws DuplicateEntryException
- GlobalExceptionHandler catches it
- Returns 409 Conflict

**Third POST:**
- Same as second: 409 Conflict

---

## Q33. The frontend calls `GET /api/products` and receives 200 OK with 3 products. It then calls `POST /api/users/1/wishlist` to add one. Later, it calls `GET /api/products` again. Will the response be different?

### Answer

No. The products list doesn't change when you add something to your wishlist.

`GET /api/products` returns all products in the catalogue. Saving to a wishlist doesn't remove products from the catalogue or change their data (price, rating, etc.).

The difference would only appear in `GET /api/users/1/wishlist`, which now includes the newly saved product.

---

## Q34. A developer accidentally makes the wishlist POST endpoint return the created WishlistItemDto with a 201 status. What's the risk?

### Answer

The client now depends on the response body to know what was saved. If the response format changes later, the client breaks.

Current approach (201 with empty body):
- Client sends the data
- Server echoes back "created"
- Client already has the data; no coupling

New approach (201 with body):
- Client sends the data
- Server sends it back
- Client depends on the exact shape
- More coupling

For idempotency and simplicity, returning no body is better. The status code alone is enough information.

---

## Q35. A user saves 100 products to their wishlist and then calls `GET /api/users/1/wishlist`. The response takes 5 seconds. What's the likely bottleneck, and how would you fix it?

### Answer

**Likely cause:** N+1 query problem. For each of the 100 wishlist items, the service calls `productRepository.findById()` separately.

```java
// Current (slow):
return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId)
    .stream()
    .map(item -> {
        Product product = productRepository.findById(item.getProductId())  // 100 queries!
            .orElseThrow(...);
        return new WishlistItemDto(...);
    })
    .toList();
```

**Fix:** Use a JOIN query to fetch wishlist + products in one query.

```java
// Better:
@Query("SELECT new com.cartwise.dto.WishlistItemDto(...) " +
       "FROM Wishlist w JOIN Product p ON w.productId = p.id " +
       "WHERE w.userId = :userId " +
       "ORDER BY w.createdAt DESC")
List<WishlistItemDto> findByUserIdWithProducts(@Param("userId") Long userId);
```

This is a Chapter 19 optimization (query performance), but the principle is important now.

---

# 📌 Summary

These questions cover:

- REST principles and the five endpoints
- HTTP status codes and their semantics
- DTOs, entities, and the separation between them
- Layered architecture: controller → service → repository
- Error handling and validation
- Duplicate prevention (409 Conflict)
- Request/response serialization
- Spring annotations (@RestController, @GetMapping, @RequestBody, @PathVariable)
- Testing via HTTP
- Performance considerations (N+1 queries)
