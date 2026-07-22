import { defineConfig, loadEnv } from "vite";

const path = require("path");
const { browserTargets } = require("./vite.lib.js");

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const target = await browserTargets();
  return {
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.ASSETS_URL": JSON.stringify(
        env.ASSETS_URL || env.PUBLIC_URL || "",
      ),
    },
    build: {
      target,
      outDir: path.resolve(__dirname, "build"),
      emptyOutDir: false,
      copyPublicDir: false,
      rolldownOptions: {
        input: path.resolve(__dirname, "src/PyodideWorker.js"),
        output: {
          entryFileNames: "PyodideWorker.js",
          format: "iife",
        },
      },
    },
  };
});
