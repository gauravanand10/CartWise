import { useCallback, useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

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

    if (status === "loading") {
        return (
            <p className="py-16 text-center text-sm text-slate-500">
                Loading click report…
            </p>
        );
    }

    if (status === "forbidden") {
        return (
            <section className="mx-auto max-w-lg py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <ShieldAlert size={26} aria-hidden="true" />
                </span>

                <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
                    Administrator access required
                </h1>

                <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
                    You are signed in, but this report is only available to
                    administrators. The server refused the request — nothing on
                    this page was loaded.
                </p>
            </section>
        );
    }

    if (status === "error" || !stats) {
        return (
            <section className="mx-auto max-w-lg py-16 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Couldn't load the click report
                </h1>

                <button
                    type="button"
                    onClick={retry}
                    className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
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

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
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
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {tile.label}
                        </dt>
                        <dd className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                            {tile.value}
                        </dd>
                    </div>
                ))}
            </dl>

            {stats.totalClicks === 0 && (
                <p className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    No clicks recorded yet.
                </p>
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
