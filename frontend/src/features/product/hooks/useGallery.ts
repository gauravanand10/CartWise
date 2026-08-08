import { useCallback, useState } from "react";
import type { MouseEvent } from "react";

interface UseGallery {
    index: number;
    select: (next: number) => void;
    next: () => void;
    previous: () => void;
    zoomed: boolean;
    toggleZoom: () => void;
    /** CSS `transform-origin` tracking the pointer while zoomed. */
    origin: string;
    onPointerMove: (event: MouseEvent<HTMLElement>) => void;
}

/**
 * Gallery navigation and basic zoom.
 *
 * Zoom is a CSS transform driven by `transform-origin` rather than a lightbox
 * library: it costs nothing, works on the placeholder images we actually ship,
 * and stays keyboard-operable because the toggle is a real button rather than a
 * hover-only effect.
 */
export function useGallery(length: number): UseGallery {
    const [index, setIndex] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const [origin, setOrigin] = useState("50% 50%");

    const select = useCallback(
        (nextIndex: number) => {
            if (length === 0) return;

            // Wrap at both ends so the arrows are never dead controls.
            const wrapped = ((nextIndex % length) + length) % length;

            setIndex(wrapped);
            setZoomed(false);
        },
        [length],
    );

    const next = useCallback(() => {
        setIndex((current) => (length === 0 ? 0 : (current + 1) % length));
        setZoomed(false);
    }, [length]);

    const previous = useCallback(() => {
        setIndex((current) =>
            length === 0 ? 0 : (current - 1 + length) % length,
        );
        setZoomed(false);
    }, [length]);

    const toggleZoom = useCallback(() => setZoomed((value) => !value), []);

    const onPointerMove = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            if (!zoomed) return;

            const bounds = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width) * 100;
            const y = ((event.clientY - bounds.top) / bounds.height) * 100;

            setOrigin(`${x}% ${y}%`);
        },
        [zoomed],
    );

    return {
        index,
        select,
        next,
        previous,
        zoomed,
        toggleZoom,
        origin,
        onPointerMove,
    };
}
