# 💻 CH17 — Commands

> **Project:** CartWise  
> **Chapter:** REST APIs

This file contains the commands used to develop, test, and verify the CartWise REST API endpoints.

---

# 🚀 Backend Development

## Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on `localhost:8080`. Logs show all endpoints are registered.

---

## Build and Test

```bash
cd backend
mvn clean verify
```

Compiles, runs tests, and verifies the build. Output should show:

```text
[INFO] BUILD SUCCESS
```

---

## Check for Compilation Errors

```bash
mvn compile
```

If there are any Java syntax errors, they appear here before starting the server.

---

# 🧪 Testing Endpoints with curl

Each endpoint can be tested with curl. Run these commands while the backend is running (`mvn spring-boot:run` in another terminal).

---

## GET /api/products — List All Products

```bash
curl http://localhost:8080/api/products
```

### Expected Response (200 OK)

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
  // ... more products
]
```

---

## GET /api/products/{slug} — Get One Product

```bash
curl http://localhost:8080/api/products/iphone-16-pro
```

### Expected Response (200 OK)

```json
{
  "id": 1,
  "slug": "iphone-16-pro",
  "name": "iPhone 16 Pro",
  // ... all fields
}
```

---

## GET /api/products/{slug} — Nonexistent Product (404)

```bash
curl -i http://localhost:8080/api/products/nonexistent-product
```

### Expected Response (404 Not Found)

```text
HTTP/1.1 404 Not Found
Content-Length: 0
```

(empty body, status code only)

---

## GET /api/users/{userId}/wishlist — Get User's Wishlist

```bash
curl http://localhost:8080/api/users/1/wishlist
```

### Expected Response (200 OK) — Initially Empty

```json
[]
```

After adding products, the list will populate.

---

## POST /api/users/{userId}/wishlist — Add to Wishlist

```bash
curl -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'
```

### Expected Response (201 Created)

```text
HTTP/1.1 201 Created
Content-Length: 0
```

(empty body, status code only)

---

## POST /api/users/{userId}/wishlist — Product Not Found (404)

```bash
curl -i -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"nonexistent-product"}'
```

### Expected Response (404 Not Found)

```json
{
  "status": 404,
  "message": "Product not found: nonexistent-product"
}
```

---

## POST /api/users/{userId}/wishlist — Duplicate (409)

```bash
# First request (should succeed)
curl -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'

# Second request with the same product (should fail)
curl -i -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'
```

### Expected Response (409 Conflict) — Second Request

```json
{
  "status": 409,
  "message": "Product already in wishlist"
}
```

---

## POST /api/users/{userId}/wishlist — Missing Input (400)

```bash
curl -i -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Content-Type: application/json" \
  -d '{"productSlug":""}'
```

### Expected Response (400 Bad Request)

```json
{
  "status": 400,
  "message": "Bad request: productSlug cannot be empty"
}
```

---

## DELETE /api/users/{userId}/wishlist/{slug} — Remove from Wishlist

```bash
curl -X DELETE http://localhost:8080/api/users/1/wishlist/iphone-16-pro
```

### Expected Response (204 No Content)

```text
HTTP/1.1 204 No Content
Content-Length: 0
```

(empty body, status code only)

---

## DELETE /api/users/{userId}/wishlist/{slug} — Not Found (404)

```bash
curl -i -X DELETE http://localhost:8080/api/users/1/wishlist/nonexistent-product
```

### Expected Response (404 Not Found)

```json
{
  "status": 404,
  "message": "Wishlist item not found"
}
```

---

# 🌐 Testing from Browser Console (fetch)

With both frontend (`npm run dev`) and backend running, open the frontend page and use the browser console:

## Get All Products

```javascript
fetch('http://localhost:8080/api/products')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Expected

Array of products logged to console.

---

## Get One Product

```javascript
fetch('http://localhost:8080/api/products/iphone-16-pro')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Expected

Single product object logged to console.

---

## Get Wishlist

```javascript
fetch('http://localhost:8080/api/users/1/wishlist')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Expected

Array of wishlist items (initially empty).

---

## Add to Wishlist

```javascript
fetch('http://localhost:8080/api/users/1/wishlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productSlug: 'iphone-16-pro' })
})
  .then(r => console.log(r.status))
```

### Expected

`201` logged to console.

---

