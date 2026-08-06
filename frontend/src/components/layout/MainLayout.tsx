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
                <Container className="pt-8 pb-24 md:pt-12 md:pb-32">
                    <Outlet />
                </Container>
            </main>

            <Footer />

        </div>
    );
}
