import { stats } from "../../data/stats";

export default function Stats() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-8">

        <div className="mb-16 text-center">

          <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">
            CartWise in Numbers
          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">
            Trusted by Thousands
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
            CartWise continues to grow with more products,
            brands and users every day.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl bg-white p-10 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              <h2 className="text-5xl font-black text-blue-600">
                {stat.value}
              </h2>

              <p className="mt-5 text-lg font-medium text-slate-500">
                {stat.label}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
