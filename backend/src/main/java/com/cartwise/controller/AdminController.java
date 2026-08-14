package com.cartwise.controller;

import com.cartwise.common.dto.ChangeRoleRequest;
import com.cartwise.common.dto.UserDto;
import com.cartwise.service.UserAdminService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Administration: see every account, and change what any account is allowed to do.
 *
 * <p>Every route here is gated by a single line in {@code SecurityConfig} —
 * {@code .requestMatchers("/api/admin/**").hasRole("ADMIN")} — and the {@code /api/admin} prefix is
 * load-bearing rather than decorative. It means a route added to this class tomorrow is protected
 * before anyone remembers to protect it, and it means the entire admin access rule can be read in
 * one place instead of being reconstructed from annotations scattered across methods. The cost is
 * that these methods are safe only because of where they are mapped, which is why the mapping is
 * the first thing this comment says.
 *
 * <p><strong>These endpoints disclose things the rest of the API refuses to, and that is the
 * intended behaviour rather than an inconsistency.</strong> Two contrasts are worth naming, because
 * both look like bugs against the rules Chapter 18 established:
 *
 * <ul>
 *   <li>{@link #listUsers} returns every registered email address — precisely the user enumeration
 *       that {@code POST /api/auth/login} goes to the trouble of preventing, refusing to distinguish
 *       an unknown address from a wrong password. The difference is who is asking. Enumeration is a
 *       threat when anonymous callers can do it; an administrator is a party that is <em>supposed</em>
 *       to know the account list, and an admin console that could not show it would be useless.
 *   <li>{@link #changeRole} answers <strong>404</strong> for an id that does not exist, where the
 *       wishlist endpoints answer 403 for exactly the same case so that nobody can map which user
 *       ids are real. Again the caller decides it: an admin is entitled to know that user 999 does
 *       not exist, and telling them 403 instead would be a false statement about permission that
 *       leaves them unable to tell a typo from a genuine refusal.
 * </ul>
 *
 * <p>Both differences exist because {@code hasRole("ADMIN")} has already run. Neither would be
 * defensible one line above that check.
 *
 * <p>No {@code @AuthenticationPrincipal} in either signature, unlike {@code WishlistController}.
 * That controller needs to know <em>which</em> user is calling in order to compare against the URL;
 * here the answer is the same for every admin, so the identity is checked by the filter chain and
 * never consulted again. The visible consequence is that nothing records which admin made a change
 * — audit logging is deliberately deferred, and {@code UserAdminService} logs the change without an
 * actor rather than pretending to a trail it does not keep.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserAdminService userAdminService;

    public AdminController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    /**
     * {@code GET /api/admin/users} — every account, oldest first.
     *
     * <p>200 with a list of {@link UserDto}; {@code []} if there are somehow no accounts, which is
     * a successful answer to "who is registered" rather than a 404.
     *
     * <p>401 without a valid token, 403 with a valid {@code USER} token. The two are answered by
     * {@code ApiErrorSecurityHandler} inside the filter chain, so neither reaches this method and
     * both arrive in the client in the same {@link com.cartwise.common.exception.ApiError} shape as
     * every other CartWise error.
     *
     * <p>No password hashes in the response — see {@link UserDto}, where the omission is structural.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> listUsers() {
        return ResponseEntity.ok(userAdminService.listUsers());
    }

    /**
     * {@code PUT /api/admin/users/{userId}/role} — set what an account may do.
     *
     * <p>200 with the updated account. {@code PUT} rather than {@code PATCH} because the body
     * states the role's entire new value rather than describing an edit to it, and rather than
     * {@code POST} because the operation is idempotent: sending it twice leaves the same result, so
     * a client that retries after a timeout cannot cause a second, different change.
     *
     * <p>Status codes: 401 no token, 403 non-admin token, 400 a missing or unrecognised role, 404
     * no such user. The 400 for an unrecognised value is not handled here — {@link
     * ChangeRoleRequest} types the field as {@code Role}, so Jackson rejects {@code "SUPERUSER"}
     * during message conversion and Spring MVC's own handling produces the 400. Only the null case
     * needs code, because a missing field deserialises to a valid record with a null component.
     *
     * <p><strong>The change does not affect tokens already issued.</strong> A user demoted while
     * signed in keeps acting with their old role until their token expires, because verification is
     * stateless and consults no database — see {@link com.cartwise.security.AuthenticatedUser}. The
     * response therefore describes the account, not the sessions: it is accurate about what the
     * database now says and says nothing about when that will take effect, which is the honest
     * split. Making it immediate needs revocation, which this chapter does not have.
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserDto> changeRole(
            @PathVariable Long userId, @RequestBody ChangeRoleRequest request) {

        // Catches {"role": null} and a body with no role at all. Both produce a record whose
        // component is null, which Jackson is content with and which would otherwise reach the
        // entity and fail against a NOT NULL column as a 500 — a server error for what is plainly
        // a malformed request.
        if (request.role() == null) {
            throw new IllegalArgumentException("role is required and must be one of USER, ADMIN");
        }

        return ResponseEntity.ok(userAdminService.changeRole(userId, request.role()));
    }
}
