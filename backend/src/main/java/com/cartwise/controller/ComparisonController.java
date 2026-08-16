package com.cartwise.controller;

import com.cartwise.common.dto.AddToComparisonRequest;
import com.cartwise.common.dto.ComparisonItemDto;
import com.cartwise.security.AuthenticatedUser;
import com.cartwise.service.ComparisonService;
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
 * A user's product comparison over HTTP.
 *
 * <p>New in Chapter 23. The table, the entity and a read query have existed since Chapters 16 and
 * 17; nothing ever exposed them, so the comparison lived entirely in the browser's localStorage
 * while an empty {@code comparisons} table sat beside the wishlist that did not.
 *
 * <p><strong>Nested under {@code /api/users/{userId}} to match {@link WishlistController}.</strong>
 * A comparison has no existence apart from its owner, the URL says so, and every request therefore
 * has to name the user rather than being able to omit it. The path shape is copied from the
 * wishlist deliberately: a client that has learned one of these resources should not have to learn a
 * second convention for the other.
 *
 * <p>Two checks stand between a request and this data, and they answer different questions —
 * {@code SecurityConfig}'s {@code anyRequest().authenticated()} asks <em>who are you?</em> and
 * answers 401; {@link #requireSelf} asks <em>is this yours?</em> and answers 403. The second cannot
 * be delegated to the security configuration, because whether a resource belongs to the caller is a
 * fact about the URL's meaning rather than its shape.
 *
 * <p>The independence from the wishlist is structural rather than promised. Different table,
 * different repository, different service, different endpoints — there is no code path on which
 * removing a wishlist entry can reach a comparison row.
 */
@RestController
@RequestMapping("/api/users/{userId}/comparison")
public class ComparisonController {

    private final ComparisonService comparisonService;

    public ComparisonController(ComparisonService comparisonService) {
        this.comparisonService = comparisonService;
    }

    /**
     * {@code GET /api/users/{userId}/comparison} — compared products, in column order.
     *
     * <p>200 for your own comparison, 401 without a valid token, 403 for anyone else's. An empty
     * comparison is {@code []} and a 200, not a 404: having compared nothing is a state, not a
     * missing resource.
     */
    @GetMapping
    public ResponseEntity<List<ComparisonItemDto>> getComparison(
            @PathVariable Long userId, @AuthenticationPrincipal AuthenticatedUser principal) {

        requireSelf(principal, userId);

        return ResponseEntity.ok(comparisonService.getUserComparison(userId));
    }

    /**
     * {@code POST /api/users/{userId}/comparison} — add a product to the comparison.
     *
     * <p>201 when a column was created, 200 when the product was already being compared. Both are
     * successes: the operation is idempotent and the status is the only thing separating them, so a
     * client that does not care can ignore the difference and one that does can report it.
     *
     * <p>401 without a valid token, 403 against someone else's comparison. 404 if the user or the
     * product does not exist, 400 if {@code productSlug} is missing or blank, and <strong>409 when
     * the comparison is already full</strong> — the request was well-formed and permitted, and what
     * refused it was the state of the resource, which is what 409 means. 409 is also what a
     * concurrent insert of the same pair produces, via the unique constraint.
     *
     * <p>The blank-slug check lives here rather than in the service because it is a statement about
     * the request: an absent field is a malformed message. Whether the slug names a real product is
     * the service's question, answered with a 404.
     */
    @PostMapping
    public ResponseEntity<Void> addToComparison(
            @PathVariable Long userId,
            @RequestBody AddToComparisonRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        requireSelf(principal, userId);

        if (request.productSlug() == null || request.productSlug().isBlank()) {
            throw new IllegalArgumentException("productSlug is required and cannot be blank");
        }

        boolean created = comparisonService.addToComparison(userId, request.productSlug().trim());

        return ResponseEntity.status(created ? HttpStatus.CREATED : HttpStatus.OK).build();
    }

    /**
     * {@code DELETE /api/users/{userId}/comparison/{slug}} — remove one product.
     *
     * <p>204 on success. 404 if this user was not comparing this product — unlike adding, removing
     * is not idempotent, because a remove that hits nothing usually means the client is looking at a
     * stale list and would rather be told. 401 and 403 as above.
     *
     * <p>The ownership check runs before the lookup, so the 404 can only ever describe the caller's
     * own comparison. In the other order, anyone could probe whether a stranger was comparing a
     * given product by telling 404 from 403.
     */
    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> removeFromComparison(
            @PathVariable Long userId,
            @PathVariable String slug,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        requireSelf(principal, userId);

        comparisonService.removeFromComparison(userId, slug);
        return ResponseEntity.noContent().build();
    }

    /**
     * {@code DELETE /api/users/{userId}/comparison} — empty the comparison.
     *
     * <p>204 always, including when it was already empty. "Start over" is one intention and the UI
     * offers it as one button; expressing it as four DELETEs would make a partial failure a state
     * the user never asked for.
     *
     * <p>The wishlist has no equivalent, and that is not an oversight to correct later: the wishlist
     * UI has no "clear all" control, so the route would have no caller.
     */
    @DeleteMapping
    public ResponseEntity<Void> clearComparison(
            @PathVariable Long userId, @AuthenticationPrincipal AuthenticatedUser principal) {

        requireSelf(principal, userId);

        comparisonService.clearComparison(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Refuses the request unless the authenticated caller is the user named in the path.
     *
     * <p>Compares the id inside the verified token with the id in the URL. The token cannot be
     * edited without invalidating its signature, so the caller controls only one of the two values —
     * which is what makes the check mean anything.
     *
     * <p>Throws rather than returning a 403 {@code ResponseEntity}, so all four endpoints fail
     * identically and through the same path as every other error in CartWise: the exception handler
     * turns it into the standard {@code ApiError} body, where an inline
     * {@code ResponseEntity.status(FORBIDDEN).build()} would return an empty one.
     *
     * <p>Duplicated from {@code WishlistController} rather than lifted into a shared base class. The
     * two controllers are meant to be independent, and a common superclass would be a real coupling
     * between them for six lines — the next change to either one's ownership rule would have to
     * decide whether it applied to both.
     *
     * <p>The null check is defence in depth: {@code SecurityConfig} answers 401 before an
     * unauthenticated request reaches this class, so a null principal should be impossible. But
     * "impossible" depends on a rule in another file, and the failure mode if that rule were ever
     * loosened would be silent unauthenticated access rather than a visible error.
     */
    private void requireSelf(AuthenticatedUser principal, Long userId) {
        if (principal == null || !principal.id().equals(userId)) {
            throw new AccessDeniedException("Comparison belongs to another user");
        }
    }
}
