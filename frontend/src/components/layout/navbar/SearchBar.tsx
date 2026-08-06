import { Mic, Search } from "lucide-react";

/**
 * Compact search field for the sticky header.
 *
 * Deliberately quieter than the homepage hero search — this one is a
 * persistent utility, not the page's headline action.
 */
export default function SearchBar() {
    return (
        <div className="flex w-full items-center justify-center">

            <div
                className="
                    group
                    relative
                    w-full
                    max-w-xl
                "
            >
                <Search
                    size={17}
                    className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                        transition-colors
                        group-focus-within:text-blue-600
                    "
                    aria-hidden="true"
                />

                <input
                    type="text"
                    placeholder="Search phones, laptops, audio…"
                    aria-label="Search products"
                    className="
                        h-11
                        w-full
                        rounded-full
                        border
                        border-slate-200
                        bg-slate-50
                        pl-11
                        pr-11
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        duration-200
                        placeholder:text-slate-400
                        hover:bg-white
                        focus:border-blue-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-500/10
                    "
                />

                <button
                    type="button"
                    aria-label="Search by voice"
                    className="
                        absolute
                        right-2
                        top-1/2
                        flex
                        h-8
                        w-8
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-slate-700
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                    "
                >
                    <Mic size={16} />
                </button>
            </div>

        </div>
    );
}
