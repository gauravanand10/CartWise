# 💻 CH19 — Commands

> **Project:** CartWise  
> **Chapter:** Authorization & Roles

This file contains the commands used to develop, test, and verify CartWise's role-based authorization.

---

# 🚀 Backend Development

## Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on `localhost:8080`. Logs show all endpoints are registered, including /api/admin/users and /api/admin/users/{userId}/role.

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

# 🌱 Database Setup — Seeded ADMIN User

Before testing, seed the database with one ADMIN user.

## BCrypt Hash for "admin-password"

Generate the hash:

```bash
# Using an online BCrypt generator or a local tool
# For testing, use this pre-computed hash (cost 10):
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm
```

Or generate your own:

```java
// In a Java REPL or test:
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
String hash = encoder.encode("admin-password");
System.out.println(hash);
```

## Insert ADMIN User into Database

Connect to PostgreSQL and insert:

```bash
psql -U cartwise -d cartwise_dev
```

```sql
INSERT INTO users (email, password_hash, role, created_at, updated_at)
VALUES (
  'admin@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm',
  'ADMIN',
  NOW(),
  NOW()
);
```

Verify:

```sql
SELECT id, email, role FROM users WHERE email = 'admin@example.com';
```

Expected output:

```text
 id |       email        | role
----+--------------------+-------
  1 | admin@example.com  | ADMIN
```

---

# 🧪 Testing Endpoints with curl

All admin endpoints require the ADMIN role. Get an ADMIN token first by logging in as the seeded admin.

---

## POST /api/auth/login — Get ADMIN Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin-password"}'
```

### Expected Response (200 OK)

```json
{
  "userId": 1,
  "email": "admin@example.com",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTY5Mjk0MDAwMCwiZXhwIjoxNjkzMDI2NDAwfQ.signature"
}
```

Copy the token. Use it in subsequent admin requests.

---

## POST /api/auth/signup — Create a Regular User

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Secure1234!"}'
```

### Expected Response (201 Created)

```json
{
  "userId": 2,
  "email": "alice@example.com",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJhbGljZUBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNjkyOTQwMDAzLCJleHAiOjE2OTMwMjY0MDN9.signature"
}
```

Alice has the USER role (visible in the JWT payload).

---

## GET /api/admin/users — List All Users (Admin Only)

```bash
ADMINTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $ADMINTOKEN"
```

### Expected Response (200 OK)

```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "role": "ADMIN",
    "createdAt": "2025-08-10T14:32:18Z"
  },
  {
    "id": 2,
    "email": "alice@example.com",
    "role": "USER",
    "createdAt": "2025-08-10T14:35:00Z"
  }
]
```

---

## GET /api/admin/users — Non-Admin Attempts Access (403)

```bash
USERTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."  # token for alice (USER role)

curl -i http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $USERTOKEN"
```

### Expected Response (403 Forbidden)

```json
{
  "code": "FORBIDDEN",
  "message": "Access denied"
}
```

Spring Security rejects the request at the filter level.

---

## GET /api/admin/users — No Token (401)

```bash
curl -i http://localhost:8080/api/admin/users
```

### Expected Response (401 Unauthorized)

```json
{
  "code": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

---

## PUT /api/admin/users/{userId}/role — Promote User to Admin

```bash
ADMINTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."

curl -X PUT http://localhost:8080/api/admin/users/2/role \
  -H "Authorization: Bearer $ADMINTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

### Expected Response (200 OK)

```json
{
  "id": 2,
  "email": "alice@example.com",
  "role": "ADMIN",
  "createdAt": "2025-08-10T14:35:00Z"
}
```

Alice is now an ADMIN.

---

## PUT /api/admin/users/{userId}/role — Non-Admin Attempts Change (403)

```bash
USERTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."  # token for a USER

curl -i -X PUT http://localhost:8080/api/admin/users/1/role \
  -H "Authorization: Bearer $USERTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

### Expected Response (403 Forbidden)

```json
{
  "code": "FORBIDDEN",
  "message": "Access denied"
}
```

---

## PUT /api/admin/users/{userId}/role — Invalid Role (400)

```bash
ADMINTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."

curl -i -X PUT http://localhost:8080/api/admin/users/2/role \
  -H "Authorization: Bearer $ADMINTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"SUPERUSER"}'
```

### Expected Response (400 Bad Request)

```json
{
  "code": "INVALID_INPUT",
  "message": "Invalid role: SUPERUSER"
}
```

Only USER and ADMIN are valid.

---

## PUT /api/admin/users/{userId}/role — User Not Found (404)

```bash
ADMINTOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."

curl -i -X PUT http://localhost:8080/api/admin/users/999/role \
  -H "Authorization: Bearer $ADMINTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

### Expected Response (404 Not Found)

```json
{
  "code": "NOT_FOUND",
  "message": "User not found"
}
```

---

# 🧬 Decoding JWT Tokens to Verify Role Claim

After getting a token, decode it to see the role claim:

```bash
TOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6IlVTRVIifQ.signature"

# Extract the payload (middle part, between the two dots)
PAYLOAD=$(echo $TOKEN | cut -d'.' -f2)

# Decode from Base64
echo $PAYLOAD | base64 -d | jq .
```

### Expected Output (for a USER)

```json
{
  "sub": "2",
  "email": "alice@example.com",
  "role": "USER",
  "iat": 1692940000,
  "exp": 1693026400
}
```

### Expected Output (for an ADMIN)

```json
{
  "sub": "1",
  "email": "admin@example.com",
  "role": "ADMIN",
  "iat": 1692940000,
  "exp": 1693026400
}
```

---

# 🌐 Testing from Browser Console (fetch)

With both frontend and backend running, open the frontend page and use the browser console:

## Login as Admin

