import type { Category } from "../../types/home";

interface CategoryCardProps {
    category: Category;
}

/**
 * A large, obviously-tappable category tile.
 *
 * The whole tile is the hit target; the icon plate carries the colour so the
 * grid reads as a set rather than nine competing gradients.
 */
export default function CategoryCard({ category }: CategoryCardProps) {
    const { title, caption, icon: Icon, gradient, tint } = category;

    return (
        <button
            type="button"
            className="
                group
                flex
                w-full
                flex-col
                items-center
                gap-4
                rounded-[24px]
                border
                border-slate-200/70
                bg-white
                px-4
                py-7
                text-center
                transition-[transform,box-shadow,border-color]
                duration-300
                ease-out
                hover:-translate-y-1.5
                hover:border-slate-300/70
                hover:shadow-[0_20px_44px_-16px_rgba(15,23,42,0.22)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                focus-visible:ring-offset-2
            "
        >
            <span
                className={`
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-[22px]
                    ${tint}
                    transition-transform
                    duration-300
                    ease-out
                    group-hover:scale-105
                `}
            >
                <span
                    className={`
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-[16px]
                        bg-gradient-to-br
                        ${gradient}
                        text-white
                        shadow-sm
                    `}
                >
                    <Icon size={26} strokeWidth={1.75} />
                </span>
            </span>

            <span className="space-y-1">
                <span className="block text-[15px] font-semibold leading-snug text-slate-900">
                    {title}
                </span>

                <span className="block text-xs font-medium text-slate-500">
                    {caption}
                </span>
            </span>
        </button>
    );
}
