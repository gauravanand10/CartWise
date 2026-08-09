export { default as ComparePage } from "./ComparePage";

export { default as CompareProvider } from "./context/CompareProvider";

export { useCompareSelection } from "./hooks/useCompareSelection";

export { MAX_COMPARE, MIN_COMPARE } from "./constants";

export type {
    AddResult,
    CompareStatus,
    CompareVerdict,
    ResolvedRow,
    ResolvedSection,
} from "./types/compare";
