import { useCallback, useEffect, useState } from "react";
import { RotateCcw, ShieldAlert } from "lucide-react";

import Skeleton from "../../components/ui/Skeleton";
import { ApiRequestError, fetchAffiliateClickStats } from "../../services/api";
import type { AffiliateClickStats } from "../../services/api";

/**
 * The affiliate click report. Chapter 26, admin only.
 *
 * ---------------------------------------------------------------------------
 * THE ROUTE IS NOT THE PROTECTION, AND THIS PAGE IS WRITTEN TO MAKE THAT OBVIOUS.
 *
 * `/admin/affiliate-clicks` sits behind `ProtectedRoute`, which only checks that
 * somebody is signed in — it cannot check for a role, because the frontend does
 * not know the user's role: `AuthResponse` returns an id, an email and a token,
 * and nothing decodes the token's claims client-side.
 *
 * That is fine, because the route was never what was keeping non-admins out.
 * The report is fetched from `/api/admin/affiliate/clicks`, which
 * `SecurityConfig` gates with `.requestMatchers("/api/admin/**").hasRole("ADMIN")`.
 * A signed-in USER reaching this URL gets a 403 from the server and the panel
 * below, having learned nothing. Hiding the link would be a courtesy; the 403 is
 * the security.
 *
 * The alternative — putting the role in the session so the route could gate on
 * it — would move an authorization decision into JavaScript the user controls,
 * and would need the backend to start returning roles it currently does not.
 * A UI that reflects the server's answer is the honest shape.
 * ---------------------------------------------------------------------------
 */