```javascript
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin-password'
  })
})
  .then(r => r.json())
  .then(d => {
    console.log(d);
    localStorage.setItem('authToken', d.token);
  })
```

### Expected

Token logged to console and stored in localStorage. You can now call admin endpoints.

---

## List All Users

```javascript
const token = localStorage.getItem('authToken');
fetch('http://localhost:8080/api/admin/users', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log(d))
```

### Expected

Array of all users logged to console.

---

## Attempt to List Users as Regular User

```javascript
// First, log in as a regular user
fetch('http://localhost:8080/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'bob@example.com',
    password: 'Secure1234!'
  })
})
  .then(r => r.json())
  .then(d => {
    localStorage.setItem('authToken', d.token);
  });

// Now try to list users
const token = localStorage.getItem('authToken');
fetch('http://localhost:8080/api/admin/users', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log(d))
```

### Expected

Status: 403, error message: "Access denied".

---

## Promote a User to Admin

```javascript
const token = localStorage.getItem('authToken');  // admin token
fetch('http://localhost:8080/api/admin/users/3/role', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ role: 'ADMIN' })
})
  .then(r => r.json())
  .then(d => console.log(d))
```

### Expected

Updated user object with role: "ADMIN".

---

# 📋 Verification Checklist

Run through this sequence to confirm Chapter 19 is complete:

## 1. Backend Compiles

```bash
cd backend
mvn clean compile
```

**Verify:**
- No compilation errors
- Role enum, User entity, AdminUserController all compile

---

## 2. Backend Boots

```bash
mvn spring-boot:run
```

**Verify:**
- Server starts on port 8080
- No exceptions in logs

---

## 3. Database Has ADMIN User

```bash
psql -U cartwise -d cartwise_dev -c "SELECT id, email, role FROM users;"
```

**Verify:**
- At least one ADMIN user exists (admin@example.com)

---

## 4. Admin Login Works

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin-password"}'
```

**Verify:**
- Status code 200
- Response includes token
- Token payload includes "role": "ADMIN"

---

## 5. Regular Signup Works

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secure1234!"}'
```

**Verify:**
- Status code 201
- Response includes token
- Token payload includes "role": "USER"

---

## 6. Admin Can List Users

```bash
ADMINTOKEN="..."
curl http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $ADMINTOKEN"
```

**Verify:**
- Status code 200
- Response is a JSON array of users

---

## 7. Regular User Cannot List Users

```bash
USERTOKEN="..."
curl -i http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $USERTOKEN"
```

**Verify:**
- Status code 403
- Message: "Access denied"

---

## 8. Admin Can Change Roles

```bash
ADMINTOKEN="..."
curl -X PUT http://localhost:8080/api/admin/users/2/role \
  -H "Authorization: Bearer $ADMINTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

**Verify:**
- Status code 200
- Updated user has role: "ADMIN"

---

## 9. Regular User Cannot Change Roles

```bash
USERTOKEN="..."
curl -i -X PUT http://localhost:8080/api/admin/users/3/role \
  -H "Authorization: Bearer $USERTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

**Verify:**
- Status code 403
- Access denied

---

## 10. All Chapter 17–18 Endpoints Still Work (No Regression)

```bash
# Get products (no auth)
curl http://localhost:8080/api/products

# Get wishlist (with token)
USERTOKEN="..."
curl http://localhost:8080/api/users/2/wishlist \
  -H "Authorization: Bearer $USERTOKEN"

# Add to wishlist (with token)
curl -X POST http://localhost:8080/api/users/2/wishlist \
  -H "Authorization: Bearer $USERTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"iphone-16-pro"}'
```

**Verify:**
- All endpoints return expected responses
- No 403 errors for non-admin operations

---

# 🌿 Git Commands

## Check Status

```bash
git status
```

Should show backend changes (Role enum, User entity updated, AdminUserController) and docs/CH19_Authorization_Roles/.

---

## Stage Changes

```bash
git add .
```

---

## Commit

```bash
git commit -m "feat: implement Chapter 19 authorization with role-based access control"
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

Should show the CH19 commit on top of CH18, CH17, CH16, and CH15.

---

# 🔍 Debugging Commands

## Check User Roles in Database

```bash
psql -U cartwise -d cartwise_dev -c "SELECT id, email, role FROM users;"
```

Shows all users and their roles.

---

## Check Role Claim in Token

```bash
TOKEN="eyJh..."
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq .
```

Displays the JWT payload, including the role claim.

---

## Manually Test Authorization at the Filter Level

```bash
# Create two users: one USER, one ADMIN
# Get their tokens
# Try both tokens on /api/admin/users
# USER token: 403
# ADMIN token: 200
```

This confirms Spring Security's filter-level authorization is working.

---

## Check Database Constraints

```bash
psql -U cartwise -d cartwise_dev -c "\d users"
```

Shows the users table schema, including the role column (should be text, not null).

---

# 📌 Command Summary

```bash
# Development
cd backend
mvn spring-boot:run

# Get ADMIN token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin-password"}'

# List users (admin only)
ADMINTOKEN="..."
curl http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $ADMINTOKEN"

# Change user role (admin only)
curl -X PUT http://localhost:8080/api/admin/users/2/role \
  -H "Authorization: Bearer $ADMINTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'

# Verify token payload
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq .

# Git
git add .
git commit -m "feat: implement Chapter 19 authorization with role-based access control"
git push origin main
```

---

# 🎯 Next Steps

After Chapter 19:

- Chapter 20 adds fine-grained permissions: what specific actions can each role perform?
- Chapter 20+ adds audit logging: who changed what, when, and why?
- Chapter 20+ adds token revocation: immediately invalidate tokens when a user's role changes
- Chapter 21+ adds rate limiting and other security hardening

CartWise now has a multi-tier authorization system.
