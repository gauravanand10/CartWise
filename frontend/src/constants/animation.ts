export const DURATION = {
    instant: "100ms",
    fast: "150ms",
    normal: "250ms",
    slow: "350ms",
    slower: "500ms",
} as const;

export const EASING = {
    standard: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const SCALE = {
    hover: 1.02,
    active: 0.98,
    imageHover: 1.08,
    buttonHover: 1.03,
} as const;

export const TRANSLATE = {
    cardHover: "-6px",
    buttonHover: "-2px",
    floating: "-10px",
} as const;

export const OPACITY = {
    hidden: 0,
    visible: 1,
    disabled: 0.5,
} as const;

export const TRANSITION = {
    default: `${DURATION.normal} ${EASING.smooth}`,
    fast: `${DURATION.fast} ${EASING.smooth}`,
    slow: `${DURATION.slow} ${EASING.smooth}`,
} as const;

export const BLUR = {
    glass: "16px",
    overlay: "24px",
} as const;

export const ANIMATION = {
    button: {
        transition: TRANSITION.default,
        scale: SCALE.buttonHover,
        translateY: TRANSLATE.buttonHover,
    },

    card: {
        transition: TRANSITION.default,
        scale: SCALE.hover,
        translateY: TRANSLATE.cardHover,
    },

    image: {
        transition: TRANSITION.slow,
        scale: SCALE.imageHover,
    },

    hero: {
        transition: TRANSITION.slow,
    },

    modal: {
        transition: TRANSITION.default,
    },
} as const;
