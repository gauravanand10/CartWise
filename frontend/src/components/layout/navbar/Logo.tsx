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

                <span className="block text-[11px] font-medium leading-tight text-slate-500">
                    AI shopping assistant
                </span>
            </span>
        </Link>
    );
}
