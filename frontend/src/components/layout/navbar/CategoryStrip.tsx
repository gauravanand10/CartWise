import {
    Camera,
    Gamepad2,
    Headphones,
    Laptop,
    Monitor,
    Refrigerator,
    Smartphone,
    Tv,
    Watch,
} from "lucide-react";

import Container from "../Container";

const categories = [
    { name: "Mobiles", icon: Smartphone },
    { name: "Laptops", icon: Laptop },
    { name: "Smart Watches", icon: Watch },
    { name: "Audio", icon: Headphones },
    { name: "TVs", icon: Tv },
    { name: "Monitors", icon: Monitor },
    { name: "Gaming", icon: Gamepad2 },
    { name: "Cameras", icon: Camera },
    { name: "Appliances", icon: Refrigerator },
];

/**
 * Slim secondary navigation.
 *
 * Text-first chips rather than large gradient tiles — the header is persistent
 * chrome, so every pixel of height it takes is height the content doesn't get.
 */
export default function CategoryStrip() {
    return (
        <div className="relative border-t border-slate-100 bg-white">

            <Container className="flex h-12 items-center gap-1 overflow-x-auto scrollbar-hide sm:h-11">

                {categories.map((category) => {
                    const Icon = category.icon;

                    return (
                        <button
                            key={category.name}
                            type="button"
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-2
                                rounded-full
                                px-3
                                py-2.5
                                text-[13px]
                                font-medium
                                sm:py-1.5
                                text-slate-600
                                transition
                                duration-200
                                hover:bg-slate-100
                                hover:text-slate-900
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-blue-500
                            "
                        >
                            <Icon
                                size={15}
                                className="text-slate-400"
                                aria-hidden="true"
                            />
                            {category.name}
                        </button>
                    );
                })}

            </Container>

            {/* Right-edge fade: the strip scrolls on small screens but has no
                arrows, so this is the only cue that more categories exist.
                Hidden from `lg`, where the full set already fits. */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent lg:hidden"
            />

        </div>
    );
}
