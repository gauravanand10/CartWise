-- Development accounts. Loaded by the dev profile only, never by a migration.
--
-- WHY THIS FILE IS NOT A FLYWAY MIGRATION
--
-- These two rows moved out of data.sql in Chapter 22 along with the catalogue, and then stopped
-- short of db/migration. The difference is not organisational.
--
-- data.sql was safe in production because it never ran there: application-prod.yml sets
-- `spring.sql.init.mode: never`, and that one line is what stood between this repository and a
-- deployed administrator account whose password is written in the comment below it. Flyway has no
-- equivalent switch. Migrations are the same everywhere by design — that is the entire property
-- Chapter 22 was adding — so a V4__seed_users.sql would have run on the first production deploy
-- and published an admin login, with its plaintext, to the internet.
--
-- So the accounts stay under spring.sql.init, which still honours the profile that has always
-- protected them, and the file is named for what it is. application-dev.yml points
-- `spring.sql.init.data-locations` here; application-prod.yml keeps `mode: never`.
--
-- WHAT CHANGED FOR THE READER: nothing about these rows, and one thing about their lifetime. Under
-- `ddl-auto: create-drop` the table was empty on every boot and these ids were reliably 1 and 2.
-- The schema now persists across restarts, so the rows persist too and the ids are assigned once,
-- on the first boot against a fresh database. ON CONFLICT is what makes the file re-runnable
-- against a database that already has them, and it is now doing real work rather than being
-- defensive: this script runs on every dev boot, against a table that is no longer wiped.


-- One development user. Added by Chapter 17, given a password by Chapter 18.
--
-- The wishlist and comparison endpoints are per-user and every row carries a real foreign key, so
-- without a user there is literally nothing to POST against — the seed would leave those endpoints
-- untestable. This is the smallest thing that makes them exercisable.
--
-- Chapter 18 made password_hash NOT NULL, which means this row could no longer be inserted as it
-- was: an account without a credential stopped being representable, which is the point of that
-- constraint. The value below is a real BCrypt hash, generated with the same encoder the
-- application uses (cost 10), of this password:
--
--     cartwise-dev-password
--
-- Committing a working credential is acceptable here and nowhere else. It signs into a database
-- that exists on one laptop. The account is reachable through POST /api/auth/login like any other,
-- which is what makes it useful: a known-good login to test against without signing up first.
--
-- The hash is stored, never the password — that is true of this seed exactly as it is true of a
-- real registration. Nothing in the application can turn the string below back into the password in
-- the comment above it; the comment is the only reason anyone knows what it is.
--
-- Chapter 19 added the role column as NOT NULL, so this insert had to name one — an account whose
-- permissions are unknown stopped being representable. USER is what a real registration produces,
-- and this row should behave like one.
INSERT INTO users (email, password_hash, role, created_at, updated_at)
VALUES (
    'demo@cartwise.dev',
    '$2a$10$cSuxp4ha1PTuVRySy3Sa/.YhIL.N1OPbWEQ1gwksVLKOWqqOrEruG',
    'USER',
    NOW(),
    NOW())
ON CONFLICT (email) DO NOTHING;


-- One administrator, added by Chapter 19.
--
--     email:    admin@example.com
--     password: admin-password
--
-- This row exists because there is otherwise no way to get an admin. Signup always assigns USER and
-- offers no way to ask for anything else, and the only endpoint that grants ADMIN is itself
-- admin-only — so the first administrator cannot be created through the API by design. That leaves
-- exactly two ways to make one: an INSERT like this, or an UPDATE by someone with database access.
-- The bootstrapping problem is real rather than an oversight, and this is the deliberate answer to
-- it for development.
--
-- The same caveats as the row above apply and matter more here, because this credential is an
-- administrator's. It is also the specific reason this file is not a migration: a deployment that
-- ran this INSERT would be publishing an administrator account to the internet with a password
-- printed in its own source. Under spring.sql.init and `mode: never` in prod, it cannot.
--
-- A production deployment makes its first admin by hand, against its own database, with a hash it
-- generated itself. There is no seeded path to that and there should not be one.
INSERT INTO users (email, password_hash, role, created_at, updated_at)
VALUES (
    'admin@example.com',
    '$2a$10$d7R2fWQFgN0RPfanlEVPt.3WEBB86TsOh5KhuGzgHkJP6.Mpr84yW',
    'ADMIN',
    NOW(),
    NOW())
ON CONFLICT (email) DO NOTHING;
