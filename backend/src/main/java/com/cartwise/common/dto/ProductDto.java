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
        String imageUrl) {
}
