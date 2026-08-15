package com.cartwise.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Locale;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * The two directions of the category slug transformation.
 *
 * <p>They are tested together because they are a genuine duplication that must not drift: {@code GET
 * /api/categories} publishes the slug form, and {@code ?category=} converts it back to filter on the
 * stored column. If the two ever disagree about a space or a case, the symptom is a category link
 * that leads to an empty page — a bug that looks like missing data rather than a broken string.
 */
class CategorySlugTest {

    @ParameterizedTest
    @CsvSource({
            "Smartphone,      smartphone",
            "Laptop,          laptop",
            "Headphones,      headphones",
            "Home Appliances, home-appliances",
            "TV And Audio,    tv-and-audio"
    })
    @DisplayName("display form becomes URL form")
    void toSlug(String name, String expected) {
        assertThat(CategorySlug.toSlug(name)).isEqualTo(expected);
    }

    @ParameterizedTest
    @CsvSource({
            "smartphone,      smartphone",
            "home-appliances, home appliances",
            "tv-and-audio,    tv and audio"
    })
    @DisplayName("URL form becomes the comparable name")
    void toComparableName(String slug, String expected) {
        assertThat(CategorySlug.toComparableName(slug)).isEqualTo(expected);
    }

    /**
     * The property the pair exists for: a display name slugified and converted back must equal its
     * own lower-cased form, which is what {@code lower(category)} in the SQL compares against.
     */
    @ParameterizedTest
    @ValueSource(strings = {"Smartphone", "Home Appliances", "TV And Audio", "Accessories"})
    @DisplayName("round-trips to the form the SQL comparison uses")
    void roundTrips(String displayName) {
        String backAgain = CategorySlug.toComparableName(CategorySlug.toSlug(displayName));

        assertThat(backAgain).isEqualTo(displayName.toLowerCase(Locale.ROOT));
    }

    @Test
    @DisplayName("trims surrounding whitespace in both directions")
    void trimsWhitespace() {
        assertThat(CategorySlug.toSlug("  Smartphone  ")).isEqualTo("smartphone");
        assertThat(CategorySlug.toComparableName("  smartphone  ")).isEqualTo("smartphone");
    }

    @Test
    @DisplayName("passes null through rather than throwing")
    void nullIsPassedThrough() {
        assertThat(CategorySlug.toSlug(null)).isNull();
        assertThat(CategorySlug.toComparableName(null)).isNull();
    }

    @Test
    @DisplayName("handles the empty string")
    void emptyString() {
        assertThat(CategorySlug.toSlug("")).isEmpty();
        assertThat(CategorySlug.toComparableName("")).isEmpty();
    }

    /**
     * The Turkish-locale trap, and the reason both methods pass {@link Locale#ROOT} explicitly.
     *
     * <p>In a Turkish locale, {@code "I".toLowerCase()} produces a dotless {@code ı} — so a server
     * running there would publish a slug that its own filter could never match, and the bug would be
     * invisible everywhere else. Setting the default locale for the duration of this test is the only
     * way to prove the conversion does not depend on where the server is.
     */
    @Test
    @DisplayName("does not depend on the JVM's default locale")
    void isLocaleIndependent() {
        Locale original = Locale.getDefault();
        try {
            Locale.setDefault(Locale.forLanguageTag("tr"));

            assertThat(CategorySlug.toSlug("I Phone Cases")).isEqualTo("i-phone-cases");
            assertThat(CategorySlug.toComparableName("I-PHONE-CASES")).isEqualTo("i phone cases");
        } finally {
            Locale.setDefault(original);
        }
    }

    /**
     * The stated limits of a deliberately narrow transformation: no accent folding, no punctuation
     * stripping, no collapsing of repeated separators. Asserted so that "narrow" is a recorded
     * boundary rather than an assumption — a catalogue category containing a slash or an ampersand
     * would produce a slug that does not round-trip, and this is where that would be noticed.
     */
    @Test
    @DisplayName("does not attempt general-purpose slugification")
    void narrowByDesign() {
        assertThat(CategorySlug.toSlug("Café & Bar")).isEqualTo("café-&-bar");
        assertThat(CategorySlug.toSlug("A  B")).isEqualTo("a--b");
    }
}
