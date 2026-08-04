const SearchSkeleton = () => {
  return (
    <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-3xl bg-white shadow-lg"
          >
            <div className="h-72 animate-pulse bg-slate-200" />

            <div className="space-y-5 p-6">

              <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />

              <div className="h-8 w-full animate-pulse rounded bg-slate-200" />

              <div className="h-8 w-1/2 animate-pulse rounded bg-slate-200" />

              <div className="h-12 animate-pulse rounded bg-slate-200" />

            </div>

          </div>
        )
      )}

    </div>
  );
};

export default SearchSkeleton;
