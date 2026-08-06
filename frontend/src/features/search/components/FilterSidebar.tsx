interface FilterSidebarProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (
        category: string
    ) => void;
}

/** Human-facing label for the catch-all category. */
const ALL_LABEL = "All products";

const FilterSidebar = ({
    categories,
    selectedCategory,
    onCategoryChange,
}: FilterSidebarProps) => {
    return (
        <aside className="sticky top-40 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
                Filters
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Narrow your search.
            </p>

            {/*
                `categories` already begins with "All" (see useSearch), so this
                renders the list as-is. Prepending a separate hardcoded button
                here previously produced two selected-looking "All" entries.
            */}

            <div className="mt-6 space-y-1.5">

                {categories.map((category) => {
                    const isActive = selectedCategory === category;

                    return (
                        <button
                            key={category}
                            type="button"
                            onClick={() => onCategoryChange(category)}
                            aria-pressed={isActive}
                            className={`
                                w-full
                                rounded-xl
                                px-4
                                py-2.5
                                text-left
                                text-sm
                                font-medium
                                transition
                                duration-200
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-blue-500
                                ${isActive
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }
                            `}
                        >
                            {category === "All" ? ALL_LABEL : category}
                        </button>
                    );
                })}

            </div>

        </aside>
    );
};

export default FilterSidebar;
