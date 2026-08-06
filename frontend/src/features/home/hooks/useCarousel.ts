import { useCallback, useEffect, useState } from "react";

interface CarouselOptions {
    /** Number of slides. */
    length: number;
    /** Milliseconds between automatic advances. */
    intervalMs?: number;
    /** Set false to disable auto-advance entirely (e.g. reduced motion). */
    autoPlay?: boolean;
}

interface CarouselState {
    index: number;
    /** +1 when advancing forward, -1 when going back — drives slide direction. */
    direction: number;
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
    pause: () => void;
    resume: () => void;
}

/**
 * Index state for an auto-advancing carousel.
 *
 * The timer restarts whenever the index changes, so a manual navigation always
 * gets a full interval before the next automatic advance — without that, tapping
 * an arrow late in a cycle makes the carousel jump again almost immediately.
 */
export function useCarousel({
    length,
    intervalMs = 5000,
    autoPlay = true,
}: CarouselOptions): CarouselState {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [paused, setPaused] = useState(false);

    const next = useCallback(() => {
        setDirection(1);
        setIndex((current) => (current + 1) % length);
    }, [length]);

    const prev = useCallback(() => {
        setDirection(-1);
        setIndex((current) => (current - 1 + length) % length);
    }, [length]);

    const goTo = useCallback((target: number) => {
        setIndex((current) => {
            setDirection(target > current ? 1 : -1);
            return target;
        });
    }, []);

    const pause = useCallback(() => setPaused(true), []);
    const resume = useCallback(() => setPaused(false), []);

    useEffect(() => {
        if (!autoPlay || paused || length <= 1) return;

        const id = window.setTimeout(next, intervalMs);

        return () => window.clearTimeout(id);
    }, [autoPlay, paused, length, intervalMs, next, index]);

    return { index, direction, next, prev, goTo, pause, resume };
}
