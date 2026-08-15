package com.cartwise.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cartwise.entity.Role;
import com.cartwise.entity.User;
import com.cartwise.testsupport.DatabaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;

/**
 * Account lookups and the constraint that makes them unambiguous, against a real PostgreSQL.
 */
@DatabaseTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private static final String HASH = "$2a$10$7EqJtq98hPqEX7fNZaFWoOa9VMKQvKZ8FvXqQ5oJqZ5Q5Q5Q5Q5Q5";

    @BeforeEach
    void clearAccounts() {
        userRepository.deleteAll();
        userRepository.flush();
    }

    private User save(String email, Role role) {
        return userRepository.saveAndFlush(new User(email, HASH, role));
    }

    @Test
    @DisplayName("findByEmail returns the account with that address")
    void findsByEmail() {
        save("ada@example.com", Role.USER);

        assertThat(userRepository.findByEmail("ada@example.com"))
                .get()
                .extracting(User::getRole)
                .isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("findByEmail returns empty for an unregistered address")
    void emptyForUnknownEmail() {
        assertThat(userRepository.findByEmail("nobody@example.com")).isEmpty();
    }

    @Test
    @DisplayName("existsByEmail answers without loading the row")
    void existsByEmail() {
        save("ada@example.com", Role.USER);

        assertThat(userRepository.existsByEmail("ada@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("grace@example.com")).isFalse();
    }

    /**
     * <strong>The database compares email byte-for-byte, and that is why {@code AuthService}
     * normalises.</strong> Two addresses differing only in case are two distinct rows to PostgreSQL,
     * and the unique constraint does not stop the second one. If normalisation were ever dropped, the
     * visible symptom would be a person who registered as {@code Ada@Example.com} and then cannot log
     * in as {@code ada@example.com} despite a correct password. Asserted here so that the
     * lower-casing in the service is understood as load-bearing rather than cosmetic.
     */
    @Test
    @DisplayName("the email column is case-sensitive, which is what makes normalisation necessary")
    void emailColumnIsCaseSensitive() {
        save("ada@example.com", Role.USER);
        save("Ada@Example.com", Role.USER);

        assertThat(userRepository.count()).isEqualTo(2);
        assertThat(userRepository.findByEmail("ADA@EXAMPLE.COM")).isEmpty();
    }

    /**
     * The real guarantee behind signup's existence check. Two simultaneous signups can both pass that
     * check; this is what stops both of them inserting.
     */
    @Test
    @DisplayName("the database refuses a second account with the same address")
    void emailIsUniqueAtTheDatabaseLevel() {
        save("ada@example.com", Role.USER);

        assertThatThrownBy(() -> save("ada@example.com", Role.ADMIN))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    /**
     * {@code EnumType.STRING}, verified by reading the column back rather than by trusting the
     * annotation. Ordinal storage would write {@code 0} and {@code 1}, and inserting a constant into
     * the middle of {@link Role} later would silently re-label every existing row — an entire user
     * base's permissions changed by an edit to a Java file.
     */
    @Test
    @DisplayName("the role round-trips as its name, not as an ordinal")
    void roleIsStoredAsAString() {
        save("root@example.com", Role.ADMIN);

        assertThat(userRepository.findByEmail("root@example.com"))
                .get()
                .extracting(User::getRole)
                .isEqualTo(Role.ADMIN);
    }

    @Test
    @DisplayName("findAll ordered by id returns accounts in registration order")
    void findAllOrderedById() {
        save("first@example.com", Role.USER);
        save("second@example.com", Role.USER);
        save("third@example.com", Role.USER);

        assertThat(userRepository.findAll(Sort.by(Sort.Direction.ASC, "id")))
                .extracting(User::getEmail)
                .containsExactly("first@example.com", "second@example.com", "third@example.com");
    }

    /**
     * The lifecycle callbacks set both timestamps on insert. Checked against the database rather than
     * in a unit test because {@code @PrePersist} only runs when something actually persists.
     */
    @Test
    @DisplayName("timestamps are populated on insert")
    void timestampsArePopulated() {
        User saved = save("ada@example.com", Role.USER);

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }
}
