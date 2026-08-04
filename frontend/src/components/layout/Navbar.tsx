import { NavLink } from "react-router-dom";

const navItems = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Search",
    path: "/search",
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
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">

        <NavLink
          to="/"
          className="group flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold text-white shadow-lg transition duration-300 group-hover:scale-105">
            C
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              CartWise
            </h1>

            <p className="-mt-1 text-xs text-slate-500">
              Compare Smart. Shop Wise.
            </p>
          </div>
        </NavLink>

        <nav className="flex items-center gap-3 rounded-full border border-slate-200 bg-white p-2 shadow-sm">

          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

        </nav>

        <div className="flex items-center gap-3">

          <button className="rounded-full border border-slate-200 bg-white px-5 py-2 font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600 hover:shadow-md">
            Login
          </button>

          <button className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
            Sign Up
          </button>

        </div>

      </div>
    </header>
  );
}
