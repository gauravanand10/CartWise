package com.cartwise.service;

import com.cartwise.common.dto.ProductDto;
import com.cartwise.entity.Product;

/**
 * Entity → DTO translation for products, in one place.
 *
 * <p>Two services need it: {@link ProductService} returns products directly, and
 * {@link WishlistService} embeds them in wishlist entries. Duplicating the mapping in both is how
 * two endpoints end up disagreeing about a field after a schema change — one gets updated, the
 * other does not.
 *
 * <p>Package-private static method rather than an injected {@code @Component}: it has no state, no
 * dependencies and no reason to be swapped out, so making it a bean would add a constructor
 * argument to every service for nothing. It lives in {@code service} rather than {@code common.dto}
 * to keep the DTO free of any knowledge of the entity — the dependency points one way, from the
 * layer that translates toward both of the things it translates between.
 */
final class ProductMapper {

    private ProductMapper() {
    }

    /**
     * Projects a persisted product onto the wire shape.
     *
     * <p>{@code reviewCount} is boxed from a primitive {@code int} because the DTO uses
     * {@code Integer} throughout for uniformity, not because it can be null — it cannot.
     * {@code originalPrice} and {@code imageUrl} genuinely can be, and are passed through as-is so
     * the client sees {@code null} rather than a zero or an empty string it would have to
     * special-case.
     */
    static ProductDto toDto(Product product) {
        return new ProductDto(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getBrand(),
                product.getCategory(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getRating(),
                product.getReviewCount(),
                product.isInStock(),
                product.getImageUrl());
    }
}
