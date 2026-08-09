/** Most products that can be compared at once. */
export const MAX_COMPARE = 4;

/** Below this, the comparison has nothing to compare against. */
export const MIN_COMPARE = 2;

/** localStorage key for the current selection. */
export const COMPARE_STORAGE_KEY = "cartwise:compare";

/** Simulated latency so the loading state is exercised in development. */
export const COMPARE_LATENCY_MS = 350;

/**
 * Column width below `lg`, where the grid scrolls horizontally.
 *
 * Narrow enough that a second column is always partly visible on a phone —
 * the affordance that tells a touch user the comparison scrolls sideways.
 */
export const COMPARE_COLUMN_WIDTH = "w-[220px] sm:w-[260px]";
