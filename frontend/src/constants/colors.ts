export const COLORS = {
    primary: "#C026D3",
    primaryDark: "#A21CAF",
    primaryLight: "#E879F9",

    secondary: "#9333EA",
    secondaryDark: "#7E22CE",
    secondaryLight: "#C084FC",

    accent: "#FACC15",
    accentDark: "#EAB308",

    background: "#FDF4FF",
    surface: "#FFFFFF",
    surfaceSecondary: "#FAF5FF",

    white: "#FFFFFF",
    black: "#020617",

    slate50: "#F8FAFC",
    slate100: "#F1F5F9",
    slate200: "#E2E8F0",
    slate300: "#CBD5E1",
    slate400: "#94A3B8",
    slate500: "#64748B",
    slate600: "#475569",
    slate700: "#334155",
    slate800: "#1E293B",
    slate900: "#0F172A",

    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    discount: "#16A34A",
    rating: "#FACC15",

    blinkit: "#FFDE00",
    zepto: "#7C3AED",
    instamart: "#FB923C",
    amazon: "#232F3E",
    flipkart: "#2874F0",
    croma: "#06B6D4",
    relianceDigital: "#E11D48",

    border: "#E2E8F0",
    borderLight: "#F1F5F9",

    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    textWhite: "#FFFFFF",

    overlay: "rgba(15,23,42,0.65)",

    glass: "rgba(255,255,255,0.60)",
    glassBorder: "rgba(255,255,255,0.35)",
} as const;

export type ColorKey = keyof typeof COLORS;
