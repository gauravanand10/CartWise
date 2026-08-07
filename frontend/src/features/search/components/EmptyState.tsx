const EmptyState = () => {
    return (
        <section className="mt-10 flex flex-col items-center justify-center rounded-[24px] bg-white p-8 text-center shadow-xl sm:mt-16 sm:rounded-[36px] sm:p-14 lg:p-20">

            <div className="text-5xl sm:text-7xl lg:text-8xl">
                🔍
            </div>

            <h2 className="mt-8 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
                No Products Found
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-500">
                We couldn't find any matching products.

                Try searching with different keywords,
                categories or brands.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">

                {[
                    "iPhone",
                    "Samsung",
                    "Laptop",
                    "Headphones",
                    "Gaming",
                ].map((item) => (
                    <span
                        key={item}
                        className="rounded-full bg-slate-100 px-6 py-3 font-semibold text-slate-600"
                    >
                        {item}
                    </span>
                ))}

            </div>

        </section>
    );
};

export default EmptyState;
