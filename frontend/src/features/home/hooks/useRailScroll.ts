import { useCallback, useEffect, useRef, useState } from "react";

interface RailScrollState {
    ref: React.RefObject<HTMLDivElement | null>;
    canScrollLeft: boolean;
    canScrollRight: boolean;
    scrollByPage: (direction: "left" | "right") => void;
}

/** Ignore sub-pixel rounding when deciding whether an edge has been reached. */
const EDGE_TOLERANCE = 8;

/**
 * Tracks how far a horizontal rail is scrolled and exposes paged scrolling.
 *
 * Used by every "scroll sideways" row on the homepage so the arrow enable/disable
 * behaviour is identical everywhere.
 */
export function useRailScroll(): RailScrollState {
    const ref = useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const sync = useCallback(() => {
        const el = ref.current;
        if (!el) return;

        const maxScroll = el.scrollWidth - el.clientWidth;

        setCanScrollLeft(el.scrollLeft > EDGE_TOLERANCE);
        setCanScrollRight(el.scrollLeft < maxScroll - EDGE_TOLERANCE);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        sync();

        el.addEventListener("scroll", sync, { passive: true });

        // Card widths are responsive, so re-check whenever the rail is resized.
        const observer = new ResizeObserver(sync);
        observer.observe(el);

        return () => {
            el.removeEventListener("scroll", sync);
            observer.disconnect();
        };
    }, [sync]);

    const scrollByPage = useCallback((direction: "left" | "right") => {
        const el = ref.current;
        if (!el) return;

        // Leave a sliver of the previous card visible so the row reads as continuous.
        const distance = el.clientWidth * 0.85;

        el.scrollBy({
            left: direction === "left" ? -distance : distance,
            behavior: "smooth",
        });
    }, []);

    return { ref, canScrollLeft, canScrollRight, scrollByPage };
}
