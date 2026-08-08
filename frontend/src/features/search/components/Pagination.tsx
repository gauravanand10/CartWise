import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const go = (page: number) => {
        onPageChange(page);
        // Jumping pages while scrolled halfway down otherwise lands the user in
        // the middle of the new results with no sense of having moved.
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const arrowClass = `
        flex h-10 w-10 items-center justify-center rounded-xl border
        border-slate-200 bg-white text-slate-600 transition
        hover:border-slate-300 hover:text-slate-900
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        disabled:pointer-events-none disabled:opacity-40
    `;

    return (
        <nav
            aria-label="Search results pages"
            className="mt-10 flex items-center justify-center gap-2"
        >
            <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => go(currentPage - 1)}
                className={arrowClass}
            >
                <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                const active = page === currentPage;

                return (
                    <button
                        key={page}
                        type="button"
                        aria-label={`Page ${page}`}
                        aria-current={active ? "page" : undefined}
                        onClick={() => go(page)}
                        className={`
                            h-10
                            w-10
                            rounded-xl
                            text-sm
                            font-semibold
                            transition
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                            ${active
                                ? "bg-slate-900 text-white"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                            }
                        `}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                type="button"
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => go(currentPage + 1)}
                className={arrowClass}
            >
                <ChevronRight size={18} />
            </button>
        </nav>
    );
}
