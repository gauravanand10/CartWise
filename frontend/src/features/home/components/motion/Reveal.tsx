import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
    children: ReactNode;
    /** Stagger hint, in seconds. Keep small — long chains feel sluggish. */
    delay?: number;
    /** Distance travelled on entry, in px. */
    offset?: number;
    className?: string;
}

/**
 * Fades + lifts its children into view once, the first time they're scrolled to.
 *
 * Centralising this here keeps the motion vocabulary identical across every
 * homepage section, and gives us one place to honour `prefers-reduced-motion`
 * (where the animation collapses to a plain fade with no movement).
 */
export default function Reveal({
    children,
    delay = 0,
    offset = 24,
    className,
}: RevealProps) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: reduceMotion ? 0 : offset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
                duration: reduceMotion ? 0.2 : 0.5,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
