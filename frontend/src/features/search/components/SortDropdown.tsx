import type { SortOption } from "../types/search";

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

const SortDropdown = ({
    value,
    onChange,
}: SortDropdownProps) => {
    return (
        <div className="flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-lg">

            <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Sort By
            </span>

            <select
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value as SortOption
                    )
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-medium transition focus:border-blue-500 focus:bg-white"
            >
                <option value="relevance">
                    Relevance
                </option>

                <option value="price-low-high">
                    Price ↑
                </option>

                <option value="price-high-low">
                    Price ↓
                </option>

                <option value="rating">
                    Rating
                </option>

                <option value="name">
                    Name
                </option>

            </select>

        </div>
    );
};

export default SortDropdown;
