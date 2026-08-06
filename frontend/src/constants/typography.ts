export const FONT_FAMILY = {
    sans: [
        "Inter",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "sans-serif",
    ].join(", "),
} as const;

export const FONT_SIZE = {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
} as const;

export const FONT_WEIGHT = {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
} as const;

export const LINE_HEIGHT = {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.75,
} as const;

export const LETTER_SPACING = {
    tighter: "-0.04em",
    tight: "-0.02em",
    normal: "0em",
    wide: "0.02em",
} as const;

export const TYPOGRAPHY = {
    hero: {
        fontSize: FONT_SIZE["6xl"],
        fontWeight: FONT_WEIGHT.black,
        lineHeight: LINE_HEIGHT.tight,
        letterSpacing: LETTER_SPACING.tighter,
    },

    pageTitle: {
        fontSize: FONT_SIZE["4xl"],
        fontWeight: FONT_WEIGHT.extrabold,
        lineHeight: LINE_HEIGHT.tight,
        letterSpacing: LETTER_SPACING.tight,
    },

    sectionTitle: {
        fontSize: FONT_SIZE["3xl"],
        fontWeight: FONT_WEIGHT.bold,
        lineHeight: LINE_HEIGHT.snug,
    },

    cardTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        lineHeight: LINE_HEIGHT.snug,
    },

    productTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.semibold,
        lineHeight: LINE_HEIGHT.snug,
    },

    body: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.regular,
        lineHeight: LINE_HEIGHT.normal,
    },

    bodyLarge: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.regular,
        lineHeight: LINE_HEIGHT.normal,
    },

    caption: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.medium,
        lineHeight: LINE_HEIGHT.normal,
    },

    label: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.semibold,
        lineHeight: LINE_HEIGHT.normal,
        letterSpacing: LETTER_SPACING.wide,
    },

    button: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.semibold,
        lineHeight: LINE_HEIGHT.normal,
    },

    price: {
        fontSize: FONT_SIZE["2xl"],
        fontWeight: FONT_WEIGHT.black,
        lineHeight: LINE_HEIGHT.tight,
    },

    rating: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
        lineHeight: LINE_HEIGHT.normal,
    },
} as const;
