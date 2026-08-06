import { useState } from "react";

import type { Brand } from "../../types/home";

interface BrandCardProps {
    brand: Brand;
}

/**
 * A brand tile that degrades to a gradient monogram when the logo file is
 * missing — which is currently every brand, since the asset folders are empty.
 */
export default function BrandCard({ brand }: BrandCardProps) {
    const { name, logo, monogram, products, gradient } = brand;
    const [logoFailed, setLogoFailed] = useState(false);

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
                rounded-[24px]
                border
                border-slate-200/70
                bg-white
                px-4
                py-6
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
                className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[18px]
                    transition-transform
                    duration-300
                    ease-out
                    group-hover:scale-105
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

            <span>
                <span className="block text-[15px] font-semibold text-slate-900">
                    {name}
                </span>

                <span className="mt-0.5 block text-xs text-slate-500">
                    {products}
                </span>
            </span>
        </button>
    );
}
