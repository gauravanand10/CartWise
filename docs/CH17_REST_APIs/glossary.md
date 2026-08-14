# 📖 CH17 — Glossary

> **Project:** CartWise  
> **Chapter:** REST APIs

This glossary explains the important terms and concepts introduced while building CartWise's REST API.

---

# 📡 REST (Representational State Transfer)

REST is an architectural style for web APIs that uses HTTP's built-in methods (GET, POST, DELETE) and status codes as the core protocol.

A REST API treats everything as a "resource" (products, wishlists) identified by URLs, and uses standard HTTP methods to operate on them.

---

# 🔗 Endpoint

An Endpoint is a URL path on the API that the client can call.

CartWise has five endpoints:
- `/api/products`
- `/api/products/{slug}`
- `/api/users/{userId}/wishlist`
- etc.

---

# 🌐 HTTP Method

An HTTP Method is the action a request performs on a resource.

```text
GET     read data without changing anything
POST    create new data
PUT     replace existing data
DELETE  remove data
```

CartWise uses GET (read), POST (add to wishlist), and DELETE (remove from wishlist).

---

# 📮 HTTP Status Code

An HTTP Status Code is a three-digit number in the response that tells the client what happened.

```text
2xx     success (200 OK, 201 Created, 204 No Content)
3xx     redirect
4xx     client error (400 Bad Request, 404 Not Found, 409 Conflict)
5xx     server error (500 Internal Server Error)
```

---

# ✅ 200 OK

The request succeeded, and the response includes the requested data.

```bash
GET /api/products → 200 + list of products
GET /api/products/iphone → 200 + product data
```

---

# ✨ 201 Created

The request succeeded and created a new resource.

```bash
POST /api/users/1/wishlist → 201 (product added)
```

The new resource (the wishlist entry) now exists.

---

# 🚫 204 No Content

The request succeeded, and there is no response body.

```bash
DELETE /api/users/1/wishlist/iphone → 204 (product removed, nothing to return)
```

The operation succeeded; no data is returned because nothing meaningful remains to send.

---

# 🔍 404 Not Found

The requested resource does not exist.

```bash
GET /api/products/nonexistent → 404
DELETE /api/users/1/wishlist/nonexistent → 404
```

---

# ⚠️ 400 Bad Request

The client sent invalid input — missing fields, wrong types, blank values.

```bash
POST /api/users/1/wishlist { "productSlug": "" } → 400
```

The server refuses to process the request because the input is malformed.

---

# 🔄 409 Conflict

The request conflicts with the current state — typically used for duplicates.

```bash
POST /api/users/1/wishlist { "productSlug": "iphone" }  # twice
# First: 201 Created
# Second: 409 Conflict (already in wishlist)
```

---

# 💥 500 Internal Server Error

An unexpected error occurred on the server.

```bash
Any endpoint hitting an unhandled exception → 500
```

This should never happen in normal operation; it signals a bug.

---

# 📦 DTO (Data Transfer Object)

A DTO is a plain object carrying data between layers — typically from the backend to the frontend via HTTP.

DTOs are separate from @Entity classes so the database schema is not exposed to the API client.

```java
public record ProductDto(
    Long id,
    String slug,
    String name,
    // ... fields
) {}
```

---

# 🏛️ Entity

An Entity is a @Entity class mapping to a database table.

The Entity is internal to the backend. The DTO is what the API exposes.

```text
Entity (database)  → toDto() → DTO (API) → JSON → Frontend
```

---

# 📤 Request Body

The Request Body is JSON data the client sends in a POST, PUT, or PATCH request.

```bash
POST /api/users/1/wishlist
Content-Type: application/json

{
  "productSlug": "iphone-16-pro"
}
```

The controller receives this as a DTO (via `@RequestBody`).

---

# 📥 Response Body

The Response Body is JSON data the server sends back to the client.

```bash
HTTP/1.1 200 OK
Content-Type: application/json

[
  { "id": 1, "slug": "iphone-16-pro", ... },
  { "id": 2, "slug": "galaxy-s25-ultra", ... }
]
```

---

# 🎯 Resource

A Resource is a noun (product, wishlist, user) that the API exposes.

CartWise's resources:
- `/api/products` → the products resource
- `/api/users/{userId}/wishlist` → a user's wishlist resource

Resources are the URL nouns; HTTP methods are the verbs.

---

# 🛠️ Service Layer

The Service Layer contains business logic — validation, rule enforcement, orchestration across repositories.

Services know about business domain concepts (products, wishlists, duplicates). Controllers and repositories do not.

---

# 🎮 Controller Layer

The Controller Layer handles HTTP routing and delegating to services.

Controllers know about HTTP methods, status codes, and JSON serialization. They know nothing about business logic.

---

# 🗄️ Repository Layer

The Repository Layer handles data access — queries, inserts, deletes.

Repositories return entities; services convert to DTOs.

---

# @RestController

`@RestController` marks a class as an HTTP endpoint handler. Spring automatically serializes return values to JSON.

```java
@RestController
@RequestMapping("/api/products")
public class ProductController { }
```

---

# @RequestMapping

`@RequestMapping` sets the base URL path for all methods in a controller.

```java
@RequestMapping("/api/products")
```

All methods in this controller respond to URLs starting with `/api/products`.

---

# @GetMapping

`@GetMapping` marks a method to handle HTTP GET requests.

