package com.cartwise.service;

import com.cartwise.entity.Product;
import com.cartwise.repository.ProductRepository;
import com.cartwise.service.OpenverseImageClient.OpenverseImage;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Replaces the catalogue's placeholder images with real, openly-licensed photographs.
 *
 * <p>---------------------------------------------------------------------------------------------
 * WHY THIS SEARCHES BY CATEGORY AND NOT BY PRODUCT NAME
 *
 * <p>The obvious implementation issues one search per product using its name, and it is the wrong
 * one. Openverse is a search index over Creative Commons media — Flickr, Wikimedia, museum
 * collections — not a product catalogue. It has no photograph of an "Amazfit GTR 4" and never will,
 * so a name search returns either nothing or, worse, something irrelevant that happens to share a
 * word. Fifty name searches would spend fifty requests to produce mostly empty results.
 *
 * <p>So this searches once per <em>category</em> — seven requests for the catalogue's seven
 * categories — and distributes the returned photographs across the products in that category. A
 * smartphone gets a real photograph of a smartphone. That is exactly what this chapter set out to
 * achieve and it is stated plainly rather than dressed up: <strong>these are relevant category
 * photographs, not manufacturer images of the specific SKU.</strong> Nothing here claims otherwise,
 * and the frontend labels them accordingly.
 *
 * <p>Distributing rather than reusing matters. With one search returning twenty results and eleven
 * smartphones to illustrate, each product takes a different photograph by index, so the catalogue
 * does not render eleven identical pictures. When a category has more products than the search
 * returned results, the index wraps and some repetition is unavoidable — the honest outcome of
 * having fewer photographs than products.
 * ---------------------------------------------------------------------------------------------
 */
@Service
public class ProductImageService {

    private static final Logger log = LoggerFactory.getLogger(ProductImageService.class);

    /**
     * Category → the search term that actually finds photographs of it.
     *
     * <p>Not simply the lower-cased category name, because two of them search badly. "Laptop" alone
     * ranks drawings and logos above photographs, and "Accessories" is so generic it returns
     * fashion. The terms below were chosen by running the searches and looking at what came back,
     * which is the only way this can be decided.
     *
     * <p>Keyed on the lower-cased category so a row stored as "Smartphone" and a lookup for
     * "smartphone" agree. An unmapped category falls back to its own name — a new category added
     * server-side then still gets a reasonable search rather than being skipped.
     */
    private static final Map<String, String> SEARCH_TERMS = Map.of(
            "smartphone", "smartphone",
            "laptop", "laptop computer",
            "headphones", "headphones",
            "earbuds", "earbuds",
            "smartwatch", "smartwatch",
            // "television screen" was the original term and it was wrong: Openverse's results for
            // it skew toward "television" as a subject for photography and art — vintage CRT sets,
            // museum exhibits about broadcasting — rather than photographs of a television. Running
            // the Chapter 30 backfill against the live index and then looking at what it chose
            // caught two of these: a 1960s wooden-cabinet CRT set, and a gallery installation of a
            // monitor behind glass with a red telephone handle. Neither was excluded by
            // CATEGORY_TIER_EXCLUSIONS because neither title mentions damage, disposal, or a decade
            // — the era keywords catch a title that ADMITS to being old, not a photo that merely is.
            // "flat screen television" was checked the same way and returns what the name asks for.
            "television", "flat screen television",
            "accessories", "computer keyboard mouse");

    private final ProductRepository products;
    private final OpenverseImageClient openverse;

    public ProductImageService(ProductRepository products, OpenverseImageClient openverse) {
        this.products = products;
        this.openverse = openverse;
    }

    /**
     * What one backfill run did. Returned to the admin caller so the outcome is inspectable rather
     * than only visible in logs.
     *
     * @param updated    products given a real photograph
     * @param skipped    products that already had one and were left alone
     * @param unmatched  products whose category search returned nothing usable; these keep their
     *                   placeholder and remain flagged as such through the API
     */
    public record BackfillResult(int updated, int skipped, int unmatched, List<String> unmatchedSlugs) {
    }

    /**
     * What one run achieved, broken down by how good each match actually was. Chapter 30.
     *
     * <p>The point of reporting these separately is that they are not equally honest. An exact match
     * is a photograph of the thing; a category match is a photograph of that KIND of thing, captioned
     * as illustrative; a placeholder is no photograph at all. Collapsing them into one "updated"
     * count would hide exactly the distinction this chapter exists to improve.
     *
     * @param exact        products matched by brand and model, verified against the result's title
     * @param category     products that fell back to a category-level photograph
     * @param none         products left with no photograph rather than a mismatched one
     */
    public record MatchRates(int exact, int category, int none, List<String> exactSlugs,
                             List<String> categorySlugs, List<String> noneSlugs) {
    }

