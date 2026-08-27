import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, MinusCircle } from "lucide-react";

import { fetchAffiliateRetailers } from "../../services/api";
import type { AffiliateRetailer } from "../../services/api";

/**
 * The full affiliate disclosure. Chapter 26.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS PAGE EXISTS, AND WHY IT IS NOT A STUB
 *
 * Chapter 24's navigation audit found six footer links pointing at "/" and
 * removed them rather than repointing them somewhere plausible, on the grounds
 * that a "Privacy" link landing on a product catalogue implies a policy that
 * has not been written. This is the first of those pages to actually get
 * written, and the reasoning cuts the same way: a disclosure link that leads to
 * two sentences of boilerplate is a worse outcome than the removed link was,
 * because it looks like compliance.
 *
 * The FTC's Endorsement Guides (16 CFR Part 255) require a clear and
 * conspicuous disclosure of a material connection — being paid for a referral
 * is one. This page is the long form of that. It is NOT the disclosure itself:
 * the guidance is explicit that a disclosure reachable only through a hyperlink
 * to a separate page does not meet the standard, which is why AffiliateNotice
 * renders the short version directly above every set of outbound links, and why
 * this page is linked from there rather than in place of it.
 *
 * THE STATUS TABLE IS READ FROM THE API, NOT TYPED INTO THIS FILE.
 *
 * Which retailers CartWise actually earns from is configuration, and a
 * hardcoded list here would be wrong the day someone sets an environment
 * variable — silently, and in the direction that matters legally, since it
 * would claim a commercial relationship that does or does not exist. The
 * endpoint returns a boolean per retailer and never the affiliate tag itself.
 * ---------------------------------------------------------------------------
 */
