const features = [
    {
        title: "Compare Products",
        description:
            "Analyze specifications, pricing and ratings side-by-side before purchasing.",
        icon: "⚖️",
    },
    {
        title: "Best Price",
        description:
            "Find the most competitive prices from multiple platforms.",
        icon: "💰",
    },
    {
        title: "Smart Search",
        description:
            "Fast debounced search with intelligent filtering and sorting.",
        icon: "🔍",
    },
    {
        title: "Trusted Reviews",
        description:
            "View ratings and insights before making a buying decision.",
        icon: "⭐",
    },
];

export default function WhyCartWise() {
    return (
        <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-black py-28 text-white">

            <div className="mx-auto max-w-7xl px-8">

                <div className="mb-20 text-center">

                    <span className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold">
                        Why CartWise
                    </span>

                    <h2 className="mt-8 text-5xl font-black">
                        Built for Smarter Shopping
                    </h2>

                    <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-slate-300">
                        CartWise is designed to simplify product
                        comparison, helping users make confident
                        purchasing decisions through a clean,
                        intuitive and responsive experience.
                    </p>

                </div>

                <div className="grid gap-10 md:grid-cols-2">

                    {features.map((feature) => (

                        <div
                            key={feature.title}
                            className="rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-lg transition duration-300 hover:-translate-y-2 hover:border-blue-500 hover:bg-white/10"
                        >

                            <div className="text-6xl">
                                {feature.icon}
                            </div>

                            <h3 className="mt-8 text-3xl font-black">
                                {feature.title}
                            </h3>

                            <p className="mt-5 text-lg leading-8 text-slate-300">
                                {feature.description}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}