    /**
     * Words that carry no distinguishing power in a product name.
     *
     * <p>A title containing only these plus the brand is not evidence of a match — "Apple" and
     * "Pro" appear across half the catalogue. The gate below requires a token from OUTSIDE this set.
     */
    private static final Set<String> WEAK_TOKENS = Set.of(
            "pro", "max", "ultra", "plus", "air", "mini", "lite", "series", "gen",
            "the", "and", "with", "new", "inch", "5g", "wifi", "edition");

    /**
     * Title fragments that mean the image MENTIONS the product rather than DEPICTS it.
     *
     * <p>Added after running the first tiered backfill and reading what it actually accepted, which
     * is the only way this could have been found. Two of the thirty-one "exact" matches were wrong
     * in the same way:
     *
     * <ul>
     *   <li>"Screenshot of the Mapillary mobile app taken from an Apple iPhone 16 Pro" — a
     *       screenshot TAKEN WITH the phone. Every word my gate looked for was present; the image is
     *       of a map application.
     *   <li>"20110930-NodeXL-Twitter-Dell And XPS composite" — a 2011 network-graph composite that
     *       happens to contain both "dell" and "xps".
     * </ul>
     *
     * <p>Both would have been shown to a shopper as a photograph of a product they were about to
     * spend money on. That is the misrepresentation this whole tier exists to avoid, so the gate
     * that let them through was not strict enough — a title naming a camera is describing the
     * equipment, not the subject.
     *
     * <p>This cannot be complete and is not claimed to be. It removes the failure modes actually
     * observed; the honest fallback for anything it misses is still a category photograph captioned
     * as illustrative.
     */
    private static final Set<String> DISQUALIFYING_TITLE_FRAGMENTS = Set.of(
            // The image is of something else, photographed or captured USING the product.
            "screenshot", "screen shot", "taken with", "taken from", "taken on", "shot on",
            "shot with", "captured with", "photographed with",
            // The image is a derived artefact, not a photograph of an object.
            "composite", "chart", "graph", "diagram", "infographic", "wordcloud", "word cloud",
            "logo", "icon", "wallpaper", "screensaver", "unboxing video", "advertisement");

    /**
     * Additional exclusions applied to the CATEGORY tier.
     *
     * <p>These are separate from {@link #DISQUALIFYING_TITLE_FRAGMENTS} because the two tiers fail
     * differently. An exact-match candidate at least names the product; a category candidate only
     * has to be "a television", and Openverse's idea of a television includes some things no
     * shopper should be shown above a buy button.
     *
     * <p><strong>Both examples below shipped.</strong> Running the tiered backfill and then opening
     * the search page on the emulator showed, side by side in the results grid:
     *
     * <ul>
     *   <li><strong>LG OLED C5</strong> — <em>"Television screen showing the funeral of JFK"</em>,
     *       a black-and-white broadcast from 1963.
     *   <li><strong>LG OLED G5</strong> — <em>"Close up of cracked television screen"</em>.
     * </ul>
     *
     * <p>The second is the serious one. A photograph of a shattered panel attached to a television
     * listing does not read as "here is a television"; it reads as a statement about the condition
     * of the item, and it is the kind of thing that would be actionable if a real retailer did it.
     * The caption saying the picture is illustrative does not undo that, because the picture is
     * looked at and the caption is not.
     *
     * <p>So the category tier now rejects three things: <em>damage</em>, because it implies a
     * condition; <em>disposal</em>, because a product in a skip implies obsolescence; and
     * <em>age</em>, because a 1960s set illustrating a 2025 OLED is simply the wrong object. A
     * category with nothing left after filtering falls through to no photograph at all, which is
     * the honest outcome and one this class already handles.
     */
    private static final Set<String> CATEGORY_TIER_EXCLUSIONS = Set.of(
            // Condition. Never acceptable next to a price.
            "cracked", "broken", "smashed", "shattered", "damaged", "burnt", "burned",
            "burn-in", "dead pixel", "faulty", "repair", "teardown", "disassembl",
            // Disposal and obsolescence.
            "landfill", "recycl", "e-waste", "ewaste", "scrap", "junk", "trash", "rubbish",
            "dump", "abandoned", "graveyard", "discard",
            // Wrong era. The catalogue is current consumer electronics.
            "vintage", "antique", "retro", "museum", "1950", "1960", "1970", "1980",
            "funeral", "crt", "cathode");