## Remove from Wishlist

```javascript
fetch('http://localhost:8080/api/users/1/wishlist/iphone-16-pro', {
  method: 'DELETE'
})
  .then(r => console.log(r.status))
```

### Expected

`204` logged to console.

---

# 📋 Verification Checklist

Run through this sequence to confirm Chapter 17 is complete:

## 1. Backend Compiles

```bash
cd backend
mvn clean compile
```

**Verify:**
- No compilation errors
- All classes (controllers, services, DTOs) compile

---

## 2. Backend Boots

```bash
mvn spring-boot:run
```

**Verify:**
- Server starts on port 8080
- No exceptions in logs
- "Tomcat started on port(s): 8080"

---

## 3. All Five Endpoints Respond

Test each endpoint with curl (or use the verification commands below).

**Verify:**
- GET /api/products → 200 + array
- GET /api/products/{slug} → 200 + object
- GET /api/users/:userId/wishlist → 200 + array
- POST /api/users/:userId/wishlist → 201
- DELETE /api/users/:userId/wishlist/:slug → 204

---

## 4. 404 Behavior Is Correct

```bash
curl -i http://localhost:8080/api/products/nonexistent
```

**Verify:**
- Status code is 404, not 500

---

## 5. Validation Works

```bash
curl -i -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Content-Type: application/json" \
  -d '{"productSlug":""}'
```

**Verify:**
- Status code is 400 (not 500)
- Message mentions "productSlug cannot be empty"

---

## 6. Duplicate Prevention Works

```bash
# Add the same product twice
curl -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'

curl -i -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'
```

**Verify:**
- First: 201 Created
- Second: 409 Conflict

---

## 7. Frontend Can Call Endpoints

Start frontend (`npm run dev`) and open the browser console:

```javascript
fetch('http://localhost:8080/api/products')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Verify:**
- No CORS error
- JSON logged to console

---

## 8. /api/health Still Works (No Regression)

```bash
curl http://localhost:8080/api/health
```

**Verify:**
- Status code 200
- JSON: `{"status":"UP",...}`

---

# 🌿 Git Commands

## Check Status

```bash
git status
```

Should show backend changes and (if written) docs/CH17_REST_APIs/.

---

## Stage Changes

```bash
git add .
```

---

## Commit

```bash
git commit -m "feat: implement Chapter 17 REST APIs with five endpoints"
```

---

## Push

```bash
git push origin main
```

---

## View History

```bash
git log --oneline -5
```

Should show the CH17 commit on top of CH16 and CH15.

---

# 🔍 Debugging Commands

## View All Endpoints Registered

The backend logs on startup which endpoints are mapped:

```text
Mapped "{GET}" onto public org.springframework.http.ResponseEntity com.cartwise.controller.ProductController.getAllProducts()
Mapped "{GET /api/products/{slug}}" onto ...
...
```

If an endpoint is missing, it won't be logged. Check the controller for typos in `@GetMapping`, `@PostMapping`, etc.

---

## Check for Serialization Errors

If DTOs don't serialize to JSON correctly, the logs show:

```text
ERROR ... Could not write JSON: (error message)
```

Check the DTO's getters/setters (for classes) or the record declaration (for records).

---

## View SQL Executed by Repositories

If `spring.jpa.show-sql: true` is set in application-dev.yml, the logs show all SQL:

```text
Hibernate: select ... from products where slug = ?
```

Useful for debugging incorrect queries.

---

# 📌 Command Summary

```bash
# Development
cd backend
mvn spring-boot:run

# Testing
curl http://localhost:8080/api/products
curl http://localhost:8080/api/products/iphone-16-pro
curl http://localhost:8080/api/users/1/wishlist
curl -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'
curl -X DELETE http://localhost:8080/api/users/1/wishlist/iphone-16-pro

# Verification
mvn clean verify

# Git
git add .
git commit -m "feat: implement Chapter 17 REST APIs with five endpoints"
git push origin main
```

---

# 🎯 Next Steps

After Chapter 17:

- Chapter 18 adds authentication: endpoints check JWT, users can only access their own data
- Chapter 19 adds filtering, sorting, pagination: query parameters on endpoints
- Chapter 20+ add more business logic: admin endpoints, recommendations, ratings, etc.

The five endpoints in Chapter 17 are the foundation. Everything else builds on them.
