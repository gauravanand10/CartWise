import { Info } from "lucide-react";
import { Link } from "react-router-dom";

import Container from "../Container";

/**
 * Thin utility strip above the main navigation.
 *
 * ===========================================================================
 * CHAPTER 26.5 — EVERY WORD IN THIS BAR WAS UNTRUE
 *
 * It carried three claims, on every page, above everything else:
 *
 *   "10-minute delivery"        CartWise ships nothing. There is no fulfilment
 *                               of any kind, in ten minutes or ten days.
 *   "Delivering to Patiala"     hard-coded. Not the reader's city unless they
 *                               happened to live in the author's, and not a
 *                               delivery destination in any case.
 *   "Save up to ₹25,000 today"  a savings figure with no source and a deadline
 *                               ("today") that never moved.
 *
 * Removing them left the bar with nothing in it, which posed the question of
 * whether to delete the bar. It is kept, because there is something true and
 * genuinely useful to put in the most persistent slot on the site: the two
 * facts a reader most needs before they trust a price or click a store link.
 *
 * Both are already established elsewhere — the affiliate disclosure has its own
 * page and a footer link from Chapter 26, and "reference prices, not live
 * quotes" is stated on the product page and in the hero. Repeating them here
 * costs nothing and puts them above the fold on every route, which is the
 * disposition FTC guidance asks for: a disclosure the reader meets rather than
 * one they could find.
 *
 * NOTE ON THE ACCENT: this bar deliberately carries none. The design pass's one
 * accent belongs to the primary action on the page below it.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 27 — THE BAR IS NO LONGER A DARK BAND
 *
 * Chapter 26.5 fixed what this strip SAID and left what it LOOKED LIKE alone: a
 * full-bleed near-black band (`bg-slate-900`) with white link text, pinned above
 * everything on every route. That silhouette is the marketplace announcement
 * bar — the shape Temu, Shein and AliExpress all use for the rotating
 * "EXTRA 20% OFF · FREE SHIPPING · ENDS TONIGHT" strip — and it reads as one
 * from across the room regardless of the words in it. A dark band at the top of
 * a page is a claim that something urgent is in it.
 *
 * Nothing urgent is in it, so it stops looking like there is. Same two strings,
 * same order, same link, same 36px: page-ground grey, muted ink, one hairline
 * rule underneath. Measured against #F5F5F7:
 *
 *     ink-muted (#6E6E78) body text      4.63:1   AA
 *     ink       (#1D1D1F) link text     15.46:1
 *     ink-subtle(#86868B) icon           3.33:1   clears 1.4.11's 3:1
 *
 * WHAT WAS DELIBERATELY NOT DONE: the strip was not deleted, the type was not
 * shrunk below 12px to make it "quieter", and no third item was added to fill
 * the space. Deleting it would move the reference-price caveat and the
 * disclosure below the fold on every route, which is the disposition the FTC
 * guidance argues against and the reason Chapter 26.5 kept the bar at all.
 * ---------------------------------------------------------------------------
 * ===========================================================================
 */
export default function TopBar() {
    return (
        <div className="border-b border-line bg-sunken text-ink-muted">

            <Container className="flex h-9 items-center justify-between gap-4 text-xs">

                <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Info
                        size={13}
                        className="shrink-0 text-ink-subtle"
                        aria-hidden="true"
                    />
                    <span className="truncate">
                        Reference prices — illustrative, not live quotes.
                    </span>
                </span>

                <Link
                    to="/affiliate-disclosure"
                    className="
                        hidden
                        shrink-0
                        rounded
                        font-medium
                        text-ink
                        underline
                        underline-offset-2
                        transition
                        hover:text-ink-muted
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                        sm:inline
                    "
                >
                    How CartWise makes money
                </Link>

            </Container>

        </div>
    );
}
