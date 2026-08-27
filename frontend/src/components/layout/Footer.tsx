import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import Container from "./Container";
import { STORES } from "../../features/product/constants";

/*
 * ---------------------------------------------------------------------------
 * CHAPTER 24 — where these used to point.
 *
 * Fifteen links, and eleven of them went nowhere useful. Six ("About
 * CartWise", "How scoring works", "Careers", "Contact", "Privacy", "Terms")
 * pointed at "/" — clicking them reloaded the homepage you were probably
 * already on, which is a dead link wearing a valid href. Five more pointed at
 * a bare "/search", so "Flash deals", "Trending now" and "Shop by brand" all
 * landed on the same unfiltered page and none of them delivered what its label
 * promised.
 *
 * The Shop column now points into /browse with a real query behind each label,
 * because /browse reads category, brand, price and sort from the URL and is
 * backed by the live catalogue.
 *
 * The Company column is the honest problem. There is no about page, no
 * careers page, no contact page and no privacy or terms page anywhere in this
 * application, and writing five of them is a chapter of its own rather than a
 * navigation fix. Those links are therefore REMOVED rather than repointed:
 * a link to a page that does not exist cannot be fixed by aiming it somewhere
 * unrelated, and a footer column of four links that all silently land on the
 * catalogue is more dishonest than a footer that does not claim to have them.
 * See the chapter report — this is deferred scope, stated rather than hidden.
 * ---------------------------------------------------------------------------
 */
const linkColumns = [
    {
        heading: "Shop",
        links: [
            { label: "All categories", to: "/browse" },
            /*
             * Chapter 26.5 renamed two of these to what they do.
             *
             * "Today's deals" pointed at `sort=price-asc` — the cheapest
             * products in the catalogue, which is not a deal and has nothing
             * to do with today. The comment that used to sit here called it
             * "the closest honest reading of deals the catalogue can answer",
             * which is the argument this chapter kept rejecting elsewhere: a
             * proxy under a title that claims something else.
             *
             * "New arrivals" pointed at `sort=name-asc` — alphabetical order.
             * The API has no `created-desc` sort (see CatalogueRail), so there
             * is no arrivals ordering to link to at all.
             */
            { label: "Lowest priced", to: "/browse?sort=price-asc" },
            { label: "Top rated", to: "/browse?sort=rating-desc" },
            { label: "A to Z", to: "/browse?sort=name-asc" },
        ],
    },
    {
        heading: "Tools",
        links: [
            { label: "Compare products", to: "/compare" },
            { label: "Wishlist", to: "/wishlist" },
            { label: "Search", to: "/search" },
            { label: "Browse the catalogue", to: "/browse" },
        ],
    },
];

/*
 * ---------------------------------------------------------------------------
 * CHAPTER 27 — this list was hand-written and wrong in both directions.
 *
 * It named seven shops under the heading "Reference prices shown for", which
 * makes it a statement of fact rather than decoration. CartWise compares five.
 *
 *   Blinkit, Zepto, Instamart   listed here, compared nowhere. They are not in
 *                               `STORES`, no offer is ever built for them, and
 *                               no price on this site has anything to do with
 *                               them. Three ten-minute grocery apps named as
 *                               price sources for televisions and laptops.
 *   Vijay Sales                 actually compared, and missing from the list.
 *
 * The homepage hero said "nine retailers" on the same page load. Three numbers,
 * none of them five.
 *
 * So the list is no longer a list. It is derived from `STORES` — the same array
 * the product page builds its offer rows from — which means the footer cannot
 * disagree with the comparison again without the comparison itself changing.
 * ---------------------------------------------------------------------------
 */
