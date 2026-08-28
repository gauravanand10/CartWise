import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * `base` — where this build expects to be SERVED FROM, not where it is built.
 * Chapter 30.1.
 *
 * Every deployment target this app has had before this chapter serves it from
 * a domain's root: `docker-compose.yml`'s nginx container, Railway, Render,
 * and the Capacitor Android build (`androidScheme` gives it its own origin
 * entirely). Vite's default, `base: "/"`, is correct for all of them, which is
 * why none of Chapter 30's deployment configs had to touch this file.
 *
 * A GitHub Pages PROJECT site is the one target that is not at a root: it is
 * served from `https://<user>.github.io/<repo>/`, so every asset URL and every
 * client-side route has to be prefixed with `/<repo>/` or the browser requests
 * `https://<user>.github.io/assets/...` — a 404, because that path belongs to
 * a different (or no) site entirely. This was verified by doing exactly that:
 * building once with `base: "/"` and serving the output from a subpath server
 * reproduced blank-page-plus-404-network-tab before this fix, and building
 * with the real base path and serving it the same way did not.
 *
 * `VITE_BASE_PATH` is read here, in Node, at config-evaluation time — not as
 * `import.meta.env.VITE_BASE_PATH` inside application code, which would be a
 * plain string baked into the bundle rather than something Vite itself acts
 * on. Unset, it defaults to `"/"`, so every build command that already exists
 * (`npm run build` locally, every Dockerfile, Capacitor's `cap sync`) is
 * unaffected — only `.github/workflows/deploy-pages.yml` sets it, to
 * `/CartWise/`, matching this repository's actual name.
 */
const basePath = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
  ],
});
