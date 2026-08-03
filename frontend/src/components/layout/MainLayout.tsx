import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
