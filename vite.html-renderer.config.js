import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const path = require("path");
const {
  browserTargets,
  processEnvBuildDefine,
  resolveViteBase,
  editorVitePlugins,
  emitDeferredClassicBundleHtml,
  classicIifeBuildOptions,
} = require("./vite.lib.js");

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const target = await browserTargets();
  return {
    base: resolveViteBase(mode, env),
    envDir: __dirname,
    envPrefix: "REACT_APP_",
    define: processEnvBuildDefine(mode, env),
    plugins: [
      ...editorVitePlugins(react, svgr, nodePolyfills),
      emitDeferredClassicBundleHtml({
        template: path.resolve(__dirname, "html-renderer.html"),
        fileName: "html-renderer.html",
        bundle: "html-renderer.js",
      }),
    ],
    build: classicIifeBuildOptions({
      root: __dirname,
      entry: "src/html-renderer.jsx",
      name: "html-renderer",
      cleansOutput: false,
      target,
    }),
  };
});
