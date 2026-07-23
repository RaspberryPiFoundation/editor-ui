# Migration plan: webpack (ejected CRA) → Vite 8.1.x

Migrate the **root `editor-ui`** build from the custom webpack 5 setup to Vite
8.1.x, matching the toolchain already used by `apps/scratch-frame`
(rolldown‑vite 8, `@vitejs/plugin-react` classic runtime, `envPrefix:
"REACT_APP_"`, `vite-plugin-static-copy`). `apps/scratch-frame` is already on
Vite and is **out of scope**.

### Locked decisions
1. **Keep Jest** — no Vitest migration in this PR (§2).
2. **`define` shim** for env vars — `process.env.*` stays in source (§3, option A).
3. **Single PR** — swap webpack for Vite and delete webpack config together.
4. **Vite `~8.1.x` on root only** — leave `apps/scratch-frame` at `^8.0.16`
   (accept minor version drift between workspaces).

---

## 1. What makes this non-trivial

The current webpack build does several things a stock Vite React template does
not. Each needs a deliberate Vite equivalent:

| # | Current behaviour | Where | Vite equivalent |
|---|---|---|---|
| 1 | **SCSS imported as a raw string** and injected into Shadow DOM via `<style>{x.toString()}</style>` (css-loader only, no style-loader) | `WebComponentLoader.jsx`, `HtmlRenderer.jsx`, `HtmlRunner.jsx` (`InternalStyles.scss`, `ExternalStyles.scss`, `index.scss`, `HtmlRunner.scss`) | Import with `?inline` → returns a CSS string. `.toString()` on a string is a no-op, so call sites can stay unchanged. |
| 2 | **SVGs in `src/assets/icons/**` compiled to React components** (`@svgr/webpack`); **all other SVGs** become URLs/data-URIs (`url-loader`) | `webpack.config.js` rules; ~30 `import X from "*.svg"` | `vite-plugin-svgr` with `include: "src/assets/icons/**/*.svg"`; leave other `.svg` as Vite default asset URLs. Verify svgr default export shape. |
| 3 | **`PyodideWorker.js` built as a standalone global-assigning IIFE**, served at `${PUBLIC_URL}/PyodideWorker.js`, then loaded at runtime via a cross-origin blob trick (`getWorkerURL`) | `src/PyodideWorker.js`, `PyodideRunner.jsx` | Keep it a separate, self-contained output (either a second Rollup input or a small dedicated `vite build` step) emitted to the build root; the runtime blob-loading trick is unchanged. Do **not** convert to `?worker` import — the cross-origin/COEP blob loader must stay. |
| 4 | **Three entry points**: `web-component.js`, `html-renderer.jsx`, `PyodideWorker.js`, plus 2 HTML templates via `HtmlWebpackPlugin` | `webpack.config.js` `entry` + `HtmlWebpackPlugin` ×2 | Multi-page `build.rolldownOptions.input` with `web-component.html` + `html-renderer.html`; move HTML to project root (or use root + `appType`). Worker handled per #3. |
| 5 | **`process.env.*`** (62 uses: `PUBLIC_URL`, `ASSETS_URL`, `NODE_ENV`, `HTML_RENDERER_URL`, `REACT_APP_*`) | across `src/` | See §3 decision. Fastest path: `define` the values at build time; cleaner long‑term: migrate to `import.meta.env`. |
| 6 | **Node core polyfills** `stream / assert / path / url` (no direct `src` imports — pulled in by deps e.g. skulpt/jszip) | `webpack.config.js` `resolve.fallback` | `vite-plugin-node-polyfills` (or targeted aliases). Confirm which are actually reached at runtime; add only those. |
| 7 | **`CopyWebpackPlugin`**: `public/**`, `src/projects → projects`, python-error-copydecks | `webpack.config.js` plugins | `vite-plugin-static-copy` (already used in scratch-frame). `public/**` can use Vite's `publicDir`; the other two need static-copy. |
| 8 | **`.md` files imported as raw strings** (`raw-loader`) | `test: /\.md$/` | `import x from "./f.md?raw"` (query suffix) — touch each `.md` import site. |
| 9 | **Dev server**: port 3011, COOP/COEP headers (Pyodide), CORS headers, per-path `Cross-Origin-Resource-Policy` middleware, static dir for `src/projects` | `webpack.config.js` `devServer` | `server` config: `port`, `headers`, and a small middleware plugin (`configureServer`) for the per-path CORP header. |
| 10 | **Babel**: `react-app` preset + `babel-plugin-prismjs` (auto-imports prism languages/plugins/theme/css) | `.babelrc` | `@vitejs/plugin-react({ jsxRuntime: "classic", babel: { plugins: [["prismjs", {...}]] } })`. Keep `.babelrc` or inline. |
| 11 | **`fullySpecified: false`** for `@raspberrypifoundation/python-friendly-error-messages` (extensionless ESM imports) | `webpack.config.js` | Usually a non-issue in Vite; if it errors, add to `optimizeDeps` / an alias. Verify. |
| 12 | **Dotenv** with `systemvars: true`, multi-file `.env.{env}.local` precedence, env dir is repo root | `config/env.js`, `Dotenv` | `loadEnv(mode, envDir, "")` + `envDir` at repo root, matching scratch-frame. |

