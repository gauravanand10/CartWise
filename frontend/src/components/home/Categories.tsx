import categories from "../../data/categories";

export default function Categories() {
    return (
        <section className="bg-slate-50 py-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold">
                        Browse Categories
                    </h2>

                    <p className="mt-3 text-gray-600">
                        Discover products from your favorite category.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <div
                            key={category.title}
                            className="rounded-2xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl"
                        >
                            <div className="mb-4 text-5xl">
                                {category.icon}
                            </div>

                            <h3 className="text-2xl font-semibold">
                                {category.title}
                            </h3>

                            <p className="mt-3 text-gray-600">
                                {category.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
