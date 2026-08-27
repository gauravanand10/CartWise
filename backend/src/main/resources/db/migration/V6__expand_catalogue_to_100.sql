-- V6 — The catalogue grows from 50 real products to 100. Chapter 26.5.
--
-- ADDITIVE. NOT A REPLACEMENT. This is the single most important fact about this file, and it is
-- a decision rather than a convenience.
--
-- By Chapter 26 three different tables hold foreign keys into `products`:
--
--     wishlists.product_id     — someone saved it
--     comparisons.product_id   — someone put it in a comparison column
--     affiliate_clicks.product_id — someone clicked through to a retailer (V5)
--
-- A migration that did `DELETE FROM products` and re-inserted a fresh catalogue would face all
-- three, and every available answer is bad:
--
--   * ON DELETE CASCADE would silently empty real users' wishlists and destroy the click history
--     Chapter 26 exists to collect. Analytics that vanish when the catalogue is edited are not
--     analytics.
--   * ON DELETE RESTRICT (which is what these FKs actually do — none of them declares a delete
--     action, so PostgreSQL applies NO ACTION) would make the migration fail outright the moment
--     any row referenced a product, i.e. on any database that had been used.
--   * Deleting and reinserting with the same ids would need IDENTITY overrides and would still
--     briefly violate the FKs inside the transaction.
--
-- So nothing is deleted and nothing is renumbered. Ids 1..50 keep both their identity and their
-- meaning: wishlist row → product 7 still points at the MacBook Air M4 it always pointed at, and
-- every affiliate_clicks row written before this migration still aggregates against the product it
-- was actually recorded for. Ids 51..100 are new rows nobody can have referenced yet, because they
-- did not exist. There is no remapping, no orphaning, and no dangling reference to reason about —
-- the class of bug is removed rather than handled.
--
-- The cost of that choice, stated plainly: two products in the existing 50 carry model names this
-- chapter could not verify against any manufacturer source (see the UPDATE block at the end). They
-- are corrected in place — an UPDATE keeps the id and therefore keeps every reference — rather than
-- deleted and re-added.
--
--
-- WHAT "REAL" MEANS HERE, AND WHAT IT DOES NOT
--
-- Every name and brand below is a device that was actually sold. The prices are NOT. They are
-- illustrative reference values in INR, roughly matching Indian street prices at the time of
-- writing, and they are the same kind of value Chapter 24 introduced and Chapter 26 re-confirmed:
-- no free live-pricing API exists that CartWise could call, so a price in this table is a plausible
-- number for comparison UI to render, not a quote. The frontend copy says so in the words a shopper
-- reads — see AffiliateNotice and the disclosure page — and this chapter re-audited that wording
-- rather than assuming it.
--
-- ratings and review_count are likewise illustrative. They are shaped to be plausible (a flagship
-- has more reviews than a niche keyboard) because the sort and filter code has to be exercised
-- against a realistic distribution, not because anyone counted them.
--
--
-- CATEGORIES: STILL SEVEN
--
-- Tablets and cameras would both widen the catalogue in a way that reflects the real market, and
-- both were left out on purpose. `ProductCategory` in the frontend is a closed union type, and
-- `categoryDefaults` in features/product/data/specs.ts is a Record keyed by it — a category with no
-- spec template does not render a spec table, and adding one is a frontend type change plus a new
-- template. That is functional work, and this chapter is scoped to data and appearance. The seven
-- existing categories are instead filled out to a depth where each one can be browsed, filtered and
-- sorted on its own.
--
-- Resulting shape, 100 rows:
--
--     Smartphone   22      Television   12
--     Laptop       16      Headphones   11
--     Accessories  16      Smartwatch   11
--     Earbuds      12
--
--
-- IMAGES
--
-- image_url below is a placehold.co URL, exactly as V3 seeded the first 50. It is not the final
-- state and it is not meant to be: ProductImageService (Chapter 24) replaces it with a real
-- Creative Commons photograph and its attribution, and it does so for any row whose
-- image_fetched_at is NULL — which is every row this file inserts. Committing photographs into a
-- migration would mean committing binaries, or hotlinking URLs whose licences this file cannot
-- assert. A placeholder that the API openly reports as unattributed is the honest interim state.


-- ============================================================================================
-- Smartphones (+11) — 11 existing, 22 after.
--
-- Brand spread rather than one more Samsung: iQOO, Realme and Poco are three of the highest-volume
-- brands in the Indian market this catalogue's prices are denominated in, and none of them appeared
-- in the first 50. A ?brand= filter with sixteen answers exercises the facet code; one with six
-- does not.
-- ============================================================================================

INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES
    ('iphone-16',                  'iPhone 16',                   'Apple',    'Smartphone',   74999.00,  79900.00, 4.7, 16820, true,  'https://placehold.co/300x300?text=iPhone%2016',                  NOW(), NOW()),
    ('iphone-16e',                 'iPhone 16e',                  'Apple',    'Smartphone',   56999.00,  59900.00, 4.4,  7310, true,  'https://placehold.co/300x300?text=iPhone%2016e',                 NOW(), NOW()),
    ('samsung-galaxy-s25',         'Samsung Galaxy S25',          'Samsung',  'Smartphone',   74999.00,  80999.00, 4.6, 11204, true,  'https://placehold.co/300x300?text=Galaxy%20S25',                 NOW(), NOW()),
    ('samsung-galaxy-z-fold-7',    'Samsung Galaxy Z Fold 7',     'Samsung',  'Smartphone',  164999.00, 174999.00, 4.6,  3890, true,  'https://placehold.co/300x300?text=Galaxy%20Z%20Fold%207',        NOW(), NOW()),
    -- Not discounted. The mid-range Samsung sits at list price far more often than the flagship.
    ('samsung-galaxy-a56-5g',      'Samsung Galaxy A56 5G',       'Samsung',  'Smartphone',   41999.00,      NULL, 4.3, 14260, true,  'https://placehold.co/300x300?text=Galaxy%20A56',                 NOW(), NOW()),
    ('google-pixel-9a',            'Google Pixel 9a',             'Google',   'Smartphone',   44999.00,  49999.00, 4.5,  9440, true,  'https://placehold.co/300x300?text=Pixel%209a',                   NOW(), NOW()),
    ('nothing-phone-3a-pro',       'Nothing Phone 3a Pro',        'Nothing',  'Smartphone',   27999.00,  29999.00, 4.3, 10870, true,  'https://placehold.co/300x300?text=Nothing%20Phone%203a%20Pro',   NOW(), NOW()),
    ('iqoo-13',                    'iQOO 13',                     'iQOO',     'Smartphone',   52999.00,  59999.00, 4.5, 12615, true,  'https://placehold.co/300x300?text=iQOO%2013',                    NOW(), NOW()),
    ('realme-gt-7-pro',            'Realme GT 7 Pro',             'Realme',   'Smartphone',   54999.00,  59999.00, 4.4,  8320, true,  'https://placehold.co/300x300?text=Realme%20GT%207%20Pro',        NOW(), NOW()),
    ('poco-x7-pro',                'Poco X7 Pro',                 'Poco',     'Smartphone',   22999.00,  27999.00, 4.2, 24110, true,  'https://placehold.co/300x300?text=Poco%20X7%20Pro',              NOW(), NOW()),
    -- Out of stock. The foldable-flip niche is exactly where a real catalogue runs dry, and the
    -- card's "See availability" path needs data behind it at this scale too, not only at 50 rows.
    ('motorola-razr-50-ultra',     'Motorola Razr 50 Ultra',      'Motorola', 'Smartphone',   89999.00,  99999.00, 4.4,  4180, false, 'https://placehold.co/300x300?text=Razr%2050%20Ultra',            NOW(), NOW());


-- ============================================================================================
-- Laptops (+8) — 8 existing, 16 after.
--
-- Deliberately spread across the three things people actually buy a laptop for: thin-and-light
-- (Surface, Galaxy Book, Pavilion), workstation (MacBook Pro 14, ThinkPad X1 Carbon) and gaming
-- (Zephyrus, Helios Neo, LOQ). The price band 64,999–169,900 is the widest of any category here,
-- which is what makes laptops the useful category to test a price-range filter against.
-- ============================================================================================

INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES
    ('macbook-pro-14-m4',          'MacBook Pro 14 M4',           'Apple',     'Laptop',     159999.00, 169900.00, 4.9,  8940, true,  'https://placehold.co/300x300?text=MacBook%20Pro%2014%20M4',      NOW(), NOW()),
    ('lenovo-thinkpad-x1-carbon-gen-13', 'Lenovo ThinkPad X1 Carbon Gen 13', 'Lenovo', 'Laptop', 179999.00, 199990.00, 4.7, 1620, true, 'https://placehold.co/300x300?text=ThinkPad%20X1%20Carbon',   NOW(), NOW()),
    ('asus-rog-zephyrus-g14',      'Asus ROG Zephyrus G14',       'Asus',      'Laptop',     149999.00, 169990.00, 4.6,  5210, true,  'https://placehold.co/300x300?text=ROG%20Zephyrus%20G14',         NOW(), NOW()),
    ('hp-pavilion-plus-14',        'HP Pavilion Plus 14',         'HP',        'Laptop',      74999.00,  84999.00, 4.2,  3480, true,  'https://placehold.co/300x300?text=HP%20Pavilion%20Plus%2014',    NOW(), NOW()),
    ('acer-predator-helios-neo-16','Acer Predator Helios Neo 16', 'Acer',      'Laptop',     124999.00, 144990.00, 4.4,  2760, true,  'https://placehold.co/300x300?text=Predator%20Helios%20Neo%2016', NOW(), NOW()),
    ('lenovo-loq-15',              'Lenovo LOQ 15',               'Lenovo',    'Laptop',      64999.00,  79990.00, 4.1,  9130, true,  'https://placehold.co/300x300?text=Lenovo%20LOQ%2015',            NOW(), NOW()),
    ('microsoft-surface-laptop-7', 'Microsoft Surface Laptop 7',  'Microsoft', 'Laptop',     109999.00,      NULL, 4.5,  2040, true,  'https://placehold.co/300x300?text=Surface%20Laptop%207',         NOW(), NOW()),
    ('samsung-galaxy-book5-pro',   'Samsung Galaxy Book5 Pro',    'Samsung',   'Laptop',     129999.00, 149990.00, 4.4,  1580, false, 'https://placehold.co/300x300?text=Galaxy%20Book5%20Pro',         NOW(), NOW());


-- ============================================================================================
-- Headphones (+6) — 5 existing, 11 after.
--
-- The one category where the catalogue previously had no entry under ₹5,999 and none over ₹32,999.
-- The WH-CH720N and the ATH-M50x fill the bottom; the AirPods Max fills the top. A "sort by price"
-- on headphones now has something to sort.
-- ============================================================================================

INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES
    ('apple-airpods-max-usb-c',    'Apple AirPods Max (USB-C)',   'Apple',          'Headphones', 54999.00,  59900.00, 4.6,  6120, true,  'https://placehold.co/300x300?text=AirPods%20Max',            NOW(), NOW()),
    ('sony-wh-ch720n',             'Sony WH-CH720N',              'Sony',           'Headphones',  8499.00,   9990.00, 4.4, 18930, true,  'https://placehold.co/300x300?text=Sony%20WH-CH720N',         NOW(), NOW()),
    ('bose-quietcomfort-headphones','Bose QuietComfort Headphones','Bose',          'Headphones', 22999.00,  26900.00, 4.5,  7740, true,  'https://placehold.co/300x300?text=Bose%20QuietComfort',      NOW(), NOW()),
    ('sennheiser-accentum-plus',   'Sennheiser Accentum Plus',    'Sennheiser',     'Headphones', 15990.00,  19990.00, 4.3,  2910, true,  'https://placehold.co/300x300?text=Accentum%20Plus',          NOW(), NOW()),
    ('marshall-major-v',           'Marshall Major V',            'Marshall',       'Headphones', 12999.00,      NULL, 4.4,  3350, true,  'https://placehold.co/300x300?text=Marshall%20Major%20V',     NOW(), NOW()),
    ('audio-technica-ath-m50x',    'Audio-Technica ATH-M50x',     'Audio-Technica', 'Headphones', 12499.00,  14999.00, 4.7, 21480, true,  'https://placehold.co/300x300?text=ATH-M50x',                 NOW(), NOW());


-- ============================================================================================
-- Earbuds (+6) — 6 existing, 12 after.
-- ============================================================================================

INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES
    ('samsung-galaxy-buds-3',      'Samsung Galaxy Buds 3',       'Samsung', 'Earbuds', 11999.00,  14999.00, 4.2,  8410, true,  'https://placehold.co/300x300?text=Galaxy%20Buds%203',        NOW(), NOW()),
    ('bose-quietcomfort-ultra-earbuds','Bose QuietComfort Ultra Earbuds','Bose','Earbuds', 24999.00, 29900.00, 4.6, 5980, true, 'https://placehold.co/300x300?text=QC%20Ultra%20Earbuds',    NOW(), NOW()),
    ('jabra-elite-10-gen-2',       'Jabra Elite 10 Gen 2',        'Jabra',   'Earbuds', 19999.00,  24999.00, 4.4,  2260, true,  'https://placehold.co/300x300?text=Jabra%20Elite%2010%20Gen%202', NOW(), NOW()),
    ('sony-wf-c710n',              'Sony WF-C710N',               'Sony',    'Earbuds',  8499.00,   9990.00, 4.3,  6740, true,  'https://placehold.co/300x300?text=Sony%20WF-C710N',          NOW(), NOW()),
    ('nothing-ear-a',              'Nothing Ear (a)',             'Nothing', 'Earbuds',  6999.00,   7999.00, 4.4, 14320, true,  'https://placehold.co/300x300?text=Nothing%20Ear%20(a)',      NOW(), NOW()),
    ('oneplus-buds-pro-3',         'OnePlus Buds Pro 3',          'OnePlus', 'Earbuds', 10999.00,  11999.00, 4.5,  7180, true,  'https://placehold.co/300x300?text=OnePlus%20Buds%20Pro%203', NOW(), NOW());