export default function AffiliateClicks() {
    const [stats, setStats] = useState<AffiliateClickStats | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "forbidden" | "error">(
        "loading",
    );

    /*
     * Deliberately does NOT set "loading" itself.
     *
     * `status` already starts as "loading", and setting it again synchronously
     * inside the effect below is a cascading render — `react-hooks/set-state-in-effect`
     * rejects it, correctly. Every setState here happens in a promise callback,
     * which is the intended shape: the effect subscribes to an external system
     * and updates state when that system answers.
     *
     * The retry button, which is not an effect, sets "loading" before calling
     * this.
     */
    const load = useCallback(() => {
        fetchAffiliateClickStats()
            .then((result) => {
                setStats(result);
                setStatus("ready");
            })
            .catch((error: unknown) => {
                // 403 is a distinct outcome, not a generic failure: it means the
                // request was understood and refused, and a "try again" button
                // would invite a retry that can only fail identically.
                setStatus(
                    error instanceof ApiRequestError && error.status === 403
                        ? "forbidden"
                        : "error",
                );
            });
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const retry = () => {
        setStatus("loading");
        load();
    };

    /*
     * CHAPTER 29 — the three non-happy states, brought onto the design system.
     *
     * The loading state was a single centred line of grey text, which tells the
     * reader nothing about what is coming. It is now a skeleton of the report's
     * actual shape — three stat tiles over two table blocks — so the page does
     * not jump when the data lands and the wait reads as progress rather than
     * as a stall. `aria-busy` carries that to assistive technology; the
     * skeletons themselves are aria-hidden.
     */
    if (status === "loading") {
        return (
            <section className="py-8 sm:py-12" aria-busy="true">
                <span className="sr-only">Loading the click report…</span>

                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="mt-4 h-9 w-64 rounded-xl" />
                <Skeleton className="mt-3 h-4 w-full max-w-xl rounded-full" />

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))}
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </section>
        );
    }

    /*
     * The 403. Neutral rather than the rose it used to wear: in this design
     * system `danger` means out-of-stock or destructive, and a refusal is
     * neither — it is the server correctly declining, which is the system
     * working. The shield glyph and the sentence carry the meaning; painting it
     * red would say something went wrong when nothing did.
     */
    if (status === "forbidden") {
        return (
            <section className="mx-auto max-w-lg py-20 text-center cw-reveal">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-sunken text-ink-subtle">
                    <ShieldAlert size={28} strokeWidth={1.25} aria-hidden="true" />
                </span>

                <h1 className="mt-8 text-2xl text-ink sm:text-3xl">
                    Administrator access required
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">
                    You are signed in, but this report is only available to
                    administrators. The server refused the request — nothing on
                    this page was loaded.
                </p>
            </section>
        );
    }

    if (status === "error" || !stats) {
        return (
            <section role="alert" className="mx-auto max-w-lg py-20 text-center cw-reveal">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-sunken text-ink-subtle">
                    <RotateCcw size={28} strokeWidth={1.25} aria-hidden="true" />
                </span>

                <h1 className="mt-8 text-2xl text-ink sm:text-3xl">
                    Couldn't load the click report
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">
                    The request didn't reach the server, or it didn't answer.
                    Nothing is wrong with the recorded clicks — only with this
                    view of them.
                </p>

                <button
                    type="button"
                    onClick={retry}
                    className="mt-8 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                    Try again
                </button>
            </section>
        );
    }

    return (
        <section className="py-8 sm:py-12">

            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
                Admin
            </p>

            <h1 className="mt-3 text-3xl tracking-tight text-ink">
                Affiliate clicks
            </h1>

            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-500">
                Outbound clicks to retailers. Counts only — this report has no
                way to show an individual click, and CartWise cannot see whether
                a click became a purchase: that happens on the retailer's site
                and arrives, if at all, in their own commission statement.
            </p>

            {/* Totals */}

            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                    { label: "Total clicks", value: stats.totalClicks },
                    { label: "From signed-in users", value: stats.attributedClicks },
                    { label: "Anonymous", value: stats.anonymousClicks },
                ].map((tile) => (
                    <div
                        key={tile.label}
                        data-numeric
                        className="rounded-2xl border border-line bg-card p-5"
                    >
                        <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                            {tile.label}
                        </dt>
                        {/*
                            Chapter 29: `data-numeric` on the tile puts these
                            three figures into tabular numerals. They sit in a
                            row and are meant to be read against each other —
                            total, attributed, anonymous — and proportional
                            digits make three numbers of different widths look
                            like three unrelated facts.
                        */}
                        <dd className="mt-2 text-3xl font-bold tracking-tight text-ink">
                            {tile.value}
                        </dd>
                    </div>
                ))}
            </dl>

            {/*
                Chapter 29 — the zero state. It was a grey strip reading "No
                clicks recorded yet.", which for a brand-new deployment is the
                FIRST thing an administrator ever sees on this page, and it
                reads like something failed. It now says what the number means
                and what would change it.
            */}
            {stats.totalClicks === 0 && (
                <div className="mt-8 rounded-2xl border border-line bg-sunken px-5 py-6">
                    <p className="text-sm font-semibold text-ink">
                        No clicks recorded yet
                    </p>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-muted">
                        This table fills the first time somebody uses a "Visit
                        store" button on a product page. An empty report means no
                        outbound traffic yet — not that tracking is broken.
                    </p>
                </div>
            )}

            <div className="mt-10 grid gap-10 lg:grid-cols-2">

                <CountTable
                    title="Clicks per retailer"
                    columns={["Retailer", "Clicks"]}
                    rows={stats.byRetailer.map((row) => [row.retailer, row.clicks])}
                />

                <CountTable
                    title="Clicks per day (UTC)"
                    columns={["Day", "Clicks"]}
                    rows={stats.byDay.map((row) => [row.day, row.clicks])}
                />

                <div className="lg:col-span-2">
                    <CountTable
                        title="Clicks per product"
                        columns={["Product", "Clicks"]}
                        rows={stats.byProduct.map((row) => [row.name, row.clicks])}
                    />
                </div>

            </div>

        </section>
    );
}

/**
 * A two-column count table.
 *
 * One component for all three because they are the same shape and this chapter's
 * brief is explicit that the report should be a real query surfaced plainly, not
 * a dashboard. Three bespoke tables would be three places to fix the same
 * alignment bug.
 */
function CountTable({
    title,
    columns,
    rows,
}: {
    title: string;
    columns: [string, string];
    rows: [string, number][];
}) {
    return (
        <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {title}
            </h2>

            {rows.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Nothing recorded yet.</p>
            ) : (
                <div className="mt-3 overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                                <th scope="col" className="py-2 pr-4 font-semibold">
                                    {columns[0]}
                                </th>
                                <th scope="col" className="py-2 text-right font-semibold">
                                    {columns[1]}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map(([label, count]) => (
                                <tr key={label} className="border-b border-slate-100">
                                    <td className="py-2.5 pr-4 text-slate-900">{label}</td>
                                    <td className="py-2.5 text-right font-medium tabular-nums text-slate-900">
                                        {count}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
