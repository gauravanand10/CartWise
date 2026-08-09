import { useContext } from "react";

import { CompareContext } from "../context/compareContext";
import type { CompareSelection } from "../context/compareContext";

/**
 * Reads the app-wide comparison selection.
 *
 * Throws rather than returning a no-op fallback: a missing provider would turn
 * every "Add to compare" button into a silent dead control, which is far harder
 * to notice than a crash during development.
 */
export function useCompareSelection(): CompareSelection {
    const context = useContext(CompareContext);

    if (!context) {
        throw new Error(
            "useCompareSelection must be used inside <CompareProvider>.",
        );
    }

    return context;
}