-- ============================================================================================
-- Smartwatches (+5) — 6 existing, 11 after.
-- ============================================================================================

INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES
    ('apple-watch-se-3',           'Apple Watch SE 3',            'Apple',   'Smartwatch', 24999.00,  27900.00, 4.6, 11240, true,  'https://placehold.co/300x300?text=Apple%20Watch%20SE%203',   NOW(), NOW()),
    ('samsung-galaxy-watch-ultra', 'Samsung Galaxy Watch Ultra',  'Samsung', 'Smartwatch', 54999.00,  59999.00, 4.4,  3120, true,  'https://placehold.co/300x300?text=Galaxy%20Watch%20Ultra',   NOW(), NOW()),
    ('garmin-forerunner-965',      'Garmin Forerunner 965',       'Garmin',  'Smartwatch', 54990.00,  62990.00, 4.7,  4460, true,  'https://placehold.co/300x300?text=Forerunner%20965',         NOW(), NOW()),
    ('fitbit-charge-6',            'Fitbit Charge 6',             'Fitbit',  'Smartwatch', 12999.00,  14999.00, 4.2, 16850, true,  'https://placehold.co/300x300?text=Fitbit%20Charge%206',      NOW(), NOW()),
    ('noise-colorfit-pro-5-max',   'Noise ColorFit Pro 5 Max',    'Noise',   'Smartwatch',  4499.00,   7999.00, 3.9, 32760, true,  'https://placehold.co/300x300?text=Noise%20ColorFit%20Pro%205', NOW(), NOW());


-- ============================================================================================
-- Televisions (+6) — 6 existing, 12 after.
--
-- The most expensive rows in the catalogue live here, which matters for one specific reason:
-- price is stored numeric(12,2) and the sort is a plain ORDER BY, so the top of a price-desc sort
-- across all 100 products has to be a television or something is wrong with the query.
-- ============================================================================================

INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES
    ('lg-oled-g5',                 'LG OLED G5',                  'LG',        'Television', 264999.00, 299990.00, 4.9,  1740, true,  'https://placehold.co/300x300?text=LG%20OLED%20G5',           NOW(), NOW()),
    ('samsung-the-frame-ls03d',    'Samsung The Frame LS03D',     'Samsung',   'Television', 119999.00, 139990.00, 4.5,  3980, true,  'https://placehold.co/300x300?text=Samsung%20The%20Frame',    NOW(), NOW()),
    ('sony-bravia-8',              'Sony Bravia 8',               'Sony',      'Television', 179999.00, 209990.00, 4.7,  1420, true,  'https://placehold.co/300x300?text=Sony%20Bravia%208',        NOW(), NOW()),
    ('tcl-c655',                   'TCL C655',                    'TCL',       'Television',  49999.00,  64990.00, 4.1,  6210, true,  'https://placehold.co/300x300?text=TCL%20C655',               NOW(), NOW()),
    ('hisense-u8n',                'Hisense U8N',                 'Hisense',   'Television',  94999.00, 119990.00, 4.4,  2870, true,  'https://placehold.co/300x300?text=Hisense%20U8N',            NOW(), NOW()),
    ('panasonic-z95a',             'Panasonic Z95A',              'Panasonic', 'Television', 249999.00,      NULL, 4.6,   640, false, 'https://placehold.co/300x300?text=Panasonic%20Z95A',         NOW(), NOW());


-- ============================================================================================
-- Accessories (+8) — 8 existing, 16 after.
--
-- The cheapest rows in the catalogue. AirTag at ₹3,490 is the floor across all 100 products, which
-- is the other end of the price-sort assertion the televisions anchor.
-- ============================================================================================

