package com.cartwise.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cartwise.entity.Product;
import com.cartwise.repository.ProductRepository;
import com.cartwise.service.OpenverseImageClient.OpenverseImage;
import com.cartwise.testsupport.ProductFixtures;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * The image backfill's decisions, with Openverse mocked out.
 *
 * <p>Mocked deliberately and not reluctantly. The one thing this service must get right is what it
 * does with the results — how many upstream calls it makes, which products it skips, and what
 * happens when a search comes back empty — and none of that is testable against a live search index
 * whose ranking changes between runs. The live integration is verified separately by actually
 * running the backfill and reading the rows it wrote; this covers the logic around it.
 */
@ExtendWith(MockitoExtension.class)
class ProductImageServiceTest {

    @Mock
    private ProductRepository products;

    @Mock
    private OpenverseImageClient openverse;

    @InjectMocks
    private ProductImageService service;

    private static OpenverseImage image(String id) {
        return new OpenverseImage(
                id,
                "A photograph",
                "https://live.staticflickr.com/" + id + ".jpg",
                "Someone",
                "by-sa",
                "https://creativecommons.org/licenses/by-sa/2.0/",
                "\"A photograph\" by Someone is licensed under CC BY-SA 2.0.",
                "https://www.flickr.com/photos/someone/" + id);
    }

    @Nested
    @DisplayName("one search per category, not per product")
    class SearchEconomy {

        /**
         * The central efficiency claim, and the reason this service groups before it fetches. Three
         * smartphones must cost one upstream request, not three — at fifty products and a shared
         * daily allowance, the difference is between a job that always fits and one that does not.
         */
        @Test
        @DisplayName("groups products by category so each category costs one request")
        void oneRequestPerCategory() {
            when(products.findAll()).thenReturn(List.of(
                    ProductFixtures.product().slug("a").category("Smartphone").buildWithId(1L),
                    ProductFixtures.product().slug("b").category("Smartphone").buildWithId(2L),
                    ProductFixtures.product().slug("c").category("Smartphone").buildWithId(3L),
                    ProductFixtures.product().slug("d").category("Laptop").buildWithId(4L)));

            when(openverse.search(anyString()))
                    .thenReturn(List.of(image("1"), image("2"), image("3")));

            ProductImageService.BackfillResult result = service.backfill(false);

            verify(openverse, times(2)).search(anyString());
            assertThat(result.updated()).isEqualTo(4);
            assertThat(result.unmatched()).isZero();
        }

        /**
         * Distinct photographs within a category. Eleven smartphones all showing the same picture
         * would be a worse catalogue than one showing placeholders, because it looks like a bug in
         * the data rather than an absence of it.
         */
        @Test
        @DisplayName("gives each product in a category a different image")
        void distributesImagesAcrossACategory() {
            Product first = ProductFixtures.product().slug("a").category("Smartphone").buildWithId(1L);
            Product second = ProductFixtures.product().slug("b").category("Smartphone").buildWithId(2L);
            when(products.findAll()).thenReturn(List.of(first, second));
            when(openverse.search(anyString())).thenReturn(List.of(image("1"), image("2")));

            service.backfill(false);

            assertThat(first.getImageUrl()).isNotEqualTo(second.getImageUrl());
            assertThat(first.getImageAttribution()).isNotBlank();
            assertThat(second.getImageAttribution()).isNotBlank();
        }

        /**
         * More products than results is a normal outcome, not an error. Wrapping means the last
         * products still get a photograph; the alternative is leaving them unillustrated so that a
         * short result set silently becomes a half-done catalogue.
         */
        @Test
        @DisplayName("wraps when a category has more products than the search returned")
        void wrapsWhenResultsRunOut() {
            Product first = ProductFixtures.product().slug("a").category("Laptop").buildWithId(1L);
            Product second = ProductFixtures.product().slug("b").category("Laptop").buildWithId(2L);
            when(products.findAll()).thenReturn(List.of(first, second));
            when(openverse.search(anyString())).thenReturn(List.of(image("only")));

            ProductImageService.BackfillResult result = service.backfill(false);

            assertThat(result.updated()).isEqualTo(2);
            assertThat(first.getImageUrl()).isEqualTo(second.getImageUrl());
        }
    }

    @Nested
    @DisplayName("when the search finds nothing")
    class NoMatch {

        /**
         * The brief's "do not silently fail" requirement, pinned down.
         *
         * <p>An unmatched product keeps whatever image_url it had — the seeded placeholder — and
         * keeps a null attribution, which is precisely what makes {@code ProductMapper} report it to
         * the client as {@code imagePlaceholder: true}. It is also named in the result, so an
         * operator running the backfill learns which products were not illustrated instead of having
         * to diff the table.
         */
        @Test
        @DisplayName("keeps the placeholder, records no attribution, and reports the slug")
        void unmatchedProductsAreReportedNotHidden() {
            Product product = ProductFixtures.product()
                    .slug("obscure-gadget")
                    .category("Accessories")
                    .imageUrl("https://placehold.co/300x300?text=Obscure")
                    .buildWithId(1L);
            when(products.findAll()).thenReturn(List.of(product));
            when(openverse.search(anyString())).thenReturn(List.of());

            ProductImageService.BackfillResult result = service.backfill(false);

            assertThat(result.updated()).isZero();
            assertThat(result.unmatched()).isEqualTo(1);
            assertThat(result.unmatchedSlugs()).containsExactly("obscure-gadget");

            assertThat(product.getImageUrl()).isEqualTo("https://placehold.co/300x300?text=Obscure");
            assertThat(product.getImageAttribution()).isNull();
            assertThat(product.getImageFetchedAt()).isNull();
        }
    }

    @Nested
    @DisplayName("idempotence")
    class Idempotence {

        /**
         * What makes the job safe to re-run after a rate-limit stop. A product that already has a
         * photograph is not re-fetched, so a second invocation over a complete catalogue costs zero
         * upstream requests — verified as "search was never called", which is the only assertion
         * that actually proves the quota was not spent.
         */
        @Test
        @DisplayName("skips products that already have an image and makes no request at all")
        void alreadyIllustratedProductsAreSkipped() {
            Product done = ProductFixtures.product().category("Laptop").buildWithId(1L);
            done.applyImage("https://example.test/x.jpg", "id", "Someone", "by",
                    "https://creativecommons.org/licenses/by/2.0/", "credit",
                    "https://example.test/orig");
            when(products.findAll()).thenReturn(List.of(done));

            ProductImageService.BackfillResult result = service.backfill(false);

            assertThat(result.skipped()).isEqualTo(1);
            assertThat(result.updated()).isZero();
            verify(openverse, never()).search(anyString());
        }

        @Test
        @DisplayName("force re-fetches a product that already has an image")
        void forceOverridesTheSkip() {
            Product done = ProductFixtures.product().category("Laptop").buildWithId(1L);
            done.applyImage("https://example.test/old.jpg", "id", "Someone", "by",
                    "https://creativecommons.org/licenses/by/2.0/", "credit",
                    "https://example.test/orig");
            when(products.findAll()).thenReturn(List.of(done));
            when(openverse.search(anyString())).thenReturn(List.of(image("new")));

            ProductImageService.BackfillResult result = service.backfill(true);

            assertThat(result.updated()).isEqualTo(1);
            assertThat(done.getImageUrl()).isEqualTo("https://live.staticflickr.com/new.jpg");
        }
    }
}
