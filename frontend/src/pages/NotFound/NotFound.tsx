import { ArrowRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";

const suggestions = [
    { label: "Browse all products", to: "/search" },
    { label: "Compare products", to: "/compare" },
    { label: "Your wishlist", to: "/wishlist" },
];

function NotFound() {
    return (
        <section className="flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">

            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm">
                <Compass size={28} strokeWidth={1.75} />
            </span>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
                Error 404
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                We couldn't find that page
            </h1>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-500">
                The link may be broken, or the page may have been moved. Here
                are a few places worth trying instead.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">

                <Link
                    to="/"
                    className="
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
                    Back to home
                    <ArrowRight size={16} />
                </Link>

                {suggestions.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className="
                            rounded-full
                            border
                            border-slate-200
                            bg-white
                            px-5
                            py-3
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
                        {item.label}
                    </Link>
                ))}

            </div>

        </section>
    );
}

export default NotFound;
