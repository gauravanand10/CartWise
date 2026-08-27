import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbProps {
    category: string;
    name: string;
}

/**
 * Trail back to Home and to the category's search results.
 *
 * The category crumb deep-links into the existing search page with the category
 * pre-selected, so "up one level" lands somewhere useful instead of on a route
 * that does not exist yet.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS INLINE FLOW RATHER THAN A FLEX ROW
 *
 * It renders as inline text — `<li className="inline">` with chevrons between —
 * instead of the flex row this used to be. That started as a workaround for a
 * bug whose cause had not been found: every crumb measured exactly 40px wide
 * regardless of its text, and the trail rendered as "SmartphoniPhone 16".
 *
 * The cause is known now, and it was not this component. A `--spacing-block`
 * token in index.css was generating `.inline-block { inline-size: 2.5rem }`,
 * which overrode Tailwind's `inline-block` DISPLAY utility everywhere in the
 * application — see the long note in index.css. The token is gone.
 *
 * The inline version is kept because it is the better markup for a breadcrumb
 * anyway: the trail wraps as text at narrow widths instead of squeezing its
 * items, and it no longer depends on `inline-block` resolving correctly.
 * ---------------------------------------------------------------------------
 */
export default function Breadcrumb({ category, name }: BreadcrumbProps) {
    // `-my-1 py-1` lifts the tap target from 18px to 26px, clearing the WCAG
    // 2.2 minimum, while the negative margin hands the padding back to the
    // layout so the trail's spacing is unchanged.
    const linkClass =
        "inline whitespace-nowrap rounded py-1 align-middle text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

    return (
        <nav aria-label="Breadcrumb">
            <ol className="text-sm leading-7">

                <li className="inline">
                    <Link to="/" className={linkClass}>
                        Home
                    </Link>
                </li>

                <li aria-hidden="true" className="inline px-2 align-middle text-slate-400">
                    <ChevronRight size={14} className="inline" />
                </li>

                {/*
                    Chapter 24 repointed this from `/search?category=` to
                    `/browse?category=`.

                    Two things were wrong with the old target. SearchPage read
                    no URL parameters at all, so the category was silently
                    dropped and the crumb landed on an unfiltered page — the
                    trail claimed to walk up to "all Smartphones" and delivered
                    the generic search screen. And /search is served by a
                    20-product mock array, while the product the crumb belongs
                    to came from the live catalogue of 50, so even a working
                    filter would have walked from real data into mock data.

                    /browse reads `?category=` already and is backed by the
                    same API as this page. The slug is lowercased because that
                    is the form `GET /api/categories` publishes and the
                    catalogue filter compares against.
                */}
                <li className="inline">
                    <Link
                        to={`/browse?category=${encodeURIComponent(category.toLowerCase())}`}
                        className={linkClass}
                    >
                        {category}
                    </Link>
                </li>

                <li aria-hidden="true" className="inline px-2 align-middle text-slate-400">
                    <ChevronRight size={14} className="inline" />
                </li>

                {/* Current page: not a link, and marked as the current location
                    so a screen reader announces where the trail ends. */}
                <li className="inline">
                    <span
                        aria-current="page"
                        className="inline align-middle font-medium text-slate-900"
                    >
                        {name}
                    </span>
                </li>

            </ol>
        </nav>
    );
}
