import { useEffect, useState } from "react";

interface CountdownTimerProps {
    /** Seconds remaining when the component mounts. */
    seconds: number;
    /** Renders light-on-dark, for use inside saturated cards. */
    onDark?: boolean;
}

function pad(value: number): string {
    return value.toString().padStart(2, "0");
}

function split(total: number) {
    const safe = Math.max(0, total);

    return {
        hours: Math.floor(safe / 3600),
        minutes: Math.floor((safe % 3600) / 60),
        secs: safe % 60,
    };
}

/**
 * A live hh:mm:ss countdown.
 *
 * Ticks once a second and stops cleanly at zero rather than going negative.
 */
export default function CountdownTimer({
    seconds,
    onDark = false,
}: CountdownTimerProps) {
    // `seconds` seeds the countdown once. Callers render one timer per deal with
    // a stable key, so a different deal mounts a fresh instance rather than
    // needing this to re-sync from the prop.
    const [remaining, setRemaining] = useState(seconds);

    // Keyed on "is it still running" rather than on `remaining`, so the interval
    // is created once and torn down at zero — not rebuilt on every tick.
    const isRunning = remaining > 0;

    useEffect(() => {
        if (!isRunning) return;

        const id = window.setInterval(() => {
            setRemaining((current) => (current <= 1 ? 0 : current - 1));
        }, 1000);

        return () => window.clearInterval(id);
    }, [isRunning]);

    const { hours, minutes, secs } = split(remaining);

    const cellClass = onDark
        ? "bg-white/15 text-white"
        : "bg-slate-900 text-white";

    const separatorClass = onDark ? "text-white/60" : "text-slate-400";

    return (
        <div
            className="flex items-center gap-1"
            role="timer"
            aria-label={`Deal ends in ${hours} hours ${minutes} minutes`}
        >
            {[pad(hours), pad(minutes), pad(secs)].map((part, index) => (
                <span key={index} className="flex items-center gap-1">
                    {index > 0 && (
                        <span className={`text-sm font-bold ${separatorClass}`}>
                            :
                        </span>
                    )}

                    <span
                        className={`
                            rounded-lg
                            px-2
                            py-1
                            font-mono
                            text-sm
                            font-bold
                            tabular-nums
                            ${cellClass}
                        `}
                    >
                        {part}
                    </span>
                </span>
            ))}
        </div>
    );
}
