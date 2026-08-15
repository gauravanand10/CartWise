import { defineConfig, mergeConfig } from "vitest/config";

// The `.ts` extension is required, not optional. Vite's newer native config loader refuses an
// extensionless relative import and warns that it will become the default; without it this file
// still loads today and stops loading on the next Vite major.
import viteConfig from "./vite.config.ts";

/**
 * Test configuration, merged onto the real Vite config rather than written beside it.
 *
 * `mergeConfig` means the tests resolve modules, JSX and aliases exactly the way the application
 * build does. A second, hand-copied config is the usual arrangement and it drifts: the day someone
 * adds a path alias to `vite.config.ts`, every test importing through it fails with a resolution
 * error that has nothing to do with the change.
 *
 * A separate file rather than a `test` block inside `vite.config.ts`, because that config is what
 * `npm run build` loads. Putting test settings there makes the production build depend on the test
 * runner's types, and `vite build` would start reading a `test` key it has no use for.
 */
export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            /**
             * jsdom, not the default node environment: every test here renders React into a DOM and
             * queries it the way a user would. It is a simulated DOM with no layout engine — see the
             * note in `HeroBanner.test.tsx`, which has to supply geometry by hand because of it.
             */
            environment: "jsdom",

            /** `describe`/`it`/`expect` without an import in every file, matching Jest conventions. */
            globals: true,

            setupFiles: ["./src/test/setup.ts"],

            /**
             * Only files named `*.test.*`. The default pattern also matches `*.spec.*`; naming one
             * convention and enforcing it stops the suite quietly splitting into two.
             */
            include: ["src/**/*.test.{ts,tsx}"],

            css: false,

            /**
             * Worker threads rather than the default child processes.
             *
             * Vitest's `forks` pool starts a full Node process per worker, and on this machine —
             * 16GB with Docker Desktop holding a chunk of it for the backend's container tests — the
             * first worker never finished starting and the run failed with "Timeout waiting for
             * worker to respond" after 60 seconds. Threads share one process's heap, which is enough
             * to fit. The trade-off is real: threads give weaker isolation between test files, so a
             * test that mutates a global must clean up after itself — which `src/test/setup.ts`
             * already enforces for the two globals this suite touches, `localStorage` and `fetch`.
             *
             * Note the flat `maxWorkers`/`minWorkers`: Vitest 4 removed the nested
             * `poolOptions.threads.*` form, and leaving it in place is not an error — it prints a
             * deprecation notice and the limits are silently ignored, which on this machine means
             * the memory problem quietly comes back.
             */
            pool: "threads",
            maxWorkers: 2,
            minWorkers: 1,

            coverage: {
                provider: "v8",
                /** `text` for the terminal, `html` to browse, `json-summary` so a script can read it. */
                reporter: ["text", "html", "json-summary"],
                reportsDirectory: "./coverage",

                /**
                 * Report on the source that exists, not only on the files a test happened to import.
                 * Without `all`, a component nobody tests is absent from the report rather than
                 * showing as 0% — which makes the headline percentage go *up* when coverage gets
                 * worse, and is the single most misleading way to configure this tool.
                 */
                all: true,
                include: ["src/**/*.{ts,tsx}"],
                exclude: [
                    "src/**/*.test.{ts,tsx}",
                    "src/test/**",
                    "src/main.tsx",
                    // Static mock catalogues awaiting a real endpoint. They are data, not behaviour;
                    // counting them as uncovered lines moves the percentage without describing a risk.
                    "src/**/data/**",
                    "src/data/**",
                    "src/**/types/**",
                    "src/types/**",
                    "src/constants/**",
                ],
            },
        },
    }),
);
