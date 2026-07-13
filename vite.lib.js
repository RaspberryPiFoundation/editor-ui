// Shared building blocks for the editor-ui Vite builds.
//
// The editor is consumed by external host sites as classic scripts loaded with
// a plain <script src="...web-component.js"> tag (see README "Usage"), NOT as ES
// modules. It also has no dynamic imports, so - exactly like the old webpack
// build - each entry must be emitted as a single, self-contained, unhashed IIFE
// bundle that a classic <script> can load. This module centralises that build
// shape and the plugin/define setup shared by every build config.

const fs = require("fs");
const path = require("path");

// The set of build-time variables the app reads via process.env.*. We keep
// those references in the source (instead of import.meta.env) so the Jest suite,
// which resolves them against the real Node env, keeps working. Every key used
// anywhere in src/ must appear here or a bare `process` access would throw in
// the browser.
const processEnvValues = (mode, env) => ({
  NODE_ENV: mode,
  PUBLIC_URL: env.PUBLIC_URL ?? "",
  ASSETS_URL: env.ASSETS_URL || env.PUBLIC_URL || "",
  HTML_RENDERER_URL: env.HTML_RENDERER_URL ?? "",
  REACT_APP_API_ENDPOINT: env.REACT_APP_API_ENDPOINT ?? "",
  REACT_APP_AUTHENTICATION_CLIENT_ID: env.REACT_APP_AUTHENTICATION_CLIENT_ID ?? "",
  REACT_APP_ALLOWED_IFRAME_ORIGINS: env.REACT_APP_ALLOWED_IFRAME_ORIGINS ?? "",
  REACT_APP_SCRATCH_FRAME_URL: env.REACT_APP_SCRATCH_FRAME_URL ?? "",
  REACT_APP_SENTRY_DSN: env.REACT_APP_SENTRY_DSN ?? "",
  REACT_APP_SENTRY_ENV: env.REACT_APP_SENTRY_ENV ?? "",
});

// Used during `vite build`: replaces each process.env.KEY reference with its
// literal string value. Applied via Vite's `define`, which this Vite/Rolldown
// version only wires into the bundler's own transform (i.e. builds) - see
// processEnvDevServer below for why dev serving needs a different mechanism.
const buildDefine = (mode, env) => {
  const values = processEnvValues(mode, env);
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      `process.env.${key}`,
      JSON.stringify(value),
    ]),
  );
};

// Used during `yarn start`: as of vite@8.1.2, the built-in `vite:define` plugin
// no-ops for the dev server's "client" consumer (its transform hook returns
// early when `environment.config.consumer === "client"`), so `define` silently
// does nothing for on-demand dev requests even though it works correctly for
// `vite build` (bundled via rolldown, a separate code path). Without this,
// every `process.env.X` reference stays as literal source text, `process` is
// undefined in the browser, and any code path that evaluates it throws/rejects
// at runtime. Work around it by injecting a real `window.process.env` object
// into the page before any module script runs; classic <script> tags execute
// synchronously during parsing, ahead of deferred `type="module"` scripts,
// so ordering is safe without needing to be first in the document.
const processEnvDevServer = (mode, env) => ({
  name: "process-env-dev-server",
  apply: "serve",
  transformIndexHtml: {
    order: "pre",
    handler() {
      return [
        {
          tag: "script",
          injectTo: "head-prepend",
          children: `window.process = { env: ${JSON.stringify(processEnvValues(mode, env))} };`,
        },
      ];
    },
  },
});

// In production the bundles are served from an absolute CDN origin (PUBLIC_URL)
// and embedded cross-origin, so asset/chunk URLs must be absolute; in dev the
// Vite server owns the origin, so a root-relative base is correct. Mirrors
// react-dev-utils' getPublicUrlOrPath under the old webpack build.
const resolveBase = (mode, env) => {
  if (mode === "development") return "/";
  const raw = env.PUBLIC_URL || "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
};