    /**
     * Decides whether an Openverse result is genuinely a photograph of this product.
     *
     * <p><strong>This gate is the whole safety of exact-match search.</strong> Openverse is a search
     * index over Creative Commons media, not a product database: querying it for "Samsung Galaxy S25
     * Ultra" does not return nothing when it has nothing, it returns whatever shares a word — a
     * photograph of a galaxy, or of somebody's ultra-marathon. Accepting the top hit because the
     * search "succeeded" would attach confidently wrong photographs to real products, which is worse
     * than the category fallback it replaced, not better.
     *
     * <p>So a result counts as an exact match only if its title contains the brand AND at least one
     * distinctive model token — a token from the product name that is not the brand and not a weak
     * marketing word. "Galaxy S25" clears it; "Ultra" alone does not.
     *
     * <p>Deliberately strict. A false negative costs a category photograph that is honestly captioned
     * as illustrative; a false positive is a misrepresentation of what the shopper will receive.
     */
    private static boolean isCredibleMatch(OpenverseImage image, Product product) {
        if (image.title() == null || image.title().isBlank()) {
            return false;
        }

        String title = image.title().toLowerCase(Locale.ROOT);
        String brand = product.getBrand() == null ? "" : product.getBrand().toLowerCase(Locale.ROOT);

        if (brand.isBlank() || !title.contains(brand)) {
            return false;
        }

        // Rejected before the token check, not after: a title can name the product perfectly and
        // still be a picture of something else. See DISQUALIFYING_TITLE_FRAGMENTS.
        for (String fragment : DISQUALIFYING_TITLE_FRAGMENTS) {
            if (title.contains(fragment)) {
                return false;
            }
        }

        /*
         * The model must appear as a CONTIGUOUS PHRASE, not as scattered tokens.
         *
         * This replaced a "any one distinctive token matches" rule after reading what that rule
         * accepted. It gave the iPhone 16 Pro a photograph titled "Apple MacBook Pro 16' M2 Max and
         * iPhone 13 Pro" — every token it looked for was present ("apple", "iphone", even "16", from
         * the MacBook's screen size), and the picture is of a DIFFERENT PHONE. Showing a shopper an
         * iPhone 13 where they are about to buy an iPhone 16 is a misrepresentation of the product,
         * which is the thing this tier is not allowed to do.
         *
         * A title that names two products cannot be a clean photograph of one of them, and requiring
         * adjacency is what separates "Dell XPS 14 Notebook" (a photograph of the laptop) from
         * "MacBook Pro 16 ... and iPhone 13 Pro" (a photograph of a desk).
         *
         * The phrase is the first two distinctive tokens of the product name — brand and marketing
         * words removed — so "iPhone 16 Pro" requires "iphone 16", and "Samsung Galaxy S25 Ultra"
         * requires "galaxy s25". A name with only one distinctive token falls back to requiring that
         * token alone.
         */
        List<String> distinctive = new ArrayList<>();
        for (String token : product.getName().toLowerCase(Locale.ROOT).split("[^a-z0-9]+")) {
            if (token.isBlank() || token.equals(brand) || WEAK_TOKENS.contains(token)) {
                continue;
            }
            distinctive.add(token);
        }

        if (distinctive.isEmpty()) {
            return false;
        }

        /*
         * A LONE distinctive token that is PURELY NUMERIC is not accepted on its own.
         *
         * Found by running the tiered backfill and looking at what it actually chose, the same way
         * the two rules above were found: "OnePlus 14" landed a photograph of a stranger in a
         * kitchen, titled "2022-12-25_12-14-42OnePlusNo_IMG20221225121442_Kiri_DxO" — a phone's
         * auto-generated filename, "OnePlus" being the camera's model. It passed every check above:
         * the title names the brand, and "14" appears in it as an isolated token — from the "12-14-42"
         * timestamp, not from any phone. The product's only distinctive token ("watch"/"ultra"/etc.
         * removed nothing here — OnePlus 14 has just the one) happened to be a bare number, and a
         * bare number is exactly the substring a date, a price, or an unrelated model is most likely
         * to contain by chance.
         *
         * This does not weaken the two-token phrase check above: "iphone 16" as a PAIR stays a strong
         * signal because "iphone" anchors it, and this guard only fires when a number is standing
         * completely alone as the sole basis for a match.
         */
        if (distinctive.size() == 1 && distinctive.get(0).chars().allMatch(Character::isDigit)) {
            return false;
        }

        // Normalise the title the same way, so punctuation cannot break adjacency:
        // "Dell XPS-14 (Notebook)" and "dell xps 14 notebook" must compare equal.
        String normalisedTitle = " " + title.replaceAll("[^a-z0-9]+", " ").trim() + " ";

        String phrase = distinctive.size() >= 2
                ? distinctive.get(0) + " " + distinctive.get(1)
                : distinctive.get(0);

        return normalisedTitle.contains(" " + phrase + " ");
    }

