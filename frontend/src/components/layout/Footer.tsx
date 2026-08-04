import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl px-8 py-20">

        <div className="grid gap-16 md:grid-cols-4">

          <div>

            <h2 className="text-4xl font-black">
              CartWise
            </h2>

            <p className="mt-6 leading-8 text-slate-400">
              Compare products smarter, discover
              better deals and make informed buying
              decisions with CartWise.
            </p>

          </div>

          <div>

            <h3 className="text-xl font-bold">
              Product
            </h3>

            <div className="mt-6 space-y-4">

              <Link
                to="/search"
                className="block text-slate-400 transition hover:text-white"
              >
                Search
              </Link>

              <Link
                to="/compare"
                className="block text-slate-400 transition hover:text-white"
              >
                Compare
              </Link>

              <Link
                to="/wishlist"
                className="block text-slate-400 transition hover:text-white"
              >
                Wishlist
              </Link>

            </div>

          </div>

          <div>

            <h3 className="text-xl font-bold">
              Resources
            </h3>

            <div className="mt-6 space-y-4">

              <a
                href="#"
                className="block text-slate-400 transition hover:text-white"
              >
                Documentation
              </a>

              <a
                href="#"
                className="block text-slate-400 transition hover:text-white"
              >
                GitHub
              </a>

              <a
                href="#"
                className="block text-slate-400 transition hover:text-white"
              >
                Contact
              </a>

            </div>

          </div>

          <div>

            <h3 className="text-xl font-bold">
              Newsletter
            </h3>

            <div className="mt-6">

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 outline-none transition focus:border-blue-500"
              />

              <button className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-4 font-semibold transition hover:-translate-y-1 hover:shadow-xl">
                Subscribe
              </button>

            </div>

          </div>

        </div>

        <div className="mt-20 border-t border-slate-800 pt-8 text-center text-slate-500">

          © 2026 CartWise • Built with React, TypeScript & Tailwind CSS

        </div>

      </div>

    </footer>
  );
}
