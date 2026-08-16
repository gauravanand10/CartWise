import { useEffect, useRef, useState } from "react";
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
 * Every image in the app goes through here so a missing or failed asset looks
 * like a deliberate placeholder rather than a broken page.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 24 — WHAT `onError` DOES AND DOES NOT COVER
 *
 * `src` now points at a third-party CDN (Openverse serves photographs hosted by
 * Flickr and friends) rather than at a local asset, so it is worth recording
 * what was actually measured about failure detection instead of assuming.
 *
 * Both realistic failures DO fire `error`, verified in the running browser
 * against the live CDN:
 *
 *   - a genuine 404 from the image host           → `error` fires
 *   - a 200 response whose body is not an image   → `error` fires
 *     (the shape Vite's dev server produces when it answers a missing
 *      /assets/... path with its SPA fallback)
 *
 * The end-to-end path was verified rather than assumed: a catalogue row was
 * pointed at a nonexistent path on the live CDN, and the card swapped to its
 * glyph with the product name as the accessible label.
 *
 * What is NOT a failure, and cost some time to establish: an image sitting at
 * `complete === false` with `naturalWidth === 0`. That is the normal resting
 * state of a `loading="lazy"` image that is off-screen — or in a backgrounded
 * tab, where lazy images do not load at all. A page-wide sample once found 23
 * images in that state and it was read as a broken error path; nearly all were
 * simply below the fold. Anything added here later must not treat "pending" as
 * "failed". See the note in the effect below.
 *
 * Two guards:
 *
 *   1. `onError`         — the ordinary failure path, covering both cases above.
 *   2. `onLoad` + zero   — a response that completed but decoded to nothing. An
 *      `naturalWidth`      image of zero width is not an image, however the
 *                          `load` event describes it.
 * ---------------------------------------------------------------------------
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

    const imgRef = useRef<HTMLImageElement>(null);

    /*
     * The observer watches this wrapper, not the <img>.
     *
     * A pending image has no intrinsic dimensions, and inside these layouts it
     * collapses to zero height until pixels arrive. IntersectionObserver never
     * reports a zero-area element as intersecting, so observing the <img>
     * directly meant the callback never fired for exactly the images that needed
     * it — the stalled ones — and the guard silently did nothing. Observed as
     * "never-intersected" on an element sitting in the middle of the viewport.
     *
     * The wrapper carries the caller's sizing classes (`h-40 w-full` and
     * friends), so it has a box whether or not the image ever loads.
     */
    const frameRef = useRef<HTMLDivElement>(null);

    const showFallback = !src || failedSrc === src;

    /*
     * The cached-failure guard.
     *
     * Covers a race the events cannot: an image served from cache can finish —
     * and fail — before React attaches `onError`, so the event fires into
     * nothing and only the element's own state records what happened.
     *
     * `complete && naturalWidth === 0` is specifically a *finished* load that
     * produced no pixels. It deliberately does not treat `complete === false` as
     * a failure, because that is the normal resting state of a lazy image that
     * has not been scrolled into view yet.
     */
    useEffect(() => {
        if (!src || failedSrc === src) return;

        const element = imgRef.current;
        const frame = frameRef.current;
        if (!element || !frame) return;

        if (element.complete && element.naturalWidth === 0) {
            setFailedSrc(src);
            return;
        }

        /*
         * NO TIMEOUT HERE, AND THE REASON IS A MISDIAGNOSIS WORTH RECORDING.
         *
         * A stalled-request guard was built for this component and then removed
         * once the evidence for it fell apart. The apparent symptom was an image
         * that stayed pending indefinitely — `complete === false`, no `error`,
         * no `load`, for twenty-five seconds and counting — which looks exactly
         * like a CDN accepting a connection and never answering.
         *
         * It was not. The tab running the measurement was backgrounded
         * (`document.visibilityState === "hidden"`), and a hidden tab does not
         * load `loading="lazy"` images at all. Nothing was stalled; nothing had
         * started. Bringing the tab to the foreground resolved the same URL to a
         * 404, fired `error`, and swapped in the fallback glyph within a second.
         *
         * Two things follow, and both argue against a timer. The failure this
         * component actually has to catch — a dead image URL — is handled by
         * `onError` below, verified end to end against a real 404 from the live
         * CDN. And a timeout would be dangerous precisely because "pending" is
         * the normal, correct state for a lazy image that is off-screen or in a
         * hidden tab: treating it as failure would replace working photographs
         * with glyphs. Arming such a timer safely needs a signal that the fetch
         * genuinely began, and an IntersectionObserver — the obvious candidate —
         * could not be observed delivering callbacks under these conditions at
         * all, for the same visibility reason.
         *
         * If a genuine hang is ever demonstrated in a foreground tab, this is
         * the place for it, and it must be gated on the fetch having started.
         */
    }, [src, failedSrc]);

    return (
        <div ref={frameRef} className={className}>
            {showFallback ? (
                <Icon
                    className={iconClassName}
                    strokeWidth={1.25}
                    aria-label={alt}
                    role="img"
                />
            ) : (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onError={() => setFailedSrc(src)}
                    onLoad={(event) => {
                        // A load that decoded to nothing is a failure wearing a
                        // success event.
                        if (event.currentTarget.naturalWidth === 0) {
                            setFailedSrc(src);
                        }
                    }}
                    className={imgClassName}
                />
            )}
        </div>
    );
}
