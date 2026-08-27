import { useState } from "react";
// `Star` was imported here for the fabricated retailer rating Chapter 28
// removed — see the note in the offer row below.
import { ExternalLink } from "lucide-react";

import SafeImage from "../../../components/ui/SafeImage";
import { formatPrice } from "../../../lib/currency";
import { affiliateClickUrl, recordAffiliateClick } from "../../../services/api";
import type { StoreOffer } from "../types/product";

interface StoreOfferCardProps {
    offer: StoreOffer;
    /** Marks the cheapest in-stock offer. */
    best: boolean;
    productName: string;
    /** The product's URL identity — what the click endpoint resolves the offer against. */
    productSlug: string;
}

/**
 * One retailer's offer, and the outbound link to it.
 *
 * The store logo goes through SafeImage with a gradient monogram fallback, so
 * the row still looks deliberate while `/assets/stores/*` is empty — the same
 * treatment brand tiles get on the homepage.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 26 — this button was deliberately dead until now.
 *
 * Chapter 24's navigation audit found five "Visit store" buttons with no
 * handler at all and left them that way on purpose, because wiring them meant
 * deciding how CartWise makes money and that decision belonged to this chapter.
 * It is now an anchor, and three things about how it is wired are load-bearing:
 *
 * 1. `href` is the backend's tracking redirect, not a retailer URL. The
 *    affiliate tag is a credential and this file is served to every visitor, so
 *    the link is assembled server-side and nothing here knows or could leak it.
 *
 * 2. An `<a>`, not a `<button>` with an onClick. The href is a real address:
 *    middle-click opens it in a tab, right-click copies it, and it works with
 *    JavaScript disabled — each of which is a normal way to use a link, and all
 *    three still record the click because the endpoint behind it does.
 *
 * 3. The click handler exists anyway, and only because of a browser fact: a
 *    top-level navigation carries no `Authorization` header, and CartWise's
 *    token lives in localStorage. Following the href alone would record every
 *    signed-in user as anonymous. `recordAffiliateClick` goes over fetch, which
 *    does send the header, and navigates afterwards — falling back to the plain
 *    href if that request fails, so a rate limit or a dropped connection leaves
 *    the shopper on their way rather than stranded.
 *
 * `rel="sponsored nofollow noopener"` is not decoration. `sponsored` is the
 * attribute search engines define for exactly this — a link placed for
 * compensation — and omitting it on a monetised link is its own kind of
 * undisclosed advertising.
 * ---------------------------------------------------------------------------
 */
