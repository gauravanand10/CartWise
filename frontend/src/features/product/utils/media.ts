import { GALLERY_VIEWS } from "../constants";
import type { GalleryImage, ProductBase } from "../types/product";

/**
 * Gallery images.
 *
 * Placeholders only — no real product photography is downloaded or bundled, as
 * the brief requires. Each view gets its own labelled placeholder so the
 * thumbnail strip is visibly a *set of angles* rather than the same picture
 * four times, and every one still renders through SafeImage so a blocked or
 * offline placeholder host degrades to a category glyph instead of a broken
 * image icon.
 */
export function buildGallery(base: ProductBase): GalleryImage[] {
    return GALLERY_VIEWS.map((view, index) => {
        const label = encodeURIComponent(`${base.name} — ${view}`);

        return {
            id: `${base.slug}-${index}`,
            src: `https://placehold.co/900x900?text=${label}`,
            alt: `${base.name}, ${view.toLowerCase()} view`,
            caption: view,
        };
    });
}

/** The single image a product card should show. */
export function cardImage(base: ProductBase): string {
    return `https://placehold.co/300x300?text=${encodeURIComponent(base.name)}`;
}
