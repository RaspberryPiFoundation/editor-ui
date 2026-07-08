import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const path = require("path");
const {
  buildDefine,
  resolveBase,
  appPlugins,
  emitClassicHtml,
  iifeBuildOptions,
} = require("./vite.lib.js");

// html-renderer is loaded as a full page inside an iframe (HtmlRunner.jsx points
// the iframe at `${HTML_RENDERER_URL}/html-renderer.html`). Emitting it as a
// self-contained classic IIFE bundle (rather than an ES-module chunk) keeps the
// cross-origin iframe page simple and robust - a single classic <script>, no
// module chunk-URL resolution. Appends to the build/ produced by the primary
// (web-component) build, so it must run after it.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  return {
    base: resolveBase(mode, env),
    envDir: __dirname,
    envPrefix: "REACT_APP_",
    define: buildDefine(mode, env),
    plugins: [
      ...appPlugins(react, svgr, nodePolyfills),
      emitClassicHtml({
        template: path.resolve(__dirname, "html-renderer.html"),
        fileName: "html-renderer.html",
        bundle: "html-renderer.js",
      }),
    ],
    build: iifeBuildOptions({
      root: __dirname,
      entry: "src/html-renderer.jsx",
      name: "html-renderer",
      primary: false,
    }),
  };
});
