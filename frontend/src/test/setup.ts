import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

/**
 * What every test in this suite can assume about its environment.
 *
 * The rule this file exists to enforce: **a test must not be able to see what another test did.**
 * The wishlist and comparison both persist to `localStorage` through module-level singletons, so
 * without the reset below, saving a product in one test leaves it saved in the next — and the
 * resulting failure appears in whichever test happens to run second, which is not the one with the
 * bug in it.
 */

/**
 * `matchMedia` is not implemented by jsdom, and framer-motion's `useReducedMotion` calls it on
 * mount. Without this stub, `HeroBanner` and every `<motion.*>` component throw on render — an
 * error about a browser API in the middle of a test about carousel dots.
 *
 * It answers "no preference" to everything, which is the majority browser state and the one where
 * animation code actually runs. A test that needs the reduced-motion branch overrides it locally.
 */
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},        // deprecated, still called by some libraries
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }),
});

/**
 * jsdom implements no scrolling, so these are absent and any call throws. Stubbed as no-ops here;
 * `HeroBanner.test.tsx` replaces `scrollTo` with a version that records geometry, because that test
 * is specifically about scroll position.
 */
window.scrollTo = (() => {}) as typeof window.scrollTo;
Element.prototype.scrollTo = Element.prototype.scrollTo ?? ((() => {}) as Element["scrollTo"]);

/**
 * `IntersectionObserver` and `ResizeObserver` are absent from jsdom and used by reveal-on-scroll and
 * measurement code. Minimal stubs, so a component that sets one up renders instead of crashing —
 * they observe nothing, which is correct for an environment with no viewport.
 */
class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
}

vi.stubGlobal("IntersectionObserver", NoopObserver);
vi.stubGlobal("ResizeObserver", NoopObserver);

beforeEach(() => {
    // The persisted-list singletons read this at module load and write on every change.
    window.localStorage.clear();
    window.sessionStorage.clear();
});

afterEach(() => {
    // Unmounts anything still rendered. Without it, a component's effects keep running into the
    // next test — a pending fetch resolving after its test has finished is the usual symptom, and
    // it surfaces as "an update was not wrapped in act(...)" somewhere unrelated.
    cleanup();

    // Undo `vi.spyOn` / `vi.stubGlobal` from the test that just ran, so a stubbed `fetch` cannot
    // leak into a test that expects the real one to be absent.
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
