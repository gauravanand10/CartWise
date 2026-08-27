import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo() {
    return (
        <Link
            to="/"
            className="
                group
                flex
                shrink-0
                items-center
                gap-2.5
                rounded-xl
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                focus-visible:ring-offset-2
            "
        >
            <span
                className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-[14px]
                    bg-gradient-to-br
                    from-blue-600
                    to-violet-600
                    text-white
                    shadow-sm
                    transition-transform
                    duration-300
                    ease-out
                    group-hover:scale-105
                "
            >
                <Sparkles size={20} />
            </span>

            <span className="hidden sm:block">
                <span className="block text-lg font-semibold leading-tight tracking-tight text-slate-900">
                    CartWise
                </span>

                {/*
                    Chapter 26.5: this read "AI shopping assistant" on every
                    page of the site. There is no AI anywhere in CartWise — the
                    only thing that ever wore the name was the fabricated 0-100
                    "AI score", which this chapter deleted from the product
                    page, the comparison table and the homepage. A strapline
                    claiming a capability the application does not have is the
                    same problem as a rail claiming a price history it does not
                    keep, and it was the most repeated instance of it.
                */}
                <span className="block text-[11px] font-medium leading-tight text-slate-500">
                    Compare before you buy
                </span>
            </span>
        </Link>
    );
}
