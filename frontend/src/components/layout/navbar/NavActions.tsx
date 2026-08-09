import { Bell, Heart, Scale, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import { useCompareSelection } from "../../../features/compare";
import { useWishlistSelection } from "../../../features/wishlist";

interface ActionButtonProps {
    icon: ReactNode;
    label: string;
    badge?: number;
    to: string;
}

function ActionButton({ icon, label, badge, to }: ActionButtonProps) {
    return (
        <Link
            to={to}
            aria-label={badge ? `${label} (${badge})` : label}
            title={label}
            className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-slate-600
                transition
                duration-200
                hover:bg-slate-100
                hover:text-slate-900
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
            "
        >
            {icon}

            {badge !== undefined && badge > 0 && (
                <span
                    className="
                        absolute
                        right-1
                        top-1
                        flex
                        h-4
                        min-w-[16px]
                        items-center
                        justify-center
                        rounded-full
                        bg-blue-600
                        px-1
                        text-[10px]
                        font-bold
                        leading-none
                        text-white
                        ring-2
                        ring-white
                    "
                >
                    {badge}
                </span>
            )}
        </Link>
    );
}

export default function NavActions() {
    // Live count, so the badge reflects the real comparison rather than a
    // placeholder that disagrees with the Compare page.
    const { count } = useCompareSelection();
    const { count: wishlistCount } = useWishlistSelection();

    return (
        <div className="flex shrink-0 items-center gap-1">

            {/* Stands in for the header search field, which is hidden on small screens. */}

            <span className="md:hidden">
                <ActionButton
                    icon={<Search size={19} />}
                    label="Search"
                    to="/search"
                />
            </span>

            <ActionButton
                icon={<Heart size={19} />}
                label="Wishlist"
                badge={wishlistCount}
                to="/wishlist"
            />

            <ActionButton
                icon={<Scale size={19} />}
                label="Compare"
                badge={count}
                to="/compare"
            />

            {/* Lowest-value action; first to go when space is tight. */}

            <span className="hidden sm:block">
                <ActionButton
                    icon={<Bell size={19} />}
                    label="Notifications"
                    badge={3}
                    to="#"
                />
            </span>

            <button
                type="button"
                className="
                    ml-2
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-full
                    bg-slate-900
                    px-4
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
                <User size={16} />
                <span className="hidden sm:inline">Login</span>
            </button>

        </div>
    );
}
