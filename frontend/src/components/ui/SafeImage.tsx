import { useState } from "react";
import { ImageIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SafeImageProps {
    src?: string;
    alt: string;
    /** Classes for the frame that wraps the image / fallback. */
    className?: string;
    /** Classes for the <img> itself. */
    imgClassName?: string;
    /** Glyph shown when the image is missing or fails to load. */
    icon?: LucideIcon;
    /** Classes for the fallback glyph. */
    iconClassName?: string;
}

/**
 * An <img> that degrades to a glyph instead of a broken-image icon.
 *
 * The product and brand asset folders are currently empty, so the fallback is
 * the common path rather than an edge case — every image in the app should go
 * through here so a missing file looks like a deliberate placeholder.
 */
export default function SafeImage({
    src,
    alt,
    className = "",
    imgClassName = "",
    icon: Icon = ImageIcon,
    iconClassName = "h-10 w-10 text-slate-300",
}: SafeImageProps) {
    // Tracking *which* src failed (rather than a boolean) means the fallback
    // resets automatically when a different src is passed in.
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    const showFallback = !src || failedSrc === src;

    return (
        <div className={className}>
            {showFallback ? (
                <Icon
                    className={iconClassName}
                    strokeWidth={1.25}
                    aria-label={alt}
                    role="img"
                />
            ) : (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onError={() => setFailedSrc(src)}
                    className={imgClassName}
                />
            )}
        </div>
    );
}
