interface Facet {
    value: string;
    count: number;
}

interface CategoryFilterProps {
    categories: Facet[];
    selected: string;
    onChange: (category: string) => void;
}

/** Single-select category list. "All products" clears the facet. */
export default function CategoryFilter({
    categories,
    selected,
    onChange,
}: CategoryFilterProps) {
    const options: Facet[] = [
        { value: "All", count: categories.reduce((n, c) => n + c.count, 0) },
        ...categories,
    ];

    return (
        <ul className="space-y-0.5">
            {options.map((option) => {
                const active = selected === option.value;

                return (
                    <li key={option.value}>
                        <button
                            type="button"
                            onClick={() => onChange(option.value)}
                            aria-pressed={active}
                            className={`
                                flex
                                w-full
                                items-center
                                justify-between
                                gap-2
                                rounded-lg
                                px-3
                                py-2
                                text-left
                                text-sm
                                transition
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-blue-500
                                ${active
                                    ? "bg-slate-900 font-semibold text-white"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }
                            `}
                        >
                            <span className="truncate">
                                {option.value === "All" ? "All products" : option.value}
                            </span>

                            <span
                                className={`shrink-0 text-xs ${active ? "text-white/70" : "text-slate-400"}`}
                            >
                                {option.count}
                            </span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
