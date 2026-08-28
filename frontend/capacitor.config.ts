import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration. Chapter 30.
 *
 * ===========================================================================
 * THE APP IS THE BUILT WEB APP, NOT A SECOND CODEBASE.
 *
 * `webDir: "dist"` means the Android app ships the exact bundle the browser
 * gets — same React, same design system, same fixes from Chapters 26–29. There
 * is no separate mobile UI to keep in step, which is the whole reason for
 * wrapping rather than rewriting.
 *
 * WHY THERE IS NO `server.url`
 *
 * Capacitor will happily load the app from a remote URL instead of from the
 * bundle. That is convenient for development and wrong for a release: the app
 * would be a browser pointed at a website, would show a blank screen with no
 * network, and Google Play increasingly rejects submissions that are only a
 * webview over a URL. The assets are bundled; only the API is remote.
 *
 * HOW THE API HOST IS CHOSEN — AND WHY IT IS NOT LOCALHOST
 *
 * On a phone, `localhost` is the phone. A build that inherited the dev default
 * would silently talk to nothing and every screen would render its error state.
 *
 * The API base is read from `VITE_API_URL` at build time by
 * `services/api.ts`, so the mobile build is produced with that variable set to
 * the deployed backend:
 *
 *     VITE_API_URL=https://<your-api-host>/api npm run build
 *     npx cap sync android
 *
 * `androidScheme: "https"` matters for the same reason. Capacitor serves the
 * bundle from a custom scheme, and on `http` the WebView treats the origin as
 * insecure — which blocks `localStorage` in some Android WebView versions, and
 * localStorage is where the auth session lives. On `https` the origin is
 * treated as secure and the session survives.
 *
 * ---------------------------------------------------------------------------
 * CAP_LOCAL_API — THE EMULATOR VERIFICATION ESCAPE HATCH
 *
 * The settings above are correct for a release and make the app IMPOSSIBLE to
 * verify against a developer's own machine, which is not a contradiction so
 * much as the point. On the emulator the backend is `http://10.0.2.2:8080`,
 * and an `https://localhost` WebView origin refuses it twice over: once as
 * mixed content, and again under Android's default cleartext ban. Measured,
 * not assumed — the first emulator run rendered the whole shell correctly and
 * every data region said "Failed to fetch".
 *
 * Rather than soften the release config until the screenshot looked right,
 * the relaxation is a named, opt-in mode:
 *
 *     CAP_LOCAL_API=1 npx cap sync android     # emulator/dev only
 *     npx cap sync android                     # the real thing
 *
 * The default — no variable set — is the production configuration, so an
 * ordinary build cannot accidentally acquire the relaxed one. It pairs with
 * `android/app/src/debug/`, which permits cleartext to `10.0.2.2` for the
 * DEBUG BUILD TYPE ONLY; a release build cannot reach that manifest overlay
 * even if this variable were somehow set, so the two are independent locks
 * and both must be opened deliberately.
 * ===========================================================================
 */
const localApi = process.env.CAP_LOCAL_API === "1";

const config: CapacitorConfig = {
    appId: "dev.cartwise.app",
    appName: "CartWise",
    webDir: "dist",

    server: {
        // http in local mode so that a request to http://10.0.2.2:8080 is
        // same-scheme rather than mixed content. localStorage is lost on some
        // WebView versions as a result, which is an acceptable trade for a
        // throwaway verification build and unacceptable for a release.
        androidScheme: localApi ? "http" : "https",
    },

    android: {
        // Mixed content stays OFF for a release. The deployed API is HTTPS;
        // allowing the WebView to load http:// subresources would let a
        // downgraded or injected request through, and there is nothing in this
        // app that needs it.
        allowMixedContent: localApi,
    },
};

export default config;
