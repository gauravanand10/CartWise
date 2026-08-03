import SearchBar from "./SearchBar";
import heroImage from "../../assets/hero.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Decorative Background Blobs */}
      <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-blue-200 opacity-30 blur-3xl"></div>

      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-indigo-200 opacity-30 blur-3xl"></div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-20 px-6 py-24 lg:flex-row">
        {/* Left Section */}
        <div className="flex-1">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            🚀 Smart Product Comparison Platform
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight text-gray-900 lg:text-7xl">
            Compare Products
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Before You Buy
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-xl leading-9 text-gray-600">
            Compare prices, specifications, ratings and reviews from multiple
            brands to make informed buying decisions with confidence.
          </p>

          <div className="mt-10">
            <SearchBar />
          </div>

          <div className="mt-10 flex flex-wrap gap-5">
            <button className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-2xl">
              Start Comparing →
            </button>

            <button className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg">
              Browse Products
            </button>
          </div>

          <div className="mt-14 flex items-center gap-3 text-gray-500">
            <div className="animate-bounce text-2xl">
              ↓
            </div>

            <span className="text-sm uppercase tracking-widest">
              Scroll to Explore
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative flex flex-1 justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 blur-3xl"></div>

          <img
            src={heroImage}
            alt="CartWise Hero"
            className="relative w-full max-w-xl rounded-3xl shadow-2xl transition duration-500 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}
