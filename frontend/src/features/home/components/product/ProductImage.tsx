import { useState } from "react";
import {
    Camera,
    Gamepad2,
    Headphones,
    Laptop,
    Monitor,
    Refrigerator,
    Smartphone,
    Tv,
    Watch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ProductCategory } from "../../types/home";

const categoryGlyph: Record<ProductCategory, LucideIcon> = {
    phones: Smartphone,
    laptops: Laptop,
    audio: Headphones,
    wearables: Watch,
    tvs: Tv,
    monitors: Monitor,
    gaming: Gamepad2,
    cameras: Camera,
    appliances: Refrigerator,
};

interface ProductImageProps {
    src: string;
    alt: string;
    category: ProductCategory;
    /** Tailwind height class for the image frame, e.g. "h-48". */
    heightClass?: string;
    /** Adds a scale-up on the parent's `group` hover. */
    zoomOnGroupHover?: boolean;
}

/**
 * Renders a product image, falling back to a category glyph on a soft tint
 * when the file is missing.
 *
 * The catalogue currently points at image paths the API doesn't serve yet, so
 * the fallback is the common case — it's styled to look like a deliberate
 * placeholder rather than a broken image.
 */
export default function ProductImage({
    src,
    alt,
    category,
    heightClass = "h-48",
    zoomOnGroupHover = true,
}: ProductImageProps) {
    const [failed, setFailed] = useState(false);
    const Glyph = categoryGlyph[category];

    const zoom = zoomOnGroupHover
        ? "transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        : "";

    return (
        <div
            className={`
                flex
                ${heightClass}
                items-center
                justify-center
                overflow-hidden
                rounded-[20px]
                bg-gradient-to-br
                from-slate-50
                to-slate-100
            `}
        >
            {failed || !src ? (
                <Glyph
                    className={`h-14 w-14 text-slate-300 ${zoom}`}
                    strokeWidth={1.25}
                    aria-hidden="true"
                />
            ) : (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onError={() => setFailed(true)}
                    className={`h-full w-full object-contain p-4 ${zoom}`}
                />
            )}
        </div>
    );
}
