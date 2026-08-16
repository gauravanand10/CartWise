import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { ApiRequestError } from "../../../services/api";

interface AuthFormProps {
    mode: "login" | "signup";
}

/**
 * The sign-in and sign-up form.
 *
 * One component for both, because they differ in four strings and one method
 * call. Two files would have meant two places to fix the next thing wrong with
 * the error handling, which is the part most likely to need fixing.
 *
 * Styling follows `FilterBar`'s inputs — `rounded-xl`, `border-ink-muted/25`,
 * `bg-card`, `focus-visible:ring-ink` — and the navbar's primary button, rather
 * than introducing a form language this app does not otherwise have. The
 * Chapter 20 token set is used throughout; there is no raw hex here.
 */
export default function AuthForm({ mode }: AuthFormProps) {
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    const isLogin = mode === "login";

    /**
     * Where to go after signing in.
     *
     * `ProtectedRoute` stores the page the user was trying to reach in
     * `location.state.from`. Falling back to `/` rather than to the previous
     * history entry is deliberate: going "back" from a login page reached
     * deliberately from the navbar would return the user to whatever they were
     * reading, which is right, but going back from a login page reached by
     * redirect would return them to the protected route they were just bounced
     * off — and then bounce them again if anything went wrong.
     */
    const from = (location.state as { from?: string } | null)?.from ?? "/";

    /**
     * Turns a failure into something worth reading.
     *
     * The codes are the backend's own, from `GlobalExceptionHandler`. Branching
     * on `code` rather than on `status` matters for 409, which means two
     * different things across this API — here it is always a taken email, but
     * the comparison endpoints use it for a full comparison.
     *
     * `INVALID_CREDENTIALS` deliberately does not say which half was wrong. The
     * server answers 401 identically for an unknown email and a bad password,
     * documented there as an anti-enumeration measure, and a UI that guessed
     * would undo it — "no account with that email" is exactly the oracle the
     * backend refuses to provide.
     */
    function messageFor(caught: unknown): string {
        if (!(caught instanceof ApiRequestError)) {
            return "We couldn't reach CartWise. Check your connection and try again.";
        }

        switch (caught.code) {
            case "INVALID_CREDENTIALS":
                return "That email and password don't match an account.";
            case "EMAIL_ALREADY_REGISTERED":
                return "An account with that email already exists. Try signing in instead.";
            case "BAD_REQUEST":
                // The server's own message names the rule that failed — the
                // password length bounds, the address shape — and is safe to
                // show: it is generated from constants, never from input.
                return caught.message;
            default:
                return "Something went wrong. Please try again.";
        }
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Guards a double submit, which is reachable by pressing Enter while
        // the button is already disabled — the disabled attribute stops the
        // click, not the form.
        if (pending) return;

        setPending(true);
        setError("");

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }

            // `replace` so the login page does not sit in history behind the
            // page the user just reached; pressing Back would otherwise return
            // a signed-in user to a sign-in form.
            navigate(from, { replace: true });
        } catch (caught) {
            setError(messageFor(caught));
            setPending(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-md">
            <header className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {isLogin ? "Sign in to CartWise" : "Create your account"}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {isLogin
                        ? "Your wishlist and comparisons are saved to your account."
                        : "Save products and compare them across every device you use."}
                </p>
            </header>

            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate>
                {/*
                    `role="alert"` so the message is announced when it appears.
                    Rendered only when there is one — an always-present empty
                    live region would announce nothing and take up space.
                */}
                {error && (
                    <p
                        role="alert"
                        className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
                    >
                        {error}
                    </p>
                )}

                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                        Email
                    </span>
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="
                            rounded-xl
                            border
                            border-ink-muted/25
                            bg-card
                            px-3
                            py-2.5
                            text-sm
                            text-ink
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-ink
                        "
                    />
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                        Password
                    </span>
                    <input
                        type="password"
                        name="password"
                        /*
                            `new-password` on signup is what tells a password
                            manager to offer a generated one rather than
                            autofilling the existing credential for this origin.
                        */
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="
                            rounded-xl
                            border
                            border-ink-muted/25
                            bg-card
                            px-3
                            py-2.5
                            text-sm
                            text-ink
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-ink
                        "
                    />
                    {!isLogin && (
                        <span className="text-xs text-ink-muted">
                            At least 8 characters.
                        </span>
                    )}
                </label>

                <button
                    type="submit"
                    disabled={pending}
                    className="
                        mt-2
                        inline-flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        bg-ink
                        px-5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-accent-primary
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-ink
                        focus-visible:ring-offset-2
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    {pending && (
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    )}
                    {pending
                        ? isLogin
                            ? "Signing in…"
                            : "Creating account…"
                        : isLogin
                            ? "Sign in"
                            : "Create account"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-muted">
                {isLogin ? "New to CartWise? " : "Already have an account? "}
                {/*
                    The redirect target is carried across, so a user bounced off
                    /wishlist who then decides to sign up instead still lands
                    back on /wishlist afterwards.
                */}
                <Link
                    to={isLogin ? "/signup" : "/login"}
                    state={{ from }}
                    className="font-semibold text-accent-primary hover:underline"
                >
                    {isLogin ? "Create an account" : "Sign in"}
                </Link>
            </p>
        </div>
    );
}
