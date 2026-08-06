interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (
        page: number
    ) => void;
}

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) => {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-16 flex items-center justify-center gap-4">

            <button
                disabled={currentPage === 1}
                onClick={() =>
                    onPageChange(currentPage - 1)
                }
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold shadow-md transition hover:-translate-y-1 disabled:opacity-40"
            >
                ← Previous
            </button>

            {Array.from(
                {
                    length: totalPages,
                },
                (_, index) => (
                    <button
                        key={index}
                        onClick={() =>
                            onPageChange(index + 1)
                        }
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold transition ${currentPage === index + 1
                                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg"
                                : "bg-white shadow-md hover:-translate-y-1"
                            }`}
                    >
                        {index + 1}
                    </button>
                )
            )}

            <button
                disabled={
                    currentPage === totalPages
                }
                onClick={() =>
                    onPageChange(currentPage + 1)
                }
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold shadow-md transition hover:-translate-y-1 disabled:opacity-40"
            >
                Next →
            </button>

        </div>
    );
};

export default Pagination;
