import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Container from "./Container";

export default function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col">

            <Navbar />

            {/* Navbar is sticky (in-flow), so no offset padding is needed here */}

            <main className="flex-1">
                <Container className="pb-16 pt-6 sm:pb-24 sm:pt-8 md:pb-32 md:pt-12">
                    <Outlet />
                </Container>
            </main>

            <Footer />

        </div>
    );
}
