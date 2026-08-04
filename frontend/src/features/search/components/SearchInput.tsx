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
    <section className="mt-12">

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">

        <div className="flex items-center gap-5 px-8 py-6">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
            🔍
          </div>

          <input
            type="text"
            placeholder="Search products, brands or categories..."
            value={query}
            onChange={(e) =>
              onQueryChange(e.target.value)
            }
            className="flex-1 bg-transparent text-xl font-medium text-slate-800 placeholder:text-slate-400"
          />

          {query.length > 0 && (
            <button
              onClick={() =>
                onQueryChange("")
              }
              className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-600 transition hover:bg-red-100 hover:text-red-600"
            >
              Clear
            </button>
          )}

          <button
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            Search
          </button>

        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-8 py-4">

          <div className="flex flex-wrap items-center gap-3">

            <span className="font-semibold text-slate-500">
              Trending
            </span>

            {trendingSearches.map((item) => (
              <button
                key={item}
                onClick={() =>
                  onQueryChange(item)
                }
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
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
