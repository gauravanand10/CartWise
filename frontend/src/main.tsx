import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/common/ErrorBoundary";

/*
 * CHAPTER 29 — the outermost boundary.
 *
 * Above <BrowserRouter> deliberately, so that a throw from the router itself —
 * a bad route element, a provider that fails to initialise — is still caught.
 * The trade is that this boundary has no router context and so its "Go to
 * homepage" is a plain <a> rather than a <Link>; a full page load is the more
 * reliable recovery from a broken tree anyway.
 *
 * A second, route-scoped boundary lives inside MainLayout. That one keeps the
 * navigation and footer on screen when only the page content throws, which is
 * the far more common case and a much better outcome than losing the whole
 * chrome. This one is the backstop for everything the inner one cannot see.
 */
/*
 * CHAPTER 30.1 — `basename`, read from Vite's own `BASE_URL`.
 *
 * Without it, React Router matches every route against the path AFTER
 * `vite.config.ts`'s `base` prefix has already put the app there — so on
 * GitHub Pages, at `/CartWise/`, the router would see `/CartWise/search` and
 * have no route for it, because every route in AppRoutes.tsx is declared as
 * `/search`, `/product/:slug`, and so on. `basename` is what tells the router
 * to strip that prefix before matching, and to add it back onto every `<Link
 * to="...">` it renders — so `to="/"` in Footer/Logo/NotFound/etc. keeps
 * working unmodified rather than needing every one of them rewritten.
 *
 * `BASE_URL` is `"/"` wherever `VITE_BASE_PATH` is unset (see vite.config.ts),
 * and `basename="/"` is what BrowserRouter already defaults to — so this is a
 * no-op on every target except a GitHub Pages project site.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
