export const SHADOWS = {
    none: "none",

    xs: "0 1px 2px rgba(15, 23, 42, 0.05)",

    sm: "0 4px 12px rgba(15, 23, 42, 0.06)",

    md: "0 8px 24px rgba(15, 23, 42, 0.08)",

    lg: "0 16px 40px rgba(15, 23, 42, 0.10)",

    xl: "0 24px 60px rgba(15, 23, 42, 0.12)",

    glow: "0 0 40px rgba(37, 99, 235, 0.18)",

    glass: "0 8px 32px rgba(15, 23, 42, 0.08)",

    floating: "0 20px 60px rgba(15, 23, 42, 0.15)",

    hero: "0 30px 80px rgba(15, 23, 42, 0.18)",
} as const;

export const COMPONENT_SHADOW = {
    button: SHADOWS.sm,

    buttonHover: SHADOWS.md,

    card: SHADOWS.md,

    cardHover: SHADOWS.lg,

    productCard: SHADOWS.lg,

    productCardHover: SHADOWS.xl,

    glassPanel: SHADOWS.glass,

    hero: SHADOWS.hero,

    floating: SHADOWS.floating,

    modal: SHADOWS.xl,

    dropdown: SHADOWS.lg,

    tooltip: SHADOWS.sm,
} as const;
