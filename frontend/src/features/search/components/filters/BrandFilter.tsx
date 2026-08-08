import { Check } from "lucide-react";

interface Facet {
    value: string;
    count: number;
}

interface BrandFilterProps {
    brands: Facet[];
    selected: string[];
    onChange: (brands: string[]) => void;
}

/** Multi-select brand list. An empty selection means "all brands". */
export default function BrandFilter({
    brands,
    selected,
    onChange,
}: BrandFilterProps) {
    const toggle = (brand: string) => {
        onChange(
            selected.includes(brand)
                ? selected.filter((b) => b !== brand)
                : [...selected, brand],
        );
    };

    return (
        // Capped height with its own scroll: eleven brands would otherwise push
        // the price and rating filters below the fold on a laptop.
        <ul className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
            {brands.map((brand) => {
                const checked = selected.includes(brand.value);

                return (
                    <li key={brand.value}>
                        <label
                            className="
                                flex
                                cursor-pointer
                                items-center
                                gap-2.5
                                rounded-lg
                                px-3
                                py-2
                                text-sm
                                text-slate-600
                                transition
                                hover:bg-slate-100
                                hover:text-slate-900
                                has-[:focus-visible]:ring-2
                                has-[:focus-visible]:ring-blue-500
                            "
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggle(brand.value)}
                                className="peer sr-only"
                            />

                            <span
                                aria-hidden="true"
                                className={`
                                    flex
                                    h-4
                                    w-4
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded
                                    border
                                    transition
                                    ${checked
                                        ? "border-slate-900 bg-slate-900 text-white"
                                        : "border-slate-300 bg-white"
                                    }
                                `}
                            >
                                {checked && <Check size={11} strokeWidth={3} />}
                            </span>

                            <span className="min-w-0 flex-1 truncate">
                                {brand.value}
                            </span>

                            <span className="shrink-0 text-xs text-slate-400">
                                {brand.count}
                            </span>
                        </label>
                    </li>
                );
            })}
        </ul>
    );
}
