interface SearchStatsProps {
  total: number;
}

const SearchStats = ({
  total,
}: SearchStatsProps) => {
  return (
    <section className="mt-10 grid gap-6 md:grid-cols-3">

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Products
        </p>

        <h2 className="mt-3 text-5xl font-black text-slate-900">
          {total}
        </h2>

        <p className="mt-4 text-slate-500">
          Products currently available.
        </p>

      </div>

      <div className="rounded-3xl bg-gradient-to-br from-fuchsia-600 to-purple-600 p-8 text-white shadow-xl">

        <p className="text-sm uppercase tracking-wide text-fuchsia-100">
          Engine
        </p>

        <h2 className="mt-3 text-4xl font-black">
          Search V1
        </h2>

        <p className="mt-4 text-fuchsia-100">
          Feature-based architecture with
          debounced search.
        </p>

      </div>

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <p className="text-sm uppercase tracking-wide text-slate-400">
          Response
        </p>

        <h2 className="mt-3 text-4xl font-black text-green-600">
          Mock API
        </h2>

        <p className="mt-4 text-slate-500">
          Ready for backend integration.
        </p>

      </div>

    </section>
  );
}

export default SearchStats;
