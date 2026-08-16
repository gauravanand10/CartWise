# 📖 CH19 — Glossary

> **Project:** CartWise  
> **Chapter:** Authorization & Roles

This glossary explains the important terms and concepts introduced while adding role-based authorization to CartWise.

---

# 👥 Authorization

Authorization is deciding what an authenticated user is allowed to do.

Once you've proven who you are (authentication), authorization answers: "what resources can you access? What actions can you perform?"

---

# 👤 Role

A role is a label for a category of users with specific permissions.

CartWise has two roles: USER (regular users) and ADMIN (system administrators).

A role groups related permissions together, so instead of granting 50 individual permissions per user, you grant one role.

---

# 👨‍💼 Admin

An admin is a user with elevated privileges.

In CartWise, an ADMIN role can list and modify users, manage system settings, and in future chapters, manage products and enforce policies.

---

# 👤 User Role

The USER role is the default role for any user who signs up.

A USER can manage their own data (wishlist, profile) but cannot see other users' data or access admin endpoints.

---

# 🛡️ Role-Based Access Control (RBAC)

RBAC is an authorization model where access decisions are based on a user's assigned role.

```text
User → has role → role has permissions → endpoint checks role → allow or deny
```

CartWise uses RBAC: every endpoint checks if the user's role permits the action.

---

# 🔑 Permission

A permission is an action a user is allowed to perform.

Examples: read_wishlist, delete_wishlist, list_users, change_user_role.

CartWise Chapter 19 doesn't have granular permissions (yet) — it uses roles as a simple proxy. Chapter 20+ may introduce fine-grained permissions.

---

# 📋 Role-Based Access Control vs. Permission-Based Access Control

```text
RBAC (Chapter 19):  User has role → role has permissions
                    Simple, coarse-grained, easy to understand

PBAC (Chapter 20+): User has specific permissions (not grouped by role)
                    Complex, fine-grained, powerful
                    Example: User A can delete products, but User B cannot
```

CartWise starts with RBAC (roles). If finer control is needed, Chapter 20+ will move toward PBAC.

---

# 🏷️ Claim (JWT)

A claim is a statement in a JWT payload about the authenticated user.

```json
{
  "sub": "5",              // claim: subject is user 5
  "email": "alice@...",    // claim: email is this
  "role": "ADMIN"          // claim: role is ADMIN
}
```

The role claim travels in the token. The backend reads it to make authorization decisions.

---

# 🎟️ Role Claim (JWT)

The role claim is the part of the JWT that states which role the user has.

When the token is validated, the role is extracted and checked against endpoint requirements.

---

# 🔐 hasRole()

`hasRole()` is a Spring Security method that checks if the authenticated user has a specific role.

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

This tells Spring Security: "for /api/admin/**, require the user to have the ADMIN role."

---

# 🚪 Endpoint Authorization

Endpoint authorization is checking roles/permissions before allowing a request to reach the controller.

In Spring Security, this happens in the filter chain before the request is dispatched to the controller.

---

# 🔄 Filter-Level Authorization

Filter-level authorization checks the user's role in the servlet filter chain, before the request reaches the controller.

```text
Request
  ↓
Spring Security Filter
  ↓
Check: does user have ADMIN role?
  ↓
  Yes: proceed to controller
  No: return 403 Forbidden (never reach controller)
  ↓
Controller (only reached if authorized)
```

This is more secure than controller-level checks because it's centralized and harder to bypass.

---

# 🎯 Controller-Level Authorization

Controller-level authorization checks the user's role inside the controller method.

```java
@GetMapping
public ResponseEntity<List<UserDto>> listUsers(
    @AuthenticationPrincipal AuthenticatedUser user
) {
    if (!user.role().equals(Role.ADMIN)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    // ...
}
```

CartWise uses filter-level (Spring Security) as the primary check, so controller-level is redundant but can be added for extra safety.

---

# 👨‍💼 Role Hierarchy

Role hierarchy is when one role inherits permissions from another.

```text
ADMIN → inherits all USER permissions + admin-specific permissions
USER  → base-level permissions
```

CartWise Chapter 19 doesn't have this. An ADMIN role is separate from USER. Chapter 20+ might introduce it.

---

# 🔑 Spring Security

Spring Security is a framework that handles authentication and authorization.

It intercepts requests, checks authentication (JWT token), checks authorization (role/permission), and decides whether to allow the request.

---

# 📏 Enum (Java)

An Enum is a type that holds a fixed set of possible values.

```java
public enum Role {
    USER("USER"),
    ADMIN("ADMIN");
}
```

Java ensures only these two values exist. Trying to create `Role.SUPERUSER` fails at compile time.

---

# @Enumerated

`@Enumerated` is a JPA annotation that tells Hibernate how to store an enum in the database.

```java
@Enumerated(EnumType.STRING)
private Role role;
```

`EnumType.STRING` stores the enum name as a string ("USER", "ADMIN"). The alternative, `EnumType.ORDINAL`, stores the ordinal position (0, 1), which is fragile.

---

# 💾 Database Role Storage

The database stores roles as strings in the `role` column:

