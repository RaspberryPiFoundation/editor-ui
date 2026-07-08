import { defineConfig, loadEnv, normalizePath } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const path = require("path");
const fs = require("fs");

// Paths that are fetched cross-origin from within the (COEP: require-corp)
// page or the Pyodide worker, so they must advertise a permissive CORP header.
// Mirrors the setupMiddlewares block in the old webpack.config.js.
const CORP_PATHS = [
  "/pyodide/shims/_internal_sense_hat.js",
  "/pyodide/shims/pygal.js",
  "/PyodideWorker.js",
  "/api/scratch/projects/cool-scratch.json",
];

// In production PyodideWorker.js is emitted by vite.worker.config.js. In dev it
// is not part of the module graph and the worker build is not run, so serve it
// directly from source with the same process.env substitutions applied. Read on
// each request so edits to the worker are picked up without a restart.
const pyodideWorkerDevServer = (replacements) => ({
  name: "pyodide-worker-dev-server",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req.url || "").split("?")[0];
      if (url !== "/PyodideWorker.js") return next();
      let code = fs.readFileSync(
        path.resolve(__dirname, "src/PyodideWorker.js"),
        "utf8",
      );
      for (const [from, to] of Object.entries(replacements)) {
        code = code.split(from).join(to);
      }
      res.setHeader("Content-Type", "text/javascript");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.end(code);
    });
  },
});

const crossOriginResourcePolicy = () => ({
  name: "cross-origin-resource-policy",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req.url || "").split("?")[0];
      if (CORP_PATHS.includes(url) || url.startsWith("/html-renderer.html")) {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      }
      next();
    });
  },
});

// The app reads a fixed set of build-time variables via `process.env.*`. We keep
// those references in the source (rather than migrating to import.meta.env) so
// the Jest suite, which resolves them against the real Node env, keeps working.
// Every key used in src/ must be listed here or a bare `process` reference would
// throw in the browser.
const buildDefine = (mode, env) => {
  const stringify = (value) => JSON.stringify(value ?? "");
  return {
    "process.env.NODE_ENV": JSON.stringify(mode),
    "process.env.PUBLIC_URL": stringify(env.PUBLIC_URL),
    "process.env.ASSETS_URL": stringify(env.ASSETS_URL || env.PUBLIC_URL),
    "process.env.HTML_RENDERER_URL": stringify(env.HTML_RENDERER_URL),
    "process.env.REACT_APP_API_ENDPOINT": stringify(env.REACT_APP_API_ENDPOINT),
    "process.env.REACT_APP_AUTHENTICATION_CLIENT_ID": stringify(
      env.REACT_APP_AUTHENTICATION_CLIENT_ID,
    ),
    "process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS": stringify(
      env.REACT_APP_ALLOWED_IFRAME_ORIGINS,
    ),
    "process.env.REACT_APP_SCRATCH_FRAME_URL": stringify(
      env.REACT_APP_SCRATCH_FRAME_URL,
    ),
    "process.env.REACT_APP_SENTRY_DSN": stringify(env.REACT_APP_SENTRY_DSN),
    "process.env.REACT_APP_SENTRY_ENV": stringify(env.REACT_APP_SENTRY_ENV),
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const isDev = mode === "development";

  // In production the bundle is served from an absolute CDN origin (PUBLIC_URL)
  // so async chunk imports resolve regardless of the embedding host; in dev the
  // Vite server owns the origin, so a root-relative base is correct. This mirrors
  // react-dev-utils' getPublicUrlOrPath behaviour under the old webpack build.
  const rawPublicUrl = env.PUBLIC_URL || "/";
  const publicUrl = rawPublicUrl.endsWith("/")
    ? rawPublicUrl
    : `${rawPublicUrl}/`;

  return {
    base: isDev ? "/" : publicUrl,
    envDir: __dirname,
    envPrefix: "REACT_APP_",
    define: buildDefine(mode, env),
    plugins: [
      // Automatic JSX runtime matches babel-preset-react-app (and the Jest
      // transform); many components do not import React, so classic would break.
      // babel-plugin-prismjs is carried over from .babelrc.
      react({
        babel: {
          plugins: [
            [
              "prismjs",
              {
                languages: ["javascript", "css", "python", "html"],
                plugins: [
                  "line-numbers",
                  "line-highlight",
                  "highlight-keywords",
                  "normalize-whitespace",
                ],
                theme: "twilight",
                css: true,
              },
            ],
          ],
        },
      }),
      // Only src/assets/icons/**/*.svg become React components (default export),
      // matching the old @svgr/webpack rule; every other .svg stays a URL asset.
      svgr({
        include: "**/src/assets/icons/**/*.svg",
        svgrOptions: { exportType: "default" },
      }),
      // Replaces webpack's resolve.fallback for node builtins reached
      // transitively (e.g. by skulpt / jszip).
      nodePolyfills({ include: ["stream", "path", "url", "assert"] }),
      // Replaces copy-webpack-plugin (public/ is handled natively by publicDir).
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(path.resolve(__dirname, "src/projects/*")),
            dest: "projects",
          },
          {
            src: normalizePath(
              path.resolve(
                __dirname,
                "node_modules/@raspberrypifoundation/python-friendly-error-messages/copydecks/*",
              ),
            ),
            dest: "python-error-copydecks",
          },
        ],
      }),
      crossOriginResourcePolicy(),
      pyodideWorkerDevServer({
        "process.env.ASSETS_URL": JSON.stringify(
          env.ASSETS_URL || env.PUBLIC_URL || "",
        ),
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
    ],
    server: {
      host: true,
      port: 3011,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization, x-run-id, x-project-id",
        // Pyodide - required for input and code interruption
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },
    build: {
      outDir: path.resolve(__dirname, "build"),
      emptyOutDir: true,
      rolldownOptions: {
        input: {
          "web-component": path.resolve(__dirname, "web-component.html"),
          "html-renderer": path.resolve(__dirname, "html-renderer.html"),
        },
        output: {
          // External sites load /web-component.js (and /html-renderer.js) by a
          // stable, unhashed name, exactly as webpack's `[name].js` emitted.
          entryFileNames: "[name].js",
        },
      },
    },
  };
});