export default function StoreOfferCard({
    offer,
    best,
    productName,
    productSlug,
}: StoreOfferCardProps) {
    // Guards a double submit while the fetch is in flight. Not a loading state
    // worth animating — the round trip is one small POST — but a second click
    // during it would record a second click the user did not make, and this
    // table's whole purpose is being an accurate count.
    const [leaving, setLeaving] = useState(false);

    const trackingUrl = affiliateClickUrl(offer.id, productSlug);

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (leaving) {
            event.preventDefault();
            return;
        }

        // Modifier-clicks and non-primary buttons are the user asking for a new
        // tab or window. Letting the browser do its own thing there means the
        // href is followed, which records the click through the redirect — the
        // attribution is lost but the count is not, and hijacking those
        // gestures to "fix" that would break how links are supposed to behave.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
            return;
        }

        event.preventDefault();
        setLeaving(true);

        void recordAffiliateClick(offer.id, productSlug)
            .then((click) => {
                window.location.assign(click.url);
            })
            .catch(() => {
                // The redirect endpoint is still there and still records the
                // click; only the user attribution is lost. Sending them on is
                // strictly better than showing an error for a link that works.
                window.location.assign(trackingUrl);
            });
    };

    return (
        <li
            className={`
                relative
                flex
                flex-col
                gap-4
                rounded-2xl
                border
                bg-white
                p-4
                transition
                sm:flex-row
                sm:items-center
                sm:justify-between
                ${best
                    ? "border-blue-300 ring-1 ring-blue-100"
                    : "border-slate-200 hover:border-slate-300"
                }
            `}
        >
            {best && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Best price
                </span>
            )}

            <div className="flex min-w-0 items-center gap-3">
                {/*
                    Monogram underneath, logo on top. `/assets/stores/*` is
                    empty, so the monogram is what actually shows today; when a
                    real logo lands it simply covers the tile. Layering beats a
                    conditional because SafeImage only learns the file is
                    missing after the request fails.
                */}
                {/*
                    Chapter 26.5: the monogram tile was `bg-gradient-to-br` over
                    `offer.gradient`, which gave Amazon an orange tile, Flipkart
                    a blue one, Croma a green one and Vijay Sales a red one — five
                    saturated colours stacked down the left edge of a list whose
                    only actionable colour should be the "Visit store" button on
                    the right. It is now one neutral tile for every store, and
                    the monogram is ink rather than white to suit the new ground.

                    `offer.gradient` is deliberately left on the StoreOffer type
                    and in data/offers.ts rather than deleted: it is data this
                    component chose to stop rendering, and removing the field
                    would be a change to the shape of the offer model, which is
                    more than a restyle. The SafeImage layered over this tile is
                    untouched, so a real logo file still covers the monogram the
                    moment one lands.
                */}
                <span
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100"
                >
                    <span
                        aria-hidden="true"
                        className="text-xs font-bold tracking-wide text-slate-600"
                    >
                        {offer.monogram}
                    </span>

                    <SafeImage
                        src={offer.logo}
                        alt=""
                        className="absolute inset-0 flex items-center justify-center"
                        imgClassName="h-full w-full object-contain p-1.5"
                        iconClassName="hidden"
                    />
                </span>

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                        {offer.name}
                    </p>

                    {/*
                        Chapter 26.5 removed a truck glyph and "Tomorrow" from
                        this row. CartWise has no delivery feed from any of
                        these retailers and does not know where the shopper is;
                        the estimate was a promise it had no standing to make.
                        The retailer states its own terms, on its own page, past
                        the link to the right.

                        Chapter 28 removed the second half of the same row: a
                        filled amber star and `offer.storeRating` — "4.5" for
                        Amazon, "4.2" for Croma. Five literals in constants.ts,
                        no survey, no feed, no source, presented as the
                        retailer's rating out of five. It was flagged in Chapter
                        26.5 as the same class of claim as the delivery estimate
                        beside it and then not taken; this is it being taken.

                        The star is worth calling out separately from the
                        number. A filled star is not decoration — it is a
                        convention that asserts something was rated. Rendering
                        one next to an invented figure claims a provenance twice
                        over.

                        Nothing replaces it. There is no honest retailer rating
                        available to put here, and a plausible-looking default
                        would be the same fabrication with a different value.
                        What is left is the retailer's name, its price and its
                        stock state — all three substantiated.
                    */}
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                        <span
                            className={
                                offer.inStock
                                    ? "font-medium text-emerald-700"
                                    : "font-medium text-slate-400"
                            }
                        >
                            {offer.inStock ? "In stock" : "Unavailable"}
                        </span>
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
                {/*
                    Chapter 29 — tabular figures. This is the list the whole
                    feature exists for: five retailers' prices stacked in a
                    column, meant to be compared at a glance. Proportional
                    digits break that alignment; these are the rows where it
                    matters most.
                */}
                <div data-numeric className="flex flex-col items-end gap-1">
                    <span className="text-lg font-semibold tracking-tight text-slate-900">
                        {formatPrice(offer.price)}
                    </span>

                    {/*
                        The per-link half of the disclosure, and the reason it
                        sits here rather than only in the banner above the list:
                        FTC guidance asks for a disclosure the reader meets
                        before or at the same time as the link itself, not one
                        they would have to scroll back for. `text-xs` is small,
                        but it is the same size as the delivery and rating text
                        beside it and in a colour that passes contrast on white
                        — the standard is "difficult to miss", not "large".
                    */}
                    {offer.inStock && (
                        <span className="text-xs font-medium text-slate-600">
                            Affiliate link
                        </span>
                    )}
                </div>

                {offer.inStock ? (
                    <a
                        href={trackingUrl}
                        onClick={handleClick}
                        rel="sponsored nofollow noopener"
                        aria-label={`Visit ${offer.name} for ${productName} — affiliate link`}
                        aria-disabled={leaving || undefined}
                        className="
                            inline-flex
                            h-10
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-full
                            bg-blue-600
                            px-4
                            text-[13px]
                            font-semibold
                            text-white
                            transition
                            hover:bg-blue-700
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                            focus-visible:ring-offset-2
                            aria-disabled:pointer-events-none
                            aria-disabled:opacity-70
                        "
                    >
                        {leaving ? "Opening…" : "Visit store"}
                        <ExternalLink size={13} aria-hidden="true" />
                    </a>
                ) : (
                    /*
                        A real <button disabled> rather than a styled anchor with
                        pointer-events off. An out-of-stock offer has nothing to
                        link to, and a disabled anchor is not a thing HTML has —
                        assistive technology would still announce it as a link
                        and offer to follow it.
                    */
                    <button
                        type="button"
                        disabled
                        aria-label={`${offer.name} does not have ${productName} in stock`}
                        className="
                            inline-flex
                            h-10
                            shrink-0
                            cursor-not-allowed
                            items-center
                            gap-1.5
                            rounded-full
                            bg-slate-200
                            px-4
                            text-[13px]
                            font-semibold
                            text-slate-500
                        "
                    >
                        Unavailable
                    </button>
                )}
            </div>
        </li>
    );
}
