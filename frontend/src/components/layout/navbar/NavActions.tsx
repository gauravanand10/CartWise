import { Bell, Heart, LogOut, Scale, Search, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../../../features/auth";
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
    //
    // Both are zero when signed out as of Chapter 23.5 — the selections are
    // per-user server state now, and a guest has none. That is derived in the
    // providers rather than special-cased here, so this component did not have
    // to learn about authentication to keep being correct.
    const { count } = useCompareSelection();
    const { count: wishlistCount } = useWishlistSelection();

    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    function onLogout() {
        logout();
        /*
         * Leave wherever we are, because "wherever we are" may have just become
         * forbidden: signing out on /wishlist would otherwise leave the page
         * mounted until something happened to re-render it past ProtectedRoute.
         * Home is always viewable.
         */
        navigate("/", { replace: true });
    }

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

            {/*
                Chapter 23.5 gave this control a destination. It was a bare
                <button> with no handler — the only "Login" affordance in the
                app, and it did nothing when clicked.
            */}
            {isAuthenticated ? (
                <div className="ml-2 flex items-center gap-1">
                    {/*
                        The email identifies the account, and identifying it is
                        the point: with the wishlist now per-user, "whose
                        wishlist am I looking at" is a question the UI has to be
                        able to answer. Hidden below `sm` where there is no room,
                        which is why the sign-out control keeps its own label.
                    */}
                    <span
                        className="hidden max-w-[16ch] truncate text-sm font-medium text-slate-600 sm:inline"
                        title={user?.email}
                    >
                        {user?.email}
                    </span>

                    <button
                        type="button"
                        onClick={onLogout}
                        aria-label="Sign out"
                        title="Sign out"
                        className="
                            inline-flex
                            h-10
                            items-center
                            gap-2
                            rounded-full
                            px-3
                            text-sm
                            font-semibold
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
                        <LogOut size={16} aria-hidden="true" />
                        <span className="hidden sm:inline">Sign out</span>
                    </button>
                </div>
            ) : (
                <Link
                    to="/login"
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
                    <User size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">Login</span>
                </Link>
            )}

        </div>
    );
}
