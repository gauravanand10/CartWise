import type { GalleryImage, ProductBase } from "../types/product";

/**
 * Product imagery.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 26.5 — THIS FILE STOPPED DRAWING GREY BOXES
 *
 * Both functions used to build placehold.co URLs from the product's name, so
 * every "photograph" in the app was the words "iPhone 16 Pro — Front" rendered
 * in grey. That made sense when it was written: there were no images.
 *
 * There are now. Chapter 24 built the Openverse integration, Chapter 26.5's
 * backfill ran it across the expanded catalogue, and all 100 products carry a
 * real Creative Commons photograph with its attribution. The API sends both on
 * every product. Continuing to generate placeholders would have meant the one
 * page dedicated to a single product was the only page not showing it.
 *
 * THE GALLERY IS NOW ONE IMAGE, NOT FOUR
 *
 * `GALLERY_VIEWS` listed four angles — Front, Back, Side, Detail — and the old
 * code produced a placeholder for each. There is exactly one photograph per
 * product, so a four-slot gallery could only be filled by showing the same
 * picture four times with four different captions claiming four different
 * views. The gallery renders what exists.
 *
 * The caption says what the picture actually is: an openly-licensed photograph
 * of this kind of product, not a manufacturer shot of this exact model. The
 * backfill searches by CATEGORY — see ProductImageService — so the image beside
 * a Pixel 9a is a photograph of a smartphone rather than of that phone. Saying
 * so in the caption is the difference between an illustration and a
 * misrepresentation, and it costs one line.
 * ---------------------------------------------------------------------------
 */

/**
 * The gallery for one product.
 *
 * Returns an empty array when there is no usable image, which the gallery
 * component already handles — it is the same state a product whose Openverse
 * search found nothing has always been in.
 */
export function buildGallery(base: ProductBase): GalleryImage[] {
    if (!base.image.url || base.image.placeholder) return [];

    return [
        {
            id: `${base.slug}-0`,
            src: base.image.url,
            alt: `Photograph illustrating ${base.name}`,
            caption: `Illustrative ${base.category.toLowerCase()} photograph`,
        },
    ];
}

/**
 * The single image a product card should show.
 *
 * Falls back to a generated placeholder rather than an empty string: a card is
 * a fixed-size tile in a grid, and handing it nothing collapses the row. The
 * fallback is only reachable for a product whose image fetch found nothing,
 * which is currently none of the hundred.
 */
export function cardImage(base: ProductBase): string {
    return (
        base.image.url
        ?? `https://placehold.co/300x300?text=${encodeURIComponent(base.name)}`
    );
}
