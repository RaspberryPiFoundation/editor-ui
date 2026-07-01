import { defineConfig, loadEnv } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";

const path = require("path");

const toOrigin = (envVarName, value) => {
  const normalizedValue = String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");

  if (!normalizedValue) return "";

  try {
    return new URL(normalizedValue).origin;
  } catch (_) {
    throw new Error(
      `Invalid URL in ${envVarName}: "${value}". ` +
        `Expected an absolute URL, for example "https://example.com".`,
    );
  }
};

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, "../../");
  const env = loadEnv(mode, envDir, "");
  const isDev = mode === "development";

  let publicUrl = env.PUBLIC_URL || "/";
  if (!publicUrl.endsWith("/")) {
    publicUrl += "/";
  }

  const cspApiOrigin = toOrigin(
    "REACT_APP_API_ENDPOINT",
    env.REACT_APP_API_ENDPOINT,
  );
  const cspAssetOrigin = toOrigin("ASSETS_URL", env.ASSETS_URL);

  // Keep in sync with SCRATCH_LIBRARY_ASSET_URL_TEMPLATE in ScratchEditor.jsx
  const cspScratchLibraryAssetOrigin = "https://editor-assets.raspberrypi.org";

  // When present these override cspApiOrigin for CSP API/connect-src origins.
  // This supports staging setups that need to allow multiple API origins,
  // such as also reaching the test API.
  const cspApiMultipleOrigins = String(env.CSP_API_MULTIPLE_ORIGINS || "")
    .split(/[\s,]+/)
    .map((originValue, index) =>
      toOrigin(`CSP_API_MULTIPLE_ORIGINS[${index}]`, originValue),
    )
    .filter(Boolean)
    .join(" ");

  const htmlTransform = () => {
    return {
      name: "html-transform",
      transformIndexHtml(html) {
        html = html.replaceAll(
          "%cspApiMultipleOrigins%",
          cspApiMultipleOrigins || cspApiOrigin,
        );
        html = html.replaceAll("%cspAssetOrigin%", cspAssetOrigin);
        html = html.replaceAll(
          "%cspScratchLibraryAssetOrigin%",
          cspScratchLibraryAssetOrigin,
        );
        html = html.replaceAll("%webSocketOrigin%", isDev ? "ws: wss:" : "");
        html = html.replaceAll("%PUBLIC_URL%", publicUrl);
        return html;
      },
    };
  };

  const resolveFromApp = (request) =>
    require.resolve(request, { paths: [__dirname] });

  const scratchDistDir = path.dirname(
    resolveFromApp("@RaspberryPiFoundation/scratch-gui"),
  );

  const scratchStaticDir = path.resolve(scratchDistDir, "static");
  const scratchChunkDir = path.resolve(scratchDistDir, "chunks");
  const scratchGuiBundlePath = path.resolve(scratchDistDir, "scratch-gui.js");
  const scratchGuiLicensePath = path.resolve(
    scratchDistDir,
    "scratch-gui.js.LICENSE.txt",
  );

  const staticCopy = viteStaticCopy({
    targets: [
      {
        src: scratchGuiBundlePath,
        dest: "vendor",
        rename: { stripBase: true, name: "scratch-gui.js" },
      },
      {
        src: scratchGuiLicensePath,
        dest: "vendor",
        rename: { stripBase: true, name: "scratch-gui.js.LICENSE.txt" },
      },
      {
        src: `${scratchStaticDir}/**/*`,
        dest: "scratch-gui/static",
        rename: { stripBase: 5 },
      },
      {
        src: `${scratchStaticDir}/**/*`,
        dest: "vendor/static",
        rename: { stripBase: 5 },
      },
      {
        src: `${scratchChunkDir}/**/*`,
        dest: "chunks",
        rename: { stripBase: 5 },
      },
    ],
  });

  return {
    plugins: [react({ jsxRuntime: "classic" }), htmlTransform(), staticCopy],
    envDir: path.resolve(__dirname, "../../"),
    envPrefix: "REACT_APP_",
    base: publicUrl,
    define: {
      "import.meta.env.CSP_API_MULTIPLE_ORIGINS": JSON.stringify(
        env.CSP_API_MULTIPLE_ORIGINS,
      ),
      "import.meta.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
      "import.meta.env.ASSETS_URL": JSON.stringify(env.ASSETS_URL),
    },
    build: {
      rolldownOptions: {
        input: {
          scratch: "scratch.html",
        },
      },
    },
    server: {
      port: 3014,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    },
  };
});
