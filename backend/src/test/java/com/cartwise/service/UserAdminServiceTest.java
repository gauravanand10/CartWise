package com.cartwise.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.cartwise.common.dto.UserDto;
import com.cartwise.entity.Role;
import com.cartwise.entity.User;
import com.cartwise.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

/**
 * The two administrative operations on accounts.
 *
 * <p>{@code UserAdminService} exists to disclose the account list, which is the exact opposite of
 * {@code AuthService}'s defining property. Keeping the two apart is what lets "this code must not
 * reveal which emails are registered" stay true of one whole file — so the tests are separate too,
 * and this one deliberately asserts that addresses <em>are</em> returned.
 *
 * <p>That the caller is an admin is not checked here and is not tested here. The rule is one line in
 * {@code SecurityConfig}, and {@code AdminControllerTest} asserts it where it actually lives.
 */
class UserAdminServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final UserAdminService userAdminService = new UserAdminService(userRepository);

    private static User user(Long id, String email, Role role) {
        User user = new User(email, "$2a$10$a-real-looking-but-irrelevant-hash", role);
        set(user, "id", id);
        set(user, "createdAt", Instant.parse("2026-08-15T09:00:00Z"));
        return user;
    }

    private static void set(User user, String name, Object value) {
        try {
            Field field = User.class.getDeclaredField(name);
            field.setAccessible(true);
            field.set(user, value);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("User." + name + " has moved", e);
        }
    }

    @Nested
    @DisplayName("listUsers")
    class ListUsers {

        @Test
        @DisplayName("returns every account")
        void returnsEveryAccount() {
            when(userRepository.findAll(any(Sort.class))).thenReturn(List.of(
                    user(1L, "ada@example.com", Role.ADMIN),
                    user(2L, "grace@example.com", Role.USER)));

            List<UserDto> users = userAdminService.listUsers();

            assertThat(users).extracting(UserDto::email)
                    .containsExactly("ada@example.com", "grace@example.com");
            assertThat(users).extracting(UserDto::role)
                    .containsExactly(Role.ADMIN, Role.USER);
        }

        /**
         * The password hash cannot reach the response, and the guarantee is structural rather than
         * behavioural: {@link UserDto} has no field to put it in. Asserted anyway, because "the DTO
         * has no such field" is exactly the kind of fact a later convenience addition would quietly
         * undo.
         */
        @Test
        @DisplayName("cannot expose a password hash")
        void noPasswordHashOnTheDto() {
            assertThat(UserDto.class.getRecordComponents())
                    .extracting(java.lang.reflect.RecordComponent::getName)
                    .containsExactly("id", "email", "role", "createdAt")
                    .doesNotContain("passwordHash");
        }

        @Test
        @DisplayName("returns an empty list when there are no accounts")
        void emptyWhenNoAccounts() {
            when(userRepository.findAll(any(Sort.class))).thenReturn(List.of());

            assertThat(userAdminService.listUsers()).isEmpty();
        }
    }

    @Nested
    @DisplayName("changeRole")
    class ChangeRole {

        @Test
        @DisplayName("promotes a user to admin and returns the updated account")
        void promotesToAdmin() {
            User ordinary = user(2L, "grace@example.com", Role.USER);
            when(userRepository.findById(2L)).thenReturn(Optional.of(ordinary));

            UserDto result = userAdminService.changeRole(2L, Role.ADMIN);

            assertThat(result.role()).isEqualTo(Role.ADMIN);
            assertThat(result.id()).isEqualTo(2L);
            assertThat(result.email()).isEqualTo("grace@example.com");
        }

        @Test
        @DisplayName("demotes an admin to user")
        void demotesToUser() {
            when(userRepository.findById(1L))
                    .thenReturn(Optional.of(user(1L, "ada@example.com", Role.ADMIN)));

            assertThat(userAdminService.changeRole(1L, Role.USER).role()).isEqualTo(Role.USER);
        }

        /**
         * The change is written by Hibernate's dirty checking on the managed entity, not by an
         * explicit save. Asserting on the entity itself is what shows the mutation actually happened
         * rather than only appearing in the returned DTO.
         */
        @Test
        @DisplayName("mutates the managed entity, which is what gets flushed")
        void mutatesTheLoadedEntity() {
            User ordinary = user(2L, "grace@example.com", Role.USER);
            when(userRepository.findById(2L)).thenReturn(Optional.of(ordinary));

            userAdminService.changeRole(2L, Role.ADMIN);

            assertThat(ordinary.getRole()).isEqualTo(Role.ADMIN);
        }

        /**
         * {@code PUT} states a desired end state rather than requesting a transition, so setting a
         * role the account already has is a success, not a conflict. That is what makes a retry after
         * a dropped connection safe.
         */
        @Test
        @DisplayName("setting the role an account already has is not an error")
        void unchangedRoleIsIdempotent() {
            when(userRepository.findById(2L))
                    .thenReturn(Optional.of(user(2L, "grace@example.com", Role.USER)));

            assertThat(userAdminService.changeRole(2L, Role.USER).role()).isEqualTo(Role.USER);
        }

        /**
         * An admin is entitled to know that user 999 does not exist — the opposite of the wishlist
         * endpoints, which answer 403 for the same case so nobody can map which ids are real. The
         * difference is that {@code hasRole("ADMIN")} has already run.
         */
        @Test
        @DisplayName("reports an unknown id rather than hiding it")
        void unknownIdIsNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userAdminService.changeRole(999L, Role.ADMIN))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("999");
        }

        /**
         * Self-demotion is permitted, and the service documents it as the sharpest edge in the
         * chapter: the only admin can demote themselves and lose the ability to undo it, since no
         * endpoint creates an admin without one. Asserted so the absence of a guard is a recorded
         * decision rather than something discovered by whoever it first strands.
         */
        @Test
        @DisplayName("permits an admin to demote themselves, with no guard")
        void selfDemotionIsAllowed() {
            when(userRepository.findById(1L))
                    .thenReturn(Optional.of(user(1L, "ada@example.com", Role.ADMIN)));

            assertThat(userAdminService.changeRole(1L, Role.USER).role()).isEqualTo(Role.USER);
        }
    }
}
