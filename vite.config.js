import { defineConfig, loadEnv } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const path = require("path");
const fs = require("fs");
const {
  browserTargets,
  processEnvBuildDefine,
  injectProcessEnvIntoDevHtml,
  resolveViteBase,
  editorVitePlugins,
  emitDeferredClassicBundleHtml,
  classicIifeBuildOptions,
  copyDirectoryContentsTarget,
} = require("./vite.lib.js");

const crossOriginResourcePolicyPaths = [
  "/pyodide/shims/_internal_sense_hat.js",
  "/pyodide/shims/pygal.js",
  "/PyodideWorker.js",
  "/api/scratch/projects/cool-scratch.json",
];

const applyCrossOriginResourcePolicy = (req, res, next) => {
  const url = (req.url || "").split("?")[0];
  if (
    crossOriginResourcePolicyPaths.includes(url) ||
    url.startsWith("/html-renderer.html")
  ) {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
  next();
};

const serveCrossOriginResources = () => ({
  name: "serve-cross-origin-resources",
  configureServer(server) {
    server.middlewares.use(applyCrossOriginResourcePolicy);
  },
  configurePreviewServer(server) {
    server.middlewares.use(applyCrossOriginResourcePolicy);
  },
});

const sharedCrossOriginIsolationHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers":
    "X-Requested-With, content-type, Authorization, x-run-id, x-project-id",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

const serveStandalonePyodideWorkerInDev = (replacements) => ({
  name: "serve-standalone-pyodide-worker-in-dev",
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

const serveIndexAtRootForCypress = () => ({
  name: "serve-index-at-root-for-cypress",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if ((req.url || "").split("?")[0] !== "/") return next();
      res.setHeader("Content-Type", "text/html");
      res.end(fs.readFileSync(path.resolve(__dirname, "public/index.html")));
    });
  },
});

const loadBundleAnalysisPlugin = async () => {
  if (process.env.ANALYZE !== "true") return false;
  const { visualizer } = await import("rollup-plugin-visualizer");
  return visualizer({
    filename: path.resolve(__dirname, "build/stats.html"),
    gzipSize: true,
    brotliSize: true,
  });
};

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const target = await browserTargets();
  const analyzePlugin = await loadBundleAnalysisPlugin();

  return {
    base: resolveViteBase(mode, env),
    appType: "mpa",
    envDir: __dirname,
    envPrefix: "REACT_APP_",
    define: processEnvBuildDefine(mode, env),
    plugins: [
      ...editorVitePlugins(react, svgr, nodePolyfills),
      viteStaticCopy({
        targets: [
          copyDirectoryContentsTarget({
            root: __dirname,
            sourceDirectory: "src/projects",
            dest: "projects",
          }),
          copyDirectoryContentsTarget({
            root: __dirname,
            sourceDirectory:
              "node_modules/@raspberrypifoundation/python-friendly-error-messages/copydecks",
            dest: "python-error-copydecks",
          }),
        ],
      }),
      serveCrossOriginResources(),
      serveIndexAtRootForCypress(),
      injectProcessEnvIntoDevHtml(mode, env),
      serveStandalonePyodideWorkerInDev({
        "process.env.ASSETS_URL": JSON.stringify(
          env.ASSETS_URL || env.PUBLIC_URL || "",
        ),
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      emitDeferredClassicBundleHtml({
        template: path.resolve(__dirname, "web-component.html"),
        fileName: "web-component.html",
        bundle: "web-component.js",
      }),
      analyzePlugin,
    ],
    optimizeDeps: {
      exclude: [
        "prismjs/plugins/line-numbers/prism-line-numbers",
        "prismjs/plugins/line-highlight/prism-line-highlight",
        "prismjs/plugins/highlight-keywords/prism-highlight-keywords",
      ],
    },
    server: {
      host: true,
      port: 3011,
      headers: sharedCrossOriginIsolationHeaders,
    },
    preview: {
      host: true,
      port: 3011,
      headers: sharedCrossOriginIsolationHeaders,
    },
    build: classicIifeBuildOptions({
      root: __dirname,
      entry: "src/web-component.jsx",
      name: "web-component",
      cleansOutput: true,
      target,
    }),
    test: {
      environment: "jsdom",
      globals: true,
      mockReset: true,
      setupFiles: [path.resolve(__dirname, "src/utils/setupTests.vitest.js")],
      include: [
        "src/**/__tests__/**/*.{js,jsx,ts,tsx}",
        "src/**/*.{spec,test}.{js,jsx,ts,tsx}",
      ],
      exclude: configDefaults.exclude,
    },
  };
});
