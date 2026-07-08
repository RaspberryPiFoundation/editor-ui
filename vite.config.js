import { defineConfig, loadEnv, normalizePath } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const path = require("path");

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
      svgr({
        include: "**/src/assets/icons/**/*.svg",
        svgrOptions: { exportType: "default" },
      }),
      nodePolyfills({ include: ["stream", "path", "url", "assert"] }),
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
    build: {
      outDir: path.resolve(__dirname, "build"),
      emptyOutDir: true,
      rolldownOptions: {
        input: {
          "web-component": path.resolve(__dirname, "web-component.html"),
          "html-renderer": path.resolve(__dirname, "html-renderer.html"),
        },
        output: {
          entryFileNames: "[name].js",
        },
      },
    },
  };
});
