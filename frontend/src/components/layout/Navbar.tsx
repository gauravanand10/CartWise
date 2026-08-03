import { NavLink } from "react-router-dom";

const navItems = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Compare",
    path: "/compare",
  },
  {
    name: "Wishlist",
    path: "/wishlist",
  },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-slate-950/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <NavLink
          to="/"
          className="text-3xl font-extrabold text-white tracking-tight"
        >
          CartWise
        </NavLink>

        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative font-medium transition duration-300 ${
                  isActive
                    ? "text-blue-500"
                    : "text-gray-300 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
