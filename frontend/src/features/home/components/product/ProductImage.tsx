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

import SafeImage from "../../../../components/ui/SafeImage";
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
 * Product imagery for the homepage.
 *
 * Thin wrapper over <SafeImage> that picks a category-appropriate fallback
 * glyph, so a missing file reads as "phone" or "laptop" rather than a generic
 * broken image.
 */
export default function ProductImage({
    src,
    alt,
    category,
    heightClass = "h-48",
    zoomOnGroupHover = true,
}: ProductImageProps) {
    const zoom = zoomOnGroupHover
        ? "transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        : "";

    return (
        <SafeImage
            src={src}
            alt={alt}
            icon={categoryGlyph[category]}
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
            imgClassName={`h-full w-full object-contain p-4 ${zoom}`}
            iconClassName={`h-14 w-14 text-slate-300 ${zoom}`}
        />
    );
}
