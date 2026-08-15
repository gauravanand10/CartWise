# 💻 CH18 — Commands

> **Project:** CartWise  
> **Chapter:** Authentication & Authorization

This file contains the commands used to develop, test, and verify CartWise's authentication and authorization endpoints.

---

# 🚀 Backend Development

## Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on `localhost:8080`. Logs show all endpoints are registered, including /api/auth/signup and /api/auth/login.

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

Each endpoint can be tested with curl. Run these commands while the backend is running.

---

## POST /api/auth/signup — Valid Input

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Secure1234!"}'
```

### Expected Response (201 Created)

```json
{
  "userId": 1,
  "email": "alice@example.com",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhbGljZUBleGFtcGxlLmNvbSIsImlhdCI6MTY5Mjk0MDAwMCwiZXhwIjoxNjkyOTQwMzYwMH0.signature"
}
```

---

## POST /api/auth/signup — Duplicate Email

```bash
curl -i -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Different!"}'
```

### Expected Response (409 Conflict)

```json
{
  "code": "EMAIL_ALREADY_REGISTERED",
  "message": "Email already registered"
}
```

---

## POST /api/auth/signup — Password Too Short

```bash
curl -i -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"short"}'
```

### Expected Response (400 Bad Request)

```json
{
  "code": "INVALID_INPUT",
  "message": "Password must be between 8 and 72 characters"
}
```

---

## POST /api/auth/signup — Invalid Email Format

```bash
curl -i -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"Secure1234!"}'
```

### Expected Response (400 Bad Request)

```json
{
  "code": "INVALID_INPUT",
  "message": "Invalid email format"
}
```

---

## POST /api/auth/login — Correct Password

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Secure1234!"}'
```

### Expected Response (200 OK)

```json
{
  "userId": 1,
  "email": "alice@example.com",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
}
```

---

## POST /api/auth/login — Wrong Password

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"WrongPassword"}'
```

### Expected Response (401 Unauthorized)

```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

---

## POST /api/auth/login — Unknown Email

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"unknown@example.com","password":"Secure1234!"}'
```

### Expected Response (401 Unauthorized)

```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

**Notice:** Same message as wrong password. An attacker cannot tell if the email is registered.

---

## GET /api/users/{userId}/wishlist — Without Token

```bash
curl http://localhost:8080/api/users/1/wishlist
```

### Expected Response (401 Unauthorized)

```json
{
  "code": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

---

## GET /api/users/{userId}/wishlist — With Token

First, get a token from signup or login, then:

```bash
USERTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:8080/api/users/1/wishlist \
  -H "Authorization: Bearer $USERTOKEN"
```

### Expected Response (200 OK)

```json
[]
```

(empty if no products have been saved to wishlist yet)

---

## GET /api/users/{userId}/wishlist — Different User's Wishlist

```bash
USERTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."  # token for user 1

curl -i http://localhost:8080/api/users/2/wishlist \
  -H "Authorization: Bearer $USERTOKEN"
```

### Expected Response (403 Forbidden)

```json
{
  "code": "FORBIDDEN",
  "message": "Access denied"
}
```

**Notice:** Status is 403, not 404. The endpoint doesn't reveal whether user 2 exists.

---

## GET /api/users/{userId}/wishlist — Tampered Token

```bash
# Modify the token: change the signature or payload
TAMPERED_TOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.MODIFIED_PAYLOAD.MODIFIED_SIGNATURE"

curl -i http://localhost:8080/api/users/1/wishlist \
  -H "Authorization: Bearer $TAMPERED_TOKEN"
```

### Expected Response (401 Unauthorized)

```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

The signature validation fails.

---

## POST /api/users/{userId}/wishlist — With Token

```bash
USERTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."  # token for user 1

curl -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Authorization: Bearer $USERTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'
```

### Expected Response (201 Created)

```text
(empty body, status code only)
```

---

## POST /api/users/{userId}/wishlist — Different User

```bash
USERTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."  # token for user 1

curl -i -X POST http://localhost:8080/api/users/2/wishlist \
  -H "Authorization: Bearer $USERTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'
```

### Expected Response (403 Forbidden)

```json
{
  "code": "FORBIDDEN",
  "message": "Access denied"
}
```

---

## DELETE /api/users/{userId}/wishlist/{slug} — With Token

```bash
USERTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."  # token for user 1

curl -X DELETE http://localhost:8080/api/users/1/wishlist/iphone-16-pro \
  -H "Authorization: Bearer $USERTOKEN"
```

### Expected Response (204 No Content)

```text
(empty body, status code only)
```

---

## GET /api/products — Without Token (Still Open)

```bash
curl http://localhost:8080/api/products
```

### Expected Response (200 OK)

```json
[
  { "id": 1, "slug": "iphone-16-pro", "name": "iPhone 16 Pro", ... },
  // ... more products
]
```

Public endpoints don't require a token.

---

# 🌐 Testing from Browser Console (fetch)

With both frontend (`npm run dev`) and backend running, open the frontend page and use the browser console:

## Signup

```javascript
fetch('http://localhost:8080/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'charlie@example.com',
    password: 'Secure1234!'
  })
})
  .then(r => r.json())
  .then(d => {
    console.log(d);
    localStorage.setItem('authToken', d.token);
  })
```

