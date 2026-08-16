package com.cartwise.service;

import com.cartwise.entity.Product;
import com.cartwise.repository.ProductRepository;
import com.cartwise.service.OpenverseImageClient.OpenverseImage;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
            "television", "television screen",
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
