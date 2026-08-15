-- V3 — Catalogue seed.
--
-- Replaces the products half of the old data.sql (now data.sql.bak). That file ran on every dev
-- boot through spring.sql.init and was skipped in production by `spring.sql.init.mode: never`.
-- A Flyway migration has no such switch: this file runs wherever migrations run, once, and is
-- recorded in flyway_schema_history so it never runs again. Both differences are deliberate and
-- both change what may be written here.
--
-- WHAT MAY BE SEEDED THIS WAY, AND WHAT MAY NOT
--
-- Catalogue rows are reference data. CartWise is a product-comparison site; a deployment with an
-- empty products table is not a clean install, it is a broken one, and shipping the catalogue with
-- the schema is the same decision as shipping a currency list or a country table.
--
-- The two user accounts that used to sit at the bottom of data.sql are NOT here, and moving them
-- into a migration would have been a security regression rather than a port. They carry real BCrypt
-- hashes of passwords written in plain text in the source, including an ADMIN account, and they
-- were safe only because `spring.sql.init.mode: never` guaranteed production never executed that
-- file. Flyway would have executed it — publishing an administrator login, with its password
-- printed in the repository, to every environment. They now live in
-- db/dev-seed/dev-users.sql, loaded by the dev profile alone. See application-dev.yml.
--
-- ONE-SHOT, NOT IDEMPOTENT-BY-HABIT
--
-- data.sql ended every statement with ON CONFLICT (slug) DO NOTHING because it re-ran constantly.
-- That is kept below, and the reason has changed: Flyway runs this exactly once, so the clause is
-- no longer what stops duplicates. It is what makes this migration safe to apply to a database
-- that was seeded by the old data.sql before Chapter 22 — an existing install has these eight rows
-- already, and without ON CONFLICT the migration would fail on the first of them and leave the
-- schema history marked failed.
--
-- PROVENANCE
--
-- Rows 1-23 are the real records from frontend/src/features/product/data/catalogue.ts — same slugs,
-- same prices, same ratings, same review counts, same in-stock state (the frontend's `stockCount: 0`
-- is this table's `in_stock = false`). That correspondence is load-bearing and predates this
-- chapter: a product fetched from this database and the same product rendered from the frontend's
-- mock data must not disagree.
--
-- Rows 24-50 have no frontend counterpart. They exist to give the catalogue a realistic shape —
-- enough rows per category that a query plan is worth reading, enough brands that ?brand= filtering
-- returns something, enough price spread that ?minPrice/?maxPrice are not vacuous. They are
-- invented, and they are grouped separately below rather than interleaved so that nobody has to
-- guess which rows are canonical.
--
-- Every row stays inside the seven categories the frontend already renders (Smartphone, Laptop,
-- Headphones, Earbuds, Smartwatch, Television, Accessories). Inventing an eighth would put a
-- category in the API's /categories response that the UI has no page for — a backend change
-- breaking a frontend that was never touched.
--
-- Prices are rupees. Image URLs use the placehold.co convention from
-- frontend/src/features/product/utils/media.ts; no product photography is downloaded or committed.
--
-- created_at/updated_at use NOW(), so every row shares the migration's timestamp. That is honest
-- for seed data — these rows were all created at once — and it means ORDER BY created_at is a tie
-- across the whole seed rather than a fabricated history.


-- ============================================================================================
-- Rows 1-23 — mirrored from the frontend catalogue. Do not change a value here without changing
-- catalogue.ts to match; they are two copies of one fact.
-- ============================================================================================

INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES
    -- Smartphones
    ('iphone-16-pro',              'iPhone 16 Pro',              'Apple',    'Smartphone',  129999.00, 139900.00, 4.9, 19412, true,  'https://placehold.co/300x300?text=iPhone%2016%20Pro',              NOW(), NOW()),
    ('samsung-galaxy-s25-ultra',   'Samsung Galaxy S25 Ultra',   'Samsung',  'Smartphone',  124999.00, 134999.00, 4.8, 22318, true,  'https://placehold.co/300x300?text=Samsung%20Galaxy%20S25%20Ultra', NOW(), NOW()),
    ('google-pixel-10',            'Google Pixel 10',            'Google',   'Smartphone',   89999.00,  99999.00, 4.7,  8104, true,  'https://placehold.co/300x300?text=Google%20Pixel%2010',            NOW(), NOW()),
    ('oneplus-14',                 'OnePlus 14',                 'OnePlus',  'Smartphone',   54999.00,  64999.00, 4.8, 15230, true,  'https://placehold.co/300x300?text=OnePlus%2014',                   NOW(), NOW()),
    -- No original_price: not discounted. Proves the column is genuinely nullable rather than
    -- nullable-but-always-populated.
    ('oneplus-13',                 'OnePlus 13',                 'OnePlus',  'Smartphone',   69999.00,      NULL, 4.6, 15230, true,  'https://placehold.co/300x300?text=OnePlus%2013',                   NOW(), NOW()),
    -- stockCount: 0 in catalogue.ts. Gives the card's "See availability" path real data behind it.
    ('nothing-phone-3',            'Nothing Phone 3',            'Nothing',  'Smartphone',   54999.00,  59999.00, 4.5,  6042, false, 'https://placehold.co/300x300?text=Nothing%20Phone%203',            NOW(), NOW()),

    -- Laptops
    ('macbook-air-m4',             'MacBook Air M4',             'Apple',    'Laptop',      114999.00, 124900.00, 4.9, 12786, true,  'https://placehold.co/300x300?text=MacBook%20Air%20M4',             NOW(), NOW()),
    ('dell-xps-14',                'Dell XPS 14',                'Dell',     'Laptop',      154999.00, 179990.00, 4.8,  4218, true,  'https://placehold.co/300x300?text=Dell%20XPS%2014',                NOW(), NOW()),
    ('hp-spectre-x360',            'HP Spectre x360',            'HP',       'Laptop',      134999.00,      NULL, 4.7,  3391, true,  'https://placehold.co/300x300?text=HP%20Spectre%20x360',            NOW(), NOW()),
    ('lenovo-yoga-pro-9i',         'Lenovo Yoga Pro 9i',         'Lenovo',   'Laptop',      144999.00, 159990.00, 4.7,  2874, false, 'https://placehold.co/300x300?text=Lenovo%20Yoga%20Pro%209i',       NOW(), NOW()),

    -- Headphones
    ('sony-wh-1000xm6',            'Sony WH-1000XM6',            'Sony',     'Headphones',   32999.00,  39990.00, 4.9, 11640, true,  'https://placehold.co/300x300?text=Sony%20WH-1000XM6',              NOW(), NOW()),

    -- Earbuds
    ('airpods-pro-3',              'AirPods Pro 3',              'Apple',    'Earbuds',      26999.00,      NULL, 4.8, 20115, true,  'https://placehold.co/300x300?text=AirPods%20Pro%203',              NOW(), NOW()),
    ('samsung-galaxy-buds-3-pro',  'Samsung Galaxy Buds 3 Pro',  'Samsung',  'Earbuds',      17999.00,  21999.00, 4.6,  6903, true,  'https://placehold.co/300x300?text=Galaxy%20Buds%203%20Pro',        NOW(), NOW()),
    ('samsung-galaxy-buds-4-pro',  'Galaxy Buds 4 Pro',          'Samsung',  'Earbuds',      19999.00,  24999.00, 4.7,  4102, true,  'https://placehold.co/300x300?text=Galaxy%20Buds%204%20Pro',        NOW(), NOW()),

    -- Smartwatches
    ('apple-watch-series-11',      'Apple Watch Series 11',      'Apple',    'Smartwatch',   49999.00,      NULL, 4.8,  8144, true,  'https://placehold.co/300x300?text=Apple%20Watch%20Series%2011',    NOW(), NOW()),
    ('apple-watch-ultra-3',        'Apple Watch Ultra 3',        'Apple',    'Smartwatch',   89999.00,  94999.00, 4.9,  5218, true,  'https://placehold.co/300x300?text=Apple%20Watch%20Ultra%203',      NOW(), NOW()),
    ('samsung-galaxy-watch-8',     'Samsung Galaxy Watch 8',     'Samsung',  'Smartwatch',   36999.00,  41999.00, 4.7,  5320, true,  'https://placehold.co/300x300?text=Galaxy%20Watch%208',             NOW(), NOW()),
    ('google-pixel-watch-4',       'Google Pixel Watch 4',       'Google',   'Smartwatch',   32999.00,      NULL, 4.6,  3187, false, 'https://placehold.co/300x300?text=Pixel%20Watch%204',              NOW(), NOW()),

    -- Televisions
    ('lg-oled-c5',                 'LG OLED C5',                 'LG',       'Television',  189999.00, 219990.00, 4.9,  4471, true,  'https://placehold.co/300x300?text=LG%20OLED%20C5',                 NOW(), NOW()),
    ('samsung-neo-qled-qn90f',     'Samsung Neo QLED QN90F',     'Samsung',  'Television',  209999.00,      NULL, 4.8,  2905, true,  'https://placehold.co/300x300?text=Neo%20QLED%20QN90F',             NOW(), NOW()),
    ('sony-bravia-9',              'Sony Bravia 9',              'Sony',     'Television',  229999.00, 259990.00, 4.9,  1988, true,  'https://placehold.co/300x300?text=Sony%20Bravia%209',              NOW(), NOW()),

    -- Accessories
    ('logitech-mx-master-3s',      'Logitech MX Master 3S',      'Logitech', 'Accessories',   9999.00,  12995.00, 4.8, 31204, true,  'https://placehold.co/300x300?text=MX%20Master%203S',               NOW(), NOW()),
    ('keychron-k8-pro',            'Keychron K8 Pro',            'Keychron', 'Accessories',  10999.00,      NULL, 4.7,  7466, true,  'https://placehold.co/300x300?text=Keychron%20K8%20Pro',            NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;


-- ============================================================================================
-- Rows 24-50 — invented. No frontend counterpart, and none expected.
--
-- These exist so the table has a shape worth querying. Twenty-three rows in seven categories
-- means most categories hold three or four products, which is too few for a filter to be
-- interesting and far too few for PostgreSQL to prefer any index over a sequential scan. Fifty
-- rows does not fix the second problem — nothing at this scale does — but it makes the first one
-- go away, and it is the size at which a `?category=smartphone&sort=price-asc` request returns a
-- page rather than a handful.
-- ============================================================================================

INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES
    -- Smartphones (+5). Brand spread is the point: Apple/Samsung/Google/OnePlus/Nothing above,
    -- Xiaomi/Vivo/Oppo/Motorola here, so ?brand= has more than five answers.
    ('xiaomi-14-ultra',            'Xiaomi 14 Ultra',            'Xiaomi',    'Smartphone',   79999.00,  89999.00, 4.6,  7315, true,  'https://placehold.co/300x300?text=Xiaomi%2014%20Ultra',          NOW(), NOW()),
    ('vivo-x200-pro',              'Vivo X200 Pro',              'Vivo',      'Smartphone',   94999.00,  99999.00, 4.5,  4120, true,  'https://placehold.co/300x300?text=Vivo%20X200%20Pro',            NOW(), NOW()),
    ('oppo-find-x8-pro',           'Oppo Find X8 Pro',           'Oppo',      'Smartphone',   99999.00,      NULL, 4.5,  3288, true,  'https://placehold.co/300x300?text=Oppo%20Find%20X8%20Pro',       NOW(), NOW()),
    ('motorola-edge-60-pro',       'Motorola Edge 60 Pro',       'Motorola',  'Smartphone',   42999.00,  49999.00, 4.3,  5510, true,  'https://placehold.co/300x300?text=Motorola%20Edge%2060%20Pro',   NOW(), NOW()),
    ('redmi-note-14-pro',          'Redmi Note 14 Pro',          'Xiaomi',    'Smartphone',   24999.00,  27999.00, 4.2, 18740, false, 'https://placehold.co/300x300?text=Redmi%20Note%2014%20Pro',      NOW(), NOW()),

    -- Laptops (+4)
    ('macbook-pro-16-m4-pro',      'MacBook Pro 16 M4 Pro',      'Apple',     'Laptop',      199999.00, 219900.00, 4.9,  6431, true,  'https://placehold.co/300x300?text=MacBook%20Pro%2016',           NOW(), NOW()),
    ('asus-zenbook-14-oled',       'Asus Zenbook 14 OLED',       'Asus',      'Laptop',       99999.00, 114990.00, 4.6,  3902, true,  'https://placehold.co/300x300?text=Zenbook%2014%20OLED',          NOW(), NOW()),
    ('msi-katana-15',              'MSI Katana 15',              'MSI',       'Laptop',       89999.00, 104990.00, 4.4,  1877, true,  'https://placehold.co/300x300?text=MSI%20Katana%2015',            NOW(), NOW()),
    ('acer-swift-go-14',           'Acer Swift Go 14',           'Acer',      'Laptop',       74999.00,      NULL, 4.3,  2115, true,  'https://placehold.co/300x300?text=Acer%20Swift%20Go%2014',       NOW(), NOW()),

    -- Headphones (+4). The old seed had exactly one product in this category, which made
    -- ?category=headphones a one-row response and a useless thing to test against.
    ('bose-quietcomfort-ultra',    'Bose QuietComfort Ultra',    'Bose',       'Headphones',  29999.00,  34900.00, 4.7,  9210, true,  'https://placehold.co/300x300?text=Bose%20QC%20Ultra',           NOW(), NOW()),
    ('sennheiser-momentum-4',      'Sennheiser Momentum 4',      'Sennheiser', 'Headphones',  27990.00,  34990.00, 4.6,  4405, true,  'https://placehold.co/300x300?text=Momentum%204',                NOW(), NOW()),
    ('jbl-tour-one-m3',            'JBL Tour One M3',            'JBL',        'Headphones',  19999.00,  24999.00, 4.4,  3120, true,  'https://placehold.co/300x300?text=JBL%20Tour%20One%20M3',       NOW(), NOW()),
    -- Cheapest row in the table. The low end matters as much as the high end: without it every
    -- ?maxPrice= below 9999 returns nothing, which reads like a broken filter.
    ('boat-nirvana-751-anc',       'boAt Nirvana 751 ANC',       'boAt',       'Headphones',   5999.00,   9990.00, 4.1, 27310, true,  'https://placehold.co/300x300?text=boAt%20Nirvana%20751',        NOW(), NOW()),

    -- Earbuds (+3)
    ('sony-wf-1000xm6',            'Sony WF-1000XM6',            'Sony',      'Earbuds',      21999.00,  24990.00, 4.7,  5602, true,  'https://placehold.co/300x300?text=Sony%20WF-1000XM6',            NOW(), NOW()),
    ('nothing-ear-3',              'Nothing Ear 3',              'Nothing',   'Earbuds',      11999.00,      NULL, 4.4,  6840, true,  'https://placehold.co/300x300?text=Nothing%20Ear%203',            NOW(), NOW()),
    ('oneplus-buds-4',             'OnePlus Buds 4',             'OnePlus',   'Earbuds',       5999.00,   7999.00, 4.3,  9012, false, 'https://placehold.co/300x300?text=OnePlus%20Buds%204',           NOW(), NOW()),

    -- Smartwatches (+2)
    ('garmin-fenix-8',             'Garmin Fenix 8',             'Garmin',    'Smartwatch',   99990.00, 109990.00, 4.8,  2240, true,  'https://placehold.co/300x300?text=Garmin%20Fenix%208',           NOW(), NOW()),
    ('amazfit-gtr-4',              'Amazfit GTR 4',              'Amazfit',   'Smartwatch',   14999.00,  19999.00, 4.2,  8317, true,  'https://placehold.co/300x300?text=Amazfit%20GTR%204',            NOW(), NOW()),

    -- Televisions (+3)
    ('tcl-c755-qd-mini-led',       'TCL C755 QD-Mini LED',       'TCL',       'Television',   84999.00, 109990.00, 4.4,  3315, true,  'https://placehold.co/300x300?text=TCL%20C755',                   NOW(), NOW()),
    ('hisense-u7n',                'Hisense U7N',                'Hisense',   'Television',   69999.00,      NULL, 4.3,  2201, true,  'https://placehold.co/300x300?text=Hisense%20U7N',                NOW(), NOW()),
    ('xiaomi-x-pro-65',            'Xiaomi X Pro 65',            'Xiaomi',    'Television',   54999.00,  64999.00, 4.1,  5540, false, 'https://placehold.co/300x300?text=Xiaomi%20X%20Pro%2065',        NOW(), NOW()),

    -- Accessories (+6)
    ('samsung-t9-portable-ssd-2tb','Samsung T9 Portable SSD 2TB','Samsung',   'Accessories',  21999.00,  27999.00, 4.8,  4417, true,  'https://placehold.co/300x300?text=Samsung%20T9%202TB',           NOW(), NOW()),
    ('anker-737-power-bank',       'Anker 737 Power Bank',       'Anker',     'Accessories',  12999.00,  15999.00, 4.6,  8804, true,  'https://placehold.co/300x300?text=Anker%20737',                  NOW(), NOW()),
    ('logitech-mx-keys-s',         'Logitech MX Keys S',         'Logitech',  'Accessories',  11499.00,  13995.00, 4.7,  6120, true,  'https://placehold.co/300x300?text=MX%20Keys%20S',                NOW(), NOW()),
    ('belkin-boostcharge-3in1',    'Belkin BoostCharge Pro 3-in-1','Belkin',  'Accessories',   9999.00,  12999.00, 4.4,  2210, false, 'https://placehold.co/300x300?text=Belkin%20BoostCharge',         NOW(), NOW()),
    ('apple-magic-keyboard',       'Apple Magic Keyboard',       'Apple',     'Accessories',   9900.00,      NULL, 4.5,  3320, true,  'https://placehold.co/300x300?text=Apple%20Magic%20Keyboard',     NOW(), NOW()),
    ('sandisk-extreme-pro-1tb',    'SanDisk Extreme Pro 1TB',    'SanDisk',   'Accessories',   8999.00,  11999.00, 4.6, 12045, true,  'https://placehold.co/300x300?text=SanDisk%20Extreme%20Pro',      NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
