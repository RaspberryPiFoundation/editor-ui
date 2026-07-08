import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const path = require("path");
const fs = require("fs");
const {
  processEnvBuildDefine,
  resolveViteBase,
  editorVitePlugins,
  emitClassicBundleHtml,
  classicIifeBuildOptions,
} = require("./vite.lib.js");

const crossOriginResourcePaths = [
  "/pyodide/shims/_internal_sense_hat.js",
  "/pyodide/shims/pygal.js",
  "/PyodideWorker.js",
  "/api/scratch/projects/cool-scratch.json",
];

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

const crossOriginResourcePolicy = () => ({
  name: "cross-origin-resource-policy",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req.url || "").split("?")[0];
      if (
        crossOriginResourcePaths.includes(url) ||
        url.startsWith("/html-renderer.html")
      ) {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      }
      next();
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

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
      serveStandalonePyodideWorkerInDev({
        "process.env.ASSETS_URL": JSON.stringify(
          env.ASSETS_URL || env.PUBLIC_URL || "",
        ),
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      emitClassicBundleHtml({
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
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },
    build: classicIifeBuildOptions({
      root: __dirname,
      entry: "src/web-component.jsx",
      name: "web-component",
      cleansOutput: true,
    }),
  };
});