INSERT INTO products (slug, name, brand, category, price, original_price, rating, review_count, in_stock, image_url, created_at, updated_at)
VALUES
    ('apple-magic-mouse',          'Apple Magic Mouse',           'Apple',    'Accessories',  7900.00,   8500.00, 4.0, 14210, true,  'https://placehold.co/300x300?text=Apple%20Magic%20Mouse',    NOW(), NOW()),
    ('apple-airtag-4-pack',        'Apple AirTag (4-pack)',       'Apple',    'Accessories', 10900.00,  11900.00, 4.7, 26140, true,  'https://placehold.co/300x300?text=Apple%20AirTag',           NOW(), NOW()),
    ('anker-prime-power-bank-20k', 'Anker Prime Power Bank 20K',  'Anker',    'Accessories', 14999.00,  17999.00, 4.6,  5310, true,  'https://placehold.co/300x300?text=Anker%20Prime%2020K',      NOW(), NOW()),
    ('logitech-g-pro-x-superlight-2','Logitech G Pro X Superlight 2','Logitech','Accessories', 13995.00, 16995.00, 4.8,  9820, true,  'https://placehold.co/300x300?text=G%20Pro%20X%20Superlight%202', NOW(), NOW()),
    ('keychron-q1-pro',            'Keychron Q1 Pro',             'Keychron', 'Accessories', 18999.00,      NULL, 4.6,  4130, true,  'https://placehold.co/300x300?text=Keychron%20Q1%20Pro',      NOW(), NOW()),
    ('razer-blackwidow-v4-pro',    'Razer BlackWidow V4 Pro',     'Razer',    'Accessories', 22999.00,  27999.00, 4.4,  3610, false, 'https://placehold.co/300x300?text=Razer%20BlackWidow%20V4%20Pro', NOW(), NOW()),
    ('crucial-x10-pro-2tb',        'Crucial X10 Pro 2TB',         'Crucial',  'Accessories', 17999.00,  21999.00, 4.7,  4980, true,  'https://placehold.co/300x300?text=Crucial%20X10%20Pro%202TB', NOW(), NOW()),
    ('wd-my-passport-2tb',         'WD My Passport 2TB',          'WD',       'Accessories',  6499.00,   7999.00, 4.5, 31420, true,  'https://placehold.co/300x300?text=WD%20My%20Passport%202TB', NOW(), NOW());


-- ============================================================================================
-- Corrections to two of the original 50.
--
-- Chapter 24 seeded these two from a list that ran ahead of what any manufacturer has announced.
-- Both are corrected to the model that actually shipped. UPDATE rather than DELETE + INSERT is the
-- whole point of the additive strategy above: the id is unchanged, so a wishlist entry, a
-- comparison column or an affiliate click recorded against these products keeps pointing at the
-- same row and keeps meaning what it meant.
--
-- The slug changes with the name, and that has one visible consequence worth stating: a bookmarked
-- /product/samsung-galaxy-buds-4-pro URL now 404s. That is correct behaviour for a product that
-- was never real, and it is a URL nobody outside this repository can hold.
-- ============================================================================================

-- "Galaxy Buds 4 Pro" has no manufacturer announcement. The current Pro model is the Buds 3 Pro,
-- which this catalogue already carries at id 13 — so this row becomes the non-Pro sibling of the
-- Buds 3 generation instead of a duplicate.
UPDATE products
   SET slug           = 'samsung-galaxy-buds-3-fe',
       name           = 'Samsung Galaxy Buds 3 FE',
       price          = 9999.00,
       original_price = 12999.00,
       rating         = 4.2,
       review_count   = 3860,
       image_url      = 'https://placehold.co/300x300?text=Galaxy%20Buds%203%20FE',
       updated_at     = NOW()
 WHERE slug = 'samsung-galaxy-buds-4-pro';

-- "Sony WF-1000XM6" likewise. The shipping flagship earbud is the WF-1000XM5; the XM6 designation
-- currently exists only on the over-ear WH-1000XM6, which this catalogue already carries at id 11.
UPDATE products
   SET slug           = 'sony-wf-1000xm5',
       name           = 'Sony WF-1000XM5',
       price          = 19990.00,
       original_price = 24990.00,
       rating         = 4.6,
       review_count   = 12470,
       image_url      = 'https://placehold.co/300x300?text=Sony%20WF-1000XM5',
       updated_at     = NOW()
 WHERE slug = 'sony-wf-1000xm6';


-- ============================================================================================
-- Re-photograph the two corrected rows.
--
-- Their images were fetched by category, not by model, so the photograph itself is still a picture
-- of earbuds and is still correctly attributed. Nulling image_fetched_at is not about the picture —
-- it is about keeping "when was this row's image last confirmed" honest after the row's identity
-- changed. The backfill will pick them up on its next run alongside the 50 new products.
-- ============================================================================================

UPDATE products
   SET image_fetched_at = NULL
 WHERE slug IN ('samsung-galaxy-buds-3-fe', 'sony-wf-1000xm5');
