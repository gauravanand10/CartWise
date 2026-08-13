package com.cartwise.service;

import com.cartwise.common.dto.WishlistItemDto;
import com.cartwise.entity.Product;
import com.cartwise.entity.User;
import com.cartwise.entity.Wishlist;
import com.cartwise.repository.ProductRepository;
import com.cartwise.repository.UserRepository;
import com.cartwise.repository.WishlistRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The wishlist's rules: what may be saved, what a duplicate means, what removing something does.
 *
 * <p>This is where the layering claim from Chapter 14 stops being theoretical. The React
 * {@code WishlistProvider} currently holds all of this — de-duplication, ordering, the
 * added/removed outcome — over a {@code string[]} in localStorage. Moving it here is what makes it
 * true for every client rather than for one browser tab, and it is why the controller below has
 * nothing in it but status codes.
 *
 * <p>Three repositories, because a wishlist entry is a fact about three things: it exists only if
 * the user exists, only if the product exists, and only once per pair. Each of those checks is a
 * lookup, and each maps to a different answer for the caller.
 *
 * <p>No authorisation. Any caller may read or modify any user's wishlist, because there is nothing
 * yet that establishes who the caller is — Chapter 18 adds authentication and the ownership check
 * that depends on it. Stated plainly rather than left to be discovered.
 */
@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(
            WishlistRepository wishlistRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /**
     * A user's saved products, newest first, each with its product embedded.
     *
     * <p>An unknown user gets an empty list, not a 404. A wishlist nobody has saved anything to and
     * a wishlist belonging to nobody look the same to a reader, and since there is no
     * authentication yet, treating the second as an error would leak which user ids exist to
     * anyone who cared to enumerate them.
     *
     * <p>The transaction is load-bearing, not decorative: {@code open-in-view} is off, so the
     * persistence context closes when this method returns. Mapping the lazily-associated product
     * outside it would throw {@code LazyInitializationException}. The repository's entity graph
     * fetches the products in the same query, so this is one statement, not one per item.
     */
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(entry -> new WishlistItemDto(
                        entry.getId(),
                        ProductMapper.toDto(entry.getProduct()),
                        entry.getCreatedAt()))
                .toList();
    }

    /**
     * Saves a product for a user.
     *
     * <p><strong>Idempotent.</strong> Saving something already saved is not an error — the frontend
     * calls this from a heart icon whose meaning is "this is saved", and a double-click, a retry
     * after a dropped response, or two open tabs must all end in the same one row. The return value
     * distinguishes the two paths so the controller can answer 201 or 200 accurately without either
     * of them being a failure.
     *
     * <p>The existence check is not the real guarantee — the unique constraint on
     * {@code (user_id, product_id)} is. Two concurrent requests can both pass this check before
     * either inserts, and the loser gets a constraint violation that surfaces as 409. That is the
     * correct division: the check makes the ordinary case cheap and quiet, the constraint makes the
     * rare case impossible rather than merely unlikely.
     *
     * @return {@code true} if a row was created, {@code false} if the product was already saved
     * @throws EntityNotFoundException if the user or the product does not exist
     */
    @Transactional
    public boolean addToWishlist(Long userId, String productSlug) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No user with id " + userId));

        Product product = productRepository
                .findBySlug(productSlug)
                .orElseThrow(() -> new EntityNotFoundException("No product with slug " + productSlug));

        if (wishlistRepository.existsByUserIdAndProductId(userId, product.getId())) {
            return false;
        }

        wishlistRepository.save(new Wishlist(user, product));
        return true;
    }

    /**
     * Removes a saved product.
     *
     * <p>Not idempotent, unlike {@link #addToWishlist}, and the asymmetry is deliberate: removing
     * something that was never saved usually means the client is working from a stale view, and
     * telling it so (404) is more useful than a silent success that leaves the two disagreeing.
     * Adding has no such ambiguity — the end state is the same either way.
     *
     * <p>The user is not looked up separately here. If the entry exists, the user does; if it does
     * not, the answer is the same 404 whether the user is unknown or simply has not saved this
     * product.
     *
     * @throws EntityNotFoundException if this user has not saved this product
     */
    @Transactional
    public void removeFromWishlist(Long userId, String productSlug) {
        Wishlist entry = wishlistRepository
                .findByUserIdAndProductSlug(userId, productSlug)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User " + userId + " has not saved product " + productSlug));

        wishlistRepository.delete(entry);
    }
}
