/**
 * Which pastel a category tile gets, and which glyph sits on it.
 *
 * Both are derived from the category's slug rather than from its position in the
 * array, and that requirement is the whole reason this file exists. Indexing by
 * position looks identical on screen today and is wrong in a specific, ugly way:
 * the categories come from `GET /api/categories` ordered alphabetically, so the
 * day a "Camera" category gains its first product it inserts at the front and
 * every tile after it changes colour. Users navigate colour-blocked grids by
 * colour and position long before they read the labels, and a grid that
 * reshuffles its palette when the catalogue changes quietly breaks that.
 *
 * Deriving from the slug means "smartphone" is lilac permanently, wherever it
 * lands in the list and however many categories exist.
 */

/**
 * The six tile surfaces, in the order they cycle.
 *
 * Tailwind class names rather than raw values, because these are the utilities
 * that `@theme` generates from `--color-tile-*`. Written as complete literal
 * strings and never assembled as `` `bg-tile-${name}` `` — Tailwind scans source
 * text for class names it can see, so an interpolated class is not generated and
 * the tile renders with no background at all.
 */
const TILE_SURFACES = [
    "bg-tile-mint",
    "bg-tile-butter",
    "bg-tile-blush",
    "bg-tile-sky",
    "bg-tile-lilac",
    "bg-tile-peach",
] as const;

/**
 * Authored geometric glyphs — six abstract marks, no brand imagery.
 *
 * Deliberately not per-category pictograms. A pictogram set needs one drawing
 * per category name, which means an unknown category renders nothing, and it
 * means someone eventually reaches for a real product silhouette. These are
 * abstract shapes that decorate without claiming to depict, so any category the
 * API invents tomorrow already has one.
 *
 * Each is a `path`/`shape` fragment drawn in a 24×24 viewBox, inheriting
 * `currentColor` so the tile controls the ink.
 */
const TILE_GLYPHS = [
    // Concentric rounded square
    <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <rect x="8" y="8" width="8" height="8" rx="2.5" />
    </>,
    // Stacked bars
    <>
        <path d="M4 17h4v3H4zM10 11h4v9h-4zM16 6h4v14h-4z" />
    </>,
    // Circle and orbit
    <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3" />
    </>,
    // Chevron pair
    <>
        <path d="M5 7l6 5-6 5" />
        <path d="M13 7l6 5-6 5" />
    </>,
    // Diamond grid
    <>
        <path d="M12 3l4.5 4.5L12 12 7.5 7.5z" />
        <path d="M12 12l4.5 4.5L12 21l-4.5-4.5z" />
    </>,
    // Arc stack
    <>
        <path d="M4 16a8 8 0 0116 0" />
        <path d="M8 20a4 4 0 018 0" />
    </>,
] as const;

/**
 * A small, stable hash of a string.
 *
 * The classic djb2-style multiply-and-add. It needs no cryptographic properties
 * — only that the same slug always produces the same number, and that similar
 * slugs ("laptop" / "laptops") do not collide into the same bucket often enough
 * to look deliberate.
 *
 * `Math.imul` keeps the multiply in 32-bit integer space. Plain `*` would
 * overflow into floating point and start losing low bits, which is exactly where
 * the variation lives — the hash would then bunch up and half the tiles would
 * come out the same colour.
 */
function hash(value: string): number {
    let h = 5381;

    for (let i = 0; i < value.length; i++) {
        h = Math.imul(h, 33) ^ value.charCodeAt(i);
    }

    // `>>> 0` reinterprets the sign bit as magnitude, so the result is a
    // non-negative integer and `%` cannot return a negative index.
    return h >>> 0;
}

/** The Tailwind background class for a category, stable for the life of the slug. */
export function tileSurface(slug: string): string {
    return TILE_SURFACES[hash(slug) % TILE_SURFACES.length];
}

/** The glyph fragment for a category, chosen by the same rule as the colour. */
export function tileGlyph(slug: string) {
    // Offset so a slug does not get colour 0 and glyph 0 together — otherwise
    // colour and shape correlate perfectly and the glyph adds no information.
    return TILE_GLYPHS[(hash(slug) + 2) % TILE_GLYPHS.length];
}

/** Exposed for the token audit in the chapter report, and for tests. */
export const TILE_SURFACE_COUNT = TILE_SURFACES.length;
