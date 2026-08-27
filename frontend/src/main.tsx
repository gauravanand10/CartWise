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
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