    /**
     * Fetches and stores photographs for every product that does not already have one.
     *
     * <p>Idempotent by way of {@code image_fetched_at}: a product with a timestamp is skipped, so
     * re-running after a rate-limit interruption resumes rather than restarts, and a second run on a
     * complete catalogue is a no-op that costs zero upstream requests. {@code force} exists for the
     * one case that needs the opposite — deliberately re-photographing the whole catalogue.
     *
     * <p>Transactional across the whole run. The unit of work is "the catalogue has photographs",
     * and a run that updated thirty products and then failed would otherwise leave the catalogue in
     * a state nobody chose. The upstream calls happen inside the transaction, which is acceptable
     * only because the whole job is seven HTTP requests and seconds long; a per-product fetch would
     * need this restructured to keep the transaction off the network.
     */
    /**
     * Tiered backfill: exact product first, category second, nothing third. Chapter 30.
     *
     * <p><strong>The problem this fixes.</strong> Chapter 24 searched once per CATEGORY and
     * distributed the results, which meant the homepage hero could show a photograph of an unrelated
     * older phone captioned as an illustrative smartphone. Honest, but weak — and avoidably so for
     * the products Openverse genuinely has a picture of.
     *
     * <p><strong>The three tiers, in order:</strong>
     *
     * <ol>
     *   <li><strong>Exact.</strong> Search for the product's own brand and model. The result is only
     *       accepted if {@link #isCredibleMatch} agrees its title actually names the thing — see
     *       there for why an unchecked top hit would be worse than the fallback.
     *   <li><strong>Category.</strong> Chapter 24's behaviour, unchanged: one search per category,
     *       distributed across that category's products, captioned as illustrative.
     *   <li><strong>Nothing.</strong> No photograph, {@code image_attribution} left null, which
     *       {@code ProductMapper} already reports to the client as an unlicensed placeholder.
     * </ol>
     *
     * <p><strong>No image is ever generated.</strong> Not as a filler, not as "better than nothing".
     * A generated picture presented as a photograph of a real, purchasable product misrepresents
     * what the shopper will receive, which is a worse failure than an empty frame and the exact
     * class of fabrication Chapters 26 to 29 spent themselves removing. The third tier is deliberate,
     * and it is where a product with no real photograph is supposed to end up.
     *
     * <p><strong>Cost.</strong> This is one upstream request per product plus one per category,
     * where Chapter 24 was seven in total. That is the honest price of the improvement and it is why
     * the transaction note below matters more than it used to: at 100 products this is ~107
     * requests, still seconds, still inside one transaction. A catalogue an order of magnitude
     * larger would need this restructured to keep the network out of the transaction.
     */
    @Transactional
    public MatchRates backfillTiered(boolean force) {
        List<Product> all = products.findAll();

        List<Product> pending = all.stream()
                .filter(p -> force || p.getImageFetchedAt() == null)
                .toList();

        List<String> exactSlugs = new ArrayList<>();
        List<Product> needCategory = new ArrayList<>();

        // --- Tier 1: the product itself -------------------------------------------------------
        for (Product product : pending) {
            String term = product.getBrand() + " " + product.getName();
            OpenverseImage match = openverse.search(term).stream()
                    .filter(image -> isCredibleMatch(image, product))
                    .findFirst()
                    .orElse(null);

            if (match == null) {
                needCategory.add(product);
                continue;
            }

            apply(product, match);
            exactSlugs.add(product.getSlug());
            log.info("Exact match for '{}': \"{}\"", product.getSlug(), match.title());
        }

        // --- Tier 2: the category, as Chapter 24 did --------------------------------------------
        Map<String, List<Product>> byCategory = new HashMap<>();
        for (Product product : needCategory) {
            byCategory.computeIfAbsent(
                    product.getCategory().toLowerCase(Locale.ROOT), key -> new ArrayList<>())
                    .add(product);
        }

        List<String> categorySlugs = new ArrayList<>();
        List<String> noneSlugs = new ArrayList<>();

        for (Map.Entry<String, List<Product>> entry : byCategory.entrySet()) {
            String category = entry.getKey();
            List<Product> group = entry.getValue();

            List<OpenverseImage> images = openverse.search(
                    SEARCH_TERMS.getOrDefault(category, category)).stream()
                    .filter(ProductImageService::isUsableAsCategoryPhoto)
                    .toList();

            if (images.isEmpty()) {
                log.warn("Openverse returned nothing usable for category '{}'; {} products keep "
                        + "their placeholder", category, group.size());
                group.forEach(p -> noneSlugs.add(p.getSlug()));
                continue;
            }

            for (int i = 0; i < group.size(); i++) {
                apply(group.get(i), images.get(i % images.size()));
                categorySlugs.add(group.get(i).getSlug());
            }
        }

        log.info("Tiered backfill complete: {} exact, {} category, {} without a photograph",
                exactSlugs.size(), categorySlugs.size(), noneSlugs.size());

        return new MatchRates(exactSlugs.size(), categorySlugs.size(), noneSlugs.size(),
                exactSlugs, categorySlugs, noneSlugs);
    }

