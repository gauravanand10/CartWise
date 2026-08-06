interface SearchHeaderProps {
  totalResults: number;
}

const SearchHeader = ({
  totalResults,
}: SearchHeaderProps) => {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-fuchsia-600 via-purple-700 to-violet-700 px-12 py-16 text-white shadow-2xl">

      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" />

      <div className="relative z-10 max-w-3xl">

        <span className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur">
          🚀 Production Ready Search
        </span>

        <h1 className="mt-6 text-6xl font-black leading-tight tracking-tight">
          Discover products
          <br />
          smarter with
          <span className="ml-3 bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
            CartWise
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-fuchsia-100">
          Compare products, analyze specifications,
          filter results and make better buying
          decisions with a fast and intuitive search
          experience.
        </p>

        <div className="mt-10 flex flex-wrap gap-6">

          <div className="rounded-2xl bg-white/10 px-8 py-5 backdrop-blur">

            <h2 className="text-4xl font-black">
              {totalResults}
            </h2>

            <p className="mt-1 text-fuchsia-100">
              Products
            </p>

          </div>

          <div className="rounded-2xl bg-white/10 px-8 py-5 backdrop-blur">

            <h2 className="text-4xl font-black">
              50ms
            </h2>

            <p className="mt-1 text-fuchsia-100">
              Search Speed
            </p>

          </div>

          <div className="rounded-2xl bg-white/10 px-8 py-5 backdrop-blur">

            <h2 className="text-4xl font-black">
              100%
            </h2>

            <p className="mt-1 text-fuchsia-100">
              Responsive
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

export default SearchHeader;
