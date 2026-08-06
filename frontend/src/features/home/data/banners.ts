import {
    Apple,
    GraduationCap,
    Laptop,
    Gamepad2,
    Sparkles,
    Tag,
} from "lucide-react";

import type { Banner } from "../types/home";

export const banners: Banner[] = [
    {
        id: "back-to-college",
        eyebrow: "Season Sale",
        title: "Back to College",
        subtitle: "Laptops, tablets and audio picked for students — compared across every major store.",
        cta: "Shop the sale",
        gradient: "from-blue-600 via-indigo-600 to-violet-700",
        icon: GraduationCap,
    },
    {
        id: "gaming-setup",
        eyebrow: "Build Guide",
        title: "Best Gaming Setup",
        subtitle: "Monitors, consoles and peripherals ranked by our AI on price-to-performance.",
        cta: "Explore builds",
        gradient: "from-indigo-600 via-violet-600 to-purple-700",
        icon: Gamepad2,
    },
    {
        id: "apple-festival",
        eyebrow: "Brand Event",
        title: "Apple Festival",
        subtitle: "iPhone, MacBook and Watch at their lowest tracked prices this quarter.",
        cta: "See Apple deals",
        gradient: "from-slate-800 via-slate-900 to-indigo-950",
        icon: Apple,
    },
    {
        id: "samsung-week",
        eyebrow: "Brand Event",
        title: "Samsung Week",
        subtitle: "Galaxy flagships, tablets and TVs with bank offers stacked and calculated for you.",
        cta: "See Samsung deals",
        gradient: "from-sky-600 via-blue-600 to-indigo-700",
        icon: Sparkles,
    },
    {
        id: "laptop-deals",
        eyebrow: "Category Sale",
        title: "Laptop Deals",
        subtitle: "Up to ₹35,000 off across ultrabooks, creator laptops and gaming rigs.",
        cta: "Compare laptops",
        gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
        icon: Laptop,
    },
    {
        id: "weekend-offers",
        eyebrow: "Ends Sunday",
        title: "Weekend Offers",
        subtitle: "Fresh price drops refreshed every hour across Amazon, Flipkart and Croma.",
        cta: "Grab offers",
        gradient: "from-blue-600 via-cyan-600 to-teal-700",
        icon: Tag,
    },
];
