package com.cartwise.common.dto;

import java.math.BigDecimal;

/**
 * A catalogue product as the API returns it.
 *
 * <p>Separate from {@link com.cartwise.entity.Product} on purpose. The entity carries things the
 * client has no business seeing or caring about — {@code createdAt}/{@code updatedAt} are
 * bookkeeping, and its field set is free to change with the schema. A DTO means a column rename is
 * a mapping change in one service method rather than a breaking change to every consumer.
 *
 * <p>The field names match what the Chapter 11 frontend already models in {@code ProductCardModel},
 * with two known differences that the frontend adapter resolves rather than the API pretending
 * away: the card calls {@code reviewCount} "reviews" and {@code imageUrl} "image". The API keeps
 * the database's vocabulary because that is the contract other clients will read; the React app
 * renames at its own boundary. {@code aiScore}, which the card also has, is absent because no
 * column behind it exists — inventing a number here would be worse than omitting it.
 *
 * @param id            numeric primary key; included because it is cheap and unambiguous, but
 *                      {@code slug} is the identity every URL and every wishlist call uses
 * @param slug          URL identity, e.g. {@code iphone-16-pro}
 * @param name          display name
 * @param brand         manufacturer
 * @param category      one of the frontend's {@code ProductCategory} values
 * @param price         current price in rupees. {@code BigDecimal}, not {@code Integer} or
 *                      {@code double}: the column is {@code numeric(12,2)} precisely so money is
 *                      exact, and narrowing it at the HTTP boundary would discard that guarantee
 *                      the first time a price has paise in it. Jackson writes it as a JSON number,
 *                      so JavaScript still receives a plain {@code number}.
 * @param originalPrice pre-discount price, or {@code null} when the product is not discounted
 * @param rating        average rating out of 5, one decimal place
 * @param reviewCount   number of ratings behind {@code rating}
 * @param inStock       availability as the card renders it
 * @param imageUrl      primary image, or {@code null} — the frontend already renders a placeholder
 * @param imageAttribution the credit line that must be displayed alongside {@code imageUrl}, or
 *                      {@code null} when the image is a placeholder rather than a licensed
 *                      photograph. Chapter 24. This field is not decorative and not optional for a
 *                      client to honour: Openverse indexes Creative Commons works whose licences
 *                      grant use <em>on condition</em> of attribution, so a client that renders
 *                      {@code imageUrl} while ignoring this is using the work outside its licence.
 *                      It is carried on the product itself, beside the URL it belongs to, so that
 *                      no consumer can obtain one without the other.
 * @param imageLicense  licence code, e.g. {@code by-sa}, or {@code null} for a placeholder
 * @param imageLicenseUrl deed URL the attribution should link to, or {@code null}
 * @param imageSourceUrl the provider's page for the original work, or {@code null}
 * @param imagePlaceholder {@code true} when {@code imageUrl} is the seeded placehold.co stand-in
 *                      rather than a real photograph. Derived rather than stored — it is exactly
 *                      "no attribution was recorded" — and sent explicitly so the frontend can
 *                      distinguish "no photo found for this product" from "photo present" without
 *                      inferring it from a null, which is the kind of inference that silently
 *                      breaks when a field is added.
 */
public record ProductDto(
        Long id,
        String slug,
        String name,
        String brand,
        String category,
        BigDecimal price,
        BigDecimal originalPrice,
        BigDecimal rating,
        Integer reviewCount,
        Boolean inStock,
        String imageUrl,
        String imageAttribution,
        String imageLicense,
        String imageLicenseUrl,
        String imageSourceUrl,
        Boolean imagePlaceholder) {
}
