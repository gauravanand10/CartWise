import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import Container from "./Container";
import ErrorBoundary from "../common/ErrorBoundary";

export default function MainLayout() {
    const { pathname } = useLocation();
    const mainRef = useRef<HTMLElement>(null);
    const firstRender = useRef(true);

    /*
     * =====================================================================
     * CHAPTER 29 — FOCUS MANAGEMENT ON ROUTE CHANGE.
     *
     * THE BUG, measured rather than assumed: focus a link, activate it, and
     * `document.activeElement` afterwards is `<body>`. React Router replaces
     * the DOM without moving focus, which is the default and is wrong in two
     * specific ways for anyone not using a mouse:
     *
     *   - A screen reader announces NOTHING on navigation. The page silently
     *     becomes a different page. There is no event a screen reader can
     *     narrate, because from the accessibility tree's point of view the
     *     document simply mutated.
     *
     *   - The next Tab press starts from the top of the document. CartWise has
     *     three rows of persistent chrome — the top bar, the logo/search/actions
     *     row and the category strip — so a keyboard user is sent back through
     *     roughly fifteen controls after every single navigation.
     *
     * THE FIX is the established pattern: move focus to the main region, which
     * carries `tabIndex={-1}` so it can receive focus programmatically without
     * becoming a tab stop. A screen reader then announces the region and the
     * heading inside it, and the next Tab lands on the first control of the new
     * page's content rather than back at the top bar.
     *
     * NOT ON FIRST RENDER. On a cold load the browser's own focus and the
     * reader's own "start of document" behaviour are correct, and stealing
     * focus into <main> would skip the header for someone who had not asked to
     * skip it. This only fires on an actual in-app navigation.
     * =====================================================================
     */
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        mainRef.current?.focus();
    }, [pathname]);

    return (
        <div className="flex min-h-screen flex-col">

            {/*
                CHAPTER 29 — the skip link, and it is a WCAG Level A fix rather
                than a nicety. 2.4.1 "Bypass Blocks" requires a mechanism to
                skip repeated content, and this application had none: every
                route began with the same fifteen-odd header controls and a
                keyboard user had to traverse all of them, every time.

                Visually hidden until focused, which is the whole convention —
                it is the first thing Tab reaches on any page, and the first
                thing a sighted mouse user never sees.
            */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            <Navbar />

            {/* Navbar is sticky (in-flow), so no offset padding is needed here */}

            <main
                id="main-content"
                ref={mainRef}
                tabIndex={-1}
                // The focus ring is suppressed because focus arrives here
                // programmatically after a navigation, not from a Tab press —
                // outlining the whole page would be alarming. Every control
                // inside it keeps its own visible ring.
                className="flex-1 outline-none"
            >
                <Container className="pb-16 pt-6 sm:pb-24 sm:pt-8 md:pb-32 md:pt-12">
                    {/*
                        CHAPTER 29 — the route-scoped error boundary.

                        Inside the layout rather than around it, so a page that
                        throws loses only the page: the navigation, the search
                        field and the footer stay on screen and the reader can
                        get somewhere else in one click. Before this chapter
                        there was no boundary anywhere and a render-time throw
                        took the entire application down to a blank div.

                        `resetKey={pathname}` is what makes recovery work. A
                        boundary that has caught stays caught until its state is
                        reset, so without this, one broken product page would
                        leave the error screen up for every subsequent route
                        until a full reload. Navigating now clears it.
                    */}
                    <ErrorBoundary resetKey={pathname}>
                        {/*
                            The page transition. `key={pathname}` is what makes
                            it a transition rather than a mount animation: React
                            tears down and remounts the subtree on every
                            navigation, so the animation replays.

                            4px and 220ms, deliberately small. A whole page
                            sliding further reads as the layout shifting under
                            the reader — alarming, not smooth. This is just
                            enough to say "something changed".
                        */}
                        <div key={pathname} className="cw-page">
                            <Outlet />
                        </div>
                    </ErrorBoundary>
                </Container>
            </main>

            <Footer />

        </div>
    );
}
