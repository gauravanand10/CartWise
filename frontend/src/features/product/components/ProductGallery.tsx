import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

import SafeImage from "../../../components/ui/SafeImage";
import { categoryGlyph } from "../constants";
import { useGallery } from "../hooks/useGallery";
import type { GalleryImage, ProductCategory } from "../types/product";

interface ProductGalleryProps {
    images: GalleryImage[];
    name: string;
    category: ProductCategory;
}

/**
 * Product image gallery.
 *
 * The thumbnail strip is a `radiogroup`: picking a view is a single-choice
 * selection, not navigation, so arrow-key behaviour and the announced state
 * ("2 of 4, selected") come from the platform rather than being reimplemented.
 *
 * Zoom is a CSS scale anchored to the pointer. It is toggled by a real button
 * rather than triggered on hover, because a hover-only zoom is unreachable on
 * touch — the same trap the product cards hit in Chapter 9.
 */
export default function ProductGallery({
    images,
    name,
    category,
}: ProductGalleryProps) {
    const {
        index,
        select,
        next,
        previous,
        zoomed,
        toggleZoom,
        origin,
        onPointerMove,
    } = useGallery(images.length);

    const active = images[index];
    const glyph = categoryGlyph[category];

    if (!active) return null;

    const arrowClass = `
        flex h-10 w-10 items-center justify-center rounded-full border
        border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur
        transition hover:border-slate-300 hover:text-slate-900
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
    `;

    return (
        <div className="flex flex-col gap-3 sm:gap-4">

            {/* Main image */}

            <div
                className="
                    group
                    relative
                    aspect-square
                    w-full
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    sm:rounded-[24px]
                "
                onMouseMove={onPointerMove}
            >
                {/*
                    `transformOrigin` is the one inline style on this page: it
                    is a continuous, pointer-derived value, so no utility class
                    can express it. The scale itself stays a Tailwind class.
                */}
                <div
                    className={`h-full w-full transition-transform duration-300 ${zoomed ? "scale-[1.8]" : "scale-100"
                        }`}
                    style={{ transformOrigin: origin }}
                >
                    <SafeImage
                        src={active.src}
                        alt={active.alt}
                        icon={glyph}
                        className="flex h-full w-full items-center justify-center"
                        imgClassName="h-full w-full object-contain"
                        iconClassName="h-20 w-20 text-slate-300"
                    />
                </div>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
                    <button
                        type="button"
                        onClick={previous}
                        aria-label="Previous image"
                        className={`pointer-events-auto ${arrowClass}`}
                    >
                        <ChevronLeft size={18} aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={next}
                        aria-label="Next image"
                        className={`pointer-events-auto ${arrowClass}`}
                    >
                        <ChevronRight size={18} aria-hidden="true" />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={toggleZoom}
                    aria-pressed={zoomed}
                    aria-label={zoomed ? "Zoom out" : "Zoom in"}
                    className={`absolute bottom-3 right-3 ${arrowClass}`}
                >
                    {zoomed ? (
                        <ZoomOut size={17} aria-hidden="true" />
                    ) : (
                        <ZoomIn size={17} aria-hidden="true" />
                    )}
                </button>

                <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {active.caption}
                </span>

                {/* Announces the change to screen readers without moving focus. */}
                <p className="sr-only" aria-live="polite">
                    {`Image ${index + 1} of ${images.length}: ${active.caption}`}
                </p>
            </div>

            {/* Thumbnails */}

            <div
                role="radiogroup"
                aria-label={`${name} images`}
                className="grid grid-cols-4 gap-2 sm:gap-3"
            >
                {images.map((image, thumbIndex) => {
                    const selected = thumbIndex === index;

                    return (
                        <button
                            key={image.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={`${image.caption} view`}
                            onClick={() => select(thumbIndex)}
                            className={`
                                aspect-square
                                overflow-hidden
                                rounded-xl
                                border-2
                                bg-slate-50
                                transition
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-blue-500
                                focus-visible:ring-offset-2
                                ${selected
                                    ? "border-blue-600"
                                    : "border-slate-200 hover:border-slate-300"
                                }
                            `}
                        >
                            <SafeImage
                                src={image.src}
                                alt=""
                                icon={glyph}
                                className="flex h-full w-full items-center justify-center"
                                imgClassName="h-full w-full object-contain p-1"
                                iconClassName="h-7 w-7 text-slate-300"
                            />
                        </button>
                    );
                })}
            </div>

        </div>
    );
}
