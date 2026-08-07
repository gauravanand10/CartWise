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

            {/* Type ramps across four steps rather than one `sm:` jump, so the
                headline stays balanced on 320px phones through to ultrawide. */}

            <h1 className="text-[28px] font-semibold leading-[1.15] tracking-tight text-slate-900 min-[400px]:text-4xl sm:text-5xl lg:text-[56px]">
                Find it. Compare it.
                <br className="hidden sm:block" />{" "}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    Pay less for it.
                </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-500 sm:mt-5 sm:text-lg">
                One search across Amazon, Flipkart, Croma and six more stores —
                with an AI score on every result.
            </p>

            {/* Search field */}

            <div
                className="
                    group
                    mt-7
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                    py-2
                    pl-4
                    pr-2
                    shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-16px_rgba(15,23,42,0.24)]
                    transition-shadow
                    duration-300
                    focus-within:border-blue-400
                    focus-within:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_48px_-16px_rgba(37,99,235,0.35)]
                    sm:mt-9
                    sm:gap-2
                    sm:pl-5
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
                    placeholder="Search phones, laptops…"
                    aria-label="Search products"
                    className="
                        h-11
                        min-w-0
                        flex-1
                        bg-transparent
                        text-base
                        text-slate-900
                        outline-none
                        placeholder:text-slate-400
                        sm:h-12
                        sm:text-[15px]
                    "
                />

                {/* Voice/image modes need ~90px of chrome. Below `sm` that space
                    is better spent on the field itself, and both modes remain
                    reachable from the header search on those widths. */}

                <span className="hidden items-center sm:flex">
                    <ModeButton label="Search by voice" icon={Mic} />
                    <ModeButton label="Search by image" icon={ScanLine} />
                </span>

                <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

                <button
                    type="button"
                    aria-label="AI Search"
                    className="
                        inline-flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        bg-gradient-to-r
                        from-blue-600
                        to-violet-600
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
                        sm:h-12
                        sm:w-auto
                        sm:px-5
                    "
                >
                    <Sparkles size={16} />
                    <span className="hidden sm:inline">AI Search</span>
                </button>
            </div>

            {/* Suggestions.
                Below `sm` these scroll sideways instead of wrapping — wrapping
                five chips on a 375px screen cost three stacked rows and pushed
                the banner well below the fold. The negative margin lets the row
                bleed to the screen edge so the last chip reads as scrollable. */}

            <div
                className="
                    -mx-4
                    mt-5
                    flex
                    items-center
                    gap-2
                    overflow-x-auto
                    px-4
                    scrollbar-hide
                    sm:mx-0
                    sm:mt-6
                    sm:flex-wrap
                    sm:justify-center
                    sm:overflow-visible
                    sm:px-0
                "
            >
                <span className="shrink-0 text-sm text-slate-400">Popular:</span>

                {quickSearches.map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => setQuery(item)}
                        className="
                            shrink-0
                            whitespace-nowrap
                            rounded-full
                            border
                            border-slate-200
                            bg-white
                            px-3.5
                            py-2
                            text-sm
                            font-medium
                            text-slate-600
                            transition
                            duration-200
                            hover:border-blue-300
                            hover:text-blue-700
                            hover:shadow-sm
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                            sm:py-1.5
                            sm:hover:-translate-y-0.5
                        "
                    >
                        {item}
                    </button>
                ))}
            </div>

        </div>
    );
}
