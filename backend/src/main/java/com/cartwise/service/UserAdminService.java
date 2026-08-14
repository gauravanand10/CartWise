package com.cartwise.service;

import com.cartwise.common.dto.UserDto;
import com.cartwise.entity.Role;
import com.cartwise.entity.User;
import com.cartwise.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The two operations an administrator can perform on accounts: see them, and change what they are.
 *
 * <p>Separate from {@link AuthService} rather than added to it, because the two answer to different
 * audiences. {@code AuthService} handles input from anyone on the internet and its defining
 * property is that it gives nothing away — identical failures, no enumeration, no timing tell. This
 * class does the opposite by design: it exists to disclose the account list. Keeping them apart
 * means the rule "this code must not reveal which emails are registered" stays true of one whole
 * file, instead of being true of some methods in a file and deliberately false in others.
 *
 * <p>Nothing here checks that the caller is an admin. That check is in {@code SecurityConfig}, one
 * rule covering {@code /api/admin/**}, and duplicating it with {@code @PreAuthorize} here would
 * create a second place where the answer could be changed and a second place someone auditing
 * access has to find. The trade-off is that these methods are only safe because of where they are
 * reachable from — which is why they live behind a controller mapped at exactly that prefix.
 */
@Service
public class UserAdminService {

    private static final Logger log = LoggerFactory.getLogger(UserAdminService.class);

    private final UserRepository userRepository;

    public UserAdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Every registered account, oldest first.
     *
     * <p>Ordered by id explicitly. {@code findAll()} with no sort returns rows in whatever order
     * PostgreSQL finds convenient, which is stable enough to look deliberate in testing and then
     * changes after a vacuum or a plan change — an admin list that silently reshuffles between
     * refreshes is a bug that is very hard to believe. Ascending id is registration order, which is
     * the order this list actually means something in.
     *
     * <p>Unpaginated, and that is a stated limit rather than an oversight: this returns the whole
     * table, which is right for a development database of a handful of rows and wrong for a real
     * one. Pagination is a query-design decision with its own chapter, and adding a half-considered
     * {@code ?page=} here would be the harder thing to undo.
     *
     * <p>{@code readOnly} because listing changes nothing — no last-viewed marker, no audit row.
     * Audit logging of who looked at what is deliberately deferred.
     */
    @Transactional(readOnly = true)
    public List<UserDto> listUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(UserAdminService::toDto)
                .toList();
    }

    /**
     * Assigns a role to an account and returns what the account now is.
     *
     * <p>The single most consequential write in CartWise: promoting someone to {@link Role#ADMIN}
     * gives them this method, and therefore the ability to promote anyone else. There is no
     * approval step, no second admin required and no record kept of who did it — all three are real
     * gaps, and all three are audit and workflow features that belong to a later chapter rather
     * than being improvised here. What this chapter does provide is that the operation is reachable
     * only by an existing admin, so the privilege can only ever have come from another privilege,
     * back to the seeded account that was created by hand.
     *
     * <p><strong>An unchanged role is not an error.</strong> Setting {@code USER} on a user already
     * {@code USER} returns 200 with the unchanged account. The operation is idempotent because it
     * states a desired end state rather than requesting a transition — which is what {@code PUT}
     * means, and what makes a retried request after a dropped connection safe.
     *
     * <p><strong>Self-demotion is permitted, and is the sharpest edge in this chapter.</strong> The
     * only admin can demote themselves and immediately lose the ability to undo it: no endpoint can
     * create an admin without an admin, so recovery means an {@code UPDATE} in the database. A
     * guard against it would be one line, and it is deliberately not here — it is a policy decision
     * ("must there always be at least one admin?") that belongs with the audit and workflow rules
     * of a later chapter, and a guard added now would be an unstated policy discovered by whoever
     * it first refuses. Stating the consequence is the honest version of not implementing it.
     *
     * <p>No {@code save} call. The entity is loaded inside this transaction and therefore managed,
     * so Hibernate's dirty checking writes the change at flush; an explicit save would be a no-op
     * that implies the write depends on it. {@code @PreUpdate} advances {@code updatedAt} on the
     * same flush.
     *
     * @throws EntityNotFoundException if no account has this id (→ 404)
     */
    @Transactional
    public UserDto changeRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No user with id " + userId));

        Role previousRole = user.getRole();
        user.changeRole(newRole);

        // At INFO, unlike almost everything else in CartWise, and unlike the 403s and bad requests
        // that log at debug. A privilege change is rare, consequential and worth finding in a log
        // six months later. This is not an audit trail — it records no actor and lives wherever the
        // logs live — but the alternative was that the single riskiest write left no trace at all.
        log.info("Role changed for user {}: {} -> {}", userId, previousRole, newRole);

        return toDto(user);
    }

    /**
     * Entity to DTO, in one place.
     *
     * <p>Private and static: it takes no state, and every path out of this service goes through it,
     * which is what keeps {@code passwordHash} from ever reaching a response body by way of a
     * mapping someone wrote in a hurry.
     */
    private static UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }
}
