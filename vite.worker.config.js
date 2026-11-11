import { defineConfig, loadEnv } from "vite";

const path = require("path");

const MODULE_WORKER_TARGET = "es2022";

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  return {
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.ASSETS_URL": JSON.stringify(
        env.ASSETS_URL || env.PUBLIC_URL || "",
      ),
    },
    build: {
      target: MODULE_WORKER_TARGET,
      outDir: path.resolve(__dirname, "build"),
      emptyOutDir: false,
      copyPublicDir: false,
      lib: {
        entry: path.resolve(__dirname, "src/PyodideWorker.js"),
        formats: ["es"],
        fileName: () => "PyodideWorker.js",
      },
      rolldownOptions: {
        preserveEntrySignatures: "exports-only",
      },
    },
  };
});
