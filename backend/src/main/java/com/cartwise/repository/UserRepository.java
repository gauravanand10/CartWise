package com.cartwise.repository;

import com.cartwise.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * User data access.
 *
 * <p>Added in Chapter 17, not Chapter 16, because until there was an endpoint that writes a
 * wishlist row there was nothing that needed to load a user. The write path does: a
 * {@code Wishlist} holds a {@code User} association, so something has to fetch the row the foreign
 * key will point at, and that fetch is also what turns "unknown user" into a 404 instead of a
 * constraint violation surfacing as a 500.
 *
 * <p>Chapter 17 declared no methods: {@code findById} from {@link JpaRepository} was the only lookup
 * it performed. Chapter 18 adds the two that authentication needs, both keyed on email, because
 * email is what a person types into a login form — the numeric id is an internal fact they have
 * never seen.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * The account with this email address, if there is one.
     *
     * <p>Login's first step. {@code Optional} rather than a nullable return because "no account with
     * that email" is the expected outcome of a typo, not an exception — and note that the caller
     * must <em>not</em> report the empty case differently from a wrong password. See
     * {@link com.cartwise.service.AuthService#login}.
     *
     * <p>The unique constraint on {@code email} is what makes this a lookup rather than a search:
     * the database guarantees at most one row, so there is no ambiguity for this method to resolve.
     */
    Optional<User> findByEmail(String email);

    /**
     * Whether this email is already registered.
     *
     * <p>Signup's precondition. An existence check rather than {@code findByEmail(...).isPresent()}
     * so the database answers with {@code SELECT 1}-shaped SQL and never loads a password hash that
     * the caller has no use for — the less that value moves, the fewer places it can leak from.
     */
    boolean existsByEmail(String email);
}
