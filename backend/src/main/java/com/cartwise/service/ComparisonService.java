package com.cartwise.service;

import com.cartwise.common.dto.ComparisonItemDto;
import com.cartwise.common.exception.ComparisonFullException;
import com.cartwise.entity.Comparison;
import com.cartwise.entity.Product;
import com.cartwise.entity.User;
import com.cartwise.repository.ComparisonRepository;
import com.cartwise.repository.ProductRepository;
import com.cartwise.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.BitSet;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The comparison's rules: how many products fit, which column a new one takes, what a duplicate
 * means.
 *
 * <p>Modelled on {@link WishlistService} and deliberately not sharing anything with it. The two
 * selections are independent by design — removing a product from a wishlist must never disturb a
 * comparison — and the cheapest way to guarantee that is for them to have no common state, no
 * common table and no common service. What they share is a shape, which costs a little repetition
 * and buys the guarantee.
 *
 * <p><strong>The cap is enforced here, not only in the browser.</strong> Until Chapter 23 the only
 * thing stopping a fifth column was {@code MAX_COMPARE} in the React provider, which is a rule that
 * holds exactly as long as every client is this app and no request is ever replayed by hand. The
 * server now refuses, and the database refuses underneath it: the baseline schema's
 * {@code ck_comparison_position_range} check constrains {@code position} to 0..3, so a fifth row is
 * not representable even if this class had the arithmetic wrong.
 */
@Service
public class ComparisonService {

    /**
     * Most products a comparison holds.
     *
     * <p>Four, matching the frontend's {@code MAX_COMPARE} and the check constraint's 0..3 range.
     * The number lives in three places because they are three different kinds of guarantee — a UI
     * affordance, a service rule and a data constraint — and collapsing them would mean trusting
     * one layer to speak for the others. They must move together, and the constraint is what makes
     * a mismatch fail loudly rather than silently admit a fifth column.
     */
    public static final int MAX_COMPARISON_PRODUCTS = 4;

    private final ComparisonRepository comparisonRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ComparisonService(
            ComparisonRepository comparisonRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.comparisonRepository = comparisonRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /**
     * A user's comparison, in column order.
     *
     * <p>An unknown user gets an empty list rather than a 404, matching the wishlist: "nobody has
     * compared anything" and "no such user" look identical to a reader, and the controller's
     * ownership check already means the only reachable id is the caller's own.
     *
     * <p>The transaction is load-bearing. {@code open-in-view} is off, so the persistence context
     * closes when this method returns and mapping the lazily-associated product outside it would
     * throw {@code LazyInitializationException}. The repository's entity graph fetches the products
     * in the same statement.
     */
    @Transactional(readOnly = true)
    public List<ComparisonItemDto> getUserComparison(Long userId) {
        return comparisonRepository.findByUserIdOrderByPosition(userId).stream()
                .map(entry -> new ComparisonItemDto(
                        entry.getId(),
                        ProductMapper.toDto(entry.getProduct()),
                        entry.getPosition(),
                        entry.getCreatedAt()))
                .toList();
    }

    /**
     * Adds a product to the comparison.
     *
     * <p><strong>Idempotent, like the wishlist's add and for the same reason.</strong> The frontend
     * calls this from a toggle whose meaning is "this is being compared", so a double-click, a retry
     * after a dropped response and two open tabs must all end in the same one row. The return value
     * separates the two successful paths so the controller can answer 201 or 200 accurately.
     *
     * <p>The duplicate check runs <em>before</em> the cap check, and the order matters: re-adding a
     * product that is already in a full comparison is a no-op, not a rejection. Checking the cap
     * first would refuse a request that asks for nothing to change, which is the wrong answer to an
     * idempotent operation — and it is exactly what the frontend does when a user clicks an
     * already-selected toggle on a full comparison.
     *
     * @return {@code true} if a column was created, {@code false} if the product was already there
     * @throws EntityNotFoundException  if the user or the product does not exist
     * @throws ComparisonFullException  if the comparison already holds {@link
     *                                  #MAX_COMPARISON_PRODUCTS} other products
     */
    @Transactional
    public boolean addToComparison(Long userId, String productSlug) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No user with id " + userId));

        Product product = productRepository
                .findBySlug(productSlug)
                .orElseThrow(() -> new EntityNotFoundException("No product with slug " + productSlug));

        if (comparisonRepository.existsByUserIdAndProductId(userId, product.getId())) {
            return false;
        }

        if (comparisonRepository.countByUserId(userId) >= MAX_COMPARISON_PRODUCTS) {
            throw new ComparisonFullException(MAX_COMPARISON_PRODUCTS);
        }

        comparisonRepository.save(new Comparison(user, product, nextFreePosition(userId)));
        return true;
    }

    /**
     * Removes a product from the comparison.
     *
     * <p>Not idempotent, matching the wishlist's remove: removing something that was never compared
     * usually means the client is working from a stale view, and a 404 tells it so rather than
     * reporting a success that leaves the two disagreeing.
     *
     * <p>Positions of the surviving columns are deliberately <em>not</em> compacted. Removing the
     * second of four leaves 0, 2 and 3, and the next product added takes the freed slot 1 rather
     * than appending at 4 — which would not fit. Renumbering would move every column the user did
     * not touch, and the grid would appear to reshuffle itself in response to one removal.
     *
     * @throws EntityNotFoundException if this user is not comparing this product
     */
    @Transactional
    public void removeFromComparison(Long userId, String productSlug) {
        Comparison entry = comparisonRepository
                .findByUserIdAndProductSlug(userId, productSlug)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User " + userId + " is not comparing product " + productSlug));

        comparisonRepository.delete(entry);
    }

    /**
     * Empties the comparison.
     *
     * <p>Its own operation rather than a loop of removes on the client, because "start over" is one
     * intention and the UI offers it as one button. Sending four DELETEs to express it would make a
     * partial failure a state the user never asked for.
     *
     * <p>Idempotent: clearing an empty comparison succeeds. There is no stale-view problem to report
     * here, unlike a single remove — the caller asked for "none left", and none are left.
     */
    @Transactional
    public void clearComparison(Long userId) {
        comparisonRepository.deleteAll(comparisonRepository.findByUserIdOrderByPosition(userId));
    }

    /**
     * The lowest column number this user does not already occupy.
     *
     * <p>Lowest-free rather than highest-plus-one, and that is not a preference. Positions are
     * constrained to 0..3 and are unique per user, so after removing column 1 from a full
     * comparison the only legal slot is the hole that was left — highest-plus-one would compute 4
     * and be rejected by the check constraint, turning a perfectly ordinary add into a 500.
     *
     * <p>A {@link BitSet} over four values is more machinery than a boolean array would need, and is
     * used because it says what it means: a set of occupied slots, asked for its first clear one.
     *
     * <p>Callers must have already established that a free slot exists. This is only reached after
     * the cap check in {@link #addToComparison}, which is what makes the {@code -1} branch below
     * unreachable rather than merely unlikely — it is kept as an assertion, not as a code path.
     */
    private int nextFreePosition(Long userId) {
        BitSet occupied = new BitSet(MAX_COMPARISON_PRODUCTS);

        for (Comparison entry : comparisonRepository.findByUserIdOrderByPosition(userId)) {
            occupied.set(entry.getPosition());
        }

        int free = occupied.nextClearBit(0);

        if (free >= MAX_COMPARISON_PRODUCTS) {
            throw new ComparisonFullException(MAX_COMPARISON_PRODUCTS);
        }

        return free;
    }
}
