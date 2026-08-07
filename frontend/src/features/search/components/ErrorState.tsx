interface ErrorStateProps {
    message: string;
}

const ErrorState = ({
    message,
}: ErrorStateProps) => {
    return (
        <section className="mt-16 rounded-[36px] border border-red-200 bg-red-50 p-8 sm:p-14 lg:p-20 text-center">

            <div className="text-5xl sm:text-7xl lg:text-8xl">
                ⚠️
            </div>

            <h2 className="mt-8 text-2xl sm:text-3xl lg:text-4xl font-black text-red-700">
                Something went wrong
            </h2>

            <p className="mt-5 text-lg text-red-600">
                {message}
            </p>

            <button
                onClick={() =>
                    window.location.reload()
                }
                className="mt-10 rounded-2xl bg-red-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-red-700"
            >
                Try Again
            </button>

        </section>
    );
};

export default ErrorState;