```java
@GetMapping
@GetMapping("/{slug}")
```

The first responds to `/api/products` (no path segment).
The second responds to `/api/products/{slug}` (with path segment).

---

# @PostMapping

`@PostMapping` marks a method to handle HTTP POST requests.

```java
@PostMapping
public ResponseEntity<Void> addToWishlist(...) { }
```

---

# @DeleteMapping

`@DeleteMapping` marks a method to handle HTTP DELETE requests.

```java
@DeleteMapping("/{slug}")
public ResponseEntity<Void> removeFromWishlist(...) { }
```

---

# @PathVariable

`@PathVariable` extracts a value from the URL path.

```java
@GetMapping("/{slug}")
public ResponseEntity<ProductDto> getProduct(@PathVariable String slug) {
    // slug = "iphone-16-pro" from /api/products/iphone-16-pro
}
```

---

# @RequestBody

`@RequestBody` deserializes JSON from the request into a DTO.

```java
@PostMapping
public ResponseEntity<Void> addToWishlist(
    @RequestBody AddToWishlistRequest request
) {
    // request.productSlug() is extracted from the JSON body
}
```

---

# ResponseEntity

`ResponseEntity` wraps an HTTP response, allowing control over status codes and headers.

```java
return ResponseEntity.ok(data);              // 200 + data
return ResponseEntity.status(HttpStatus.CREATED).build();  // 201, no body
return ResponseEntity.notFound().build();    // 404
```

---

# Validation

Validation is checking that input is valid before processing it.

```java
if (request.productSlug() == null || request.productSlug().isBlank()) {
    throw new IllegalArgumentException("productSlug cannot be empty");
}
```

Validation happens at the API boundary (controller), not the database.

---

# Duplicate Prevention

Duplicate Prevention checks whether a record already exists before inserting.

```java
boolean exists = wishlistRepository.existsByUserIdAndProductId(userId, productId);
if (exists) {
    throw new DuplicateEntryException("Product already in wishlist");
}
```

Returning 409 Conflict tells the client "this operation had no effect because the state was already what you were trying to create."

---

# Exception Handling

Exception Handling catches errors and converts them to HTTP responses.

```java
@ExceptionHandler(EntityNotFoundException.class)
public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse(404, ex.getMessage()));
}
```

A thrown exception becomes a JSON error response.

---

# ErrorResponse

ErrorResponse is a DTO for error messages — always the same shape across all endpoints.

```java
public record ErrorResponse(int status, String message) {}
```

```json
{ "status": 404, "message": "Product not found" }
{ "status": 409, "message": "Product already in wishlist" }
```

---

# Content-Type

Content-Type is an HTTP header declaring the format of the request or response body.

```text
Content-Type: application/json
```

Both request and response use JSON in CartWise.

---

# CORS (Cross-Origin Resource Sharing)

CORS (configured in Chapter 15) allows the frontend (`localhost:5173`) to call the backend (`localhost:8080`).

Without CORS, the browser would block the fetch() call.

---

# fetch() (JavaScript)

fetch() is the JavaScript API for making HTTP requests from the browser.

```javascript
fetch('http://localhost:8080/api/products')
  .then(r => r.json())
  .then(data => console.log(data))
```

Returns a Promise that resolves to the response.

---

# Serialization

Serialization is converting an object into JSON.

Spring Boot automatically serializes DTOs to JSON in responses.

```java
ProductDto product = new ProductDto(...);
// Spring: return product; → convert to JSON → send to client
```

---

# Deserialization

Deserialization is converting JSON into an object.

Spring Boot automatically deserializes JSON request bodies into DTOs.

```java
// Client sends: { "productSlug": "iphone" }
// Spring: convert to AddToWishlistRequest(productSlug="iphone")
```

---

# HTTP Header

An HTTP Header is metadata sent with a request or response.

```text
Content-Type: application/json
Authorization: Bearer token
User-Agent: curl/7.68.0
```

CartWise uses `Content-Type: application/json` for all requests and responses.

---

# Query Parameter

A Query Parameter is a key-value pair in the URL after the `?`.

```text
/api/products?category=Smartphones&sort=rating
```

Chapter 17 does not use query parameters; they are added in Chapter 19 for filtering and sorting.

---

# Path Parameter (Path Variable)

A Path Parameter is a variable segment in the URL path.

```text
/api/products/{slug}
/api/users/{userId}/wishlist
```

The controller extracts these with `@PathVariable`.

---

# Idempotence

An operation is idempotent if calling it multiple times has the same effect as calling it once.

```text
GET /api/products        idempotent (reading never changes state)
POST /api/wishlist       NOT idempotent (first call creates, second fails with 409)
DELETE /api/wishlist/x   idempotent in effect (second delete returns 404)
```

---

# Pagination

Pagination breaks large result sets into pages.

```text
/api/products?limit=10&offset=0   → products 0–9
/api/products?limit=10&offset=10  → products 10–19
```

Chapter 17 returns all results; Chapter 19 adds pagination.

---

# Filtering

Filtering reduces results based on criteria.

```text
/api/products?category=Smartphones&price_max=150000
```

Chapter 17 has no filters; Chapter 19 adds them.

---

# Sorting

Sorting arranges results by a field.

```text
/api/products?sort=rating-desc   → highest rated first
/api/products?sort=price-asc     → cheapest first
```

Chapter 17 returns database order; Chapter 19 adds sorting.
