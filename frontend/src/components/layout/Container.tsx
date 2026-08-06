import type { ReactNode } from "react";

interface ContainerProps {
    children: ReactNode;
    className?: string;
}

/**
 * Single source of truth for the site's content width + horizontal padding.
 *
 * Every row of the navbar, the footer and the main page outlet render
 * through this component so their left/right edges always line up exactly,
 * on every screen size. Never hardcode `mx-auto max-w-* px-*` elsewhere —
 * reuse this instead.
 */
export default function Container({ children, className = "" }: ContainerProps) {
    return (
        <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
            {children}
        </div>
    );
}
