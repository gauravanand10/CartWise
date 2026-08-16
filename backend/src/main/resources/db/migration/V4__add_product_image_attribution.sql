-- V4 — Real product photography, and the attribution that legally must travel with it.
--
-- Chapter 24. Until now every row's image_url was a placehold.co URL built from the product name
-- (see V3's PROVENANCE note: "no product photography is downloaded or committed"). Those render a
-- grey box with text in it. This migration adds the columns needed to replace them with real
-- photographs fetched from Openverse, the WordPress-run search index over openly-licensed media.
--
-- WHY SIX COLUMNS AND NOT ONE
--
-- It would be shorter to overwrite image_url and stop. That would also be a licence violation.
--
-- Openverse indexes Creative Commons and public-domain works, and almost everything it returns is
-- CC BY or CC BY-SA — licences that permit commercial use and permit modification, but require
-- attribution as a *condition of the grant*. An image used without its credit is not "an image with
-- a missing caption", it is an unlicensed copy. The credit needs the creator's name, the licence,
-- and a link back to both the licence deed and the original work, so the columns that carry those
-- facts are as load-bearing as the URL itself. They are NOT optional metadata, and nothing may
-- render image_url without also being able to render image_attribution.
--
-- image_attribution stores the credit line Openverse composes itself and returns in the search
-- response, e.g.
--     "Smartphone" by Insights Unspoken is licensed under CC BY-SA 2.0. To view a copy of this
--     license, visit https://creativecommons.org/licenses/by-sa/2.0/.
-- Storing their string rather than assembling our own from the parts is deliberate: they know the
-- correct form for each licence version, and a home-made concatenation is how a CC0 work ends up
-- credited as CC BY. The individual fields are stored alongside it anyway, because a UI that wants
-- to render the creator as a link needs them separately and re-parsing a sentence to get them back
-- is not a thing worth doing.
--
-- NULLABLE, EVERY ONE OF THEM
--
-- All six are nullable, and that is the honest state rather than laziness: the catalogue has 50
-- products, Openverse is a search index rather than a product database, and there is no guarantee
-- that a given query returns a usable result. A product whose fetch found nothing keeps its
-- placeholder image_url and holds NULL here, which is a state the API and the frontend both have
-- to handle. Defaulting them to '' would make "no attribution known" indistinguishable from
-- "attribution is the empty string", and the difference decides whether it is safe to display the
-- picture at all.
--
-- image_fetched_at is what makes a re-run cheap: the backfill skips any row that already has one,
-- so it is resumable after a rate-limit stop and idempotent on a second invocation. It is also the
-- only way to answer "how stale is this photograph" without a second table.


ALTER TABLE products
    -- Openverse's own identifier for the work, a UUID. Kept so a specific image can be re-fetched
    -- or checked against /v1/images/{id}/ later without re-running the search that found it —
    -- searches are ranked and not stable, so the query that returned this image today may not
    -- return it tomorrow.
    ADD COLUMN image_external_id  varchar(64),

    -- Creator as Openverse reports it. Frequently a username rather than a legal name, and
    -- occasionally absent upstream, which is one of the reasons this is nullable.
    ADD COLUMN image_creator      varchar(200),

    -- Licence code, e.g. "by", "by-sa", "cc0". Short by nature; 40 is generous.
    ADD COLUMN image_license      varchar(40),

    -- Deed URL, e.g. https://creativecommons.org/licenses/by-sa/2.0/. The attribution text must be
    -- able to link here.
    ADD COLUMN image_license_url  varchar(300),

    -- The full credit line. 500 to match image_url; the composed strings observed run to roughly
    -- 200 characters, and the headroom is for a long title plus a long creator name.
    ADD COLUMN image_attribution  varchar(500),

    -- foreign_landing_url — the page at the original provider (Flickr, Wikimedia, …) where the
    -- work lives. Distinct from image_url, which is the direct bytes. Attribution guidance asks
    -- for a link to the original work, and this is that link; image_url is not a substitute.
    ADD COLUMN image_source_url   varchar(500),

    -- When the fetch that populated the five columns above last succeeded. NULL means "never
    -- attempted, or attempted and found nothing".
    ADD COLUMN image_fetched_at   timestamp(6) with time zone;
