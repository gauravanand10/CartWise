import { ArrowRight } from "lucide-react";

interface ViewAllButtonProps {
    label?: string;
    /** Renders light-on-dark, for use inside saturated panels. */
    onDark?: boolean;
    onClick?: () => void;
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
}: ViewAllButtonProps) {
    const tone = onDark
        ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

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
