package com.cartwise.controller;

import com.cartwise.common.dto.AddToWishlistRequest;
import com.cartwise.common.dto.WishlistItemDto;
import com.cartwise.security.AuthenticatedUser;
import com.cartwise.service.WishlistService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * A user's wishlist over HTTP.
 *
 * <p>Nested under {@code /api/users/{userId}} because a wishlist has no existence apart from its
 * owner — there is no such thing as "the wishlist", only "this user's wishlist". The URL says so,
 * which means no request can accidentally omit the user.
 *
 * <p>No {@code PUT}. Replacing a whole wishlist in one call is not an operation the frontend
 * performs: the UI is a toggle per product, so add and remove are the two verbs that exist. A
 * bulk-replace endpoint would be a route with no caller.
 *
 * <p><strong>Chapter 18 closes the hole this class documented in Chapter 17.</strong> {@code userId}
 * used to be trusted as given, which meant anyone could read or edit anyone's wishlist by changing a
 * number in the URL. Two separate checks now stand between a request and this data, and they answer
 * different questions:
 *
 * <ul>
 *   <li>{@code SecurityConfig} asks <em>who are you?</em> — no valid token, no entry, 401.
 *   <li>{@link #requireSelf} asks <em>is this yours?</em> — a valid token for a different user, 403.
 * </ul>
 *
 * <p>The second check cannot be delegated to the security configuration, because whether a resource
 * belongs to the caller is a fact about the URL's meaning rather than about the URL's shape. It is
 * also the reason the id stays in the path at all: {@code /api/users/me/wishlist} would make the
 * check unnecessary by construction, and is the better design, but it would change the five endpoint
 * paths Chapter 17 published and tested. Keeping the paths and enforcing ownership is the honest
 * version of this chapter's scope.
 */
@RestController
@RequestMapping("/api/users/{userId}/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    /**
     * {@code GET /api/users/{userId}/wishlist} — saved products, newest first.
     *
     * <p>200 for your own wishlist, 401 without a valid token, 403 for anyone else's.
     *
     * <p>Chapter 17's note that an unknown user returns {@code []} is now unreachable in practice:
     * the only id that passes {@link #requireSelf} is the one in the caller's own token, and that
     * account exists. The service still behaves that way, and still should — it is a service, and
     * "no rows" remains the right answer to a query that matches none.
     */
    @GetMapping
    public ResponseEntity<List<WishlistItemDto>> getWishlist(
            @PathVariable Long userId, @AuthenticationPrincipal AuthenticatedUser principal) {

        requireSelf(principal, userId);

        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }

    /**
     * {@code POST /api/users/{userId}/wishlist} — save a product.
     *
     * <p>201 when a row was created, 200 when the product was already saved. Both are successes:
     * the operation is idempotent, and the status is the only thing that distinguishes them, so a
     * client that does not care can ignore the difference and a client that does can report it.
     *
     * <p>401 without a valid token, 403 when saving to someone else's wishlist. 404 if the user or
     * the product does not exist, 400 if {@code productSlug} is missing or blank, 409 if a
     * concurrent request wins the race to insert the same pair.
     *
     * <p>The validation is done here rather than in the service because it is a statement about the
     * request, not about the wishlist: an absent field is a malformed message. Whether the slug
     * names a real product is the service's question, and it answers it with a 404 instead.
     * {@code @Valid} and Bean Validation annotations would express this more declaratively and are
     * the right move once there is more than one rule; one {@code if} does not yet justify a
     * dependency.
     */
    @PostMapping
    public ResponseEntity<Void> addToWishlist(
            @PathVariable Long userId,
            @RequestBody AddToWishlistRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        requireSelf(principal, userId);

        if (request.productSlug() == null || request.productSlug().isBlank()) {
            throw new IllegalArgumentException("productSlug is required and cannot be blank");
        }

        boolean created = wishlistService.addToWishlist(userId, request.productSlug().trim());

        return ResponseEntity.status(created ? HttpStatus.CREATED : HttpStatus.OK).build();
    }

    /**
     * {@code DELETE /api/users/{userId}/wishlist/{slug}} — unsave a product.
     *
     * <p>204 on success: the removal succeeded and there is nothing to return, which is exactly
     * what "No Content" means. 404 if this user had not saved this product — unlike adding,
     * removing is not idempotent, because a remove that hits nothing usually means the client is
     * looking at a stale list and would rather be told. 401 without a valid token, 403 against
     * someone else's wishlist.
     *
     * <p>The ownership check runs before the lookup, so the 404 can only ever describe the caller's
     * own wishlist. Checking in the other order would let anyone probe whether a stranger had saved
     * a given product by comparing 404 against 403.
     */
    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable String slug,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        requireSelf(principal, userId);

        wishlistService.removeFromWishlist(userId, slug);
        return ResponseEntity.noContent().build();
    }

    /**
     * Refuses the request unless the authenticated caller is the user named in the path.
     *
     * <p>The comparison is between the id inside the verified token and the id in the URL. The token
     * cannot be edited without invalidating its signature, so the caller controls only one of the
     * two values — which is precisely what makes the check meaningful.
     *
     * <p>Throws rather than returning a 403 {@code ResponseEntity}, so all three endpoints fail
     * identically and through the same path as every other error in CartWise: the exception handler
     * turns it into the standard {@link com.cartwise.common.exception.ApiError} body, where an
     * inline {@code ResponseEntity.status(FORBIDDEN).build()} would return an empty one.
     *
     * <p>The null check is defence in depth. {@code SecurityConfig} already answers 401 before an
     * unauthenticated request reaches any method here, so a null principal should be impossible —
     * but "impossible" here depends on a rule in another file, and the failure mode if that rule is
     * ever loosened would be silent unauthenticated access rather than a visible error.
     */
    private void requireSelf(AuthenticatedUser principal, Long userId) {
        if (principal == null || !principal.id().equals(userId)) {
            throw new AccessDeniedException("Wishlist belongs to another user");
        }
    }
}
