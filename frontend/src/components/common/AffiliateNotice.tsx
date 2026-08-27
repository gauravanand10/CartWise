import { Info } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * The affiliate disclosure that sits immediately above a set of outbound links.
 *
 * ---------------------------------------------------------------------------
 * THIS IS A LEGAL REQUIREMENT, NOT A DESIGN FLOURISH.
 *
 * The FTC's Endorsement Guides (16 CFR Part 255) require a "clear and
 * conspicuous" disclosure wherever a material connection — being paid for a
 * referral is one — is not obvious to the reader. §255.0 defines that as a
 * disclosure that is "difficult to miss (i.e., easily noticeable) and easily
 * understandable by ordinary consumers", which "by its size, contrast,
 * location, the length of time it appears, and other characteristics, should
 * stand out from any accompanying text", and which in interactive media
 * "should be unavoidable".
 *
 * Every one of those words is doing work here, so the choices below are
 * deliberate rather than aesthetic:
 *
 *   location    — rendered ABOVE the offers, so the reader meets it before the
 *                 first "Visit store" button rather than after. A disclosure
 *                 encountered only after the click is explicitly not compliant.
 *   unavoidable — always rendered. Not behind a tooltip, not inside a
 *                 collapsed <details>, not a hover title. Each of those is the
 *                 textbook example of what fails this standard.
 *   size        — `text-sm`, the same size as the offer rows it introduces, on
 *                 an amber panel with a border. Not `text-[10px]` grey-on-grey
 *                 in a corner.
 *   plain words — "CartWise may earn a commission", not "we may receive
 *                 consideration from our commercial partners". §255.0 asks for
 *                 easily understandable, and the second sentence is written to
 *                 be understood rather than to be technically true.
 *
 * The link to the full policy is IN ADDITION to this text and never instead of
 * it: the guidance is explicit that a disclosure reachable only by following a
 * hyperlink to a separate page does not meet the standard on its own.
 * ---------------------------------------------------------------------------
 */
export default function AffiliateNotice() {
    return (
        <div
            className="
                mb-4
                flex
                items-start
                gap-2.5
                rounded-xl
                border
                border-amber-300
                bg-amber-50
                px-4
                py-3
                text-sm
                leading-relaxed
                text-amber-950
            "
        >
            <Info
                size={16}
                className="mt-0.5 shrink-0 text-amber-700"
                aria-hidden="true"
            />

            <p>
                <span className="font-semibold">Affiliate links.</span>{" "}
                The “Visit store” buttons below are affiliate links. If you buy
                something after using one, CartWise may earn a commission from
                that retailer. It costs you nothing extra, and it does not
                change the prices shown here or the order offers appear in —
                these are always sorted cheapest in-stock first.{" "}
                <Link
                    to="/affiliate-disclosure"
                    className="font-semibold underline underline-offset-2 hover:text-amber-800"
                >
                    Read the full affiliate disclosure
                </Link>
                .
            </p>
        </div>
    );
}
