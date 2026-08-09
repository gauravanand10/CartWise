import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Heart, Scale, Share2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { MAX_COMPARE, useCompareSelection } from "../../compare";

interface ProductActionsProps {
    name: string;
    slug: string;
}

/**
 * Wishlist, Compare and Share.
 *
 * Wishlist stays navigation only — Chapter 12 does not own that behaviour, so it
 * routes to the page that will rather than being a button that does nothing.
 *
 * Compare now adds this product to the comparison and goes there, which is what
 * the button always implied. Once the product is already in the comparison the
 * button becomes a plain link to it, so a second press never silently removes
 * the product the user is currently reading about.
 *
 * Share is self-contained: the native share sheet where the browser offers one,
 * a clipboard copy everywhere else. No backend, no state to persist.
 */
export default function ProductActions({ name, slug }: ProductActionsProps) {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const navigate = useNavigate();
    const { add, isComparing, isFull, count } = useCompareSelection();
    const comparing = isComparing(slug);

    const compare = useCallback(() => {
        if (!comparing) add(slug);
        navigate("/compare");
    }, [comparing, add, slug, navigate]);

    // Clear the pending reset on unmount so a share on the way out cannot set
    // state after the component has gone.
    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    const share = useCallback(async () => {
        const url = `${window.location.origin}/product/${slug}`;

        try {
            if (navigator.share) {
                await navigator.share({ title: name, url });
                return;
            }

            await navigator.clipboard.writeText(url);

            setCopied(true);
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            // The user dismissing the share sheet throws, and so does a
            // clipboard write without permission. Neither is worth an error
            // message — the page is unchanged either way.
        }
    }, [name, slug]);

    const buttonClass = `
        inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full
        border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700
        transition hover:border-slate-300 hover:bg-slate-50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        focus-visible:ring-offset-2
    `;

    return (
        <div className="flex flex-wrap gap-2.5">

            <Link to="/wishlist" className={buttonClass}>
                <Heart size={16} aria-hidden="true" />
                Add to wishlist
            </Link>

            <button
                type="button"
                onClick={compare}
                disabled={isFull && !comparing}
                aria-label={
                    comparing
                        ? `${name} is in your comparison — go to compare`
                        : isFull
                            ? `Comparison is full (${count} of ${MAX_COMPARE}) — remove a product first`
                            : `Add ${name} to comparison`
                }
                className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-60`}
            >
                {comparing ? (
                    <Check size={16} className="text-blue-600" aria-hidden="true" />
                ) : (
                    <Scale size={16} aria-hidden="true" />
                )}
                {comparing ? `In compare (${count})` : "Compare"}
            </button>

            <button type="button" onClick={share} className={buttonClass}>
                {copied ? (
                    <Check size={16} className="text-emerald-600" aria-hidden="true" />
                ) : (
                    <Share2 size={16} aria-hidden="true" />
                )}
                {copied ? "Link copied" : "Share"}
            </button>

            {/* Announced without moving focus, so keyboard users get the same
                confirmation the icon swap gives everyone else. */}
            <p className="sr-only" aria-live="polite">
                {copied ? "Product link copied to clipboard" : ""}
            </p>

        </div>
    );
}
