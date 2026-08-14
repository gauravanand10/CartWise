package com.cartwise.entity;

/**
 * What a user is allowed to be. Two values, and deliberately only two.
 *
 * <p>Chapter 18 answered <em>who are you?</em>; this is the type that answers <em>what may you
 * do?</em> It is an enum rather than a string column or a lookup table because the set is closed: a
 * role that is not one of these does not exist, and the compiler should say so at the call site
 * rather than the database saying so at 2am. A {@code roles} table would be the right shape for
 * roles that operators can create at runtime — this chapter has none, and building the table first
 * would be building for a requirement that does not exist yet.
 *
 * <p>Stored as {@code EnumType.STRING}, not {@code ORDINAL}. Ordinal storage writes {@code 0} and
 * {@code 1}, so inserting a value into the middle of this enum later would silently re-label every
 * existing row — an entire user base's permissions changed by an edit to a Java file. The string
 * form costs a few bytes and is also readable in a {@code psql} session, which matters because
 * changing a role by hand in the database is the only way to create the first admin.
 *
 * <p>Roles are coarse on purpose. {@code read_wishlist} / {@code delete_product}-style permissions,
 * permission inheritance and groups are all deferred: they are a genuinely different design, and
 * two roles is enough to make the mechanism real and testable without pretending to a model this
 * application has no use for yet.
 */
public enum Role {

    /**
     * The default, and what every signup gets. Can manage its own data and nothing else — the
     * ownership check in {@code WishlistController} is what "its own" means in practice.
     */
    USER,

    /**
     * Can reach {@code /api/admin/**}: list every account and change any account's role.
     *
     * <p>No endpoint grants this. It is reachable only by an existing admin promoting someone, or
     * by an {@code UPDATE} against the database — which is exactly how the seeded admin in
     * {@code data.sql} exists, and is the deliberate answer to "who makes the first one".
     */
    ADMIN;

    /**
     * Spring Security's convention for a role, as opposed to any other kind of authority.
     *
     * <p>{@code hasRole("ADMIN")} does not compare against anything in the JWT. It looks in the
     * {@code Authentication}'s authority collection for the literal string {@code ROLE_ADMIN},
     * prepending this prefix itself. An authority stored as plain {@code "ADMIN"} therefore matches
     * nothing, and the symptom is the confusing one: a correctly-issued admin token that is refused
     * with 403 on every admin route, with no error anywhere to explain why.
     *
     * <p>Spelled out as a constant here so that the one place the prefix is applied is the one place
     * it is documented.
     */
    private static final String AUTHORITY_PREFIX = "ROLE_";

    /**
     * This role as the string Spring Security matches on — {@code ROLE_USER}, {@code ROLE_ADMIN}.
     *
     * <p>Derived from {@link #name()} rather than held in a field passed to the constructor. A
     * constructor argument would be a second copy of the enum constant's own name, free to drift
     * from it the first time someone renames a constant and misses the argument, and there is no
     * case where the two are meant to differ.
     *
     * <p>Note this is <em>not</em> the value stored in the database or in the token; both of those
     * are {@link #name()}, without the prefix. The prefix is a detail of one authorization
     * framework, and baking it into persisted data would leak that framework into the schema.
     */
    public String authority() {
        return AUTHORITY_PREFIX + name();
    }
}
