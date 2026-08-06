export const RADIUS = {
    none: "0px",

    xs: "6px",
    sm: "10px",
    md: "14px",
    lg: "18px",
    xl: "24px",
    "2xl": "32px",
    full: "9999px",
} as const;

export const COMPONENT_RADIUS = {
    button: RADIUS.xl,

    input: RADIUS.xl,

    card: RADIUS["2xl"],

    productCard: RADIUS["2xl"],

    badge: RADIUS.full,

    chip: RADIUS.full,

    modal: RADIUS["2xl"],

    panel: RADIUS["2xl"],

    hero: RADIUS["2xl"],

    image: RADIUS.xl,

    avatar: RADIUS.full,
} as const;
