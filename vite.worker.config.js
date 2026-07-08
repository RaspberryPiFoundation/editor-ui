import { defineConfig, loadEnv } from "vite";

const path = require("path");

// The Pyodide worker is a standalone classic script: it defines a
// `globalThis.PyodideWorker` function and uses importScripts(), and is loaded
// cross-origin from a Blob via `importScripts("${PUBLIC_URL}/PyodideWorker.js")`
// (see getWorkerURL in PyodideRunner.jsx). It is therefore NOT part of the main
// module graph and must be emitted as its own unhashed, non-module bundle at the
// build root. This mirrors the dedicated `PyodideWorker` entry the old webpack
// build produced. `yarn start` serves it via a dev middleware in vite.config.js.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  return {
    // Its only build-time need is substituting process.env.ASSETS_URL (used to
    // importScripts the Sense HAT / pygal shims).
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.ASSETS_URL": JSON.stringify(
        env.ASSETS_URL || env.PUBLIC_URL || "",
      ),
    },
    build: {
      outDir: path.resolve(__dirname, "build"),
      // Do not clobber the main build output or re-copy public/.
      emptyOutDir: false,
      copyPublicDir: false,
      rolldownOptions: {
        input: path.resolve(__dirname, "src/PyodideWorker.js"),
        output: {
          entryFileNames: "PyodideWorker.js",
          // Classic (non-ESM) script so the blob's importScripts() can load it
          // and read the global it assigns. iife implies a single chunk.
          format: "iife",
        },
      },
    },
  };
});
