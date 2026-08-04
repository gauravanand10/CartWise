import categories from "../../data/categories";

export default function Categories() {
    return (
        <section className="bg-slate-50 py-24">
            <div className="mx-auto max-w-7xl px-8">

                <div className="mb-16 text-center">

                    <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">
                        Categories
                    </span>

                    <h2 className="mt-6 text-5xl font-black text-slate-900">
                        Shop by Category
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
                        Browse products across multiple categories with an intuitive experience.
                    </p>

                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

                    {categories.map((category) => (

                        <button
                            key={category.title}
                            className="group rounded-3xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                        >

                            <div className="mb-6 text-5xl">
                                {category.icon}
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900">
                                {category.title}
                            </h3>

                            <p className="mt-3 text-slate-500">
                                {category.description}
                            </p>

                        </button>

                    ))}

                </div>

            </div>
        </section>
    );
}
