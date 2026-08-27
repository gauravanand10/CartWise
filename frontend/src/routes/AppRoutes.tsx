import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import Home from "../pages/Home/Home";
import Wishlist from "../pages/Wishlist/Wishlist";
import Product from "../pages/Product/Product";
import NotFound from "../pages/NotFound/NotFound";
import AffiliateDisclosure from "../pages/AffiliateDisclosure/AffiliateDisclosure";
import AffiliateClicks from "../pages/Admin/AffiliateClicks";

import { SearchPage } from "../features/search";
import { ComparePage } from "../features/compare";
import { LoginPage, ProtectedRoute, SignupPage } from "../features/auth";
import CataloguePage from "../features/discovery/CataloguePage";

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

                {/* The catalogue, filtered by query string. Every filter, sort
                    and page lives in the URL, so this route is shareable and
                    survives a reload — see useCatalogueParams. */}

                <Route
                    path="/browse"
                    element={<CataloguePage />}
                />

                {/* Public: getting a token cannot itself require one. */}

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/signup"
                    element={<SignupPage />}
                />

                {/*
                    Chapter 23.5. Both of these read user-scoped endpoints that
                    answer 401 without a token, so there is nothing to render for
                    a guest — the gate matches what the API already enforces
                    rather than adding a rule of its own.

                    Grouped under one layout route so the protection is visible
                    here, in the route table, instead of being a wrapper each
                    page has to remember to apply.
                */}

                {/* Chapter 26. Public, and it has to be: the disclosure is a
                    legal notice about links a signed-out visitor can click, so
                    putting it behind a login would defeat its purpose. */}

                <Route
                    path="/affiliate-disclosure"
                    element={<AffiliateDisclosure />}
                />

                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/compare"
                        element={<ComparePage />}
                    />

                    <Route
                        path="/wishlist"
                        element={<Wishlist />}
                    />

                    {/*
                        Chapter 26's click report.

                        ProtectedRoute only asks "is anyone signed in" — it
                        cannot ask for a role, because the frontend never learns
                        one: AuthResponse carries an id, an email and a token,
                        and nothing decodes the token client-side. That is not a
                        gap being tolerated. The report is served by
                        /api/admin/affiliate/clicks, which SecurityConfig gates
                        with hasRole("ADMIN"), so a signed-in non-admin who types
                        this URL gets a 403 from the server and a page that says
                        so. The route gate is convenience; the server is the
                        control.
                    */}

                    <Route
                        path="/admin/affiliate-clicks"
                        element={<AffiliateClicks />}
                    />

                </Route>

                {/* Slug rather than a numeric id: product URLs are shared and
                    read by people, and every card in the app already carries
                    the slug it links to. */}

                <Route
                    path="/product/:slug"
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
