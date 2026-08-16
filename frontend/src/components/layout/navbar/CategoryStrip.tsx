import {
    Headphones,
    Keyboard,
    Laptop,
    Smartphone,
    Tv,
    Watch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import Container from "../Container";
import { useCategories } from "../../../features/discovery/hooks/useCatalogue";

/**
 * Glyph per category slug, keyed by the slugs `GET /api/categories` actually
 * returns: accessories, earbuds, headphones, laptop, smartphone, smartwatch,
 * television.
 *
 * A lookup rather than a field on the API response — which icon represents a
 * category is a presentation decision, and the backend has no business
 * carrying it. An unlisted slug falls back to the earbuds/headphones glyph
 * rather than rendering nothing, so a category added server-side still gets a
 * usable chip without a frontend release.
 */
const glyphs: Record<string, LucideIcon> = {
    smartphone: Smartphone,
    laptop: Laptop,
    smartwatch: Watch,
    headphones: Headphones,
    earbuds: Headphones,
    television: Tv,
    accessories: Keyboard,
};

/**
 * Slim secondary navigation.
 *
 * Text-first chips rather than large gradient tiles — the header is persistent
 * chrome, so every pixel of height it takes is height the content doesn't get.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 24 — this strip was nine dead buttons.
 *
 * Every chip was a `<button type="button">` with no `onClick`: Mobiles,
 * Laptops, Smart Watches, Audio, TVs, Monitors, Gaming, Cameras, Appliances.
 * Clicking any of them did nothing, on every page of the app.
 *
 * Two things were wrong, and only one of them was the missing handler. The
 * list itself was invented: **Monitors, Gaming, Cameras and Appliances are not
 * categories this catalogue has** — the API serves seven, and those four are
 * not among them. Wiring the hardcoded list up would have produced four chips
 * that navigate to a guaranteed-empty result page, which is a worse failure
 * than a dead button because it looks like the catalogue is broken rather than
 * the link.
 *
 * So the list is no longer hardcoded. It comes from `GET /api/categories`, the
 * same source the homepage tile grid already uses, which means the strip can
 * only ever offer a category that has products behind it — the endpoint
 * derives its rows by grouping the products table and cannot return an empty
 * one. Chips are `<Link>`s to `/browse?category=<slug>`, the route that
 * already reads that parameter.
 * ---------------------------------------------------------------------------
 */
export default function CategoryStrip() {
    const { status, categories } = useCategories();

    /*
     * Render nothing until there is something real to show. The alternative —
     * a skeleton row — would reserve 3rem of persistent header height on every
     * page for a strip that is decoration, and an error state here would put a
     * failure message in the site chrome for a request the user did not make.
     * A missing strip degrades to "no shortcut"; the nav, search and footer all
     * still reach the catalogue.
     */
    if (status !== "ready" || categories.length === 0) return null;

    return (
        <div className="relative border-t border-slate-100 bg-white">

            <Container className="flex h-12 items-center gap-1 overflow-x-auto scrollbar-hide sm:h-11">

                {categories.map((category) => {
                    const Icon = glyphs[category.slug] ?? Headphones;

                    return (
                        <Link
                            key={category.slug}
                            to={`/browse?category=${encodeURIComponent(category.slug)}`}
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-2
                                rounded-full
                                px-3
                                py-2.5
                                text-[13px]
                                font-medium
                                sm:py-1.5
                                text-slate-600
                                transition
                                duration-200
                                hover:bg-slate-100
                                hover:text-slate-900
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-blue-500
                            "
                        >
                            <Icon
                                size={15}
                                className="text-slate-400"
                                aria-hidden="true"
                            />
                            {category.name}
                        </Link>
                    );
                })}

            </Container>

            {/* Right-edge fade: the strip scrolls on small screens but has no
                arrows, so this is the only cue that more categories exist.
                Hidden from `lg`, where the full set already fits. */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent lg:hidden"
            />

        </div>
    );
}
