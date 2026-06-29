import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { defineConfig, loadEnv, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { visualizer } from "rollup-plugin-visualizer";

const require = createRequire(import.meta.url);
const {
  getScratchChunkDir,
  getScratchCopyPatterns,
  getScratchStaticDir,
  mainCopyPatterns,
} = require("./config/buildArtifacts.js");
const {
  crossOriginHeaders,
  setCrossOriginResourcePolicy,
} = require("./config/devServerSecurity.js");
const {
  getScratchTemplateParameters,
} = require("./src/utils/scratchTemplateConfig.cjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scratchStaticDir = getScratchStaticDir(__dirname);
const scratchChunkDir = getScratchChunkDir(__dirname);
const scratchRoot = path.resolve(__dirname, "src/scratch.jsx");
const scratchComponentsDir = path.resolve(
  __dirname,
  "src/components/ScratchEditor",
);

const scratchGlobalModules = {
  react: `
    const React = window.React;
    export const {
      Children,
      Component,
      Fragment,
      Profiler,
      PureComponent,
      StrictMode,
      Suspense,
      cloneElement,
      createContext,
      createElement,
      createRef,
      forwardRef,
      isValidElement,
      lazy,
      memo,
      startTransition,
      use,
      useActionState,
      useCallback,
      useContext,
      useDebugValue,
      useDeferredValue,
      useEffect,
      useId,
      useImperativeHandle,
      useInsertionEffect,
      useLayoutEffect,
      useMemo,
      useOptimistic,
      useReducer,
      useRef,
      useState,
      useSyncExternalStore,
      useTransition,
      version
    } = React;
    export default React;
  `,
  "react-dom": `
    const ReactDOM = window.ReactDOM;
    export const {
      createPortal,
      flushSync,
      findDOMNode,
      hydrate,
      render,
      unmountComponentAtNode,
      version
    } = ReactDOM;
    export default ReactDOM;
  `,
  "react-dom/client": `
    const ReactDOM = window.ReactDOM;
    export const createRoot = ReactDOM.createRoot;
    export const hydrateRoot = ReactDOM.hydrateRoot;
    export default ReactDOM;
  `,
  redux: `
    const Redux = window.Redux;
    export const {
      __DO_NOT_USE__ActionTypes,
      applyMiddleware,
      bindActionCreators,
      combineReducers,
      compose,
      createStore,
      isAction,
      isPlainObject,
      legacy_createStore
    } = Redux;
    export default Redux;
  `,
  "react-redux": `
    const ReactRedux = window.ReactRedux;
    export const {
      Provider,
      ReactReduxContext,
      batch,
      connect,
      createDispatchHook,
      createSelectorHook,
      createStoreHook,
      shallowEqual,
      useDispatch,
      useSelector,
      useStore
    } = ReactRedux;
    export default ReactRedux;
  `,
  "@RaspberryPiFoundation/scratch-gui": `
    const GUI = window.GUI;
    export const AppStateHOC = GUI.AppStateHOC;
    export const manualUpdateProject = GUI.manualUpdateProject;
    export const remixProject = GUI.remixProject;
    export const setStageSize = GUI.setStageSize;
    export default GUI;
  `,
};

const normalizePublicUrl = (value) => {
  const publicUrl = value || "/";
  return publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`;
};

const resolveFromRoot = (value) =>
  path.isAbsolute(value) ? value : path.resolve(__dirname, value);

const copyContents = (from, to) => {
  const source = resolveFromRoot(from);
  const target = path.resolve(__dirname, "build", to);
  const stat = fs.statSync(source);

  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (stat.isDirectory()) {
    fs.cpSync(source, target, { recursive: true });
  } else {
    fs.copyFileSync(source, target);
  }
};

const contentTypes = {
  ".css": "text/css",
  ".glb": "model/gltf-binary",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
};

const serveDirectory = (urlPrefix, directory) => (req, res, next) => {
  const { pathname } = new URL(req.url, "http://localhost");
  if (pathname !== urlPrefix && !pathname.startsWith(`${urlPrefix}/`)) {
    next();
    return;
  }

  const relativePath = decodeURIComponent(pathname.slice(urlPrefix.length));
  const filePath = path.resolve(directory, `.${relativePath}`);
  if (!filePath.startsWith(directory)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    next();
    return;
  }

  res.setHeader(
    "Content-Type",
    contentTypes[path.extname(filePath)] || "application/octet-stream",
  );
  fs.createReadStream(filePath).pipe(res);
};

const viteMigrationArtifactsPlugin = ({ copyPatterns }) => ({
  name: "editor-vite-artifacts",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      setCrossOriginResourcePolicy(req, res, next);
    });
    server.middlewares.use(
      "/projects",
      serveDirectory("/projects", path.resolve(__dirname, "src/projects")),
    );
    server.middlewares.use(
      "/scratch-gui/static",
      serveDirectory("/scratch-gui/static", scratchStaticDir),
    );
    server.middlewares.use(
      "/scratch-gui/chunks",
      serveDirectory("/scratch-gui/chunks", scratchChunkDir),
    );
  },
  writeBundle() {
    copyPatterns.forEach(({ from, to }) => copyContents(from, to));
  },
});

const scratchTemplatePlugin = (templateParameters) => ({
  name: "editor-scratch-template",
  transformIndexHtml(html, ctx) {
    if (!ctx.path.endsWith("/scratch.html")) return html;

    return html
      .replaceAll("%SCRATCH_PUBLIC_URL%", templateParameters.publicUrl)
      .replaceAll(
        "%SCRATCH_CSP_API_ORIGINS%",
        templateParameters.cspApiMultipleOrigins ||
          templateParameters.cspApiOrigin,
      )
      .replaceAll("%SCRATCH_CSP_ASSET_ORIGIN%", templateParameters.cspAssetOrigin)
      .replaceAll(
        "%SCRATCH_CSP_LIBRARY_ASSET_ORIGIN%",
        templateParameters.cspScratchLibraryAssetOrigin,
      )
      .replaceAll(
        "%SCRATCH_CSP_DEV_CONNECT_ORIGINS%",
        templateParameters.isDev ? "ws: wss:" : "",
      );
  },
});

const scratchGlobalBridgePlugin = () => ({
  name: "editor-scratch-global-bridge",
  enforce: "pre",
  resolveId(source, importer) {
    if (!scratchGlobalModules[source] || !importer) return null;

    const normalizedImporter = importer.replace(/\0/g, "");
    const isScratchImporter =
      normalizedImporter === scratchRoot ||
      normalizedImporter.startsWith(scratchComponentsDir) ||
      normalizedImporter.startsWith("scratch-global:");

    return isScratchImporter ? `\0scratch-global:${source}` : null;
  },
  load(id) {
    if (!id.startsWith("\0scratch-global:")) return null;
    return scratchGlobalModules[id.slice("\0scratch-global:".length)];
  },
});

const jsAsJsxPlugin = () => ({
  name: "editor-js-as-jsx",
  enforce: "pre",
  async transform(code, id) {
    if (!id.includes("/src/") || !id.endsWith(".js")) return null;
    return transformWithOxc(code, id, {
      lang: "jsx",
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const nodeEnv =
    process.env.NODE_ENV ||
    (mode === "production" ? "production" : "development");
  const publicUrl = normalizePublicUrl(env.PUBLIC_URL);
  const copyPatterns = [
    ...mainCopyPatterns.filter(({ from }) => from !== "public"),
    ...getScratchCopyPatterns({ scratchStaticDir, scratchChunkDir }),
  ];
  const runtimeEnv = Object.keys(env)
    .filter(
      (key) =>
        key.startsWith("REACT_APP_") ||
        ["ASSETS_URL", "HTML_RENDERER_URL", "PUBLIC_URL"].includes(key),
    )
    .reduce(
      (values, key) => ({
        ...values,
        [key]: env[key],
      }),
      { NODE_ENV: nodeEnv },
    );
  const scratchTemplateParameters = getScratchTemplateParameters({
    assetsUrl: env.ASSETS_URL,
    cspApiMultipleOrigins: env.CSP_API_MULTIPLE_ORIGINS,
    nodeEnv,
    publicUrl,
    reactAppApiEndpoint: env.REACT_APP_API_ENDPOINT,
  });

  return {
    appType: "mpa",
    base: publicUrl,
    publicDir: "public",
    define: {
      __RUNTIME_ENV__: JSON.stringify(runtimeEnv),
    },
    plugins: [
      jsAsJsxPlugin(),
      scratchGlobalBridgePlugin(),
      nodePolyfills({
        include: ["assert", "path", "stream", "url"],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
      svgr({
        include: "**/src/assets/icons/**/*.svg",
        svgrOptions: {
          exportType: "default",
        },
      }),
      react(),
      scratchTemplatePlugin(scratchTemplateParameters),
      viteMigrationArtifactsPlugin({ copyPatterns }),
      process.env.ANALYZE_VITE_BUNDLE &&
        visualizer({
          filename: "build/stats.html",
          gzipSize: true,
        }),
    ].filter(Boolean),
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [path.resolve(__dirname, "node_modules")],
        },
      },
    },
    server: {
      allowedHosts: true,
      headers: crossOriginHeaders,
      host: "0.0.0.0",
      port: 3011,
      strictPort: true,
    },
    preview: {
      headers: crossOriginHeaders,
      host: "0.0.0.0",
      port: 3011,
    },
    build: {
      cssMinify: "esbuild",
      outDir: "build",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          "web-component": path.resolve(__dirname, "web-component.html"),
          "html-renderer": path.resolve(__dirname, "html-renderer.html"),
          scratch: path.resolve(__dirname, "scratch.html"),
          PyodideWorker: path.resolve(__dirname, "src/PyodideWorker.js"),
        },
        output: {
          assetFileNames: "assets/[name][extname]",
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "[name].js",
        },
      },
    },
    optimizeDeps: {
      rolldownOptions: {
        moduleTypes: {
          ".js": "jsx",
        },
      },
    },
  };
});
