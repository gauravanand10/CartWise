import { NavLink } from "react-router-dom";

const links = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: "Wishlist", path: "/wishlist" },
];

function Navbar() {
    return (
        <header className="bg-slate-900 text-white shadow-md">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
                <NavLink
                    to="/"
                    className="text-2xl font-bold tracking-wide text-white"
                >
                    CartWise
                </NavLink>

                <div className="flex items-center gap-8">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "font-semibold text-blue-400"
                                    : "transition hover:text-blue-300"
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
