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
                gap-3
                rounded-[20px]
                border
                border-slate-200/70
                bg-white
                px-3
                py-5
                text-center
                sm:gap-4
                sm:rounded-[24px]
                sm:px-4
                sm:py-7
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
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-[18px]
                    ${tint}
                    transition-transform
                    duration-300
                    ease-out
                    group-hover:scale-105
                    sm:h-20
                    sm:w-20
                    sm:rounded-[22px]
                `}
            >
                <span
                    className={`
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-[13px]
                        bg-gradient-to-br
                        ${gradient}
                        text-white
                        shadow-sm
                        sm:h-14
                        sm:w-14
                        sm:rounded-[16px]
                    `}
                >
                    <Icon
                        className="h-[21px] w-[21px] sm:h-[26px] sm:w-[26px]"
                        strokeWidth={1.75}
                    />
                </span>
            </span>

            <span className="w-full space-y-0.5 sm:space-y-1">
                {/* Wraps to a second line rather than truncating: "Home
                    Appliances" needs 111px and the tile is 108px at 320px, so
                    truncating cost the last word for no reason. Grid rows
                    stretch, so a two-line title keeps the cards level. */}

                <span className="block text-sm font-semibold leading-snug text-slate-900 sm:text-[15px]">
                    {title}
                </span>

                <span className="block text-[11px] font-medium text-slate-500 sm:text-xs">
                    {caption}
                </span>
            </span>
        </button>
    );
}
