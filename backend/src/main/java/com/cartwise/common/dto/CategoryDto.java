package com.cartwise.common.dto;

/**
 * One catalogue category, with how many products are in it.
 *
 * <p>Derived from a {@code GROUP BY} over the products table — there is no categories table. That
 * is a deliberate decision and worth stating where the type is defined, because the shape of this
 * record makes it look like a persisted entity and it is not.
 *
 * <p>A category here is a denormalised string column on {@code Product}, and it has no attributes of
 * its own: no description, no image, no ordering, no parent. A table would therefore start life with
 * exactly one meaningful column — the name that already exists on the product — plus the CRUD
 * endpoints, admin screens and foreign-key migration needed to keep it honest. That is a
 * considerable amount of machinery in exchange for a {@code GROUP BY} that the database performs
 * well, and it buys nothing until a category needs to carry data the product cannot.
 *
 * <p>The trade-off, stated plainly rather than hidden: a category with no products is invisible to
 * this endpoint, because a group with no rows does not exist. There is no way to create a category
 * in advance, rename one without updating every product, or order them by anything but their own
 * data. The day any of those is required, a table becomes the right answer and this endpoint becomes
 * its read model. Until then the string column is the simpler thing that is true.
 *
 * @param name         the category exactly as stored on the product, e.g. {@code "Smartphone"} —
 *                     this is the display form
 * @param slug         the URL form, e.g. {@code "smartphone"}: lower-cased with spaces hyphenated.
 *                     Derived rather than stored, so it cannot drift from the name it came from
 * @param productCount how many products carry this category. {@code long} because that is what
 *                     {@code COUNT} returns; the cast to {@code int} would be free today and wrong
 *                     eventually
 */
public record CategoryDto(String name, String slug, long productCount) {
}