    /**
     * Whether a category-search result is fit to stand in for a product nobody could photograph.
     *
     * <p>A weaker test than {@link #isCredibleMatch}: it cannot ask whether the picture is of the
     * right product, because by this point it is established that no picture of the right product
     * exists. All it can do is rule out pictures that would say something false about the item —
     * that it is damaged, discarded, or thirty years old. See {@link #CATEGORY_TIER_EXCLUSIONS}.
     *
     * <p>An untitled result is rejected. Openverse titles are the only signal available here, so an
     * image with no title cannot be screened at all, and passing it through would mean the filter
     * silently stops applying to exactly the results it cannot see into.
     */
    private static boolean isUsableAsCategoryPhoto(OpenverseImage image) {
        if (image.title() == null || image.title().isBlank()) {
            return false;
        }

        String title = image.title().toLowerCase(Locale.ROOT);

        for (String fragment : DISQUALIFYING_TITLE_FRAGMENTS) {
            if (title.contains(fragment)) {
                return false;
            }
        }

        for (String fragment : CATEGORY_TIER_EXCLUSIONS) {
            if (title.contains(fragment)) {
                return false;
            }
        }

        return true;
    }

    /** Stores an image and its attribution. Every field the licence requires travels together. */
    private static void apply(Product product, OpenverseImage image) {
        product.applyImage(
                image.url(),
                image.id(),
                image.creator(),
                image.license(),
                image.licenseUrl(),
                image.attribution(),
                image.foreignLandingUrl());
    }

    @Transactional
    public BackfillResult backfill(boolean force) {
        List<Product> all = products.findAll();

        // Group by category first so each category's search runs once, not once per product.
        Map<String, List<Product>> byCategory = new HashMap<>();
        for (Product product : all) {
            if (!force && product.getImageFetchedAt() != null) {
                continue;
            }
            byCategory
                    .computeIfAbsent(product.getCategory().toLowerCase(Locale.ROOT),
                            key -> new ArrayList<>())
                    .add(product);
        }

        int skipped = all.size() - byCategory.values().stream().mapToInt(List::size).sum();
        int updated = 0;
        List<String> unmatchedSlugs = new ArrayList<>();

        for (Map.Entry<String, List<Product>> entry : byCategory.entrySet()) {
            String category = entry.getKey();
            List<Product> group = entry.getValue();

            String term = SEARCH_TERMS.getOrDefault(category, category);
            List<OpenverseImage> images = openverse.search(term);

            if (images.isEmpty()) {
                // The required "do not silently fail" path. These products keep the placeholder
                // image V3 seeded and keep a null image_attribution, which is precisely the
                // combination ProductMapper reports to the client as an unlicensed placeholder.
                log.warn("Openverse returned nothing usable for category '{}' (term '{}'); "
                        + "{} products keep their placeholder", category, term, group.size());
                group.forEach(product -> unmatchedSlugs.add(product.getSlug()));
                continue;
            }

            for (int i = 0; i < group.size(); i++) {
                Product product = group.get(i);
                // Modulo so a category with more products than results wraps rather than running
                // off the end. Repetition is preferable to leaving later products unillustrated.
                OpenverseImage image = images.get(i % images.size());

                product.applyImage(
                        image.url(),
                        image.id(),
                        image.creator(),
                        image.license(),
                        image.licenseUrl(),
                        image.attribution(),
                        image.foreignLandingUrl());
                updated++;
            }

            log.info("Category '{}': {} products illustrated from {} Openverse results",
                    category, group.size(), images.size());
        }

        // Dirty checking writes these back; no explicit save call is needed inside the transaction.
        log.info("Image backfill complete: {} updated, {} skipped, {} unmatched",
                updated, skipped, unmatchedSlugs.size());

        return new BackfillResult(updated, skipped, unmatchedSlugs.size(), unmatchedSlugs);
    }
}
