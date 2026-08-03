export default function Footer() {
    return (
        <footer className="mt-24 bg-slate-950 text-gray-300">
            <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3">
                <div>
                    <h2 className="text-3xl font-bold text-white">
                        CartWise
                    </h2>

                    <p className="mt-4 text-gray-400">
                        Compare products intelligently before making your next purchase.
                    </p>
                </div>

                <div>
                    <h3 className="mb-4 text-lg font-semibold text-white">
                        Quick Links
                    </h3>

                    <ul className="space-y-2">
                        <li>Home</li>
                        <li>Compare</li>
                        <li>Wishlist</li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 text-lg font-semibold text-white">
                        Contact
                    </h3>

                    <p>support@cartwise.com</p>
                    <p>India</p>
                </div>
            </div>

            <div className="border-t border-slate-800 py-6 text-center text-sm text-gray-400">
                © 2026 CartWise • Built with React + TypeScript
            </div>
        </footer>
    );
}
