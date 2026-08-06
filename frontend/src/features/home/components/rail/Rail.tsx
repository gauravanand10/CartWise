import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { useRailScroll } from "../../hooks/useRailScroll";
import { railScroller } from "../../styles";

interface RailProps {
    children: ReactNode;
    /** Accessible name for the scroll region, e.g. "Flash deals". */
    label: string;
}

interface ArrowProps {
    direction: "left" | "right";
    visible: boolean;
    onClick: () => void;
}

function RailArrow({ direction, visible, onClick }: ArrowProps) {
    const Icon = direction === "left" ? ChevronLeft : ChevronRight;
    const side = direction === "left" ? "-left-5" : "-right-5";

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
            aria-hidden={!visible}
            tabIndex={visible ? 0 : -1}
            className={`
                absolute
                ${side}
                top-1/2
                z-10
                hidden
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-700
                shadow-[0_4px_16px_rgba(15,23,42,0.14)]
                transition-opacity
                duration-200
                hover:bg-slate-50
                hover:text-slate-900
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                md:flex
                ${visible ? "opacity-100" : "pointer-events-none opacity-0"}
            `}
        >
            <Icon size={20} />
        </button>
    );
}

/**
 * A horizontally scrolling row with paged arrow controls.
 *
 * Arrows overlay the row's vertical centre rather than sitting above it — the
 * space above belongs to the section header's own CTA, and stacking both there
 * makes them collide. They're desktop-only: touch devices get native swipe.
 */
export default function Rail({ children, label }: RailProps) {
    const { ref, canScrollLeft, canScrollRight, scrollByPage } = useRailScroll();

    return (
        <div className="relative">

            <RailArrow
                direction="left"
                visible={canScrollLeft}
                onClick={() => scrollByPage("left")}
            />

            <RailArrow
                direction="right"
                visible={canScrollRight}
                onClick={() => scrollByPage("right")}
            />

            <div
                ref={ref}
                role="region"
                aria-label={label}
                tabIndex={0}
                className={railScroller}
            >
                {children}
            </div>

        </div>
    );
}
