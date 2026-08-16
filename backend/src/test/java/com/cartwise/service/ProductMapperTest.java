package com.cartwise.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.cartwise.common.dto.ProductDto;
import com.cartwise.entity.Product;
import com.cartwise.testsupport.ProductFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Entity → DTO translation for products.
 *
 * <p><strong>This test lives in {@code com.cartwise.service} because it has to.</strong>
 * {@link ProductMapper} is a package-private class with a package-private static method — deliberately
 * so, since it has no state and no reason to be a bean — and no test outside its package can reference
 * it at all. Moving this file elsewhere would not fail an assertion; it would fail to compile.
 *
 * <p>Small, and worth having anyway. The mapper is the boundary that decides what the API exposes,
 * and a field dropped from it is a field that silently stops appearing in every product response.
 */
class ProductMapperTest {

    @Test
    @DisplayName("copies every field onto the DTO")
    void mapsAllFields() {
        Product product = ProductFixtures.product()
                .slug("sony-wh-1000xm6")
                .name("Sony WH-1000XM6")
                .brand("Sony")
                .category("Headphones")
                .price("29990.00")
                .originalPrice("34990.00")
                .rating("4.8")
                .reviewCount(1234)
                .inStock(true)
                .imageUrl("https://example.test/sony.png")
                .buildWithId(7L);

        ProductDto dto = ProductMapper.toDto(product);

        assertThat(dto.id()).isEqualTo(7L);
        assertThat(dto.slug()).isEqualTo("sony-wh-1000xm6");
        assertThat(dto.name()).isEqualTo("Sony WH-1000XM6");
        assertThat(dto.brand()).isEqualTo("Sony");
        assertThat(dto.category()).isEqualTo("Headphones");
        assertThat(dto.price()).isEqualByComparingTo("29990.00");
        assertThat(dto.originalPrice()).isEqualByComparingTo("34990.00");
        assertThat(dto.rating()).isEqualByComparingTo("4.8");
        assertThat(dto.reviewCount()).isEqualTo(1234);
        assertThat(dto.inStock()).isTrue();
        assertThat(dto.imageUrl()).isEqualTo("https://example.test/sony.png");
    }

    /**
     * The nullable fields pass through as null rather than being defaulted to zero or an empty
     * string. A client can then render "no discount" and "no image" as the distinct states they are,
     * instead of having to guess whether {@code 0} means free.
     */
    @Test
    @DisplayName("passes nulls through rather than substituting defaults")
    void nullableFieldsStayNull() {
        Product product = ProductFixtures.product()
                .originalPrice(null)
                .imageUrl(null)
                .buildWithId(1L);

        ProductDto dto = ProductMapper.toDto(product);

        assertThat(dto.originalPrice()).isNull();
        assertThat(dto.imageUrl()).isNull();
    }

    /*
     * ---------------------------------------------------------------------------------------
     * Chapter 24 — the image-attribution contract.
     *
     * These two tests are the guard on a legal requirement rather than a cosmetic one. Openverse
     * serves Creative Commons works whose licences permit this use only if the creator is
     * credited, so a mapper that emitted imageUrl while dropping imageAttribution would put the
     * application in breach on every product response. That is a silent failure with no visible
     * symptom, which is exactly the kind worth pinning down in a test.
     * ---------------------------------------------------------------------------------------
     */

    @Test
    @DisplayName("carries the image credit alongside the image, and marks it not a placeholder")
    void licensedPhotographCarriesItsAttribution() {
        Product product = ProductFixtures.product().buildWithId(1L);
        product.applyImage(
                "https://live.staticflickr.com/1/2_b.jpg",
                "cf510223-b7f1-4030-9904-836225509f2c",
                "Insights Unspoken",
                "by-sa",
                "https://creativecommons.org/licenses/by-sa/2.0/",
                "\"Smartphone\" by Insights Unspoken is licensed under CC BY-SA 2.0.",
                "https://www.flickr.com/photos/23328561@N07/21135682726");

        ProductDto dto = ProductMapper.toDto(product);

        assertThat(dto.imageUrl()).isEqualTo("https://live.staticflickr.com/1/2_b.jpg");
        assertThat(dto.imageAttribution())
                .isEqualTo("\"Smartphone\" by Insights Unspoken is licensed under CC BY-SA 2.0.");
        assertThat(dto.imageLicense()).isEqualTo("by-sa");
        assertThat(dto.imageLicenseUrl())
                .isEqualTo("https://creativecommons.org/licenses/by-sa/2.0/");
        assertThat(dto.imageSourceUrl())
                .isEqualTo("https://www.flickr.com/photos/23328561@N07/21135682726");
        assertThat(dto.imagePlaceholder()).isFalse();
    }

    /**
     * A product the backfill could not illustrate keeps the seeded placehold.co URL. It therefore
     * has an {@code imageUrl} and no attribution, and the flag has to be driven by the attribution
     * rather than by the URL — testing the URL would report every product as illustrated, since V3
     * gave every row one.
     */
    @Test
    @DisplayName("flags an unattributed image as a placeholder even though a URL is present")
    void unattributedImageIsAPlaceholder() {
        Product product = ProductFixtures.product()
                .imageUrl("https://placehold.co/300x300?text=OnePlus%2013")
                .buildWithId(1L);

        ProductDto dto = ProductMapper.toDto(product);

        assertThat(dto.imageUrl()).isNotNull();
        assertThat(dto.imageAttribution()).isNull();
        assertThat(dto.imagePlaceholder()).isTrue();
    }

    @Test
    @DisplayName("carries an out-of-stock product's availability as false, not as absent")
    void outOfStockIsFalse() {
        ProductDto dto = ProductMapper.toDto(
                ProductFixtures.product().inStock(false).buildWithId(1L));

        assertThat(dto.inStock()).isFalse();
    }

    /**
     * Price arrives as {@code BigDecimal} and must stay one. Converting through a floating-point type
     * anywhere in the mapping would reintroduce, at the API boundary, exactly the precision problem
     * the {@code numeric(12,2)} column exists to avoid.
     */
    @Test
    @DisplayName("preserves decimal precision exactly")
    void priceKeepsItsScale() {
        ProductDto dto = ProductMapper.toDto(
                ProductFixtures.product().price("119900.99").buildWithId(1L));

        assertThat(dto.price().toPlainString()).isEqualTo("119900.99");
    }
}
