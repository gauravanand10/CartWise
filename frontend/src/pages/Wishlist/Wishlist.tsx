import { ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

function Wishlist() {
    return (
        <section>

            <header>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Wishlist
                </h1>

                <p className="mt-2 text-[15px] text-slate-500">
                    Save products here to track their price and compare them later.
                </p>
            </header>

            {/* Empty state. Replaced by the saved-items grid once wishlist
                persistence is wired up to the API. */}

            <div
                className="
                    mt-10
                    flex
                    flex-col
                    items-center
                    justify-center
                    rounded-[28px]
                    border
                    border-dashed
                    border-slate-300
                    bg-slate-50/60
                    px-6
                    py-20
                    text-center
                "
            >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm">
                    <Heart size={24} strokeWidth={1.75} />
                </span>

                <h2 className="mt-6 text-lg font-semibold text-slate-900">
                    Nothing saved yet
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                    Tap the heart on any product and it'll show up here, along
                    with its price history.
                </p>

                <Link
                    to="/search"
                    className="
                        mt-8
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-slate-900
                        px-6
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        transition
                        duration-200
                        hover:bg-blue-600
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                        focus-visible:ring-offset-2
                    "
                >
                    Browse products
                    <ArrowRight size={16} />
                </Link>
            </div>

        </section>
    );
}

export default Wishlist;
