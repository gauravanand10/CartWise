import { useEffect, useState } from "react";

/**
 * Reports whether the window has been scrolled past `threshold` pixels.
 *
 * Reads are throttled through `requestAnimationFrame` so a fast scroll can't
 * queue up more state updates than the browser can paint.
 */
export function useScrolledPast(threshold: number): boolean {
    const [scrolledPast, setScrolledPast] = useState(false);

    useEffect(() => {
        let frame = 0;

        const check = () => {
            frame = 0;
            setScrolledPast(window.scrollY > threshold);
        };

        const onScroll = () => {
            if (frame) return;
            frame = window.requestAnimationFrame(check);
        };

        // Run once on mount so a restored scroll position is reflected immediately.
        check();

        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", onScroll);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, [threshold]);

    return scrolledPast;
}
