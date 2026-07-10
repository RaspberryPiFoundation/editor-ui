import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const path = require("path");
const fs = require("fs");
const {
  buildDefine,
  processEnvDevServer,
  resolveBase,
  appPlugins,
  emitClassicHtml,
  iifeBuildOptions,
  copyDirTarget,
} = require("./vite.lib.js");

// Paths that are fetched cross-origin from within the (COEP: require-corp)
// page or the Pyodide worker, so they must advertise a permissive CORP header.
// Mirrors the setupMiddlewares block in the old webpack.config.js.
const CORP_PATHS = [
  "/pyodide/shims/_internal_sense_hat.js",
  "/pyodide/shims/pygal.js",
  "/PyodideWorker.js",
  "/api/scratch/projects/cool-scratch.json",
];

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

// webpack-dev-server's `static` middleware served public/index.html for the
// bare "/" request by default (standard static-file-server "index" document
// convention). Vite's dev server does not: with appType "mpa" it has no SPA
// fallback, and publicDir assets are only served at their exact path (e.g.
// "/index.html", not "/"). CI's Cypress job waits on the bare origin
// (http://localhost:3011) before starting, so "/" must return 2xx. Reproduce
// the old behaviour by serving public/index.html verbatim for "/" in dev.
const rootIndexDevServer = () => ({
  name: "root-index-dev-server",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if ((req.url || "").split("?")[0] !== "/") return next();
      res.setHeader("Content-Type", "text/html");
      res.end(fs.readFileSync(path.resolve(__dirname, "public/index.html")));
    });
  },
});

// Primary build config. Emits the externally-embedded web-component.js bundle
// (classic IIFE) and, on `yarn start`, serves the dev server for both HTML test
// pages. html-renderer.js and PyodideWorker.js are emitted by their own configs
// (chained in the build script) because a classic IIFE build cannot contain
// more than one entry.
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  // rollup-plugin-visualizer is ESM-only; import it dynamically so `require`-ing
  // this config never has to load it when ANALYZE is unset (the common case).
  const analyzePlugin =
    process.env.ANALYZE === "true"
      ? (await import("rollup-plugin-visualizer")).visualizer({
          filename: path.resolve(__dirname, "build/stats.html"),
          gzipSize: true,
          brotliSize: true,
        })
      : false;

  return {
    base: resolveBase(mode, env),
    // Multiple HTML test pages, no single index.html / SPA fallback.
    appType: "mpa",
    envDir: __dirname,
    envPrefix: "REACT_APP_",
    define: buildDefine(mode, env),
    plugins: [
      ...appPlugins(react, svgr, nodePolyfills),
      // Replaces copy-webpack-plugin (public/ is handled natively by publicDir).
      viteStaticCopy({
        targets: [
          copyDirTarget({ root: __dirname, dir: "src/projects", dest: "projects" }),
          copyDirTarget({
            root: __dirname,
            dir: "node_modules/@raspberrypifoundation/python-friendly-error-messages/copydecks",
            dest: "python-error-copydecks",
          }),
        ],
      }),
      crossOriginResourcePolicy(),
      rootIndexDevServer(),
      processEnvDevServer(mode, env),
      pyodideWorkerDevServer({
        "process.env.ASSETS_URL": JSON.stringify(
          env.ASSETS_URL || env.PUBLIC_URL || "",
        ),
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      // Deployed preview page loads the bundle exactly as an external host does.
      emitClassicHtml({
        template: path.resolve(__dirname, "web-component.html"),
        fileName: "web-component.html",
        bundle: "web-component.js",
      }),
      // `yarn analyze` (ANALYZE=true) replaces webpack-bundle-analyzer: writes an
      // interactive treemap of web-component.js's contents to build/stats.html.
      analyzePlugin,
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
    build: iifeBuildOptions({
      root: __dirname,
      entry: "src/web-component.jsx",
      name: "web-component",
      primary: true,
    }),
  };
});