export default function AffiliateDisclosure() {
    const [retailers, setRetailers] = useState<AffiliateRetailer[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetchAffiliateRetailers()
            .then((list) => {
                if (!cancelled) setRetailers(list);
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // PAID only. A PLACEHOLDER retailer carries an affiliate parameter and earns
    // nothing, so counting it here would restore exactly the false claim the
    // three-state status was introduced to remove.
    const paid = retailers?.filter((r) => r.status === "PAID") ?? [];

    return (
        <article className="mx-auto max-w-3xl py-8 sm:py-12">

            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
                Legal
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Affiliate disclosure
            </h1>

            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
                How CartWise makes money, what that means for what you see on
                this site, and what we record when you click through to a shop.
            </p>

            {/* The summary, first and in a panel, because most readers will read
                only this. Putting the substance behind six paragraphs of
                preamble is the standard way a disclosure technically exists and
                practically does not. */}

            <section className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-[15px] leading-relaxed text-amber-950 sm:p-6">
                <h2 className="text-base font-semibold">The short version</h2>

                <ul className="mt-3 space-y-2 list-disc pl-5">
                    <li>
                        The <strong>“Visit store”</strong> buttons on product
                        pages are affiliate links.
                    </li>
                    <li>
                        If you buy something after clicking one, the retailer may
                        pay CartWise a commission.
                    </li>
                    <li>
                        <strong>You never pay more.</strong> The commission comes
                        out of the retailer's margin, not out of your price.
                    </li>
                    <li>
                        Commission <strong>does not</strong> affect which offers
                        we show you or what order they appear in.
                    </li>
                    <li>
                        CartWise never handles your payment, your order or your
                        returns — the shop does all of that.
                    </li>
                </ul>
            </section>

            <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-slate-700">

                <section>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        What an affiliate link is
                    </h2>

                    <p className="mt-3">
                        CartWise compares prices; it does not sell anything. When
                        you have decided what to buy, we send you to a retailer
                        who does. Some of those retailers run affiliate
                        programmes: they pay a small percentage of the sale to
                        whoever referred the customer, and they identify the
                        referrer from a code attached to the link you followed.
                    </p>

                    <p className="mt-3">
                        That code is the only difference between an affiliate
                        link and an ordinary one. The page you land on, the price
                        you are charged and the offers available to you are
                        exactly the same either way. What changes is whether
                        CartWise gets paid for having sent you.
                    </p>

                    <p className="mt-3">
                        Because we are paid for the referral, the law in most
                        places — the FTC's Endorsement Guides in the United
                        States, the ASA's rules in the United Kingdom, and
                        comparable consumer-protection rules elsewhere — requires
                        us to tell you before you click, not after. That is why
                        the notice appears above the buttons themselves as well
                        as on this page.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        Which links these are
                    </h2>

                    <p className="mt-3">
                        Every outbound retailer link on CartWise goes through our
                        own redirect first, so that we can count the click. The
                        table below is generated from this site's live
                        configuration rather than written by hand, so it cannot
                        drift out of date.
                    </p>

                    {failed && (
                        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            The live retailer list could not be loaded just now.
                            Everything else on this page still applies: every
                            “Visit store” link is a tracked referral link, and
                            any of them may earn CartWise a commission.
                        </p>
                    )}

                    {retailers && (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[26rem] border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                        <th scope="col" className="py-2 pr-4 font-semibold">
                                            Retailer
                                        </th>
                                        <th scope="col" className="py-2 font-semibold">
                                            Does CartWise earn a commission?
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {retailers.map((retailer) => (
                                        <tr
                                            key={retailer.id}
                                            className="border-b border-slate-100"
                                        >
                                            <td className="py-3 pr-4 font-medium text-slate-900">
                                                {retailer.name}
                                            </td>
                                            <td className="py-3">
                                                {retailer.status === "PAID" && (
                                                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                                                        <CheckCircle2 size={15} aria-hidden="true" />
                                                        Yes — this is a paid affiliate link
                                                    </span>
                                                )}

                                                {retailer.status === "PLACEHOLDER" && (
                                                    <span className="inline-flex items-center gap-1.5 text-amber-800">
                                                        <AlertCircle size={15} aria-hidden="true" />
                                                        Not yet — the link carries a test code, so
                                                        nothing is earned
                                                    </span>
                                                )}

                                                {retailer.status === "NONE" && (
                                                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                                                        <MinusCircle size={15} aria-hidden="true" />
                                                        No — tracked, but not paid
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {retailers && paid.length === 0 && (
                        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950">
                            <strong>Right now, CartWise earns nothing from any
                            of these links.</strong>{" "}
                            No approved affiliate account is connected to this
                            site. Getting one is an application a person has to
                            make and a retailer has to accept — Amazon Associates
                            only confirms an account after it has referred three
                            qualifying sales, and Flipkart has not taken direct
                            sign-ups since 2018. Until then the links still work
                            and we still count the clicks, but the tracking code
                            attached to them is a test value that identifies
                            nobody, so no commission is generated. This paragraph
                            disappears on its own the moment that changes,
                            because the table above reads the live setting rather
                            than a fixed list.
                        </p>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        How this affects what you see — and what it doesn't
                    </h2>

                    <p className="mt-3">
                        Offers on a product page are sorted by price, cheapest
                        first, with anything out of stock moved to the bottom.
                        That is the whole rule. Nothing in CartWise reads a
                        commission rate, and no retailer can pay to appear higher
                        in a comparison, be marked “Best price”, or be included
                        at all.
                    </p>

                    <p className="mt-3">
                        We think that is the only version of this arrangement
                        worth having. A comparison site that ranked by commission
                        would be an advertising channel wearing a comparison
                        site's clothes, and the disclosure on this page would be
                        describing the wrong thing.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        What we record when you click
                    </h2>

                    <p className="mt-3">
                        Clicking a “Visit store” button records one row on our
                        side, containing exactly four things:
                    </p>

                    <ul className="mt-3 list-disc space-y-1.5 pl-5">
                        <li>which product's offer you clicked;</li>
                        <li>which retailer it went to;</li>
                        <li>the time;</li>
                        <li>
                            your account, <em>only</em> if you were signed in.
                            Clicks by signed-out visitors are recorded with no
                            identity at all.
                        </li>
                    </ul>

                    <p className="mt-3">
                        We do not record your IP address, your browser, the page
                        you came from, or any cookie or device identifier
                        alongside a click. We are not able to reconstruct one
                        person's browsing from this data, and the reports built
                        on it are counts — clicks per product, clicks per
                        retailer, clicks per day — with no way to view an
                        individual click.
                    </p>

                    <p className="mt-3">
                        The retailer, once you arrive, is a separate company with
                        its own privacy policy, its own cookies and its own
                        terms. We have no visibility into what you do there
                        beyond, eventually, an aggregate commission statement.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        What CartWise is not responsible for
                    </h2>

                    <p className="mt-3">
                        CartWise has no cart, no checkout and no payment
                        processing, by design. Once you follow a link, your
                        purchase is entirely between you and that retailer: their
                        price at the moment you buy, their stock, their delivery,
                        their warranty, their returns policy and their customer
                        service.
                    </p>

                    <p className="mt-3">
                        Prices and availability shown on CartWise are what we last
                        recorded and can be out of date. Always confirm the price
                        on the retailer's own page before buying — that is the
                        one that will be charged.
                    </p>
                </section>

            </div>

        </article>
    );
}
