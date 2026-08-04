interface FilterSidebarProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (
        category: string
    ) => void;
}

const FilterSidebar = ({
    categories,
    selectedCategory,
    onCategoryChange,
}: FilterSidebarProps) => {
    return (
        <aside className="sticky top-28 rounded-3xl bg-white p-8 shadow-lg">

            <h2 className="text-2xl font-black text-slate-900">
                Filters
            </h2>

            <p className="mt-2 text-slate-500">
                Narrow your search.
            </p>

            <div className="mt-8 space-y-4">

                <button
                    onClick={() =>
                        onCategoryChange("All")
                    }
                    className={`w-full rounded-2xl px-5 py-4 text-left font-semibold transition ${selectedCategory === "All"
                            ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                            : "bg-slate-100 hover:bg-blue-50"
                        }`}
                >
                    All Products
                </button>

                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() =>
                            onCategoryChange(category)
                        }
                        className={`w-full rounded-2xl px-5 py-4 text-left font-semibold transition ${selectedCategory === category
                                ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                                : "bg-slate-100 hover:bg-blue-50"
                            }`}
                    >
                        {category}
                    </button>
                ))}

            </div>

        </aside>
    );
};

export default FilterSidebar;
