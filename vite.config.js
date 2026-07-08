import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const path = require("path");
const fs = require("fs");
const {
  buildDefine,
  resolveBase,
  appPlugins,
  emitClassicHtml,
  iifeBuildOptions,
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

// Primary build config. Emits the externally-embedded web-component.js bundle
// (classic IIFE) and, on `yarn start`, serves the dev server for both HTML test
// pages. html-renderer.js and PyodideWorker.js are emitted by their own configs
// (chained in the build script) because a classic IIFE build cannot contain
// more than one entry.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

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
          {
            src: path.resolve(__dirname, "src/projects/*").replace(/\\/g, "/"),
            dest: "projects",
          },
          {
            src: path
              .resolve(
                __dirname,
                "node_modules/@raspberrypifoundation/python-friendly-error-messages/copydecks/*",
              )
              .replace(/\\/g, "/"),
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
      // Deployed preview page loads the bundle exactly as an external host does.
      emitClassicHtml({
        template: path.resolve(__dirname, "web-component.html"),
        fileName: "web-component.html",
        bundle: "web-component.js",
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
    build: iifeBuildOptions({
      root: __dirname,
      entry: "src/web-component.jsx",
      name: "web-component",
      primary: true,
    }),
  };
});
