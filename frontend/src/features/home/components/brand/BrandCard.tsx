import { useState } from "react";
import { Link } from "react-router-dom";

import type { Brand } from "../../types/home";

interface BrandCardProps {
    brand: Brand;
}

/**
 * A brand tile that degrades to a gradient monogram when the logo file is
 * missing — which is currently every brand, since the asset folders are empty.
 *
 * Chapter 24: this was a `<button type="button">` with no `onClick`. A grid of
 * eight brand tiles under a "Shop by brand" heading, none of which did
 * anything. It is now a link into `/browse?brand=`, which the catalogue API
 * already filters on — the brand names in this data ("Apple", "Samsung", …)
 * are the same strings the products table stores, and the server compares them
 * case-insensitively.
 */
export default function BrandCard({ brand }: BrandCardProps) {
    const { name, logo, monogram, products, gradient } = brand;
    const [logoFailed, setLogoFailed] = useState(false);

    return (
        <Link
            to={`/browse?brand=${encodeURIComponent(name)}`}
            className="
                group
                flex
                w-full
                flex-col
                items-center
                gap-2.5
                rounded-[20px]
                border
                border-slate-200/70
                bg-white
                px-3
                py-5
                text-center
                sm:gap-3
                sm:rounded-[24px]
                sm:px-4
                sm:py-6
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
                className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[16px]
                    transition-transform
                    duration-300
                    ease-out
                    group-hover:scale-105
                    sm:h-16
                    sm:w-16
                    sm:rounded-[18px]
                "
            >
                {logoFailed || !logo ? (
                    <span
                        className={`
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            rounded-[18px]
                            bg-gradient-to-br
                            ${gradient}
                            text-base
                            font-bold
                            tracking-tight
                            text-white
                        `}
                    >
                        {monogram}
                    </span>
                ) : (
                    <img
                        src={logo}
                        alt={name}
                        loading="lazy"
                        onError={() => setLogoFailed(true)}
                        className="h-full w-full object-contain"
                    />
                )}
            </span>

            <span className="w-full">
                <span className="block truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
                    {name}
                </span>

                <span className="mt-0.5 block text-[11px] text-slate-500 sm:text-xs">
                    {products}
                </span>
            </span>
        </Link>
    );
}
