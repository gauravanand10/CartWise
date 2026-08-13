package com.cartwise.repository;

import com.cartwise.entity.User;
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
 * <p>No declared methods. {@code findById} from {@link JpaRepository} is the only lookup Chapter 17
 * performs. {@code findByEmail} is the obvious next one and belongs to Chapter 18, alongside the
 * authentication that would call it.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