---

## 2. Testing: keep Jest (locked)

Jest does **not** reference `webpack.config.js` — it is almost fully decoupled
from the bundler already. Its wiring:

- `config/jest/babelTransform.js` uses `babel-preset-react-app` directly with
  `babelrc: false, configFile: false` (so it ignores `.babelrc` and
  `babel-plugin-prismjs` entirely). Self-contained.
- The `jest` block in `package.json` has its own transforms
  (`jest-scss-transform` → scss-as-string, `jest-transformer-svg` → svg-as-component,
  `jest-css-modules-transform`, `jest-transform-stub`, `identity-obj-proxy`),
  `transformIgnorePatterns` for `three`, and `setupTests.js` (mocks
  `window.Worker`). None of this is webpack-related.
- **The only coupling** is `scripts/test.js` → `require("../config/env")` →
  `config/paths.js` → `react-dev-utils`.

**To keep Jest green through the migration:**
1. Leave the entire `jest` block in `package.json` untouched.
2. Do **not** prune the Jest-only deps during webpack cleanup: `babel-preset-react-app`,
   `babel-jest`, `@babel/core`, `jest-scss-transform`, `jest-transformer-svg`,
   `jest-css-modules-transform`, `jest-transform-stub`, `identity-obj-proxy`,
   `jest-circus`, `jest-environment-jsdom`, `react-app-polyfill`, reporters,
   watch plugins.
3. Rewrite `scripts/test.js` to drop `require("../config/env")` — inline the env
   bootstrap (`NODE_ENV`/`BABEL_ENV`/`PUBLIC_URL`, optional `dotenv` load) so
   `config/env.js`, `config/paths.js`, and `react-dev-utils` can still be deleted.
4. **Keep `process.env.*` in source** (§3 option A). Jest resolves those against
   real Node env via Babel; `import.meta.env` would break Jest without an extra
   `import.meta` Babel shim. This is why "keep Jest" and "define shim" are paired.

`yarn test` / CI test command stay unchanged. (A Jest→Vitest migration, to match
scratch-frame, is a possible later follow-up but is out of scope here.)

---

## 3. `process.env` strategy — `define` shim (locked, option A)

62 usages. **Chosen: option A** (keeps `process.env.*` in source, so Jest is
unaffected). Option B kept below for reference only.

- **A — `define` shim (fast, minimal diff).** In `vite.config.js`, statically
  replace the specific keys:
  ```js
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
    "process.env.PUBLIC_URL": JSON.stringify(env.PUBLIC_URL || ""),
    "process.env.ASSETS_URL": JSON.stringify(env.ASSETS_URL || env.PUBLIC_URL || ""),
    "process.env.HTML_RENDERER_URL": JSON.stringify(env.HTML_RENDERER_URL || ""),
    "process.env.REACT_APP_API_ENDPOINT": JSON.stringify(env.REACT_APP_API_ENDPOINT || ""),
    // ...one entry per REACT_APP_* key
  }
  ```
  Pro: no `src` changes. Con: every env key must be enumerated; a bare
  `process.env` object reference would break (none found — all uses are
  specific keys).
- **B — migrate to `import.meta.env`.** Codemod `process.env.REACT_APP_X` →
  `import.meta.env.REACT_APP_X`, set `envPrefix: "REACT_APP_"`, and map the
  non-prefixed ones (`PUBLIC_URL`→`import.meta.env.BASE_URL` or a defined var).
  Pro: idiomatic Vite, matches scratch-frame. Con: touches ~62 sites + tests
  that read env.

> Chosen: **A**. B remains a possible cleanup only if tests move to Vitest later.

---

## 4. Step-by-step plan

### Phase 0 — Prep
1. Decisions are locked (see top): keep Jest, define shim, single PR, root on
   `~8.1.x` only.
2. Read scratch-frame's `vite.config.js` as the template for
   headers/`envDir`/`envPrefix`/static-copy conventions.

