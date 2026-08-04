import { Link } from "react-router-dom";

import type {
    Product,
} from "../types/product";

interface BreadcrumbProps {
    product: Product;
}

export default function Breadcrumb({
    product,
}: BreadcrumbProps) {

    return (

        <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-3 border-b border-slate-200 py-6 text-sm"
        >

            <Link
                to="/"
                className="font-medium text-slate-500 transition hover:text-blue-600"
            >
                Home
            </Link>

            <span className="text-slate-300">
                /
            </span>

            <Link
                to="/search"
                className="font-medium text-slate-500 transition hover:text-blue-600"
            >
                Search
            </Link>

            <span className="text-slate-300">
                /
            </span>

            <Link
                to={`/search?category=${encodeURIComponent(
                    product.category
                )}`}
                className="font-medium text-slate-500 transition hover:text-blue-600"
            >
                {product.category}
            </Link>

            <span className="text-slate-300">
                /
            </span>

            <span className="font-semibold text-slate-900">
                {product.name}
            </span>

        </nav>

    );

}