// The transform plugins every build (and the dev server) needs. babelReact uses
// the DEFAULT automatic JSX runtime - babel-preset-react-app and the Jest
// transform both do, and many components do not import React, so classic would
// break them. babel-plugin-prismjs is carried over from .babelrc. Only
// src/assets/icons/**/*.svg become React components (default export), matching
// the old @svgr/webpack rule; every other .svg stays a URL asset. Node builtins
// reached transitively (skulpt / jszip) are polyfilled, replacing webpack's
// resolve.fallback. `global` stays polyfilled - plotly.js references the Node
// `global` object directly and throws ReferenceError without it. `process` is
// turned off: it defaults to true and injects a per-module `process` binding
// (with an empty, fake `.env`) that shadows any real `process` global (ours or
// the browser's) purely via JS scoping, which silently broke every
// `process.env.REACT_APP_X` read in the app (producing the literal string
// "undefined" instead of throwing or using the real value). We provide
// process.env ourselves instead (via `define` for builds, and
// processEnvDevServer for dev).
const appPlugins = (react, svgr, nodePolyfills) => [
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
  nodePolyfills({
    include: ["stream", "path", "url", "assert"],
    globals: { process: false, Buffer: true, global: true },
  }),
];

// On build, emit the entry's HTML template next to its bundle with the dev-only
// module script (<script type="module" src="/src/...">) rewritten to a classic
// <script src="./bundle.js">. External hosts embed the bundle with a classic
// script tag, so the deployed preview page must load it the same way.
//
// The replacement is `defer`red: the source template's module script lives in
// <head>, and module scripts are deferred by default, so the bundle runs only
// after the document is parsed (i.e. <body> exists). A plain classic script in
// <head> would instead run synchronously mid-parse, before <body> exists, and
// the bundle's top-level evaluation appends to document.body - which is null at
// that point, throwing "Cannot read properties of null (reading 'appendChild')".
// `defer` restores the module-script timing (run after parse, before
// DOMContentLoaded, preserving the ordering the page's inline DOMContentLoaded
// handler relies on).
const emitClassicHtml = ({ template, fileName, bundle }) => ({
  name: `emit-classic-html:${fileName}`,
  apply: "build",
  generateBundle() {
    const html = fs
      .readFileSync(template, "utf8")
      .replace(
        /<script\s+type="module"\s+src="\/src\/[^"]+"><\/script>\s*/,
        `<script defer src="${bundle}"></script>`,
      );
    this.emitFile({ type: "asset", fileName, source: html });
  },
});

// Build options for a self-contained classic IIFE bundle emitted at a stable,
// unhashed name (parity with webpack's `[name].js` entries). Only the primary
// build empties build/ and copies public/; later builds append to it.
const iifeBuildOptions = ({ root, entry, name, primary = false }) => ({
  outDir: path.resolve(root, "build"),
  emptyOutDir: primary,
  copyPublicDir: primary,
  rolldownOptions: {
    input: path.resolve(root, entry),
    output: {
      format: "iife",
      entryFileNames: `${name}.js`,
      assetFileNames: "assets/[name]-[hash][extname]",
    },
  },
});

// A vite-plugin-static-copy target that copies the *contents* of a directory
// (recursively) into `dest`, preserving the structure inside it - the
// copy-webpack-plugin `{ from: dir, to: dest }` behaviour. static-copy builds
// each dest path relative to the project root, so without help a deep source
// like node_modules/.../copydecks would be recreated verbatim under dest. We
// strip exactly the leading segments up to and including `dir`, so only the
// in-directory structure (e.g. copydecks/en/foo.json -> dest/en/foo.json) is
// kept. Same approach as apps/scratch-frame's rename.stripBase.
const copyDirTarget = ({ root, dir, dest }) => {
  const abs = path.resolve(root, dir);
  const stripBase = path.relative(root, abs).split(path.sep).length;
  return {
    src: `${abs.replace(/\\/g, "/")}/**/*`,
    dest,
    rename: { stripBase },
  };
};

module.exports = {
  buildDefine,
  processEnvDevServer,
  resolveBase,
  appPlugins,
  emitClassicHtml,
  iifeBuildOptions,
  copyDirTarget,
};
