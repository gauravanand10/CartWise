package com.cartwise.common;

import java.util.Locale;

/**
 * Converts between a category's display form and its URL form.
 *
 * <p>{@code "Smartphone"} ⇄ {@code "smartphone"}, {@code "Home Appliances"} ⇄
 * {@code "home-appliances"}.
 *
 * <p>Slugs are derived on the fly, never stored. A stored slug is a second copy of the name that can
 * disagree with it — rename the category on one product and the two forms part company with nothing
 * to detect it. Deriving costs a string operation per row and makes disagreement impossible.
 *
 * <p>Both directions live here together on purpose. {@code GET /api/categories} needs
 * name → slug to publish the URL form, and {@code ?category=} needs slug → name to filter on the
 * stored column. If those two rules were written in separate files they would eventually disagree
 * about a space, and the symptom would be a category link that leads to an empty page.
 *
 * <p>Deliberately narrow: no accent folding, no punctuation stripping, no collapsing of repeated
 * separators. The catalogue's categories are short ASCII words, and a general-purpose slugifier
 * would be a lot of untested behaviour serving inputs that do not occur. This is the transformation
 * the data actually needs, and it round-trips for that data — see the tests implied by
 * {@link #toSlug} and {@link #toName}.
 */
public final class CategorySlug {

    private CategorySlug() {
    }

    /**
     * Display form → URL form. {@code "Home Appliances"} → {@code "home-appliances"}.
     *
     * <p>{@link Locale#ROOT} rather than the default locale: in a Turkish locale
     * {@code "I".toLowerCase()} produces a dotless ı, which would emit a slug the filter below could
     * never match. Server-side case conversion should never depend on where the server is.
     */
    public static String toSlug(String categoryName) {
        return categoryName == null
                ? null
                : categoryName.trim().toLowerCase(Locale.ROOT).replace(' ', '-');
    }

    /**
     * URL form → the comparable form of the display name. {@code "home-appliances"} →
     * {@code "home appliances"}.
     *
     * <p>Returns a lower-cased string because it is only ever compared against
     * {@code lower(category)} — it is not an attempt to reconstruct the original capitalisation,
     * which is unrecoverable ({@code "iPhone Cases"} cannot be derived from its slug). Restoring the
     * display form is the database's job, since it holds the real value.
     */
    public static String toComparableName(String slug) {
        return slug == null ? null : slug.trim().toLowerCase(Locale.ROOT).replace('-', ' ');
    }
}
