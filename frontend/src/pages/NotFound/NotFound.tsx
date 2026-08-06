import { Link } from "react-router-dom";

function NotFound() {
    return (
        <section className="flex flex-col items-center justify-center py-24 text-center">
            <h1 className="mb-4 text-7xl font-bold text-red-600">
                404
            </h1>

            <p className="mb-8 text-lg text-gray-600">
                The page you are looking for does not exist.
            </p>

            <Link
                to="/"
                className="rounded-lg bg-fuchsia-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700"
            >
                Return Home
            </Link>
        </section>
    );
}

export default NotFound;