const stores = STORES.map((store) => store.name);

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-400">

            <Container className="py-12 sm:py-16 lg:py-20">

                {/*
                    =======================================================
                    CHAPTER 27 — THE NEWSLETTER BLOCK IS DELETED

                    It was the largest single element in the footer: a
                    gradient panel, a 24px headline, an email field and a
                    white "Subscribe" pill that grew on hover. It read:

                        "Never overpay again"
                        "Weekly price drops and AI picks, straight to your
                         inbox. No spam, unsubscribe anytime."

                    Four claims, and every one of them false.

                      Weekly            nothing is sent weekly, or ever.
                      price drops       CartWise stores no price history —
                                        Chapter 26.5 deleted the PriceDrops
                                        rail for exactly this reason.
                      AI picks          there is no AI. The fabricated 0-100
                                        "AI score" was removed from the
                                        product page, the comparison table,
                                        the homepage rails and the logo
                                        strapline. This outlived all of them.
                      unsubscribe
                        anytime         from a list nobody is ever added to.

                    And the form itself was inert: `onSubmit` was
                    `event.preventDefault()` and nothing else. No endpoint,
                    no state, no confirmation. A visitor who typed their
                    address and pressed Subscribe watched the page do
                    nothing and had every reason to believe they had signed
                    up. That is worse than a dead link — a dead link fails
                    visibly.

                    DELETED RATHER THAN REWORDED. There is no honest
                    version: an email capture with nothing behind it is
                    dishonest whatever the headline says, and building the
                    list is a feature, which this chapter is not for.
                    =======================================================
                */}

                {/* Links */}

                {/* 1 → 2 (link columns share a row from `sm`) → 4. The brand
                    blurb keeps a wider track only once there's room at `lg`. */}

                {/* Two link columns now rather than three — see the note above
                    the Company column's removal. */}

                {/* `mt-12 lg:mt-16` used to sit here. It was the gap between
                    this grid and the newsletter panel above it — with the panel
                    deleted it became leading whitespace, and the footer opened
                    with an empty band roughly 64px deep before the logo. The
                    Container's own `py-12 sm:py-16 lg:py-20` is the top padding
                    now, which is what it was always for. */}
                <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-[1.4fr_repeat(2,1fr)]">

                    <div className="max-w-xs">
                        <Link
                            to="/"
                            className="flex items-center gap-2.5"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                                <Sparkles size={20} />
                            </span>

                            <span className="text-lg font-semibold tracking-tight text-white">
                                CartWise
                            </span>
                        </Link>

                        {/*
                        Chapter 27: this claimed "an AI score on every result".

                        It is the last surviving copy of the claim. Chapter 26.5
                        removed the fabricated 0-100 score from the product page,
                        the comparison table and the homepage rails, and changed
                        the navbar strapline from "AI shopping assistant" —
                        and then missed the footer, which repeats it on every
                        route in the application.

                        "Every major Indian store" went with it for the same
                        reason the retailer chips below did: it is five, and they
                        are named.
                    */}
                        <p className="mt-5 text-sm leading-relaxed">
                            One catalogue, five retailers, and the price each of
                            them is listed at side by side — so you can see for
                            yourself which is cheapest before you click through.
                        </p>
                    </div>

                    {linkColumns.map((column) => (
                        <div key={column.heading}>
                            <h3 className="text-sm font-semibold text-white">
                                {column.heading}
                            </h3>

                            <ul className="mt-5 space-y-3">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            className="text-sm transition-colors hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                </div>

                {/* Stores */}

                <div className="mt-12 border-t border-white/10 pt-8 lg:mt-14">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Reference prices shown for
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {stores.map((store) => (
                            <span
                                key={store}
                                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300"
                            >
                                {store}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Legal */}

                <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © 2026 CartWise. Built with React, TypeScript and Tailwind CSS.
                    </p>

                    {/*
                        CHAPTER 26 — the first of the removed legal links comes
                        back, and only this one.

                        Chapter 24 removed "Privacy", "Terms" and "How scoring
                        works" because none of those pages existed and a footer
                        legal link is the one place a dead link is actively
                        misleading rather than merely useless — it implies a
                        policy has been published. That reasoning has not
                        changed and those three are still absent.

                        "Affiliate disclosure" is different now because the page
                        behind it is real, and because unlike the others it is
                        not optional: CartWise is paid for outbound clicks, and
                        the FTC's Endorsement Guides require that to be
                        disclosed. Note it is NOT the whole disclosure —
                        AffiliateNotice renders that directly above the links
                        themselves, since a disclosure reachable only from a
                        footer does not meet the standard.
                    */}
                    <Link
                        to="/affiliate-disclosure"
                        className="font-medium text-slate-300 underline underline-offset-2 transition-colors hover:text-white"
                    >
                        Affiliate disclosure
                    </Link>
                </div>

            </Container>

        </footer>
    );
}
