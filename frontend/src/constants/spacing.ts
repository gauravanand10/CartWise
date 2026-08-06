export const SPACING = {
    0: "0rem",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
} as const;

export const CONTAINER = {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1440px",
} as const;

export const SECTION_SPACING = {
    xs: SPACING[8],
    sm: SPACING[12],
    md: SPACING[16],
    lg: SPACING[20],
    xl: SPACING[24],
} as const;

export const CARD_SPACING = {
    xs: SPACING[3],
    sm: SPACING[4],
    md: SPACING[6],
    lg: SPACING[8],
} as const;

export const GRID_GAP = {
    sm: SPACING[4],
    md: SPACING[6],
    lg: SPACING[8],
    xl: SPACING[10],
} as const;

export const NAVBAR = {
    height: "80px",
} as const;

export const SEARCH = {
    height: "64px",
} as const;

export const PRODUCT_IMAGE = {
    sm: "180px",
    md: "240px",
    lg: "320px",
} as const;
