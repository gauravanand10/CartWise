/**
 * The privacy policy. Chapter 30.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS PAGE EXISTS NOW, AND WHY IT DID NOT BEFORE
 *
 * Chapter 24 removed a "Privacy" footer link that pointed at "/" — a link
 * implying a policy that had not been written is worse than no link, the same
 * reasoning that produced AffiliateDisclosure two chapters later. This page is
 * the second one written under that rule rather than an exception to it: it
 * exists because Google Play requires every submitted app to link a real
 * privacy policy, which finally makes writing one the honest thing to do
 * rather than an optional nicety.
 *
 * EVERY CLAIM BELOW WAS CHECKED AGAINST THE CODE, NOT ASSUMED
 *
 * Specifically, while writing this page: `User` (backend/entity/User.java)
 * carries exactly email, a bcrypt hash, a role and two timestamps — no name,
 * phone number, address or payment detail is a column that exists to hold.
 * The frontend was searched for analytics, ad or tracking SDKs and cookie
 * usage and found none — session and preference data live in `localStorage`
 * only (see `services/api.ts` and `lib/persistedList.ts`). The affiliate-click
 * record is described identically to AffiliateDisclosure's own "What we
 * record when you click" section, because it is the same table.
 *
 * WHAT THIS PAGE DELIBERATELY DOES NOT CLAIM
 *
 * It does not claim CartWise is incorporated anywhere, does not name a legal
 * entity, and does not provide a postal address — none of that exists for a
 * project at this stage, and inventing one would be exactly the kind of
 * fabrication this project has spent several chapters removing. The contact
 * method given is real and reachable: the same GitHub repository this app
 * ships from.
 * ---------------------------------------------------------------------------
 */
export default function PrivacyPolicy() {
    return (
        <article className="mx-auto max-w-3xl py-8 sm:py-12">

            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
                Legal
            </p>

            <h1 className="mt-3 text-3xl tracking-tight text-ink sm:text-4xl">
                Privacy policy
            </h1>

            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
                What CartWise collects, why, and what it does not collect at
                all. Last reviewed against the running code in Chapter 30,
                2026-08-28.
            </p>

            <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-[15px] leading-relaxed text-blue-950 sm:p-6">
                <h2 className="text-base font-semibold">The short version</h2>

                <ul className="mt-3 space-y-2 list-disc pl-5">
                    <li>
                        Creating an account needs an email address and a
                        password. Nothing else is asked for, ever.
                    </li>
                    <li>
                        Your password is never stored — only a one-way hash of
                        it, which cannot be turned back into the password.
                    </li>
                    <li>
                        <strong>No advertising or analytics SDK of any kind is
                        built into CartWise</strong> — not Google Analytics,
                        not an ad network, not a crash reporter. Nothing here
                        watches you use the app.
                    </li>
                    <li>
                        CartWise sets no cookies. Your session token and your
                        recent searches live only in this device's local
                        storage, never sent anywhere except back to CartWise's
                        own API to prove you're signed in.
                    </li>
                    <li>
                        We never see your payment details. CartWise has no
                        checkout — buying something happens entirely on the
                        retailer's own site, under their own privacy policy.
                    </li>
                </ul>
            </section>

            <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-slate-700">

                <section>
                    <h2 className="text-xl tracking-tight text-ink">
                        What creating an account collects
                    </h2>

                    <p className="mt-3">
                        Signing up asks for an email address and a password.
                        That password is run through bcrypt, a one-way hashing
                        algorithm, before it ever reaches storage — the
                        database holds the hash, never the password, and nothing
                        in CartWise can convert a stored hash back into the
                        password that produced it. If our database were ever
                        exposed, your original password would not be sitting
                        in it to be exposed with it.
                    </p>

                    <p className="mt-3">
                        Beyond the email and the hash, an account record holds
                        only which of two roles it has (an ordinary user, or an
                        administrator) and when it was created and last
                        changed. No name, phone number, postal address, date
                        of birth or payment detail is collected at signup,
                        because none of CartWise's features need one.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl tracking-tight text-ink">
                        What being signed in adds
                    </h2>

                    <p className="mt-3">
                        Two features are tied to your account once you're
                        signed in: your wishlist (the products you've saved)
                        and your active comparison (up to four products you're
                        looking at side by side). Both are stored against your
                        account so they survive switching devices, and both
                        are readable and erasable only by you — no endpoint in
                        CartWise's API returns another user's wishlist or
                        comparison, signed in as anyone.
                    </p>

                    <p className="mt-3">
                        Clicking a "Visit store" button records one row: which
                        product, which retailer, the time, and your account —
                        only if you were signed in when you clicked. A
                        signed-out click is recorded with no identity attached
                        at all. See{" "}
                        <a
                            href="/affiliate-disclosure"
                            className="font-medium text-blue-700 underline underline-offset-2"
                        >
                            the affiliate disclosure page
                        </a>{" "}
                        for the complete detail on this — it's the same table,
                        described once rather than twice.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl tracking-tight text-ink">
                        What stays on your device and never reaches us
                    </h2>

                    <p className="mt-3">
                        Your session token — the thing that keeps you signed
                        in between visits — is stored in this browser's or
                        app's local storage, not in a cookie. It is sent back
                        to CartWise's API only to authenticate your own
                        requests; it is never sent to anyone else, and nothing
                        about it identifies your device to a third party.
                    </p>

                    <p className="mt-3">
                        Your recent searches are stored the same way, entirely
                        on your device. CartWise's server never receives that
                        list and cannot see what you've searched for unless a
                        specific search is actually submitted to it as a
                        request.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl tracking-tight text-ink">
                        What CartWise does not do
                    </h2>

                    <ul className="mt-3 list-disc space-y-1.5 pl-5">
                        <li>
                            No advertising network, analytics platform, or
                            crash-reporting SDK is embedded in this
                            application — checked directly against the
                            dependencies this app ships with, not asserted
                            from memory.
                        </li>
                        <li>
                            No cookies are set by CartWise, on the web or in
                            the Android app.
                        </li>
                        <li>
                            No data about you is sold, rented, or shared with
                            a third party for their own marketing purposes.
                        </li>
                        <li>
                            No payment card, bank detail, or government ID is
                            ever collected — CartWise has no feature that
                            would need one.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl tracking-tight text-ink">
                        What a retailer you visit collects
                    </h2>

                    <p className="mt-3">
                        Once you follow a "Visit store" link, you have left
                        CartWise. Whatever that retailer collects — cookies,
                        an account of theirs, your payment details for a
                        purchase — is between you and them, governed by their
                        privacy policy, not this one. CartWise has no
                        visibility into what happens on their site beyond,
                        eventually, an aggregate count of how many people
                        clicked through.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl tracking-tight text-ink">
                        Deleting your data
                    </h2>

                    <p className="mt-3">
                        There is no self-service account deletion in the app
                        yet — this is a real, known gap, and it is named as
                        one rather than glossed over. Until it exists, email
                        the address below and ask; the account, its wishlist
                        and its comparison rows can be removed by hand.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl tracking-tight text-ink">
                        Contact
                    </h2>

                    <p className="mt-3">
                        CartWise is not a registered company; there is no
                        postal address to give, and this page will not
                        pretend otherwise. The working point of contact is the
                        project's own GitHub repository — open an issue there
                        for a question about this policy, a data-deletion
                        request, or anything else.
                    </p>
                </section>

            </div>

        </article>
    );
}
