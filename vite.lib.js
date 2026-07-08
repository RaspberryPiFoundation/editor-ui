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
// resolve.fallback.
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
  nodePolyfills({ include: ["stream", "path", "url", "assert"] }),
];

// On build, emit the entry's HTML template next to its bundle with the dev-only
// module script (<script type="module" src="/src/...">) rewritten to a classic
// <script src="./bundle.js">. External hosts embed the bundle with a classic
// script tag, so the deployed preview page must load it the same way.
const emitClassicHtml = ({ template, fileName, bundle }) => ({
  name: `emit-classic-html:${fileName}`,
  apply: "build",
  generateBundle() {
    const html = fs
      .readFileSync(template, "utf8")
      .replace(
        /<script\s+type="module"\s+src="\/src\/[^"]+"><\/script>\s*/,
        `<script src="${bundle}"></script>`,
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
  resolveBase,
  appPlugins,
  emitClassicHtml,
  iifeBuildOptions,
  copyDirTarget,
};
