-- Sample catalogue for local development.
--
-- Runs on every dev boot, after Hibernate has created the schema. Two settings in
-- application-dev.yml make that true and both are load-bearing:
--   spring.jpa.defer-datasource-initialization: true  -> run after DDL, not before
--   spring.sql.init.mode: always                      -> run at all against a non-embedded DB
--
-- The rows are the real records from the frontend catalogue
-- (frontend/src/features/product/data/catalogue.ts), not invented ones. Same slugs, same prices,
-- same ratings — so a product fetched from this database and the same product rendered from the
-- frontend's mock data cannot disagree, and Chapter 17 can swap one for the other without the UI
-- changing. Prices are rupees, matching CartWise's India-first framing.
--
-- Image URLs use the same placehold.co convention as frontend/src/features/product/utils/media.ts.
-- No real product photography is downloaded or committed.
--
-- ON CONFLICT makes the script idempotent. It is redundant under ddl-auto: create-drop, where the
-- table is empty on every boot, and it is exactly what stops the seed exploding the day someone
-- switches to ddl-auto: update to keep their local data.

INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES
    ('iphone-16-pro',            'iPhone 16 Pro',            'Apple',   'Smartphone', 129999.00, 139900.00, 4.9, 19412, true,  'https://placehold.co/300x300?text=iPhone%2016%20Pro',            NOW(), NOW()),
    ('samsung-galaxy-s25-ultra', 'Samsung Galaxy S25 Ultra', 'Samsung', 'Smartphone', 124999.00, 134999.00, 4.8, 22318, true,  'https://placehold.co/300x300?text=Samsung%20Galaxy%20S25%20Ultra', NOW(), NOW()),
    ('google-pixel-10',          'Google Pixel 10',          'Google',  'Smartphone',  89999.00,  99999.00, 4.7,  8104, true,  'https://placehold.co/300x300?text=Google%20Pixel%2010',          NOW(), NOW()),
    -- No original_price: this product is not discounted. Proves the column is genuinely nullable
    -- rather than nullable-but-always-populated.
    ('oneplus-13',               'OnePlus 13',               'OnePlus', 'Smartphone',  69999.00,      NULL, 4.6, 15230, true,  'https://placehold.co/300x300?text=OnePlus%2013',                 NOW(), NOW()),
    -- Out of stock, so the card's "See availability" path has real data behind it.
    ('nothing-phone-3',          'Nothing Phone 3',          'Nothing', 'Smartphone',  54999.00,  59999.00, 4.5,  6042, false, 'https://placehold.co/300x300?text=Nothing%20Phone%203',          NOW(), NOW()),
    ('macbook-air-m4',           'MacBook Air M4',           'Apple',   'Laptop',     114999.00, 124900.00, 4.9, 12786, true,  'https://placehold.co/300x300?text=MacBook%20Air%20M4',           NOW(), NOW()),
    ('sony-wh-1000xm6',          'Sony WH-1000XM6',          'Sony',    'Headphones',  32999.00,  39990.00, 4.9, 11640, true,  'https://placehold.co/300x300?text=Sony%20WH-1000XM6',            NOW(), NOW()),
    ('lg-oled-c5',               'LG OLED C5',               'LG',      'Television', 189999.00, 219990.00, 4.9,  4471, true,  'https://placehold.co/300x300?text=LG%20OLED%20C5',               NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- One development user. Added by Chapter 17, given a password by Chapter 18.
--
-- The wishlist endpoints are per-user and every wishlist row carries a real foreign key, so
-- without a user there is literally nothing to POST against — the seed would have left the three
-- wishlist endpoints untestable. This is the smallest thing that makes them exercisable.
--
-- Chapter 18 made password_hash NOT NULL, which means this row could no longer be inserted as it
-- was: an account without a credential stopped being representable, which is the entire point of
-- that constraint. The value below is a real BCrypt hash, generated with the same encoder the
-- application uses (cost 10), of this password:
--
--     cartwise-dev-password
--
-- Committing a working credential is acceptable here and nowhere else. It signs into a database
-- that exists on one laptop and is dropped on every boot, and the prod profile never runs this
-- file (spring.sql.init.mode: never). The account is also reachable through POST /api/auth/login
-- like any other, which is what makes it useful: it gives a known-good login to test against
-- without signing up first.
--
-- The hash is stored, never the password — that is true of this seed exactly as it is true of a
-- real registration. Nothing in the application can turn the string below back into the password
-- in the comment above it; the comment is the only reason anyone knows what it is.
--
-- Because ddl-auto is create-drop in dev, this row is recreated on every boot and reliably lands
-- at id 1, which is the userId used in this chapter's requests.
--
-- Chapter 19 added the role column as NOT NULL, so this insert had to name one — an account whose
-- permissions are unknown stopped being representable, which is the point of that constraint. USER
-- is what a real registration produces, and this row should behave like one.
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
-- administrator's: the hash is real (generated with the application's own encoder at cost 10, and
-- verified against the password before being committed), the plaintext is written down in this
-- comment only, and committing it is acceptable only because the database it opens lives on one
-- laptop, is dropped on every boot, and is never touched by the prod profile — which does not run
-- this file at all (spring.sql.init.mode: never). A deployment that seeded this row would be
-- publishing an administrator account to the internet with a password printed in its own source.
--
-- Lands at id 2, after the demo user. Both ids are stable across boots because the table is
-- recreated empty and this script runs in order.
INSERT INTO users (email, password_hash, role, created_at, updated_at)
VALUES (
    'admin@example.com',
    '$2a$10$d7R2fWQFgN0RPfanlEVPt.3WEBB86TsOh5KhuGzgHkJP6.Mpr84yW',
    'ADMIN',
    NOW(),
    NOW())
ON CONFLICT (email) DO NOTHING;