### Phase 1 — Dependencies
3. Add (root `package.json` devDeps): `vite@~8.1.x`, `@vitejs/plugin-react@^6`,
   `vite-plugin-svgr`, `vite-plugin-static-copy@^4`, `vite-plugin-node-polyfills`,
   `sass` (already present). Keep `babel-plugin-prismjs` (used by the react
   plugin's babel), `postcss`, `stylelint*`.
4. Remove webpack-only deps **at the end** (after green build): `webpack`,
   `webpack-cli`, `webpack-dev-server`, `webpack-bundle-analyzer`,
   `html-webpack-plugin`, `copy-webpack-plugin`, `dotenv-webpack`, `worker-plugin`,
   `@svgr/webpack`, `css-loader`, `sass-loader` (webpack loader — Vite uses
   `sass` directly, so this can go), `resolve-url-loader`, `file-loader`,
   `url-loader`, `raw-loader`, `babel-loader`, `react-dev-utils`. Keep anything
   still referenced by Jest.

### Phase 2 — Config
5. Create root `vite.config.js` (mirroring scratch-frame): `plugins`
   (react classic + svgr(include icons) + static-copy + node-polyfills +
   html-transform-if-needed + dev-CORP-middleware), `envDir` = repo root,
   `envPrefix: "REACT_APP_"`, `base` from `PUBLIC_URL`, `define` (§3),
   `resolve.alias` for any polyfills, `server` (port 3011 + COOP/COEP/CORS
   headers), `build.outDir: "build"`, `build.rolldownOptions.input` for the two
   HTML pages.
6. Move/adjust HTML: place `web-component.html` and `index-html-renderer.html`
   (→ `html-renderer.html`) where Vite expects them (project root), and add the
   `<script type="module" src="/src/web-component.js">` / `html-renderer.jsx`
   tags that `HtmlWebpackPlugin` used to inject. Preserve the inline
   `<script>`/`<style>` blocks already in `web-component.html`.
7. Handle `PyodideWorker.js` build (§1 #3) — separate input emitting
   `PyodideWorker.js` to build root; verify the `getWorkerURL` blob loader still
   resolves `${PUBLIC_URL}/PyodideWorker.js`.

### Phase 3 — Source touch-ups (minimal)
8. SCSS-as-string: append `?inline` to the 4 Shadow-DOM style imports
   (`InternalStyles.scss`, `ExternalStyles.scss`, `index.scss`, `HtmlRunner.scss`).
   Leave `.toString()` calls (no-op on strings).
9. `.md` imports: append `?raw`.
10. Verify SVG component imports render identically under `vite-plugin-svgr`
    (default export as component); adjust any `ReactComponent` named-import
    style if present.
11. Env: apply §3 choice.

### Phase 4 — Scripts & CI
12. Update root `package.json` scripts: `start` → `vite` (or
    `vite --port 3011`), `build` → `vite build`, `analyze` → rollup-plugin-visualizer
    or `vite build` + analyzer flag. Keep `test`, `lint`, `stylelint`,
    `watch-css` unchanged.
13. Update `.github/workflows/ci-cd.yml` if it invokes webpack directly (build
    step, `PUBLIC_URL`/`ASSETS_URL` env still passed at build time). Cypress
    still targets `http://localhost:3011` — no change if dev port preserved.
14. Update `docs/` references (README build/dev instructions, `WebComponent.md`)
    and `CLAUDE.md`/`AGENTS.md` note about "custom (ejected CRA) webpack setup".

### Phase 5 — Verify & clean up
15. `yarn start`, load `/web-component.html`, run Python (Pyodide worker +
    COOP/COEP), HTML, and Scratch sample projects; confirm Shadow-DOM styling.
16. `yarn build` → inspect `build/` for parity: `PyodideWorker.js`, both HTML
    pages, `projects/`, python-error-copydecks, public assets.
17. `CI=true yarn test`, `yarn lint`, `yarn exec cypress run`.
18. Delete `webpack.config.js`, `config/env.js`, `config/paths.js` (CRA
    leftovers) and the webpack-only deps from Phase 1.

---

## 5. Key risks / watch-list

- **COOP/COEP + cross-origin worker**: Pyodide needs COOP `same-origin` + COEP
  `require-corp`; the per-path `Cross-Origin-Resource-Policy: cross-origin`
  middleware for `PyodideWorker.js`, shims, and `html-renderer.html` must be
  reproduced in `configureServer`, or Python silently fails to run.
- **Worker output naming/hashing**: the runtime loads `PyodideWorker.js` by a
  fixed name — the build must emit that exact filename (no hash) at the base
  path, exactly as webpack's `filename: "[name].js"` did.
- **Node polyfills**: nothing in `src` imports node builtins, so the need is
  transitive (skulpt, jszip, stream-browserify). Test Python/zip flows before
  assuming they can be dropped.
- **CSS `@use "../../../node_modules/..."`** paths in `ExternalStyles.scss`
  (prism CSS): verify Sass `loadPaths`/resolution under Vite's Sass.
- **`?inline` SCSS + `sourceMap`/`resolve-url-loader`**: the old chain used
  `resolve-url-loader` for `url(...)` in SCSS; confirm asset URLs inside inlined
  SCSS resolve correctly (or inline as data-URIs).
- **Multi-page + `base`/`PUBLIC_URL`**: asset paths in the web-component bundle
  are consumed by external host apps; keep `base` = `PUBLIC_URL` so emitted
  asset URLs stay absolute as today.

---

## 6. Decisions (resolved)

1. **Tests:** keep Jest (see §2 for the checklist that keeps it green).
2. **`process.env`:** `define` shim, `process.env.*` stays in source (§3, A).
3. **Vite version:** root on `~8.1.x`; `apps/scratch-frame` stays at `^8.0.16`.
4. **Rollout:** single PR — add Vite and remove webpack (Phase 5) together.
