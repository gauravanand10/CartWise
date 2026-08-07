import { categories } from "../../data/categories";
import Reveal from "../motion/Reveal";
import CategoryCard from "./CategoryCard";

/**
 * The "start browsing here" grid.
 *
 * Sits directly under the hero search because picking a category is the most
 * common first action — the same reason Blinkit leads with it.
 */
export default function CategoryGrid() {
    return (
        <section aria-labelledby="browse-categories">

            <Reveal>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2
                            id="browse-categories"
                            className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
                        >
                            Browse categories
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Every model, compared across nine stores.
                        </p>
                    </div>
                </div>
            </Reveal>

            {/* 2 → 3 → 4 → 5 columns. The extra `md` step stops tablets from
                jumping straight from 3 oversized tiles to 5 cramped ones. */}

            <div
                className="
                    grid
                    grid-cols-2
                    gap-3
                    min-[400px]:gap-4
                    sm:grid-cols-3
                    md:grid-cols-4
                    lg:grid-cols-5
                    xl:gap-5
                "
            >
                {categories.map((category, index) => (
                    <Reveal
                        key={category.id}
                        delay={Math.min(index * 0.04, 0.24)}
                    >
                        <CategoryCard category={category} />
                    </Reveal>
                ))}
            </div>

        </section>
    );
}
