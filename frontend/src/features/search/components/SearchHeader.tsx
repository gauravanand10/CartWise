interface SearchHeaderProps {
  totalResults: number;
}

const SearchHeader = ({
  totalResults,
}: SearchHeaderProps) => {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-fuchsia-600 via-purple-700 to-violet-700 px-6 py-10 text-white shadow-2xl sm:rounded-[32px] sm:px-10 sm:py-14 lg:px-12 lg:py-16">

      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" />

      <div className="relative z-10 max-w-3xl">

        <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur sm:px-5 sm:py-2 sm:text-sm">
          🚀 Production Ready Search
        </span>

        {/*
          The line break is `sm`-only. A hard <br /> plus a fixed text-6xl meant
          "smarter with CartWise" was one unbreakable 60px line, which ran off
          the panel on any screen under ~640px. Now the words wrap naturally on
          phones and only take the designed two-line shape once there's room.
        */}

        <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:mt-6 sm:text-4xl lg:text-6xl">
          Discover products
          <br className="hidden sm:block" />{" "}
          smarter with{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
            CartWise
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fuchsia-100 sm:mt-6 sm:text-lg sm:leading-8">
          Compare products, analyze specifications,
          filter results and make better buying
          decisions with a fast and intuitive search
          experience.
        </p>

        {/* A 3-up grid rather than flex-wrap: wrapping left a lone orphan tile
            on a second row at tablet widths. */}

        <div className="mt-8 grid grid-cols-3 gap-2.5 sm:mt-10 sm:gap-6">

          <div className="rounded-xl bg-white/10 px-2 py-3 backdrop-blur sm:rounded-2xl sm:px-8 sm:py-5">

            <h2 className="text-base font-black sm:text-2xl lg:text-4xl">
              {totalResults}
            </h2>

            <p className="mt-1 text-[11px] leading-tight text-fuchsia-100 sm:text-base">
              Products
            </p>

          </div>

          <div className="rounded-xl bg-white/10 px-2 py-3 backdrop-blur sm:rounded-2xl sm:px-8 sm:py-5">

            <h2 className="text-base font-black sm:text-2xl lg:text-4xl">
              50ms
            </h2>

            <p className="mt-1 text-[11px] leading-tight text-fuchsia-100 sm:text-base">
              Search Speed
            </p>

          </div>

          <div className="rounded-xl bg-white/10 px-2 py-3 backdrop-blur sm:rounded-2xl sm:px-8 sm:py-5">

            <h2 className="text-base font-black sm:text-2xl lg:text-4xl">
              100%
            </h2>

            <p className="mt-1 text-[11px] leading-tight text-fuchsia-100 sm:text-base">
              Responsive
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

export default SearchHeader;
