import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Calls `handler` when a pointer press lands outside `ref`.
 *
 * Listens on `pointerdown` rather than `click` so the dropdown closes on press
 * instead of release — matching native select behaviour and avoiding a stray
 * click landing on whatever sits underneath.
 */
export function useClickOutside(
    ref: RefObject<HTMLElement | null>,
    handler: () => void,
    enabled = true,
): void {
    useEffect(() => {
        if (!enabled) return;

        const onPointerDown = (event: PointerEvent) => {
            const el = ref.current;
            if (el && !el.contains(event.target as Node)) handler();
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [ref, handler, enabled]);
}
