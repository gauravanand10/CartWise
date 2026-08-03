import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-1 px-8 py-10">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default MainLayout;
