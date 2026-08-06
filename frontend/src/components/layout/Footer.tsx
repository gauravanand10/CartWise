import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import Container from "./Container";

const linkColumns = [
    {
        heading: "Shop",
        links: [
            { label: "All categories", to: "/search" },
            { label: "Flash deals", to: "/search" },
            { label: "Trending now", to: "/search" },
            { label: "Shop by brand", to: "/search" },
        ],
    },
    {
        heading: "Tools",
        links: [
            { label: "Compare products", to: "/compare" },
            { label: "Wishlist", to: "/wishlist" },
            { label: "Price alerts", to: "/wishlist" },
            { label: "AI recommendations", to: "/search" },
        ],
    },
    {
        heading: "Company",
        links: [
            { label: "About CartWise", to: "/" },
            { label: "How scoring works", to: "/" },
            { label: "Careers", to: "/" },
            { label: "Contact", to: "/" },
        ],
    },
];

const stores = [
    "Amazon",
    "Flipkart",
    "Croma",
    "Reliance Digital",
    "Blinkit",
    "Zepto",
    "Instamart",
];

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-400">

            <Container className="py-16 lg:py-20">

                {/* Newsletter */}

                <div
                    className="
                        flex
                        flex-col
                        gap-8
                        rounded-[28px]
                        border
                        border-white/10
                        bg-gradient-to-br
                        from-blue-600/15
                        via-violet-600/10
                        to-transparent
                        p-8
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                        lg:p-10
                    "
                >
                    <div className="max-w-md">
                        <h2 className="text-2xl font-semibold tracking-tight text-white">
                            Never overpay again
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed">
                            Weekly price drops and AI picks, straight to your
                            inbox. No spam, unsubscribe anytime.
                        </p>
                    </div>

                    <form
                        className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
                        onSubmit={(event) => event.preventDefault()}
                    >
                        <label htmlFor="newsletter-email" className="sr-only">
                            Email address
                        </label>

                        <input
                            id="newsletter-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="
                                h-12
                                min-w-0
                                flex-1
                                rounded-full
                                border
                                border-white/15
                                bg-white/5
                                px-5
                                text-sm
                                text-white
                                outline-none
                                transition
                                placeholder:text-slate-500
                                focus:border-blue-400
                                focus:bg-white/10
                            "
                        />

                        <button
                            type="submit"
                            className="
                                inline-flex
                                h-12
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-full
                                bg-white
                                px-6
                                text-sm
                                font-semibold
                                text-slate-900
                                transition-transform
                                duration-200
                                hover:scale-[1.03]
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-white
                                focus-visible:ring-offset-2
                                focus-visible:ring-offset-slate-950
                            "
                        >
                            Subscribe
                            <ArrowRight size={16} />
                        </button>
                    </form>
                </div>

                {/* Links */}

                <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">

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

                        <p className="mt-5 text-sm leading-relaxed">
                            One search across every major Indian store, with an
                            AI score on every result — so you always know
                            whether the price you're seeing is actually good.
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

                <div className="mt-14 border-t border-white/10 pt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Prices tracked across
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

                    <div className="flex gap-6">
                        <Link to="/" className="transition-colors hover:text-white">
                            Privacy
                        </Link>

                        <Link to="/" className="transition-colors hover:text-white">
                            Terms
                        </Link>
                    </div>
                </div>

            </Container>

        </footer>
    );
}
