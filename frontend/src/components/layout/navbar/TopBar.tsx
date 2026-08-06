import { MapPin, TrendingDown, Zap } from "lucide-react";

import Container from "../Container";

/**
 * Thin utility strip above the main navigation.
 *
 * Kept to a single line and a neutral dark ground so it frames the page
 * without competing with the content beneath it.
 */
export default function TopBar() {
    return (
        <div className="bg-slate-900 text-slate-300">

            <Container className="flex h-9 items-center justify-between gap-4 text-xs">

                <div className="flex min-w-0 items-center gap-4">

                    <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-white">
                        <Zap
                            size={13}
                            className="fill-blue-400 text-blue-400"
                            aria-hidden="true"
                        />
                        10-minute delivery
                    </span>

                    <span className="hidden min-w-0 items-center gap-1.5 sm:inline-flex">
                        <MapPin size={13} aria-hidden="true" />
                        <span className="truncate">
                            Delivering to
                            <span className="ml-1 font-semibold text-white">
                                Patiala
                            </span>
                        </span>
                    </span>

                </div>

                <span className="hidden shrink-0 items-center gap-1.5 md:inline-flex">
                    <TrendingDown
                        size={13}
                        className="text-emerald-400"
                        aria-hidden="true"
                    />
                    Save up to ₹25,000 today
                </span>

            </Container>

        </div>
    );
}
