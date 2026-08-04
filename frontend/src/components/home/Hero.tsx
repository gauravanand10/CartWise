import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2563eb22,transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-8 py-28 lg:flex-row">

        {/* Left */}

        <div className="flex-1">

          <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-300">
            🚀 Smart Product Discovery
          </span>

          <h1 className="mt-8 text-6xl font-black leading-tight text-white">

            Find.

            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Compare.
            </span>

            Buy Smarter.

          </h1>

          <p className="mt-8 max-w-xl text-xl leading-9 text-slate-300">
            CartWise helps you discover products, compare specifications,
            analyze prices and make confident buying decisions in seconds.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">

            <Link
              to="/search"
              className="rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:scale-105 hover:bg-blue-700"
            >
              Explore Products
            </Link>

            <Link
              to="/compare"
              className="rounded-2xl border border-slate-700 px-8 py-4 font-semibold text-slate-200 transition hover:border-blue-500 hover:text-white"
            >
              Compare Products
            </Link>

          </div>

          <div className="mt-14 flex gap-10">

            <div>
              <h2 className="text-4xl font-black text-white">
                20+
              </h2>

              <p className="mt-2 text-slate-400">
                Products
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-black text-white">
                8+
              </h2>

              <p className="mt-2 text-slate-400">
                Categories
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-black text-white">
                4.9★
              </h2>

              <p className="mt-2 text-slate-400">
                Ratings
              </p>
            </div>

          </div>

        </div>

        {/* Right */}

        <div className="mt-20 flex flex-1 justify-center lg:mt-0">

          <div className="rounded-[40px] border border-slate-700 bg-slate-900/60 p-10 shadow-2xl backdrop-blur">

            <div className="grid grid-cols-2 gap-6">

              <div className="rounded-3xl bg-slate-800 p-8 text-center transition hover:scale-105">
                <div className="text-6xl">📱</div>
                <p className="mt-5 font-semibold text-white">
                  Smartphones
                </p>
              </div>

              <div className="rounded-3xl bg-slate-800 p-8 text-center transition hover:scale-105">
                <div className="text-6xl">💻</div>
                <p className="mt-5 font-semibold text-white">
                  Laptops
                </p>
              </div>

              <div className="rounded-3xl bg-slate-800 p-8 text-center transition hover:scale-105">
                <div className="text-6xl">🎧</div>
                <p className="mt-5 font-semibold text-white">
                  Audio
                </p>
              </div>

              <div className="rounded-3xl bg-slate-800 p-8 text-center transition hover:scale-105">
                <div className="text-6xl">⌚</div>
                <p className="mt-5 font-semibold text-white">
                  Wearables
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
