import { Link } from "react-router-dom";

interface ProductErrorProps {
    message: string;
}

export default function ProductError({
    message,
}: ProductErrorProps) {

    return (

        // MainLayout supplies the <main> landmark and width container.
        <div className="flex min-h-[60vh] items-center justify-center">

            <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xl">

                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-red-100 text-6xl">

                    ⚠️

                </div>

                <h1 className="mt-8 text-4xl font-black text-slate-900">

                    Product Not Available

                </h1>

                <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-500">

                    {message}

                </p>

                <div className="mt-12 grid gap-5 md:grid-cols-2">

                    <Link
                        to="/search"
                        className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 py-4 text-center font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >

                        Browse Products

                    </Link>

                    <Link
                        to="/"
                        className="rounded-2xl border border-slate-300 bg-white py-4 text-center font-semibold text-slate-700 transition duration-300 hover:border-fuchsia-600 hover:text-fuchsia-600 hover:shadow-lg"
                    >

                        Back to Home

                    </Link>

                </div>

            </section>

        </div>

    );

}
