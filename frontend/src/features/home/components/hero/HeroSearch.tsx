import { useState } from "react";
import { Mic, ScanLine, Search, Sparkles } from "lucide-react";

const quickSearches = [
    "iPhone 16 Pro",
    "Galaxy S25 Ultra",
    "MacBook Air M4",
    "Sony WH-1000XM6",
    "Apple Watch Ultra",
];

interface ModeButtonProps {
    label: string;
    icon: typeof Mic;
    onClick?: () => void;
}

function ModeButton({ label, icon: Icon, onClick }: ModeButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                text-slate-500
                transition
                duration-200
                hover:bg-slate-100
                hover:text-slate-900
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
            "
        >
            <Icon size={19} />
        </button>
    );
}

/**
 * The homepage's primary entry point.
 *
 * Deliberately the only interactive element above the fold: one large field,
 * three input modes, and a row of suggestions. No stats, no cards, no noise.
 */
export default function HeroSearch() {
    const [query, setQuery] = useState("");

    return (
        <div className="mx-auto w-full max-w-3xl text-center">

            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Find it. Compare it.
                <br className="hidden sm:block" />{" "}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    Pay less for it.
                </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
                One search across Amazon, Flipkart, Croma and six more stores —
                with an AI score on every result.
            </p>

            {/* Search field */}

            <div
                className="
                    group
                    mt-9
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                    py-2
                    pl-5
                    pr-2
                    shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-16px_rgba(15,23,42,0.24)]
                    transition-shadow
                    duration-300
                    focus-within:border-blue-400
                    focus-within:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_48px_-16px_rgba(37,99,235,0.35)]
                "
            >
                <Search
                    size={20}
                    className="shrink-0 text-slate-400 transition-colors group-focus-within:text-blue-600"
                    aria-hidden="true"
                />

                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search phones, laptops, audio…"
                    aria-label="Search products"
                    className="
                        h-12
                        min-w-0
                        flex-1
                        bg-transparent
                        text-[15px]
                        text-slate-900
                        outline-none
                        placeholder:text-slate-400
                    "
                />

                <span className="hidden items-center sm:flex">
                    <ModeButton label="Search by voice" icon={Mic} />
                    <ModeButton label="Search by image" icon={ScanLine} />
                </span>

                <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

                <button
                    type="button"
                    className="
                        inline-flex
                        h-12
                        shrink-0
                        items-center
                        gap-2
                        rounded-full
                        bg-gradient-to-r
                        from-blue-600
                        to-violet-600
                        px-5
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition-transform
                        duration-200
                        hover:scale-[1.03]
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                        focus-visible:ring-offset-2
                    "
                >
                    <Sparkles size={16} />
                    <span className="hidden sm:inline">AI Search</span>
                </button>
            </div>

            {/* Suggestions */}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-slate-400">Popular:</span>

                {quickSearches.map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => setQuery(item)}
                        className="
                            rounded-full
                            border
                            border-slate-200
                            bg-white
                            px-3.5
                            py-1.5
                            text-sm
                            font-medium
                            text-slate-600
                            transition
                            duration-200
                            hover:-translate-y-0.5
                            hover:border-blue-300
                            hover:text-blue-700
                            hover:shadow-sm
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                        "
                    >
                        {item}
                    </button>
                ))}
            </div>

        </div>
    );
}
