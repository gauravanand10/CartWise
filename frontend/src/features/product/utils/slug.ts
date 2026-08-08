/**
 * URL slugs.
 *
 * Product identity in the URL is the slug, not a numeric id, so links are
 * readable and shareable (`/product/iphone-16-pro`). Every card in the app
 * derives its href from the product's own `slug` field; this helper exists so
 * the *data* files can generate those fields from a name without drifting from
 * whatever the router later has to parse back.
 */

/** "iPhone 16 Pro" → "iphone-16-pro". Safe for use as a route segment. */
export function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
