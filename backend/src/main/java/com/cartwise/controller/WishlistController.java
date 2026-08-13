package com.cartwise.controller;

import com.cartwise.common.dto.AddToWishlistRequest;
import com.cartwise.common.dto.WishlistItemDto;
import com.cartwise.service.WishlistService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
 * <p>{@code userId} is trusted as given. Nothing verifies that the caller is that user, because
 * nothing yet establishes who the caller is; that arrives with authentication in Chapter 18.
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
     * <p>Always 200. An unknown user and a user who has saved nothing both return {@code []}; see
     * {@link WishlistService#getUserWishlist} for why that is not a 404.
     */
    @GetMapping
    public ResponseEntity<List<WishlistItemDto>> getWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }

    /**
     * {@code POST /api/users/{userId}/wishlist} — save a product.
     *
     * <p>201 when a row was created, 200 when the product was already saved. Both are successes:
     * the operation is idempotent, and the status is the only thing that distinguishes them, so a
     * client that does not care can ignore the difference and a client that does can report it.
     *
     * <p>404 if the user or the product does not exist, 400 if {@code productSlug} is missing or
     * blank, 409 if a concurrent request wins the race to insert the same pair.
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
            @PathVariable Long userId, @RequestBody AddToWishlistRequest request) {

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
     * looking at a stale list and would rather be told.
     */
    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long userId, @PathVariable String slug) {

        wishlistService.removeFromWishlist(userId, slug);
        return ResponseEntity.noContent().build();
    }
}
