import { Trophy } from "lucide-react";

interface WinnerBadgeProps {
    title?: string;
    score?: number;
    className?: string;
}

export default function WinnerBadge({
    title = "AI Recommended",
    score,
    className = "",
}: WinnerBadgeProps) {
    return (
        <div
            className={`inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 px-5 py-3 text-white shadow-lg ${className}`}
        >
            <div className="rounded-full bg-white/20 p-2">

                <Trophy size={18} />

            </div>

            <div>

                <p className="text-xs font-semibold uppercase tracking-wider">
                    {title}
                </p>

                {score !== undefined && (

                    <p className="text-lg font-black">
                        {score}/100
                    </p>

                )}

            </div>

        </div>
    );
}
