import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import Home from "../pages/Home/Home";
import Wishlist from "../pages/Wishlist/Wishlist";
import Product from "../pages/Product/Product";
import NotFound from "../pages/NotFound/NotFound";

import { SearchPage } from "../features/search";
import { ComparePage } from "../features/compare";

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/search"
                    element={<SearchPage />}
                />

                <Route
                    path="/compare"
                    element={<ComparePage />}
                />

                <Route
                    path="/wishlist"
                    element={<Wishlist />}
                />

                <Route
                    path="/product/:id"
                    element={<Product />}
                />

                {/* Inside the layout so a wrong URL still gets the nav, search
                    and footer to recover with, rather than being a dead end. */}

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Route>

        </Routes>
    );
}
