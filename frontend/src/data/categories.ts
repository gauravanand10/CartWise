interface Category {
    title: string;
    description: string;
    icon: string;
}

const categories: Category[] = [
    {
        title: "Smartphones",
        description: "Latest Android & iPhone devices",
        icon: "📱",
    },
    {
        title: "Laptops",
        description: "Gaming, Student & Professional",
        icon: "💻",
    },
    {
        title: "Headphones",
        description: "Wireless & Noise Cancelling",
        icon: "🎧",
    },
    {
        title: "Smart Watches",
        description: "Fitness & Lifestyle",
        icon: "⌚",
    },
    {
        title: "Televisions",
        description: "LED, OLED & QLED TVs",
        icon: "📺",
    },
    {
        title: "Gaming",
        description: "Consoles & Accessories",
        icon: "🎮",
    },
];

export default categories;