### Expected

Token logged to console and stored in localStorage.

---

## Login with Token

```javascript
const token = localStorage.getItem('authToken');
fetch('http://localhost:8080/api/users/1/wishlist', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log(d))
```

### Expected

Wishlist array logged to console (empty if no items saved yet).

---

## Try Without Token

```javascript
fetch('http://localhost:8080/api/users/1/wishlist')
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log(d))
```

### Expected

Status: 401, error message: "Authentication required".

---

## Add to Wishlist with Token

```javascript
const token = localStorage.getItem('authToken');
fetch('http://localhost:8080/api/users/1/wishlist', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ productSlug: 'iphone-16-pro' })
})
  .then(r => console.log('Status:', r.status))
```

### Expected

Status: 201 (created).

---

## Logout

```javascript
localStorage.removeItem('authToken');
console.log('Logged out');
```

### Expected

Token removed from localStorage. Next API request will return 401.

---

# 📋 Verification Checklist

Run through this sequence to confirm Chapter 18 is complete:

## 1. Backend Compiles

```bash
cd backend
mvn clean compile
```

**Verify:**
- No compilation errors
- All classes (User, JwtTokenProvider, AuthController, SecurityConfig) compile

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

## 3. Signup Works

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secure1234!"}'
```

**Verify:**
- Status code 201
- Response includes token

---

## 4. Login Works

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secure1234!"}'
```

**Verify:**
- Status code 200
- Response includes token (same user ID as signup)

---

## 5. Protected Endpoints Require Token

```bash
curl http://localhost:8080/api/users/1/wishlist
```

**Verify:**
- Status code 401
- Message: "Authentication required"

---

## 6. Protected Endpoints Accept Token

```bash
TOKEN="..."  # from signup/login
curl http://localhost:8080/api/users/1/wishlist \
  -H "Authorization: Bearer $TOKEN"
```

**Verify:**
- Status code 200
- Returns wishlist (empty array if no items)

---

## 7. Duplicate Email Prevention

```bash
curl -i -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Different!"}'
```

**Verify:**
- Status code 409
- Message: "Email already registered"

---

## 8. Per-User Authorization

```bash
TOKEN1="..."  # token for user 1
curl -i http://localhost:8080/api/users/2/wishlist \
  -H "Authorization: Bearer $TOKEN1"
```

**Verify:**
- Status code 403 (not 404)
- Cannot enumerate user IDs

---

## 9. Public Endpoints Still Open

```bash
curl http://localhost:8080/api/products
```

**Verify:**
- Status code 200
- Returns product list (no token required)

---

## 10. /api/health Still Works (No Regression)

```bash
curl http://localhost:8080/api/health
```

**Verify:**
- Status code 200
- Response: `{"status":"UP",...}`

---

# 🌿 Git Commands

## Check Status

```bash
git status
```

Should show backend changes (User, JwtTokenProvider, AuthController, SecurityConfig) and docs/CH18_Authentication_Authorization/.

---

## Stage Changes

```bash
git add .
```

---

## Commit

```bash
git commit -m "feat: implement Chapter 18 authentication with JWT and per-user authorization"
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

Should show the CH18 commit on top of CH17, CH16, and CH15.

---

# 🔍 Debugging Commands

## View User Table

```bash
psql -U postgres -d cartwise_dev -c "SELECT id, email, created_at FROM users;"
```

Confirms users are being saved to the database.

---

## Decode a JWT Token

```bash
# Copy the token from signup/login response
TOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...."

# Extract the payload (middle part)
PAYLOAD=$(echo $TOKEN | cut -d'.' -f2)

# Decode (Base64)
echo $PAYLOAD | base64 -d | jq .
```

Shows the claims inside the token (userId, email, expiration).

---

## Check If Token Is Expired

```javascript
// In browser console
const token = localStorage.getItem('authToken');
const payload = JSON.parse(atob(token.split('.')[1]));
const exp = new Date(payload.exp * 1000);
console.log('Token expires at:', exp);
console.log('Expired?', new Date() > exp);
```

Shows token expiration time.

---

## Manually Test Authorization

```bash
TOKEN1="..."  # token for user 1
TOKEN2="..."  # token for user 2

# User 1 adds to their own wishlist (should work)
curl -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'

# User 2 tries to add to user 1's wishlist (should fail)
curl -i -X POST http://localhost:8080/api/users/1/wishlist \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"galaxy-s25-ultra"}'
```

First returns 201, second returns 403.

---

# 📌 Command Summary

```bash
# Development
cd backend
mvn spring-boot:run

# Testing signup/login
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secure1234!"}'

# Testing protected endpoints
TOKEN="..."
curl http://localhost:8080/api/users/1/wishlist \
  -H "Authorization: Bearer $TOKEN"

# Verification
mvn clean verify

# Git
git add .
git commit -m "feat: implement Chapter 18 authentication with JWT and per-user authorization"
git push origin main
```

---

# 🎯 Next Steps

After Chapter 18:

- Chapter 19 adds authorization: roles, permissions, admin endpoints
- Chapter 20+ adds email verification, password reset, OAuth
- Chapter 21+ adds rate limiting, refresh tokens, two-factor authentication

CartWise is now a secure, multi-user system.