```text
user_id | email | role
--------|-------|-------
1       | alice | ADMIN
2       | bob   | USER
3       | carol | USER
```

Java maps these strings to the Role enum automatically via `@Enumerated`.

---

# 🔐 Seeded Data

Seeded data is sample data inserted into the database for development and testing.

CartWise is seeded with one ADMIN user:
- Email: admin@example.com
- Password: admin-password
- Role: ADMIN

This allows testing admin endpoints without needing a way to self-promote.

---

# 📋 UserDto

UserDto is a Data Transfer Object for user information.

```java
public record UserDto(
    Long id,
    String email,
    Role role,
    Instant createdAt
) {}
```

Used in responses from admin endpoints. Does not include passwordHash (secrets never in DTOs).

---

# 🔄 ChangeRoleRequest

ChangeRoleRequest is a DTO for the PUT endpoint that changes a user's role.

```java
public record ChangeRoleRequest(Role role) {}
```

The request body specifies which role to assign.

---

# 🚫 403 Forbidden (Authorization)

HTTP 403 Forbidden means the user is authenticated but not authorized for this resource.

```bash
GET /api/admin/users
Authorization: Bearer <user-token>
```

The token is valid (user is authenticated). But the user's role is not ADMIN, so Spring Security returns 403 (access denied).

---

# 🔍 401 Unauthorized (Authentication)

HTTP 401 Unauthorized means the user is not authenticated.

```bash
GET /api/admin/users
(no Authorization header)
```

No token or invalid token → 401 (who are you?).

---

# 🔐 Privilege Escalation

Privilege escalation is when a user gains higher-level permissions they shouldn't have.

CartWise prevents this: a USER cannot self-assign the ADMIN role. Only an existing ADMIN can promote someone.

---

# 🎯 Least Privilege

Least privilege is the principle that users should have only the minimum permissions needed for their role.

CartWise uses this: a USER has no admin permissions, an ADMIN has no restrictions (though in future, we might limit admin to specific areas).

---

# 🔄 Token Invalidation (Role Change)

When a user's role changes, their existing token still has the old role.

The old token remains valid until it expires (24 hours later). After expiration, a re-login gets a new token with the updated role.

This is why Chapter 20+ should add refresh tokens or token revocation — to immediately invalidate old tokens on role change.

---

# 📊 Access Control List (ACL)

An ACL is a list of rules specifying which users/roles have access to a resource.

Spring Security's configuration is a form of ACL:
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers("/api/users/{userId}/wishlist").authenticated()
.requestMatchers("/api/products").permitAll()
```

---

# 🎭 Delegation

Delegation is allowing one role to perform actions on behalf of another role.

CartWise's ADMIN can change a USER's role, which is a form of delegation (the admin acts for the system).

---

# 🔐 Defense in Depth

Defense in depth is using multiple layers of security checks.

CartWise uses:
1. Filter-level authorization (Spring Security)
2. Controller-level validation (extra checks)
3. Database constraints (unique emails, not-null roles)

If one layer is bypassed, others still protect the system.

---

# 📋 Centralized Authorization

Centralized authorization means authorization rules are defined in one place (not scattered across controllers).

CartWise defines all role requirements in SecurityConfig, making it easy to audit and change access rules.

---

# 🔄 Dynamic Role Assignment

Dynamic role assignment is changing roles at runtime (not hardcoded).

CartWise stores roles in the database and JWT tokens, so roles can be changed without restarting the server.

---

# 🎯 Role-Based Endpoint Design

Endpoints are grouped by authorization level:

```text
/api/auth/**        → public (no token required)
/api/products       → public (no token required)
/api/users/{id}/... → protected (any authenticated user)
/api/admin/**       → admin-only (ADMIN role required)
```

This makes it clear which endpoints need which authorization.

---

# 📊 Role Distribution

Role distribution is how many users have each role.

In a healthy system, most users are regular users (USER role), a small number are admins (ADMIN role).

CartWise doesn't enforce this yet, but Chapter 20+ might add limits (e.g., at most 5 admins).

---

# 🔐 Cross-Role Communication

Cross-role communication is when different roles need to work together.

An ADMIN promoting a USER is cross-role communication. The admin (ADMIN role) modifies the user's role (USER role).

---

# 🎯 Role-Scoped Queries

Role-scoped queries are database queries that return different data based on the user's role.

CartWise doesn't have this yet. An ADMIN sees all users; a USER sees no one. Chapter 20+ might add "company-scoped" access where users see other users in their company.

---

# 📈 Audit Trail

An audit trail is a log of who did what and when.

CartWise doesn't have audit logging yet. Chapter 20+ will add: "admin@example.com promoted bob@example.com to ADMIN on 2025-08-10 at 14:32:18Z."

---

# 🔐 Token Revocation

Token revocation is invalidating a token before it expires.

CartWise doesn't support this yet. If a user's role changes or they're locked out, their old token is still valid until expiration. Chapter 20+ will add revocation.

---

# 🎭 Superuser Model

Superuser model is where one role (ADMIN/superuser) has unrestricted access.

CartWise uses the superuser model: ADMIN can do anything. Chapter 20+ might add granular permissions instead (ADMIN can only manage products, moderators can manage users, etc.).
