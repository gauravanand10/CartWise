import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ViewAllButtonProps {
    label?: string;
    /** Renders light-on-dark, for use inside saturated panels. */
    onDark?: boolean;
    onClick?: () => void;
    /**
     * Route this CTA navigates to. When set, the control renders as a `<Link>`
     * rather than a `<button>`.
     *
     * Chapter 24. Every one of the seven homepage sections rendered this
     * component without an `onClick`, so all seven CTAs — "See all", "All
     * deals", "All price drops", "How scoring works", "All brands", "Full
     * history", "Refine picks" — were buttons that did nothing when pressed.
     *
     * A route prop rather than seven `useNavigate` handlers: a section CTA is
     * navigation, and navigation should be an anchor. That gives middle-click,
     * open-in-new-tab and a status-bar URL on hover, none of which a button
     * with a navigate() callback provides.
     */
    to?: string;
}

/**
 * The standard section CTA: a quiet pill that defers to the content it sits above.
 *
 * Deliberately not a saturated gradient button — with eight of these down the
 * page, loud CTAs would compete with the products themselves.
 */
export default function ViewAllButton({
    label = "View all",
    onDark = false,
    onClick,
    to,
}: ViewAllButtonProps) {
    const tone = onDark
        ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

    const className = `
                group
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                px-4
                py-2
                text-sm
                font-semibold
                transition
                duration-200
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                focus-visible:ring-offset-2
                ${tone}
            `;

    const inner = (
        <>
            {label}

            <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
        </>
    );

    if (to) {
        return (
            <Link to={to} className={className}>
                {inner}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                group
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                px-4
                py-2
                text-sm
                font-semibold
                transition
                duration-200
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                focus-visible:ring-offset-2
                ${tone}
            `}
        >
            {label}

            <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
        </button>
    );
}
