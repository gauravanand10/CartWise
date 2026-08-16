import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Compact search field for the sticky header.
 *
 * Deliberately quieter than the homepage hero search — this one is a
 * persistent utility, not the page's headline action.
 *
 * Chapter 24 gave it a destination. Until then it was a bare <input> with no
 * form, no handler and no router access — the one search affordance visible on
 * every page of the app, and typing into it and pressing Enter did nothing.
 * It now submits to `/search?q=`, which SearchPage seeds its query from.
 *
 * A <form> rather than an onKeyDown on the input: Enter-to-submit is then the
 * browser's behaviour rather than something re-implemented, and the field gets
 * the mobile keyboard's "Search" key for free.
 */
export default function SearchBar() {
    const [value, setValue] = useState("");
    const navigate = useNavigate();

    function onSubmit(event: React.FormEvent) {
        event.preventDefault();

        // An empty search would land on /search with `?q=`, which reads as a
        // search for nothing rather than the page's own idle state.
        const trimmed = value.trim();
        if (!trimmed) return;

        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }

    return (
        <form
            onSubmit={onSubmit}
            role="search"
            className="flex w-full items-center justify-center"
        >

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
                    type="search"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
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

                {/*
                    Was a microphone labelled "Search by voice" with no handler
                    and no speech recognition behind it — an affordance for a
                    capability the app does not have. Replaced with the submit
                    control the form actually needs rather than left dead.
                */}
                <button
                    type="submit"
                    aria-label="Search"
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
                    <Search size={16} />
                </button>
            </div>

        </form>
    );
}
