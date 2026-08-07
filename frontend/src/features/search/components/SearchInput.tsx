interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
}

const trendingSearches = [
  "iPhone",
  "Samsung",
  "MacBook",
  "Laptop",
  "Headphones",
];

const SearchInput = ({
  query,
  onQueryChange,
}: SearchInputProps) => {
  return (
    <section className="mt-8 sm:mt-12">
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-xl sm:rounded-[32px]">

        {/* Stacks on phones: an icon tile, a field and two buttons cannot share
            one row at 320px without squeezing the field to a few characters. */}

        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-8 sm:py-6">

          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-100 text-2xl sm:flex">
            🔍
          </div>

          <input
            id="search"
            name="search"
            type="text"
            placeholder="Search products, brands or categories..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full min-w-0 flex-1 bg-transparent text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none sm:text-xl"
          />

          {/* `sm:contents` dissolves this wrapper at desktop so the buttons
              become direct flex children again — desktop layout unchanged. */}

          <div className="flex gap-2 sm:contents">

            {query.length > 0 && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="shrink-0 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-100 hover:text-red-600 sm:px-5 sm:text-base"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              className="flex-1 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:shadow-2xl sm:flex-none sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base sm:hover:-translate-y-1"
            >
              Search
            </button>

          </div>

        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-8 sm:py-4">

          <div className="flex flex-wrap items-center gap-3">

            <span className="font-semibold text-slate-500">
              Trending
            </span>

            {trendingSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onQueryChange(item)}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:border-fuchsia-500 hover:bg-fuchsia-50 hover:text-fuchsia-600"
              >
                {item}
              </button>
            ))}

          </div>

          <div className="hidden rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow md:block">
            ⌘ K
          </div>

        </div>

      </div>
    </section>
  );
};

export default SearchInput;
