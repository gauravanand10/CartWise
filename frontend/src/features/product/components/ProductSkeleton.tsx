export default function ProductSkeleton() {

    return (

        <main className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-7xl px-6 py-10 animate-pulse">

                {/* Breadcrumb */}

                <div className="mb-10 h-5 w-80 rounded bg-slate-200" />

                <div className="grid gap-12 lg:grid-cols-2">

                    {/* Gallery */}

                    <section>

                        <div className="h-[520px] rounded-3xl bg-slate-200" />

                        <div className="mt-6 grid grid-cols-4 gap-4">

                            {Array.from({ length: 4 }).map((_, index) => (

                                <div
                                    key={index}
                                    className="h-28 rounded-2xl bg-slate-200"
                                />

                            ))}

                        </div>

                    </section>

                    {/* Product Info */}

                    <section className="rounded-3xl bg-white p-10 shadow-xl">

                        <div className="h-8 w-32 rounded bg-slate-200" />

                        <div className="mt-8 h-12 w-3/4 rounded bg-slate-200" />

                        <div className="mt-5 h-6 w-40 rounded bg-slate-200" />

                        <div className="mt-8 flex gap-5">

                            <div className="h-10 w-28 rounded bg-slate-200" />

                            <div className="h-10 w-36 rounded bg-slate-200" />

                            <div className="h-10 w-28 rounded bg-slate-200" />

                        </div>

                        <div className="mt-10 h-14 w-64 rounded bg-slate-200" />

                        <div className="mt-10 h-10 w-40 rounded bg-slate-200" />

                        <div className="mt-10 space-y-4">

                            {Array.from({ length: 6 }).map((_, index) => (

                                <div
                                    key={index}
                                    className="h-5 rounded bg-slate-200"
                                />

                            ))}

                        </div>

                        <div className="mt-12 grid grid-cols-2 gap-5">

                            <div className="h-14 rounded-2xl bg-slate-200" />

                            <div className="h-14 rounded-2xl bg-slate-200" />

                        </div>

                    </section>

                </div>

                {/* Specifications */}

                <section className="mt-16 rounded-3xl bg-white p-10 shadow-xl">

                    <div className="mb-8 h-10 w-60 rounded bg-slate-200" />

                    {Array.from({ length: 8 }).map((_, index) => (

                        <div
                            key={index}
                            className="mb-4 grid grid-cols-3 gap-6"
                        >

                            <div className="h-6 rounded bg-slate-200" />

                            <div className="col-span-2 h-6 rounded bg-slate-200" />

                        </div>

                    ))}

                </section>

                {/* Description */}

                <section className="mt-16 rounded-3xl bg-white p-10 shadow-xl">

                    <div className="h-10 w-56 rounded bg-slate-200" />

                    <div className="mt-8 space-y-5">

                        {Array.from({ length: 5 }).map((_, index) => (

                            <div
                                key={index}
                                className="h-5 rounded bg-slate-200"
                            />

                        ))}

                    </div>

                </section>

            </div>

        </main>

    );

}
