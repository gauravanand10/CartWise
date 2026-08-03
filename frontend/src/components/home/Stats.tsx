import { stats } from "../../data/stats";

export default function Stats() {
  return (
    <section className="bg-blue-600 py-20 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">
            Trusted by Thousands
          </h2>

          <p className="mt-3 text-blue-100">
            CartWise continues to help users make smarter purchasing decisions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="text-center"
            >
              <h3 className="text-5xl font-bold">
                {item.value}
              </h3>

              <p className="mt-3 text-blue-100">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
