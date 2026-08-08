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
 */
export default function Breadcrumb({ category, name }: BreadcrumbProps) {
    // `-my-1 py-1` lifts the tap target from 18px to 26px, clearing the WCAG
    // 2.2 minimum, while the negative margin hands the padding back to the
    // layout so the trail's spacing is unchanged.
    const linkClass =
        "-my-1 inline-block rounded py-1 text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm">

                <li>
                    <Link to="/" className={linkClass}>
                        Home
                    </Link>
                </li>

                <li aria-hidden="true" className="text-slate-300">
                    <ChevronRight size={14} />
                </li>

                <li>
                    <Link
                        to={`/search?category=${encodeURIComponent(category)}`}
                        className={linkClass}
                    >
                        {category}
                    </Link>
                </li>

                <li aria-hidden="true" className="text-slate-300">
                    <ChevronRight size={14} />
                </li>

                {/* Current page: not a link, and marked as the current location
                    so a screen reader announces where the trail ends. */}
                <li>
                    <span
                        aria-current="page"
                        className="font-medium text-slate-900"
                    >
                        {name}
                    </span>
                </li>

            </ol>
        </nav>
    );
}
