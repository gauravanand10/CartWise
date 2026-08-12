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
